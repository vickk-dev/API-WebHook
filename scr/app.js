const express = require('express');
const errorHandler = require('./config/middlewares/errorHandler.js');
const app = express();
const reenvioRoutes = require('./routes/reenvioRoutes');

app.use(express.json());

// Prefixo para as rotas da API
app.use('/api', ReenvioRota);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorHandler);
module.exports = app;