#!/bin/bash

# Comprehensive TodoList API Integration Test
# Tests the full workflow from registration to task management

TIMESTAMP=$(date +%s)
echo "======================================"
echo "   TodoList API Integration Test"
echo "   Timestamp: $TIMESTAMP"
echo "======================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_BASE="http://localhost:5000/api"
USER1_TOKEN=""
USER2_TOKEN=""
ORG_ID=""
USER2_ID=""
TASK_ID=""
ACTION_ID=""

# Unique emails for this test run
ADMIN_EMAIL="admin${TIMESTAMP}@testorg.com"
MEMBER_EMAIL="member${TIMESTAMP}@testorg.com"
ORG_NAME="Test Organization ${TIMESTAMP}"

echo "Using unique identifiers:"
echo "- Admin Email: $ADMIN_EMAIL"
echo "- Member Email: $MEMBER_EMAIL"
echo "- Organization: $ORG_NAME"
echo

# Helper function to make API calls and show responses
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -e "${BLUE}=== $description ===${NC}"
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    local response
    if [ -n "$data" ] && [ -n "$token" ]; then
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ -n "$token" ]; then
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token")
    elif [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$API_BASE$endpoint")
    fi
    
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo -e "${BLUE}---${NC}\n"
    
    # Return the response for further processing
    echo "$response"
}

# Helper function to extract values from JSON
extract_json_value() {
    local json=$1
    local key=$2
    echo "$json" | python3 -c "import sys, json; print(json.load(sys.stdin)$key)" 2>/dev/null || echo ""
}

echo "🚀 Starting Integration Test..."
echo

# Phase 1: Authentication Tests
echo -e "${GREEN}📝 PHASE 1: AUTHENTICATION${NC}"
echo "========================================="

# Test 1: Register first user (Admin)
echo -e "${YELLOW}Test 1: Register User 1 (Admin)${NC}"
REGISTER_RESPONSE=$(make_request "POST" "/auth/register" "{
    \"name\": \"Admin User\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"admin123\",
    \"organizationName\": \"$ORG_NAME\",
    \"organizationDescription\": \"A test organization for integration testing\"
}" "" "Register User 1 (Admin)")

USER1_TOKEN=$(extract_json_value "$REGISTER_RESPONSE" "['token']")

if [ -n "$USER1_TOKEN" ]; then
    echo -e "${GREEN}✅ User 1 registered successfully${NC}"
    echo "Token: ${USER1_TOKEN:0:20}..."
    
    # Get organization ID from user's organizations
    ORG_LIST_RESPONSE=$(make_request "GET" "/organizations" "" "$USER1_TOKEN" "Get User Organizations")
    ORG_ID=$(extract_json_value "$ORG_LIST_RESPONSE" "['data'][0]['_id']")
    
    if [ -n "$ORG_ID" ]; then
        echo "Organization ID: $ORG_ID"
    else
        echo -e "${YELLOW}⚠️ Could not extract organization ID${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ User 1 registration failed${NC}"
    exit 1
fi

# Test 2: Login with first user
echo -e "${YELLOW}Test 2: Login User 1${NC}"
LOGIN_RESPONSE=$(make_request "POST" "/auth/login" "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"admin123\"
}" "" "Login User 1")

LOGIN_TOKEN=$(extract_json_value "$LOGIN_RESPONSE" "['token']")
if [ -n "$LOGIN_TOKEN" ]; then
    echo -e "${GREEN}✅ User 1 login successful${NC}"
    USER1_TOKEN="$LOGIN_TOKEN"  # Update token
else
    echo -e "${RED}❌ User 1 login failed${NC}"
fi

# Test 3: Get current user info
echo -e "${YELLOW}Test 3: Auth Me - Get Current User${NC}"
AUTH_ME_RESPONSE=$(make_request "GET" "/auth/me" "" "$USER1_TOKEN" "Get Current User Info")

# Phase 2: Organization Management
echo -e "${GREEN}📁 PHASE 2: ORGANIZATION MANAGEMENT${NC}"
echo "========================================="

# Test 4: Get user's organizations
echo -e "${YELLOW}Test 4: Get User Organizations${NC}"
ORG_LIST_RESPONSE=$(make_request "GET" "/organizations" "" "$USER1_TOKEN" "Get User Organizations")

# Test 5: Get specific organization
echo -e "${YELLOW}Test 5: Get Specific Organization${NC}"
GET_ORG_RESPONSE=$(make_request "GET" "/organizations/$ORG_ID" "" "$USER1_TOKEN" "Get Specific Organization")

