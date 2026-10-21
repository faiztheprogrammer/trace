const express = require("express");
const app = express();
app.use(express.json());

const healthRouter = require('./routes/healthRoutes.js');
const bugRouter = require('./routes/bugRoutes.js');

app.use('/api/bugs', bugRouter)
app.use('/api', healthRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});