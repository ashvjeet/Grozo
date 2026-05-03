const router = require('express').Router();
const { getDashboard, getAllOrders, getAnalytics, getAllUsers, manageCoupon, updateCoupon, deleteCoupon } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.route('/coupons').get(manageCoupon).post(manageCoupon);
router.route('/coupons/:id').put(updateCoupon).delete(deleteCoupon);

module.exports = router;
