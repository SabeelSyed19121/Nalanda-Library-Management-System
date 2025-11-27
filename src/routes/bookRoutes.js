const express = require('express');
const { addBook, updateBook, deleteBook, listBooks, availabilityReport } = require('../controllers/bookController');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router();

router.route('/')
  .get(protect, listBooks)
  .post(protect, authorize('admin'), addBook);

router.route('/:id')
  .put(protect, authorize('admin'), updateBook)
  .delete(protect, authorize('admin'), deleteBook);

router.get('/reports/availability', protect, authorize('admin','member'), availabilityReport);

module.exports = router;
