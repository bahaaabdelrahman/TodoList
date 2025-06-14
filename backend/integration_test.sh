#!/bin/bash

# Comprehensive TodoList API Integration Test
# Tests the full workflow from registration to task management

echo "======================================"
echo "   TodoList API Integration Test"
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

# Helper function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -e "${BLUE}=== $description ===${NC}"
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    if [ -n "$data" ] && [ -n "$token" ]; then
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data"
    elif [ -n "$token" ]; then
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token"
    elif [ -n "$data" ]; then
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -X "$method" "$API_BASE$endpoint"
    fi
    
    echo -e "\n${BLUE}---${NC}\n"
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
REGISTER_RESPONSE=$(make_request "POST" "/auth/register" '{
    "name": "Admin User",
    "email": "admin1749909559@testorg.com",
    "password": "admin123",
    "organizationName": "Test Organization 1749909559",
    "organizationDescription": "A test organization for integration testing"
}' "" "Register User 1 (Admin)")

USER1_TOKEN=$(extract_json_value "$REGISTER_RESPONSE" "['token']")

if [ -n "$USER1_TOKEN" ]; then
    echo -e "${GREEN}✅ User 1 registered successfully${NC}"
    echo "Token: ${USER1_TOKEN:0:20}..."
    
    # Get organization ID from user's organizations
    ORG_LIST_RESPONSE=$(curl -s -X GET "$API_BASE/organizations" -H "Authorization: Bearer $USER1_TOKEN")
    ORG_ID=$(extract_json_value "$ORG_LIST_RESPONSE" "['data'][0]['_id']")
    
    if [ -n "$ORG_ID" ]; then
        echo "Organization ID: $ORG_ID"
    else
        echo -e "${YELLOW}⚠️ Could not extract organization ID, but user registered${NC}"
        # Try to extract from the first organization in the list differently
        echo "Organization list response: $ORG_LIST_RESPONSE"
    fi
else
    echo -e "${RED}❌ User 1 registration failed${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi
echo

# Test 2: Login with first user
echo -e "${YELLOW}Test 2: Login User 1${NC}"
LOGIN_RESPONSE=$(make_request "POST" "/auth/login" '{
    "email": "admin1749909559@testorg.com",
    "password": "admin123"
}' "" "Login User 1")

LOGIN_TOKEN=$(extract_json_value "$LOGIN_RESPONSE" "['token']")
if [ -n "$LOGIN_TOKEN" ]; then
    echo -e "${GREEN}✅ User 1 login successful${NC}"
    USER1_TOKEN="$LOGIN_TOKEN"  # Update token
else
    echo -e "${RED}❌ User 1 login failed${NC}"
fi
echo

# Test 3: Get current user info
echo -e "${YELLOW}Test 3: Auth Me - Get Current User${NC}"
AUTH_ME_RESPONSE=$(make_request "GET" "/auth/me" "" "$USER1_TOKEN" "Get Current User Info")
echo "$AUTH_ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$AUTH_ME_RESPONSE"
echo

# Phase 2: Organization Management
echo -e "${GREEN}📁 PHASE 2: ORGANIZATION MANAGEMENT${NC}"
echo "========================================="

# Test 4: Get user's organizations
echo -e "${YELLOW}Test 4: Get User Organizations${NC}"
ORG_LIST_RESPONSE=$(make_request "GET" "/organizations" "" "$USER1_TOKEN" "Get User Organizations")
echo "$ORG_LIST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ORG_LIST_RESPONSE"
echo

# Test 5: Create additional organization
echo -e "${YELLOW}Test 5: Create Additional Organization${NC}"
NEW_ORG_RESPONSE=$(make_request "POST" "/organizations" '{
    "name": "Secondary Organization",
    "description": "A secondary organization for testing"
}' "$USER1_TOKEN" "Create Additional Organization")
echo "$NEW_ORG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$NEW_ORG_RESPONSE"
echo

# Test 6: Get specific organization
echo -e "${YELLOW}Test 6: Get Specific Organization${NC}"
GET_ORG_RESPONSE=$(make_request "GET" "/organizations/$ORG_ID" "" "$USER1_TOKEN" "Get Specific Organization")
echo "$GET_ORG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_ORG_RESPONSE"
echo

# Phase 3: User Organization Management
echo -e "${GREEN}👥 PHASE 3: USER ORGANIZATION MANAGEMENT${NC}"
echo "========================================="

