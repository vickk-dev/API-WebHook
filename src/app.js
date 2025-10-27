const express = require('express');
const errorHandler = require('./config/middlewares/errorHandler.js');
const app = express();
const ReenvioRoutes = require('./Rotas/ReenvioRota.js');
const ProtocoloRoutes = require('./rotas/ProtocoloRota.js');

app.use(express.json());

app.use('/api', ReenvioRoutes);
app.use('/api', ProtocoloRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorHandler);
module.exports = app;