const express = require('express');
const router = express.Router();
const { reenviarController } = require('../controller/ReenvioController');

// POST /api/reenviar
router.post('/reenviar', reenviarController);

module.exports = router;