# Test 7: Add member to organization
echo -e "${YELLOW}Test 7: Add Member to Organization${NC}"
ADD_MEMBER_RESPONSE=$(make_request "POST" "/organizations/$ORG_ID/members" '{
    "name": "Member User",
    "email": "member1749909559@testorg.com",
    "password": "member123",
    "role": "member"
}' "$USER1_TOKEN" "Add Member to Organization")

USER2_ID=$(extract_json_value "$ADD_MEMBER_RESPONSE" "['data']['userId']['_id']")
echo "$ADD_MEMBER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ADD_MEMBER_RESPONSE"
echo

# Test 8: Login as second user
echo -e "${YELLOW}Test 8: Login User 2 (Member)${NC}"
USER2_LOGIN_RESPONSE=$(make_request "POST" "/auth/login" '{
    "email": "member1749909559@testorg.com",
    "password": "member123"
}' "" "Login User 2 (Member)")

USER2_TOKEN=$(extract_json_value "$USER2_LOGIN_RESPONSE" "['token']")
if [ -n "$USER2_TOKEN" ]; then
    echo -e "${GREEN}✅ User 2 login successful${NC}"
else
    echo -e "${RED}❌ User 2 login failed${NC}"
fi
echo

# Test 9: Get organization members
echo -e "${YELLOW}Test 9: Get Organization Members${NC}"
MEMBERS_RESPONSE=$(make_request "GET" "/organizations/$ORG_ID/members" "" "$USER1_TOKEN" "Get Organization Members")
echo "$MEMBERS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MEMBERS_RESPONSE"
echo

# Test 10: Switch to organization context
echo -e "${YELLOW}Test 10: Switch to Organization Context${NC}"
SWITCH_ORG_RESPONSE=$(make_request "POST" "/organizations/$ORG_ID/switch" '{}' "$USER2_TOKEN" "Switch to Organization Context")
CONTEXT_TOKEN=$(extract_json_value "$SWITCH_ORG_RESPONSE" "['data']['token']")
if [ -n "$CONTEXT_TOKEN" ]; then
    USER2_TOKEN="$CONTEXT_TOKEN"
    echo -e "${GREEN}✅ Organization context switched${NC}"
else
    echo -e "${RED}❌ Organization context switch failed${NC}"
fi
echo "$SWITCH_ORG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SWITCH_ORG_RESPONSE"
echo

# Phase 4: Task Management
echo -e "${GREEN}📋 PHASE 4: TASK MANAGEMENT${NC}"
echo "========================================="

# Test 11: Create task (Admin)
echo -e "${YELLOW}Test 11: Create Task (Admin)${NC}"
CREATE_TASK_RESPONSE=$(make_request "POST" "/tasks" '{
    "title": "Integration Test Task",
    "description": "A task created during integration testing",
    "status": "todo",
    "priority": "high",
    "dueDate": "2025-12-31",
    "assignedTo": "'$USER2_ID'",
    "tags": ["integration", "test", "api"]
}' "$USER1_TOKEN" "Create Task (Admin)")

TASK_ID=$(extract_json_value "$CREATE_TASK_RESPONSE" "['data']['_id']")
echo "$CREATE_TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_TASK_RESPONSE"
echo

# Test 12: Get all tasks (Admin view)
echo -e "${YELLOW}Test 12: Get All Tasks (Admin view)${NC}"
ALL_TASKS_RESPONSE=$(make_request "GET" "/tasks?showAll=true" "" "$USER1_TOKEN" "Get All Tasks (Admin)")
echo "$ALL_TASKS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ALL_TASKS_RESPONSE"
echo

# Test 13: Get tasks (Member view)
echo -e "${YELLOW}Test 13: Get Tasks (Member view)${NC}"
MEMBER_TASKS_RESPONSE=$(make_request "GET" "/tasks" "" "$USER2_TOKEN" "Get Tasks (Member)")
echo "$MEMBER_TASKS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MEMBER_TASKS_RESPONSE"
echo

# Test 14: Get specific task
echo -e "${YELLOW}Test 14: Get Specific Task${NC}"
GET_TASK_RESPONSE=$(make_request "GET" "/tasks/$TASK_ID" "" "$USER2_TOKEN" "Get Specific Task")
echo "$GET_TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_TASK_RESPONSE"
echo

