const express = require('express');
const { borrowBook, returnBook, memberHistory, mostBorrowedBooks, activeMembers } = require('../controllers/borrowController');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router();

router.post('/borrow', protect, authorize('member'), borrowBook);
router.post('/return', protect, authorize('member'), returnBook);
router.get('/history/me', protect, authorize('member'), memberHistory);


router.get('/reports/most-borrowed', protect, authorize('admin','member'), mostBorrowedBooks);
router.get('/reports/active-members', protect, authorize('admin'), activeMembers);

module.exports = router;
