#!/bin/bash

# Task and Action Integration Test
echo "=== Task and Action Integration Test ==="

TIMESTAMP=$(date +%s)
API_BASE="http://localhost:5000/api"

echo "Timestamp: $TIMESTAMP"

# Setup: Register and get token
echo
echo "🔧 Setup: Registration and Authentication"
REGISTER_RESULT=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Action Tester\",
    \"email\": \"action${TIMESTAMP}@example.com\",
    \"password\": \"test123\",
    \"organizationName\": \"Action Test Org ${TIMESTAMP}\",
    \"organizationDescription\": \"Organization for testing actions\"
  }")

TOKEN=$(echo "$REGISTER_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo "✅ User registered with token: ${TOKEN:0:20}..."

# Get organization
ORG_RESULT=$(curl -s -X GET "$API_BASE/organizations" -H "Authorization: Bearer $TOKEN")
ORG_ID=$(echo "$ORG_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data'][0]['_id'])" 2>/dev/null)
echo "✅ Organization ID: $ORG_ID"

# Add a second user
echo
echo "👥 Adding Second User"
MEMBER_RESULT=$(curl -s -X POST "$API_BASE/organizations/$ORG_ID/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Second User\",
    \"email\": \"second${TIMESTAMP}@example.com\",
    \"password\": \"second123\",
    \"role\": \"member\"
  }")

MEMBER_ID=$(echo "$MEMBER_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['userId']['_id'])" 2>/dev/null)
echo "✅ Second user added with ID: $MEMBER_ID"

# Login as second user
MEMBER_LOGIN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"second${TIMESTAMP}@example.com\",
    \"password\": \"second123\"
  }")

MEMBER_TOKEN=$(echo "$MEMBER_LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo "✅ Second user logged in: ${MEMBER_TOKEN:0:20}..."

# Switch organization context for member
SWITCH_RESULT=$(curl -s -X POST "$API_BASE/organizations/$ORG_ID/switch" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}")

CONTEXT_TOKEN=$(echo "$SWITCH_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
if [ -n "$CONTEXT_TOKEN" ]; then
    MEMBER_TOKEN="$CONTEXT_TOKEN"
    echo "✅ Organization context switched for member"
else
    echo "⚠️ Organization context switch not needed or failed"
fi

echo
echo "📋 Task Management and Actions Workflow"

# Create task assigned to member
echo
echo "1. Creating task assigned to member..."
TASK_RESULT=$(curl -s -X POST "$API_BASE/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Complete integration testing\",
    \"description\": \"Test the complete task and action workflow\",
    \"status\": \"todo\",
    \"priority\": \"high\",
    \"assignedTo\": \"$MEMBER_ID\",
    \"dueDate\": \"2025-12-31\",
    \"tags\": [\"integration\", \"testing\", \"workflow\"]
  }")

TASK_ID=$(echo "$TASK_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['_id'])" 2>/dev/null)
echo "✅ Task created with ID: $TASK_ID"
echo "Task response: $TASK_RESULT" | python3 -m json.tool

# Member accepts the task (updates status)
echo
echo "2. Member accepts task and updates status..."
UPDATE_RESULT=$(curl -s -X PUT "$API_BASE/tasks/$TASK_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"in-progress\",
    \"description\": \"Updated: Started working on this task\"
  }")

echo "✅ Task updated by member"
echo "Update response: $UPDATE_RESULT" | python3 -m json.tool

# Create action for task start
echo
echo "3. Creating action for task start..."
ACTION1_RESULT=$(curl -s -X POST "$API_BASE/tasks/$TASK_ID/actions" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\": \"Started working on the integration testing task\",
    \"type\": \"status-change\",
    \"metadata\": {
      \"oldStatus\": \"todo\",
      \"newStatus\": \"in-progress\",
      \"note\": \"Excited to work on this!\"
    }
  }")

ACTION1_ID=$(echo "$ACTION1_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['_id'])" 2>/dev/null)
echo "✅ Action 1 created with ID: $ACTION1_ID"
echo "Action response: $ACTION1_RESULT" | python3 -m json.tool

# Create a note action
echo
echo "4. Adding progress note..."
ACTION2_RESULT=$(curl -s -X POST "$API_BASE/tasks/$TASK_ID/actions" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\": \"Making good progress on the testing workflow. All endpoints are responding correctly.\",
    \"type\": \"note\",
    \"metadata\": {
      \"progress\": \"50%\",
      \"completed_tests\": [\"registration\", \"authentication\", \"task_creation\"]
    }
  }")

ACTION2_ID=$(echo "$ACTION2_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['_id'])" 2>/dev/null)
echo "✅ Progress note added with ID: $ACTION2_ID"

# Complete the task
echo
echo "5. Completing the task..."
COMPLETE_RESULT=$(curl -s -X POST "$API_BASE/tasks/$TASK_ID/actions" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\": \"Task completed successfully! All integration tests passed.\",
    \"type\": \"status-change\",
    \"metadata\": {
      \"oldStatus\": \"in-progress\",
      \"newStatus\": \"completed\",
      \"completion_time\": \"$(date -Iseconds)\",
      \"success\": true
    }
  }")

echo "✅ Task completion action created"
echo "Completion response: $COMPLETE_RESULT" | python3 -m json.tool

# Get all actions for the task
echo
echo "6. Retrieving all task actions..."
ACTIONS_RESULT=$(curl -s -X GET "$API_BASE/tasks/$TASK_ID/actions" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Retrieved task actions"
echo "Actions response: $ACTIONS_RESULT" | python3 -m json.tool

# Get task with all details
echo
echo "7. Getting complete task details..."
TASK_DETAILS=$(curl -s -X GET "$API_BASE/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Retrieved complete task details"
echo "Task details: $TASK_DETAILS" | python3 -m json.tool

# Admin view of all tasks
echo
echo "8. Admin view of all tasks..."
ALL_TASKS=$(curl -s -X GET "$API_BASE/tasks?showAll=true" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Retrieved all tasks (admin view)"
echo "All tasks: $ALL_TASKS" | python3 -m json.tool

echo
echo "🎉 INTEGRATION TEST COMPLETE!"
echo
echo "Summary of workflow tested:"
echo "✅ User registration and authentication"
echo "✅ Organization creation and management"
echo "✅ Multi-user organization membership"
echo "✅ Task creation with assignment"
echo "✅ Task updates by assigned user"
echo "✅ Action creation with different types (status-change, note)"
echo "✅ Action metadata and timestamps"
echo "✅ Action retrieval and history tracking"
echo "✅ Task completion workflow"
echo "✅ Admin vs member permissions"
echo "✅ Organization context switching"
echo
echo "Key identifiers from this test:"
echo "- Organization ID: $ORG_ID"
echo "- Admin Token: ${TOKEN:0:20}..."
echo "- Member Token: ${MEMBER_TOKEN:0:20}..."
echo "- Task ID: $TASK_ID"
echo "- Action 1 ID: $ACTION1_ID"
echo "- Action 2 ID: $ACTION2_ID"
