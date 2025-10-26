const express = require('express');
const errorHandler = require('./config/middlewares/errorHandler.js');
const app = express();
const ReenvioRoutes = require('./Rotas/ReenvioRota.js');

app.use(express.json());

app.use('/api', ReenvioRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorHandler);
module.exports = app;