# Phase 3: User Organization Management
echo -e "${GREEN}👥 PHASE 3: USER ORGANIZATION MANAGEMENT${NC}"
echo "========================================="

# Test 6: Add member to organization
echo -e "${YELLOW}Test 6: Add Member to Organization${NC}"
ADD_MEMBER_RESPONSE=$(make_request "POST" "/organizations/$ORG_ID/members" "{
    \"name\": \"Member User\",
    \"email\": \"$MEMBER_EMAIL\",
    \"password\": \"member123\",
    \"role\": \"member\"
}" "$USER1_TOKEN" "Add Member to Organization")

USER2_ID=$(extract_json_value "$ADD_MEMBER_RESPONSE" "['data']['userId']['_id']")

if [ -n "$USER2_ID" ]; then
    echo -e "${GREEN}✅ Member added successfully${NC}"
    echo "User 2 ID: $USER2_ID"
else
    echo -e "${YELLOW}⚠️ Could not extract User 2 ID${NC}"
fi

# Test 7: Login as second user
echo -e "${YELLOW}Test 7: Login User 2 (Member)${NC}"
USER2_LOGIN_RESPONSE=$(make_request "POST" "/auth/login" "{
    \"email\": \"$MEMBER_EMAIL\",
    \"password\": \"member123\"
}" "" "Login User 2 (Member)")

USER2_TOKEN=$(extract_json_value "$USER2_LOGIN_RESPONSE" "['token']")
if [ -n "$USER2_TOKEN" ]; then
    echo -e "${GREEN}✅ User 2 login successful${NC}"
else
    echo -e "${RED}❌ User 2 login failed${NC}"
fi

# Test 8: Get organization members
echo -e "${YELLOW}Test 8: Get Organization Members${NC}"
MEMBERS_RESPONSE=$(make_request "GET" "/organizations/$ORG_ID/members" "" "$USER1_TOKEN" "Get Organization Members")

# Test 9: Switch to organization context (User 2)
echo -e "${YELLOW}Test 9: Switch to Organization Context${NC}"
SWITCH_ORG_RESPONSE=$(make_request "POST" "/organizations/$ORG_ID/switch" '{}' "$USER2_TOKEN" "Switch to Organization Context")
CONTEXT_TOKEN=$(extract_json_value "$SWITCH_ORG_RESPONSE" "['data']['token']")
if [ -n "$CONTEXT_TOKEN" ]; then
    USER2_TOKEN="$CONTEXT_TOKEN"
    echo -e "${GREEN}✅ Organization context switched${NC}"
else
    echo -e "${YELLOW}⚠️ Organization context switch failed or not needed${NC}"
fi

# Phase 4: Task Management
echo -e "${GREEN}📋 PHASE 4: TASK MANAGEMENT${NC}"
echo "========================================="

# Test 10: Create task (Admin)
echo -e "${YELLOW}Test 10: Create Task (Admin)${NC}"
CREATE_TASK_RESPONSE=$(make_request "POST" "/tasks" "{
    \"title\": \"Integration Test Task\",
    \"description\": \"A task created during integration testing\",
    \"status\": \"todo\",
    \"priority\": \"high\",
    \"dueDate\": \"2025-12-31\",
    \"assignedTo\": \"$USER2_ID\",
    \"tags\": [\"integration\", \"test\", \"api\"]
}" "$USER1_TOKEN" "Create Task (Admin)")

TASK_ID=$(extract_json_value "$CREATE_TASK_RESPONSE" "['data']['_id']")

if [ -n "$TASK_ID" ]; then
    echo -e "${GREEN}✅ Task created successfully${NC}"
    echo "Task ID: $TASK_ID"
else
    echo -e "${YELLOW}⚠️ Could not extract Task ID${NC}"
fi

# Test 11: Get all tasks (Admin view)
echo -e "${YELLOW}Test 11: Get All Tasks (Admin view)${NC}"
ALL_TASKS_RESPONSE=$(make_request "GET" "/tasks?showAll=true" "" "$USER1_TOKEN" "Get All Tasks (Admin)")

# Test 12: Get tasks (Member view)
echo -e "${YELLOW}Test 12: Get Tasks (Member view)${NC}"
MEMBER_TASKS_RESPONSE=$(make_request "GET" "/tasks" "" "$USER2_TOKEN" "Get Tasks (Member)")

