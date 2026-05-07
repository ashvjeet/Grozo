const router = require('express').Router();
const { initiatePayment, verifyOtp, paymentCallback } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/initiate', initiatePayment);
router.post('/verify-otp', verifyOtp);
router.post('/callback', paymentCallback);

module.exports = router;
