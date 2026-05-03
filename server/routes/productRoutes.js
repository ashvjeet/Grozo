const router = require('express').Router();
const { getProducts, getProduct, getCategories, getFlashDeals, getRecommendations, optimizeBasket, generateMealPlan, createProduct, updateProduct, deleteProduct, addReview } = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/flash-deals', getFlashDeals);
router.get('/recommendations', protect, getRecommendations);
router.post('/optimize-basket', protect, optimizeBasket);
router.post('/meal-planner', protect, generateMealPlan);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
