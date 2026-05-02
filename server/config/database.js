const mongoose = require("mongoose");
require("dotenv").config();


class DatabaseConnection {
  static #instance = null;

  constructor() {
    this._connected = false;
  }

  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
    }
    return DatabaseConnection.#instance;
  }

  connect() {
    if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
    ) {
      console.log("DATABASE already connected.");
      return;
    }

    mongoose
      .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        this._connected = true;
        console.log("DATABASE CONNECTED SUCCESSFULLY !!");
      })
      .catch((error) => {
        console.error("ERROR IN DATABASE CONNECTION !!", error);
        process.exit(1);
      });
  }

  get isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = DatabaseConnection.getInstance();