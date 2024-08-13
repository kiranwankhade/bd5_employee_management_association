// models/department.js
let { sequelize, DataTypes } = require("../lib");
// const sequelize = new Sequelize('sqlite::memory:');

const department = sequelize.define("department", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
});

module.exports = { department };
