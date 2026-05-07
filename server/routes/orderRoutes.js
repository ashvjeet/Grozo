const router = require('express').Router();
const { placeOrder, getMyOrders, getOrder, cancelOrder, updateOrderStatus, reorder, getSpendingInsights, getActiveOrders } = require('../controllers/orderController');
const { getInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/place', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/spending-insights', getSpendingInsights);
router.get('/active', authorize('admin', 'delivery'), getActiveOrders);
router.get('/:id', getOrder);
router.get('/:id/invoice', getInvoice);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', authorize('admin', 'delivery'), updateOrderStatus);
router.post('/:id/reorder', reorder);

module.exports = router;
