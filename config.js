require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

module.exports = { JWT_SECRET, MONGO_URI };
