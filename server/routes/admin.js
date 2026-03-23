const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAnalytics,
  getUsers,
  updateUser,
  updateSettings,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', validateMongoId('id'), updateUser);
router.put('/settings', updateSettings);

module.exports = router;
