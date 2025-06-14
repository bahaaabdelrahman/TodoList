# TodoList Application - User Stories & Business Requirements

## Project Overview

The TodoList application is a multi-organization task management system that allows users to create organizations, manage teams, assign tasks, and track progress through actions and comments.

---

## Core User Stories

### 1. User Registration & Organization Creation

**As a new user,**  
**I want to register an account and create my organization,**  
**So that I can start managing tasks for my team.**

#### Acceptance Criteria:

- ✅ User provides: name, email, password, organization name, organization description
- ✅ System validates email uniqueness
- ✅ System creates user account with encrypted password
- ✅ System automatically creates organization with user as admin
- ✅ System returns JWT token with organization context (activeOrgId, activeOrgRole)
- ✅ User becomes the first admin of the organization

#### Business Rules:

- Email must be unique across the entire system
- Organization name must be unique
- First user in organization automatically gets admin role
- Password must be at least 6 characters
- JWT token includes organization context for subsequent API calls

#### Frontend Implications:

- Registration form needs both user and organization fields
- Store JWT token for authenticated requests
- Redirect to dashboard after successful registration
- Handle validation errors (duplicate email, weak password)

---

### 2. User Authentication & Session Management

**As a registered user,**  
**I want to log in to my account,**  
**So that I can access my organizations and tasks.**

#### Acceptance Criteria:

- ✅ User provides email and password
- ✅ System validates credentials
- ✅ System returns JWT token (may include last used organization context)
- ✅ User can access protected endpoints with valid token
- ✅ Token expires after configured time (30 days default)

#### Business Rules:

- Login with email and password only
- Token includes user ID and optionally organization context
- Invalid credentials return specific error messages
- System maintains user session until token expires

#### Frontend Implications:

- Login form with email/password fields
- Store token in secure storage (localStorage/sessionStorage)
- Add Authorization header to all authenticated requests
- Handle token expiration and redirect to login
- Implement logout functionality (clear token)

---

### 3. Organization Management

**As an organization admin,**  
**I want to manage my organization settings and view organization details,**  
**So that I can maintain accurate organization information.**

#### Acceptance Criteria:

- ✅ Admin can view organization details (name, description, creation date)
- ✅ Admin can update organization information
- ✅ Admin can see organization member count and roles
- ✅ System prevents deletion of organization with multiple members
- ✅ Admin can switch between multiple organizations if member of several

#### Business Rules:

- Only organization admins can modify organization details
- Organization name must remain unique when updating
- Cannot delete organization with existing members
- User can be member of multiple organizations
- Organization creator is automatically the first admin

#### Frontend Implications:

- Organization settings page (admin only)
- Organization selector dropdown if user belongs to multiple orgs
- Display current organization context in header/sidebar
- Organization dashboard with statistics (member count, task count)

---

### 4. Team Member Management

**As an organization admin,**  
**I want to invite and manage team members,**  
**So that I can build my team and assign appropriate roles.**

#### Acceptance Criteria:

- ✅ Admin can invite new users by email with name and password
- ✅ Admin can invite existing users by email (no password needed)
- ✅ Admin can assign roles: 'member' or 'admin'
- ✅ Admin can change member roles (promote/demote)
- ✅ Admin can remove members from organization
- ✅ System prevents removing the last admin from organization
- ✅ System shows who invited each member and when

#### Business Rules:

- Only admins can manage organization members
- Cannot have organization with zero admins
- Cannot demote the last admin
- New users are created if they don't exist
- Existing users are added to organization if found by email
- Default role for new members is 'member'

#### Frontend Implications:

- Team management page (admin only)
- Member invitation form with role selection
- Member list with role badges and management actions
- Role change confirmation dialogs
- Display invitation history (who invited whom)
- Prevent UI actions that would violate business rules

---

### 5. Organization Context Switching

**As a user who belongs to multiple organizations,**  
**I want to switch between organizations,**  
**So that I can work with tasks and teams from different organizations.**

#### Acceptance Criteria:

- ✅ User can view all organizations they belong to
- ✅ User can switch active organization context
- ✅ System returns new JWT token with updated organization context
- ✅ All subsequent operations use the active organization context
- ✅ User sees their role in each organization

#### Business Rules:

- User can only switch to organizations they're a member of
- Switching updates the JWT token with new activeOrgId and activeOrgRole
- Tasks, members, and other data are filtered by active organization
- User role may differ between organizations

#### Frontend Implications:

- Organization switcher component in header/sidebar
- Update token when switching organizations
- Refresh current page data after organization switch
- Show user's role in current organization
- Filter all data by current organization context

---

### 6. Task Creation & Assignment

**As a team member,**  
**I want to create tasks and assign them to team members,**  
**So that work can be organized and tracked within my organization.**

#### Acceptance Criteria:

- ✅ User can create tasks with: title, description, status, priority, due date, tags
- ✅ User can assign tasks to any member of the same organization
- ✅ User can create unassigned tasks (self-assigned)
- ✅ System validates assigned user belongs to same organization
- ✅ Task creator is recorded as 'userId'
- ✅ Tasks are automatically associated with user's active organization

#### Business Rules:

- Tasks belong to the user's active organization
- Can only assign tasks to members of the same organization
- Task creator and assigned user can be different
- Default status is 'todo', default priority is 'medium'
- Tags are optional and stored as array of strings
- Due date is optional

#### Frontend Implications:

- Task creation form with all fields
- Member selector dropdown (organization members only)
- Tag input with autocomplete
- Date picker for due date
- Status and priority selectors
- Rich text editor for description (optional)

---

### 7. Task Management & Updates

**As a task creator, assigned user, or organization admin,**  
**I want to update task details and status,**  
**So that I can keep task information current and track progress.**

#### Acceptance Criteria:

- ✅ Task creator can update all task fields
- ✅ Assigned user can update task status and description
- ✅ Organization admin can update any task in organization
- ✅ System validates assigned user still belongs to organization
- ✅ System automatically sets completedAt when status becomes 'completed'
- ✅ System clears completedAt when status changes from 'completed'

#### Business Rules:

- Only creator, assigned user, or admin can update tasks
- Cannot assign task to user from different organization
- Status changes automatically manage completion timestamps
- Task organization cannot be changed after creation

#### Frontend Implications:

- Task edit form with permission-based field visibility
- Status change buttons with visual feedback
- Completion status indicators and timestamps
- Assignment validation and user search
- Bulk status update capabilities
- Task history/audit trail display

---

### 8. Task Visibility & Filtering

**As a team member,**  
**I want to view tasks relevant to me,**  
**So that I can focus on my work and responsibilities.**

**As an organization admin,**  
**I want to view all organization tasks,**  
**So that I can oversee project progress.**

#### Acceptance Criteria:

- ✅ Members see tasks they created or are assigned to
- ✅ Admins can see all organization tasks with 'showAll=true' parameter
- ✅ Users can filter tasks by: status, priority, assigned user, search text, tags
- ✅ System supports pagination for large task lists
- ✅ Search works on task title and description
- ✅ Tasks are sorted by creation date (newest first) by default

#### Business Rules:

- Task visibility is role-based (member vs admin)
- All task operations respect organization boundaries
- Search is case-insensitive partial matching
- Pagination helps with performance on large datasets

#### Frontend Implications:

- Different task views for admins vs members
- Advanced filtering sidebar/toolbar
- Search input with debounced API calls
- Pagination controls with page size options
- Task list with sorting options
- Filter chips showing active filters
- "Show All Tasks" toggle for admins

---

### 9. Task Actions & History Tracking

**As a team member working on tasks,**  
**I want to log actions and progress on tasks,**  
**So that there's a clear history of what happened and when.**

#### Acceptance Criteria:

- ✅ Users can create different types of actions: note, status-change, assignment, priority-change, due-date-change
- ✅ Actions automatically include user, timestamp, and description
- ✅ Actions can include structured metadata (old/new values, additional context)
- ✅ Status-change actions can automatically update task completion status
- ✅ Actions are displayed in chronological order (newest first)
- ✅ Users can view complete action history for any accessible task