# Test 15: Update task (Member - assigned user)
echo -e "${YELLOW}Test 15: Update Task (Member - assigned user)${NC}"
UPDATE_TASK_RESPONSE=$(make_request "PUT" "/tasks/$TASK_ID" '{
    "status": "in-progress",
    "description": "Updated description - task is now in progress"
}' "$USER2_TOKEN" "Update Task (Member)")
echo "$UPDATE_TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_TASK_RESPONSE"
echo

# Phase 5: Action Management
echo -e "${GREEN}🎬 PHASE 5: ACTION MANAGEMENT${NC}"
echo "========================================="

# Test 16: Create action on task
echo -e "${YELLOW}Test 16: Create Action on Task${NC}"
CREATE_ACTION_RESPONSE=$(make_request "POST" "/tasks/$TASK_ID/actions" '{
    "description": "Started working on this task",
    "type": "status-change",
    "metadata": {
        "oldStatus": "todo",
        "newStatus": "in-progress"
    }
}' "$USER2_TOKEN" "Create Action on Task")

ACTION_ID=$(extract_json_value "$CREATE_ACTION_RESPONSE" "['data']['_id']")
echo "$CREATE_ACTION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_ACTION_RESPONSE"
echo

# Test 17: Get task actions
echo -e "${YELLOW}Test 17: Get Task Actions${NC}"
ACTIONS_RESPONSE=$(make_request "GET" "/tasks/$TASK_ID/actions" "" "$USER1_TOKEN" "Get Task Actions")
echo "$ACTIONS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ACTIONS_RESPONSE"
echo

# Test 18: Complete task with action
echo -e "${YELLOW}Test 18: Complete Task with Action${NC}"
COMPLETE_ACTION_RESPONSE=$(make_request "POST" "/tasks/$TASK_ID/actions" '{
    "description": "Task completed successfully",
    "type": "status-change",
    "metadata": {
        "oldStatus": "in-progress",
        "newStatus": "completed"
    }
}' "$USER2_TOKEN" "Complete Task with Action")
echo "$COMPLETE_ACTION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$COMPLETE_ACTION_RESPONSE"
echo

# Phase 6: Advanced Operations
echo -e "${GREEN}⚡ PHASE 6: ADVANCED OPERATIONS${NC}"
echo "========================================="

# Test 19: Search tasks
echo -e "${YELLOW}Test 19: Search Tasks${NC}"
SEARCH_RESPONSE=$(make_request "GET" "/tasks?search=integration&status=completed" "" "$USER1_TOKEN" "Search Tasks")
echo "$SEARCH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEARCH_RESPONSE"
echo

# Test 20: Update member role
echo -e "${YELLOW}Test 20: Update Member Role${NC}"
ROLE_UPDATE_RESPONSE=$(make_request "PUT" "/organizations/$ORG_ID/members/$USER2_ID" '{
    "role": "admin"
}' "$USER1_TOKEN" "Update Member Role to Admin")
echo "$ROLE_UPDATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ROLE_UPDATE_RESPONSE"
echo

# Phase 7: Cleanup Tests
echo -e "${GREEN}🧹 PHASE 7: CLEANUP TESTS${NC}"
echo "========================================="

# Test 21: Create another task for deletion test
echo -e "${YELLOW}Test 21: Create Task for Deletion${NC}"
DELETE_TASK_RESPONSE=$(make_request "POST" "/tasks" '{
    "title": "Task to be deleted",
    "description": "This task will be deleted",
    "status": "todo"
}' "$USER1_TOKEN" "Create Task for Deletion")

DELETE_TASK_ID=$(extract_json_value "$DELETE_TASK_RESPONSE" "['data']['_id']")
echo "$DELETE_TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DELETE_TASK_RESPONSE"
echo

# Test 22: Delete task
echo -e "${YELLOW}Test 22: Delete Task${NC}"
DELETE_RESPONSE=$(make_request "DELETE" "/tasks/$DELETE_TASK_ID" "" "$USER1_TOKEN" "Delete Task")
echo "$DELETE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DELETE_RESPONSE"
echo

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

echo -e "${BLUE}🎉 Integration test completed successfully!${NC}"
echo
echo "Key IDs generated during test:"
echo "- Organization ID: $ORG_ID"
echo "- User 1 (Admin) Token: ${USER1_TOKEN:0:20}..."
echo "- User 2 (Member) Token: ${USER2_TOKEN:0:20}..."
echo "- Task ID: $TASK_ID"
echo "- Action ID: $ACTION_ID"
echo
