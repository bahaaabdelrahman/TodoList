#!/bin/bash

# Simple TodoList API Test
echo "=== Simple TodoList API Test ==="

TIMESTAMP=$(date +%s)
API_BASE="http://localhost:5000/api"

echo "Timestamp: $TIMESTAMP"
echo

# Test 1: Registration
echo "1. Testing Registration..."
REGISTER_RESULT=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"password\": \"test123\",
    \"organizationName\": \"Test Org ${TIMESTAMP}\",
    \"organizationDescription\": \"Test description\"
  }")

echo "Registration response: $REGISTER_RESULT"

# Extract token
TOKEN=$(echo "$REGISTER_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo "✅ Registration successful"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "❌ Registration failed"
    exit 1
fi

echo

# Test 2: Get Organizations
echo "2. Testing Get Organizations..."
ORG_RESULT=$(curl -s -X GET "$API_BASE/organizations" \
  -H "Authorization: Bearer $TOKEN")

echo "Organizations response: $ORG_RESULT"

# Extract organization ID
ORG_ID=$(echo "$ORG_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data'][0]['_id'])" 2>/dev/null)

if [ -n "$ORG_ID" ]; then
    echo "✅ Got organizations"
    echo "Organization ID: $ORG_ID"
else
    echo "❌ Failed to get organizations"
    exit 1
fi

echo

# Test 3: Create Task
echo "3. Testing Create Task..."
TASK_RESULT=$(curl -s -X POST "$API_BASE/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Task\",
    \"description\": \"A simple test task\",
    \"status\": \"todo\",
    \"priority\": \"medium\"
  }")

echo "Task creation response: $TASK_RESULT"

# Extract task ID
TASK_ID=$(echo "$TASK_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['_id'])" 2>/dev/null)

if [ -n "$TASK_ID" ]; then
    echo "✅ Task created"
    echo "Task ID: $TASK_ID"
else
    echo "❌ Failed to create task"
    echo "This might be due to missing organization context in token"
fi

echo

# Test 4: Get Tasks
echo "4. Testing Get Tasks..."
TASKS_RESULT=$(curl -s -X GET "$API_BASE/tasks" \
  -H "Authorization: Bearer $TOKEN")

echo "Get tasks response: $TASKS_RESULT"

echo

# Test 5: Add Organization Member
echo "5. Testing Add Member to Organization..."
MEMBER_RESULT=$(curl -s -X POST "$API_BASE/organizations/$ORG_ID/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Member User\",
    \"email\": \"member${TIMESTAMP}@example.com\",
    \"password\": \"member123\",
    \"role\": \"member\"
  }")

echo "Add member response: $MEMBER_RESULT"

echo

echo "=== Test Summary ==="
echo "- Registration: $([ -n "$TOKEN" ] && echo "✅ Success" || echo "❌ Failed")"
echo "- Organizations: $([ -n "$ORG_ID" ] && echo "✅ Success" || echo "❌ Failed")"
echo "- Task Creation: $([ -n "$TASK_ID" ] && echo "✅ Success" || echo "❌ Failed")"
echo
echo "Key identifiers:"
echo "- Token: ${TOKEN:0:30}..."
echo "- Organization ID: $ORG_ID"
echo "- Task ID: $TASK_ID"
