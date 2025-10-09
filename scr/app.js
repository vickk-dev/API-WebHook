const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorHandler);
module.exports = app;