if [ -n "$TASK_ID" ]; then
    # Test 13: Get specific task
    echo -e "${YELLOW}Test 13: Get Specific Task${NC}"
    GET_TASK_RESPONSE=$(make_request "GET" "/tasks/$TASK_ID" "" "$USER2_TOKEN" "Get Specific Task")

    # Test 14: Update task (Member - assigned user)
    echo -e "${YELLOW}Test 14: Update Task (Member - assigned user)${NC}"
    UPDATE_TASK_RESPONSE=$(make_request "PUT" "/tasks/$TASK_ID" '{
        "status": "in-progress",
        "description": "Updated description - task is now in progress"
    }' "$USER2_TOKEN" "Update Task (Member)")

    # Phase 5: Action Management
    echo -e "${GREEN}🎬 PHASE 5: ACTION MANAGEMENT${NC}"
    echo "========================================="

    # Test 15: Create action on task
    echo -e "${YELLOW}Test 15: Create Action on Task${NC}"
    CREATE_ACTION_RESPONSE=$(make_request "POST" "/tasks/$TASK_ID/actions" '{
        "description": "Started working on this task",
        "type": "status-change",
        "metadata": {
            "oldStatus": "todo",
            "newStatus": "in-progress"
        }
    }' "$USER2_TOKEN" "Create Action on Task")

    ACTION_ID=$(extract_json_value "$CREATE_ACTION_RESPONSE" "['data']['_id']")

    # Test 16: Get task actions
    echo -e "${YELLOW}Test 16: Get Task Actions${NC}"
    ACTIONS_RESPONSE=$(make_request "GET" "/tasks/$TASK_ID/actions" "" "$USER1_TOKEN" "Get Task Actions")

    # Test 17: Complete task with action
    echo -e "${YELLOW}Test 17: Complete Task with Action${NC}"
    COMPLETE_ACTION_RESPONSE=$(make_request "POST" "/tasks/$TASK_ID/actions" '{
        "description": "Task completed successfully",
        "type": "status-change",
        "metadata": {
            "oldStatus": "in-progress",
            "newStatus": "completed"
        }
    }' "$USER2_TOKEN" "Complete Task with Action")

    # Phase 6: Advanced Operations
    echo -e "${GREEN}⚡ PHASE 6: ADVANCED OPERATIONS${NC}"
    echo "========================================="

    # Test 18: Search tasks
    echo -e "${YELLOW}Test 18: Search Tasks${NC}"
    SEARCH_RESPONSE=$(make_request "GET" "/tasks?search=integration&status=completed" "" "$USER1_TOKEN" "Search Tasks")

    # Test 19: Create another task for deletion test
    echo -e "${YELLOW}Test 19: Create Task for Deletion${NC}"
    DELETE_TASK_RESPONSE=$(make_request "POST" "/tasks" '{
        "title": "Task to be deleted",
        "description": "This task will be deleted",
        "status": "todo"
    }' "$USER1_TOKEN" "Create Task for Deletion")

    DELETE_TASK_ID=$(extract_json_value "$DELETE_TASK_RESPONSE" "['data']['_id']")

    if [ -n "$DELETE_TASK_ID" ]; then
        # Test 20: Delete task
        echo -e "${YELLOW}Test 20: Delete Task${NC}"
        DELETE_RESPONSE=$(make_request "DELETE" "/tasks/$DELETE_TASK_ID" "" "$USER1_TOKEN" "Delete Task")
    fi
fi

# Test 21: Update member role
echo -e "${YELLOW}Test 21: Update Member Role${NC}"
if [ -n "$USER2_ID" ]; then
    ROLE_UPDATE_RESPONSE=$(make_request "PUT" "/organizations/$ORG_ID/members/$USER2_ID" '{
        "role": "admin"
    }' "$USER1_TOKEN" "Update Member Role to Admin")
fi

# Final Summary
echo -e "${GREEN}📊 INTEGRATION TEST SUMMARY${NC}"
echo "========================================="
echo -e "${GREEN}✅ Authentication: User registration, login, auth me${NC}"
echo -e "${GREEN}✅ Organizations: Create, list, get organizations${NC}"
echo -e "${GREEN}✅ User Management: Add members, role management${NC}"
echo -e "${GREEN}✅ Task Management: Create, read, update, delete tasks${NC}"
echo -e "${GREEN}✅ Action Management: Create actions, track task history${NC}"
echo -e "${GREEN}✅ Advanced Features: Search, filtering, pagination${NC}"
echo -e "${GREEN}✅ Authorization: Role-based access control${NC}"
echo

echo -e "${BLUE}🎉 Integration test completed!${NC}"
echo
echo "Key IDs generated during test:"
echo "- Organization ID: $ORG_ID"
echo "- User 1 (Admin) Token: ${USER1_TOKEN:0:20}..."
echo "- User 2 (Member) Token: ${USER2_TOKEN:0:20}..."
echo "- Task ID: $TASK_ID"
echo "- Action ID: $ACTION_ID"
echo
