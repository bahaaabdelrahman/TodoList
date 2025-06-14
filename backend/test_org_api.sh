#!/bin/bash

# Test Organization API

echo "=== Testing Organization API ==="
echo

# Set the JWT token (you'll need to replace this with a valid token)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NGQ3N2JkNTM2MDRjZWMwYWJjNGEyYiIsImlhdCI6MTc0OTkwNzQ0OCwiZXhwIjoxNzUyNDk5NDQ4fQ.r9h6PCsTrcjKOZasWVkycw2_P1nJdBUcsCnVp0WVTNY"

echo "1. Testing Authentication - GET /api/auth/me"
curl -s -X GET 'http://localhost:5000/api/auth/me' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo
echo "---"
echo

echo "2. Creating Organization - POST /api/organizations"
curl -s -X POST 'http://localhost:5000/api/organizations' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name": "Test Organization via Script", "description": "Created via test script"}' | python3 -m json.tool
echo
echo "---"
echo

echo "3. Getting User Organizations - GET /api/organizations"
curl -s -X GET 'http://localhost:5000/api/organizations' \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo
echo "---"
echo

echo "=== Test Complete ==="
