const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const {
  createAction,
  getActions
} = require('../controllers/actionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - userId
 *         - organizationId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the task
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *           description: Task status
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Task due date
 *         userId:
 *           type: string
 *           description: ID of user who created the task
 *         organizationId:
 *           type: string
 *           description: ID of the organization the task belongs to
 *         assignedTo:
 *           type: string
 *           description: ID of user assigned to the task
 *         completedAt:
 *           type: string
 *           format: date
 *           description: When the task was completed
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with task
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date task was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date task was last updated
 */

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task within the user's organization
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, completed]
 *                 default: todo
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 description: Task priority
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *               assignedTo:
 *                 type: string
 *                 description: ID of user to assign task to
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with task
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *
 *   get:
 *     summary: Get tasks
 *     description: Get tasks created by or assigned to the authenticated user (admins can get all tasks in their organization)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: showAll
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: For admins - show all tasks in organization
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 */
router
  .route('/')
  .post(createTask)
  .get(getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     description: Get details of a specific task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not your organization
 *       404:
 *         description: Task not found
 *
 *   put:
 *     summary: Update a task
 *     description: Update a task (creator, assigned user, or admin only)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, completed]
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *               assignedTo:
 *                 type: string
 *                 description: ID of user to assign task to
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with task
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized to update this task
 *       404:
 *         description: Task not found
 *
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task (creator or admin only)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized to delete this task
 *       404:
 *         description: Task not found
 */
router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

/**
 * @swagger
 * /api/tasks/{taskId}/actions:
 *   post:
 *     summary: Create an action for a task
 *     description: Add a new action to a task
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Action description
 *               type:
 *                 type: string
 *                 enum: [note, status-change, assignment, priority-change, due-date-change, other]
 *                 default: note
 *                 description: Type of action
 *               metadata:
 *                 type: object
 *                 description: Additional data related to the action
 *               completedAt:
 *                 type: string
 *                 format: date
 *                 description: When the action was completed
 *     responses:
 *       201:
 *         description: Action created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized to add actions to this task
 *       404:
 *         description: Task not found
 *
 *   get:
 *     summary: Get task actions
 *     description: Get all actions for a specific task
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of actions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Action'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not authorized to view actions for this task
 *       404:
 *         description: Task not found
 */
router
  .route('/:taskId/actions')
  .post(createAction)
  .get(getActions);

module.exports = router;
