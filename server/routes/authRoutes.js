const router = require('express').Router();
const { register, login, getMe, updateProfile, addAddress, deleteAddress, refreshToken, updatePantry } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.put('/pantry', protect, updatePantry);

module.exports = router;
