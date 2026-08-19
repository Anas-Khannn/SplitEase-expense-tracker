const app = require("./app");
const env = require("./config/env");

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`SplitEase server running on port ${PORT} [${env.nodeEnv}]`);
});
