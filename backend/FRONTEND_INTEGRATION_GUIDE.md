# TodoList API Integration Guide for Frontend Developers

## Quick Start Examples

Based on our integration tests, here are real working examples of how to interact with the TodoList API.

### 1. Complete User Registration & Organization Setup

```javascript
// Step 1: Register new user with organization
const registerUser = async () => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "John Doe",
      email: "john@company.com",
      password: "securepass123",
      organizationName: "Acme Corporation",
      organizationDescription: "A leading software company"
    })
  });

  const result = await response.json();

  if (result.success) {
    // Store token for authenticated requests
    localStorage.setItem('authToken', result.token);
    return result.token;
  } else {
    throw new Error(result.error);
  }
};

// Example response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Authentication & Getting User Context

```javascript
// Step 2: Login existing user
const loginUser = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (result.success) {
    localStorage.setItem('authToken', result.token);
    return result.token;
  } else {
    throw new Error(result.error);
  }
};

// Step 3: Get current user info
const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};

// Example response:
{
  "success": true,
  "data": {
    "_id": "684d80d40c3d58e8d0151961",
    "name": "John Doe",
    "email": "john@company.com",
    "createdAt": "2025-06-14T14:01:56.859Z",
    "updatedAt": "2025-06-14T14:01:56.859Z",
    "activeOrganization": {
      "_id": "684d80d40c3d58e8d0151964",
      "name": "Acme Corporation",
      "description": "A leading software company"
    },
    "activeOrganizationRole": "admin"
  }
}
```

### 3. Organization Management

```javascript
// Get user's organizations
const getUserOrganizations = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/organizations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};

// Example response:
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "684d80d40c3d58e8d0151964",
      "name": "Acme Corporation",
      "description": "A leading software company",
      "createdBy": "684d80d40c3d58e8d0151961",
      "createdAt": "2025-06-14T14:01:56.864Z",
      "updatedAt": "2025-06-14T14:01:56.864Z",
      "userRole": "admin"
    }
  ]
}

// Create new organization
const createOrganization = async (name, description) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/organizations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description })
  });

  return await response.json();
};

// Switch organization context
const switchOrganization = async (organizationId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/organizations/${organizationId}/switch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const result = await response.json();

  if (result.success && result.data.token) {
    // Update token with new organization context
    localStorage.setItem('authToken', result.data.token);
  }

  return result;
};
```

### 4. Team Member Management

```javascript
// Get organization members
const getOrganizationMembers = async (organizationId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/organizations/${organizationId}/members`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};

// Add new member to organization
const addMemberToOrganization = async (organizationId, memberData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/organizations/${organizationId}/members`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: memberData.name,
      email: memberData.email,
      password: memberData.password, // Only if creating new user
      role: memberData.role || 'member'
    })
  });

  return await response.json();
};

// Example response:
{
  "success": true,
  "data": {
    "userId": {
      "_id": "684d80d50c3d58e8d0151979",
      "name": "Jane Smith",
      "email": "jane@company.com"
    },
    "organizationId": "684d80d40c3d58e8d0151964",
    "role": "member",
    "invitedBy": {
      "_id": "684d80d40c3d58e8d0151961",
      "name": "John Doe",
      "email": "john@company.com"
    },
    "_id": "684d80d50c3d58e8d015197c",
    "createdAt": "2025-06-14T14:01:57.403Z",
    "updatedAt": "2025-06-14T14:01:57.403Z"
  }
}

// Update member role
const updateMemberRole = async (organizationId, userId, newRole) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/organizations/${organizationId}/members/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: newRole })
  });

  return await response.json();
};

// Remove member from organization
const removeMemberFromOrganization = async (organizationId, userId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/organizations/${organizationId}/members/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};
```

### 5. Task Management

```javascript
// Create new task
const createTask = async (taskData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo, // User ID
      tags: taskData.tags || []
    })
  });

  return await response.json();
};

// Example response:
{
  "success": true,
  "data": {
    "title": "Complete integration testing",
    "description": "Test the complete task and action workflow",
    "status": "todo",
    "priority": "high",
    "userId": {
      "_id": "684d80d40c3d58e8d0151961",
      "name": "John Doe",
      "email": "john@company.com"
    },
    "organizationId": "684d80d40c3d58e8d0151964",
    "assignedTo": {
      "_id": "684d80d50c3d58e8d0151979",
      "name": "Jane Smith",
      "email": "jane@company.com"
    },
    "tags": ["integration", "testing", "workflow"],
    "dueDate": "2025-12-31T00:00:00.000Z",
    "_id": "684d81870c3d58e8d015199d",
    "createdAt": "2025-06-14T14:04:39.437Z",
    "updatedAt": "2025-06-14T14:04:39.437Z"
  }
}

