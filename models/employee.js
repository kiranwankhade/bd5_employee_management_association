// models/employee.js
let { sequelize, DataTypes } = require("../lib");
// const sequelize = new Sequelize("sqlite::memory:");

const employee = sequelize.define("employee", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  // departmentId: { type: DataTypes.INTEGER, allowNull: false },
  // roleId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = { employee };
