const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  getDepartmentTickets,
  addResponse,
  createDepartment,
} = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateMongoId, validateResponse } = require('../middleware/validation');

router.use(authenticate);

router.get('/', getDepartments);
router.post(
  '/',
  authorize('admin'),
  createDepartment
);
router.get('/:id', validateMongoId('id'), getDepartment);
router.get(
  '/:id/tickets',
  validateMongoId('id'),
  authorize('admin', 'department_staff'),
  getDepartmentTickets
);
router.post(
  '/:id/response',
  validateMongoId('id'),
  authorize('admin', 'department_staff'),
  validateResponse,
  addResponse
);

module.exports = router;
