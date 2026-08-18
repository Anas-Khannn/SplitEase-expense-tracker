const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const groupRoutes = require("./modules/groups/group.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SplitEase API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);

module.exports = app;
