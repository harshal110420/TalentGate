const { Sequelize } = require("sequelize");
require("dotenv").config();

// 🟢 Main Talent Gate DB
const dashMatrixSequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// 🔵 Website DB
// const sequelizeWebsite = new Sequelize(
//   process.env.WEBSITE_DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT || "mysql",
//     port: process.env.DB_PORT || 3306,
//     logging: false,
//   }
// );

// 🧪 Test both connections
(async () => {
  try {
    await dashMatrixSequelize.authenticate();
    console.log("✅ Connected to Talent Gate DB");

    // await sequelizeWebsite.authenticate();
    console.log("✅ Connected to Website DB");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

module.exports = { dashMatrixSequelize };
