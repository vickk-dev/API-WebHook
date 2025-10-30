const express = require('express');
const errorHandler = require('./config/middlewares/errorHandler.js');
const ReenvioRoutes = require('./rotas/ReenvioRota.js');
const ProtocoloRoutes = require('./rotas/ProtocoloRota.js');
const app = express();

app.use(express.json());

app.use('/api', ReenvioRoutes);
app.use('/api', ProtocoloRoutes);

app.use(errorHandler);

module.exports = app;