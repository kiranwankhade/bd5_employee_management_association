const { sequelize, DataTypes } = require("../lib");
const { department } = require("./department");
const { employee } = require("./employee");

const employeeDepartment = sequelize.define('employeeDepartment',{
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: "id",
    },
  },
  departmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: department,
      key: "id",
    },
  },
});

employee.belongsToMany(department, { through: employeeDepartment });
department.belongsToMany(employee, { through: employeeDepartment });

module.exports = { employeeDepartment };
