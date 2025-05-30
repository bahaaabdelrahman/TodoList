const express = require('express');
const { 
  getOrganizationMembers,
  addMember,
  updateMemberRole,
  removeMember,
  getUserOrganizations,
  setActiveOrganization 
} = require('../controllers/userOrganizationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// User's organizations routes
router.route('/users/organizations')
  .get(getUserOrganizations);

router.route('/users/organizations/active')
  .post(setActiveOrganization);

// Organization members routes
router.route('/organizations/:organizationId/members')
  .get(getOrganizationMembers)
  .post(addMember);

router.route('/organizations/:organizationId/members/:userId')
  .put(updateMemberRole)
  .delete(removeMember);

module.exports = router;
