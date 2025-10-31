const express = require('express');
const router = express.Router();
const { reenviarController } = require('../controller/ReenvioController');
const authMiddleware = require('../config/middlewares/authMiddleware');

// POST /api/reenviar
router.post('/reenviar', authMiddleware, reenviarController);

module.exports = router;