// models/role.js
let { sequelize, DataTypes } = require("../lib");
// const sequelize = new Sequelize("sqlite::memory:");

const role = sequelize.define("role", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
});

module.exports = { role };
