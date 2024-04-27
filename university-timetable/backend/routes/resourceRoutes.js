// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, resourceController.createResource);
router.get('/getAllResources', resourceController.getAllResources);
router.get('/getResource/:id', resourceController.getResourceById);
router.put('/update/:id', authMiddleware, resourceController.updateResource);
router.delete('/delete/:id', authMiddleware, resourceController.deleteResource);

module.exports = router;
