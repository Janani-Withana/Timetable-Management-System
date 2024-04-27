// routes/authRoutes.js
const router = require("express").Router();
const { login,register,deleteAccount, logout } = require('../controllers/authController');
const authenticateUser = require('../middleware/authMiddleware');

router.post("/login",login);
router.post('/logout', authenticateUser,logout);
router.post('/register',register);
router.delete('/delete_account', authenticateUser,deleteAccount);

module.exports = router;
