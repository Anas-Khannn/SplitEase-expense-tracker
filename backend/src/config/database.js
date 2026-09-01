const { Sequelize } = require("sequelize");
const env = require("./env");

let sequelize;

if (process.env.NODE_ENV === "test") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: "postgres",
    logging: env.nodeEnv === "development" ? console.log : false,
  });
}

module.exports = sequelize;
