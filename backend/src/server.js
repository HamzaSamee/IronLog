"use strict";

require("dotenv").config();
const app = require("./app");
const connectMongoDB = require("./config/mongodb");

// Connect to MongoDB Atlas
connectMongoDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

app.get("/",(req,res)=>{
  res.send("Welcome to the Activity Tracker API");
})

module.exports = server;
