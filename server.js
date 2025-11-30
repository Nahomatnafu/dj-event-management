const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('frontend/public'));

app.get('/', (req, res) => {
    res.send('DJ Event Management System - Coming Soon!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});