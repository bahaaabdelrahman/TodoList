const express = require('express');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  addUserToOrganization,
  removeUserFromOrganization
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the organization
 *         name:
 *           type: string
 *           description: The organization name
 *         description:
 *           type: string
 *           description: The organization description
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the organization was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the organization was last updated
 */

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create new organization
 *     description: Create a new organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *               description:
 *                 type: string
 *                 description: Organization description
 *     responses:
 *       201:
 *         description: Organization created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request - Organization with this name already exists
 */
router.post('/', createOrganization);

// Protect all routes below
router.use(protect);

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get an organization
 *     description: Get details of a specific organization
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not your organization
 *       404:
 *         description: Organization not found
 */
router.get('/:id', getOrganization);

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get all organizations
 *     description: Get a list of all organizations (admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin access required
 */
router
  .route('/')
  .get(authorize('admin'), getOrganizations);

/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     summary: Update organization
 *     description: Update organization details (admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *               description:
 *                 type: string
 *                 description: Organization description
 *     responses:
 *       200:
 *         description: Organization updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin access required or not your organization
 *       404:
 *         description: Organization not found
 *
 *   delete:
 *     summary: Delete organization
 *     description: Delete an organization (admin only, no users must exist)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted
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
 *       400:
 *         description: Bad request - Cannot delete organization with users
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin access required or not your organization
 *       404:
 *         description: Organization not found
 */
router
  .route('/:id')
  .put(authorize('admin'), updateOrganization)
  .delete(authorize('admin'), deleteOrganization);

/**
 * @swagger
 * /api/organizations/{id}/users:
 *   post:
 *     summary: Add user to organization
 *     description: Add a new user to an organization (admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 default: member
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User added to organization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - User with this email already exists
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin access required or not your organization
 *       404:
 *         description: Organization not found
 */
router
  .route('/:id/users')
  .post(authorize('admin'), addUserToOrganization);

/**
 * @swagger
 * /api/organizations/{id}/users/{userId}:
 *   delete:
 *     summary: Remove user from organization
 *     description: Remove a user from an organization (admin only)
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User removed from organization
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
 *       400:
 *         description: Bad request - Cannot remove last admin or user not in organization
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin access required or not your organization
 *       404:
 *         description: Organization or user not found
 */
router
  .route('/:id/users/:userId')
  .delete(authorize('admin'), removeUserFromOrganization);

module.exports = router;