// Get tasks with filtering
const getTasks = async (filters = {}) => {
  const token = localStorage.getItem('authToken');
  const queryParams = new URLSearchParams();

  // Add filters as query parameters
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.priority) queryParams.append('priority', filters.priority);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
  if (filters.tag) queryParams.append('tag', filters.tag);
  if (filters.showAll) queryParams.append('showAll', 'true'); // Admin only
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const response = await fetch(`/api/tasks?${queryParams.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};

// Example response:
{
  "success": true,
  "count": 1,
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  },
  "data": [
    {
      "_id": "684d81870c3d58e8d015199d",
      "title": "Complete integration testing",
      "description": "Test the complete task and action workflow",
      "status": "todo",
      "priority": "high",
      "userId": {
        "_id": "684d80d40c3d58e8d0151961",
        "name": "John Doe",
        "email": "john@company.com"
      },
      "organizationId": "684d80d40c3d58e8d0151964",
      "assignedTo": {
        "_id": "684d80d50c3d58e8d0151979",
        "name": "Jane Smith",
        "email": "jane@company.com"
      },
      "tags": ["integration", "testing", "workflow"],
      "dueDate": "2025-12-31T00:00:00.000Z",
      "createdAt": "2025-06-14T14:04:39.437Z",
      "updatedAt": "2025-06-14T14:04:39.437Z"
    }
  ]
}

// Update task
const updateTask = async (taskId, updates) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  return await response.json();
};

// Delete task
const deleteTask = async (taskId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};
```

### 6. Task Actions & History

```javascript
// Create action on task
const createTaskAction = async (taskId, actionData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/tasks/${taskId}/actions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: actionData.description,
      type: actionData.type, // 'note', 'status-change', 'assignment', etc.
      metadata: actionData.metadata // Optional structured data
    })
  });

  return await response.json();
};

// Example: Status change action
const updateTaskStatus = async (taskId, oldStatus, newStatus, note) => {
  return await createTaskAction(taskId, {
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    type: 'status-change',
    metadata: {
      oldStatus,
      newStatus,
      note
    }
  });
};

// Example: Progress note
const addProgressNote = async (taskId, note, progress) => {
  return await createTaskAction(taskId, {
    description: note,
    type: 'note',
    metadata: {
      progress,
      timestamp: new Date().toISOString()
    }
  });
};

// Get task actions
const getTaskActions = async (taskId, page = 1, limit = 20) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/tasks/${taskId}/actions?page=${page}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
};

// Example response:
{
  "success": true,
  "count": 2,
  "pagination": {
    "total": 2,
    "page": 1,
    "pages": 1
  },
  "data": [
    {
      "_id": "684d81880c3d58e8d01519a8",
      "taskId": "684d81870c3d58e8d015199d",
      "description": "Task completed successfully! All integration tests passed.",
      "type": "status-change",
      "userId": {
        "_id": "684d80d50c3d58e8d0151979",
        "name": "Jane Smith",
        "email": "jane@company.com"
      },
      "metadata": {
        "oldStatus": "in-progress",
        "newStatus": "completed",
        "completion_time": "2025-06-14T14:04:40+00:00",
        "success": true
      },
      "createdAt": "2025-06-14T14:04:40.125Z",
      "updatedAt": "2025-06-14T14:04:40.125Z"
    },
    {
      "_id": "684d81880c3d58e8d01519a1",
      "taskId": "684d81870c3d58e8d015199d",
      "description": "Started working on the integration testing task",
      "type": "status-change",
      "userId": {
        "_id": "684d80d50c3d58e8d0151979",
        "name": "Jane Smith",
        "email": "jane@company.com"
      },
      "metadata": {
        "oldStatus": "todo",
        "newStatus": "in-progress",
        "note": "Excited to work on this!"
      },
      "createdAt": "2025-06-14T14:04:39.718Z",
      "updatedAt": "2025-06-14T14:04:39.718Z"
    }
  ]
}
```

## Frontend Architecture Recommendations

### 1. State Management Structure

```javascript
// Redux/Zustand store structure
const appState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  },
  organizations: {
    list: [],
    active: null,
    members: {},
    loading: false,
  },
  tasks: {
    list: [],
    filters: {
      status: null,
      priority: null,
      assignedTo: null,
      search: "",
      tag: null,
      showAll: false,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    loading: false,
  },
  actions: {
    byTaskId: {},
    loading: false,
  },
};
```

### 2. API Client Setup

```javascript
// api.js - Centralized API client
class ApiClient {
  constructor(baseURL = "/api") {
    this.baseURL = baseURL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "API request failed");
    }

    return result;
  }

  // Auth methods
  auth = {
    register: (data) =>
      this.request("/auth/register", { method: "POST", body: data }),
    login: (data) =>
      this.request("/auth/login", { method: "POST", body: data }),
    me: () => this.request("/auth/me"),
  };

  // Organization methods
  organizations = {
    list: () => this.request("/organizations"),
    create: (data) =>
      this.request("/organizations", { method: "POST", body: data }),
    get: (id) => this.request(`/organizations/${id}`),
    update: (id, data) =>
      this.request(`/organizations/${id}`, { method: "PUT", body: data }),
    delete: (id) => this.request(`/organizations/${id}`, { method: "DELETE" }),
    switch: (id) =>
      this.request(`/organizations/${id}/switch`, { method: "POST", body: {} }),
    members: {
      list: (orgId) => this.request(`/organizations/${orgId}/members`),
      add: (orgId, data) =>
        this.request(`/organizations/${orgId}/members`, {
          method: "POST",
          body: data,
        }),
      updateRole: (orgId, userId, role) =>
        this.request(`/organizations/${orgId}/members/${userId}`, {
          method: "PUT",
          body: { role },
        }),
      remove: (orgId, userId) =>
        this.request(`/organizations/${orgId}/members/${userId}`, {
          method: "DELETE",
        }),
    },
  };

  // Task methods
  tasks = {
    list: (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      return this.request(`/tasks?${queryParams}`);
    },
    create: (data) => this.request("/tasks", { method: "POST", body: data }),
    get: (id) => this.request(`/tasks/${id}`),
    update: (id, data) =>
      this.request(`/tasks/${id}`, { method: "PUT", body: data }),
    delete: (id) => this.request(`/tasks/${id}`, { method: "DELETE" }),
  };

  // Action methods
  actions = {
    list: (taskId, page = 1, limit = 20) =>
      this.request(`/tasks/${taskId}/actions?page=${page}&limit=${limit}`),
    create: (taskId, data) =>
      this.request(`/tasks/${taskId}/actions`, { method: "POST", body: data }),
  };
}

export const api = new ApiClient();
```

### 3. Error Handling

```javascript
// errorHandler.js
export const handleApiError = (error, dispatch) => {
  if (error.message.includes("401") || error.message.includes("Unauthorized")) {
    // Token expired or invalid
    localStorage.removeItem("authToken");
    dispatch(logout());
    window.location.href = "/login";
    return;
  }

  if (error.message.includes("403") || error.message.includes("Forbidden")) {
    // Insufficient permissions
    dispatch(
      showNotification({
        type: "error",
        message: "You do not have permission to perform this action.",
      })
    );
    return;
  }

  // Generic error handling
  dispatch(
    showNotification({
      type: "error",
      message: error.message || "An unexpected error occurred.",
    })
  );
};
```

### 4. React Hooks for API Integration

```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      api.auth
        .me()
        .then((result) => setUser(result.data))
        .catch(() => localStorage.removeItem("authToken"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const result = await api.auth.login({ email, password });
    localStorage.setItem("authToken", result.token);
    const userResult = await api.auth.me();
    setUser(userResult.data);
    return result;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return { user, loading, login, logout };
};

// hooks/useTasks.js
export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.tasks.list(filters);
      setTasks(result.data);
      setPagination(result.pagination);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData) => {
    const result = await api.tasks.create(taskData);
    await loadTasks(); // Refresh list
    return result;
  };

  const updateTask = async (taskId, updates) => {
    const result = await api.tasks.update(taskId, updates);
    await loadTasks(); // Refresh list
    return result;
  };

  return {
    tasks,
    loading,
    pagination,
    createTask,
    updateTask,
    refreshTasks: loadTasks,
  };
};
```

This comprehensive guide provides frontend developers with real examples, practical code snippets, and architectural recommendations based on the actual API behavior demonstrated in our integration tests.
