const express = require('express');
const {
  getAction,
  updateAction,
  deleteAction
} = require('../controllers/actionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Action:
 *       type: object
 *       required:
 *         - taskId
 *         - description
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the action
 *         taskId:
 *           type: string
 *           description: ID of the related task
 *         description:
 *           type: string
 *           description: Description of the action
 *         type:
 *           type: string
 *           enum: [note, status-change, assignment, priority-change, due-date-change, other]
 *           description: Type of action
 *         userId:
 *           type: string
 *           description: ID of user who created the action
 *         metadata:
 *           type: object
 *           description: Additional data related to the action
 *         completedAt:
 *           type: string
 *           format: date
 *           description: When the action was completed
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date action was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date action was last updated
 */

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/actions/{id}:
 *   get:
 *     summary: Get a single action
 *     description: Get details of a specific action
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Action ID
 *     responses:
 *       200:
 *         description: Action details
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
 *         description: Forbidden - not your organization
 *       404:
 *         description: Action not found
 *
 *   put:
 *     summary: Update an action
 *     description: Update an action (creator or admin only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Action ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Action description
 *               type:
 *                 type: string
 *                 enum: [note, status-change, assignment, priority-change, due-date-change, other]
 *                 description: Type of action
 *               metadata:
 *                 type: object
 *                 description: Additional data related to the action
 *               completedAt:
 *                 type: string
 *                 format: date
 *                 description: When the action was completed
 *     responses:
 *       200:
 *         description: Action updated
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
 *         description: Forbidden - not authorized to update this action
 *       404:
 *         description: Action not found
 *
 *   delete:
 *     summary: Delete an action
 *     description: Delete an action (creator or admin only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Action ID
 *     responses:
 *       200:
 *         description: Action deleted
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
 *         description: Forbidden - not authorized to delete this action
 *       404:
 *         description: Action not found
 */
router
  .route('/:id')
  .get(getAction)
  .put(updateAction)
  .delete(deleteAction);

module.exports = router;
