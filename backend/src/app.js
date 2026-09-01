const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const HTTP_STATUSES = require("./constants/http-statuses");
const env = require("./config/env");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.cors.origin,
  }),
);

app.get("/api/health", (req, res) => {
  res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: "SplitEase API is running",
  });
});

app.use("/api", routes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  const PORT = env.port;
  app.listen(PORT, () => {
    console.log(`SplitEase server running on port ${PORT} [${env.nodeEnv}]`);
  });
}

module.exports = app;
