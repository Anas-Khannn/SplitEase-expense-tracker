const env = require("./config/env");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SplitEase API is running",
  });
});

app.use("/api", routes);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`SplitEase server running on port ${PORT} [${env.nodeEnv}]`);
});

module.exports = app;
