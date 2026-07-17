const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// importing routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const resourceRoutes = require("./routes/resource");
const medicalRoutes =  require("./routes/medicalRoutes.js");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/medical", medicalRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));