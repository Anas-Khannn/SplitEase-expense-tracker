const env = require("./config/env");
const app = require("./app");

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`SplitEase server running on port ${PORT} [${env.nodeEnv}]`);
});