#### Business Rules:

- Actions are immutable once created (no editing/deleting)
- Only users with task access can create actions
- System actions are created automatically for some changes
- Action metadata structure varies by action type
- Actions provide complete audit trail for tasks

#### Frontend Implications:

- Action creation form with type selection
- Rich metadata forms for different action types
- Action timeline/feed component
- Action type icons and visual styling
- Real-time action updates (websockets/polling)
- Action filtering and search within task
- Expandable action details for metadata

---

### 10. Task Search & Advanced Filtering

**As a user managing multiple tasks,**  
**I want to search and filter tasks efficiently,**  
**So that I can quickly find the tasks I need to work on.**

#### Acceptance Criteria:

- ✅ Users can search tasks by title and description (case-insensitive)
- ✅ Users can filter by status (todo, in-progress, completed)
- ✅ Users can filter by priority (low, medium, high)
- ✅ Users can filter by specific tags
- ✅ Users can combine multiple filters
- ✅ Search and filters work with pagination

#### Business Rules:

- Search is partial text matching
- Filters can be combined (AND logic)
- Results respect user's task visibility permissions
- Empty searches return all accessible tasks

#### Frontend Implications:

- Global search bar with autocomplete
- Advanced filter panel with multiple options
- Filter state management and URL persistence
- Clear all filters option
- Filter result counts and summaries
- Saved search/filter presets

---

## Technical Integration Points

### Authentication Flow

1. User registers → Gets JWT with org context
2. User logs in → Gets JWT (may include last org context)
3. User switches org → Gets new JWT with different org context
4. All API calls include Authorization header with Bearer token

### Data Relationships

- **User** ↔ **UserOrganization** ↔ **Organization** (many-to-many)
- **User** → **Task** (creator)
- **User** → **Task** (assignee)
- **Organization** → **Task** (contains)
- **Task** → **Action** (history)
- **User** → **Action** (creator)

### Permission Matrix

| Role   | View Own Tasks | View All Tasks | Create Tasks | Update Any Task        | Manage Members | Manage Org |
| ------ | -------------- | -------------- | ------------ | ---------------------- | -------------- | ---------- |
| Member | ✅             | ❌             | ✅           | ❌ (only own/assigned) | ❌             | ❌         |
| Admin  | ✅             | ✅             | ✅           | ✅                     | ✅             | ✅         |

### API Endpoints Summary

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Organizations**: `/api/organizations` (CRUD + member management)
- **Members**: `/api/organizations/{id}/members` (add, remove, update roles)
- **Tasks**: `/api/tasks` (CRUD with filtering and search)
- **Actions**: `/api/tasks/{id}/actions` (create, list)
- **Context**: `/api/organizations/{id}/switch` (switch active organization)

---

## Frontend Development Priorities

### Phase 1: Core Authentication & Organization

1. Registration/Login forms
2. Organization dashboard
3. Basic organization management

### Phase 2: Task Management

1. Task creation and listing
2. Task updates and status changes
3. Basic filtering and search

### Phase 3: Team Collaboration

1. Member management (admin features)
2. Task assignment workflows
3. Organization switching

### Phase 4: Advanced Features

1. Task actions and history
2. Advanced filtering and search
3. Reporting and analytics
4. Real-time updates

---

## Error Handling Scenarios

### Common Error Cases to Handle:

- **401 Unauthorized**: Token expired or invalid → Redirect to login
- **403 Forbidden**: Insufficient permissions → Show error message
- **404 Not Found**: Resource doesn't exist → Handle gracefully
- **400 Bad Request**: Validation errors → Show field-specific errors
- **500 Server Error**: Server issues → Show generic error with retry option

### Business Logic Errors:

- Cannot assign task to user from different organization
- Cannot remove last admin from organization
- Cannot delete organization with existing members
- User already member of organization
- Organization name already exists

---

This documentation provides the frontend developer with a complete understanding of the business logic, user workflows, and technical requirements for building the TodoList application interface.
