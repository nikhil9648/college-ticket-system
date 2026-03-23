const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  getTicketSolutions,
} = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');
const { validateTicket, validateMongoId } = require('../middleware/validation');

router.use(authenticate);

router.route('/').get(getTickets).post(validateTicket, createTicket);

router
  .route('/:id')
  .get(validateMongoId('id'), getTicket)
  .put(validateMongoId('id'), updateTicket)
  .delete(validateMongoId('id'), deleteTicket);

router.get('/:id/solutions', validateMongoId('id'), getTicketSolutions);

module.exports = router;
