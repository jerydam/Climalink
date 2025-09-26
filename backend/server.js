const express = require('express');
const app = express();
const cors = require('cors');
const apiRoutes = require('./routes/api');


require('dotenv').config(); 
// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());



app.use(cors());
app.use('/api', apiRoutes);

app.get("/", (req, res)=>{
    res.send("Welcome to Prediction API")
});

// Start server
app.listen(process.env.PORT, () => {
    console.log(`Server started at ${process.env.PORT}`);
});