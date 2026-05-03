const router = require('express').Router();
const { getActiveOrders, updateLocation, completeDelivery, toggleOnline, getEarnings } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('delivery'));
router.get('/active-orders', getActiveOrders);
router.put('/update-location', updateLocation);
router.put('/complete/:orderId', completeDelivery);
router.put('/toggle-online', toggleOnline);
router.get('/earnings', getEarnings);

module.exports = router;
