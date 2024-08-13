const express = require("express");
const app = express();
let { sequelize } = require("./lib/index");
const { employee } = require("./models/employee");
const { department } = require("./models/department");
const { role } = require("./models/role");
const { employeeDepartment } = require("./models/employeeDepartment");
const { employeeRole } = require("./models/employeeRole");
var cors = require("cors");

app.use(express.json());
app.use(cors());

// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { employeeId },
  });

  let departmentData;
  for (let empDep of employeeDepartments) {
    departmentData = await department.findOne({
      where: { id: empDep.departmentId },
    });
  }

  return departmentData;
}

// Helper function to get employee's associated roles
async function getEmployeeRoles(employeeId) {
  const employeeRoles = await employeeRole.findAll({
    where: { employeeId },
  });

  let roleData;
  for (let empRole of employeeRoles) {
    roleData = await role.findByPk(empRole.roleId);
  }

  return roleData;
}

// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  employeeData.department = department;
  employeeData.role = role;
  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

// Endpoint to seed database
app.get("/seed_db", async (req, res) => {
  await sequelize.sync({ force: true });

  const departments = await department.bulkCreate([
    { name: "Engineering" },
    { name: "Marketing" },
  ]);

  const roles = await role.bulkCreate([
    { title: "Software Engineer" },
    { title: "Marketing Specialist" },
    { title: "Product Manager" },
  ]);

  const employees = await employee.bulkCreate([
    { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
    { name: "Priya Singh", email: "priya.singh@example.com" },
    { name: "Ankit Verma", email: "ankit.verma@example.com" },
  ]);

  // Associate employees with departments and roles
  await employees[0].setDepartments([departments[0]]);
  await employees[0].setRoles([roles[0]]);

  await employees[1].setDepartments([departments[1]]);
  await employees[1].setRoles([roles[1]]);

  await employees[2].setDepartments([departments[0]]);
  await employees[2].setRoles([roles[2]]);

  return res.json({ message: "Database seeded!" });
});

// Endpoint to get all employees with their departments and roles
app.get("/employees", async (req, res) => {
  const employees = await employee.findAll();

  const employeesWithDetails = [];
  for (let employeeData of employees) {
    const detailedEmployee = await getEmployeeDetails(employeeData);
    employeesWithDetails.push(detailedEmployee);
  }

  return res.json({ employees: employeesWithDetails });
});

// Endpoint to get employee by ID with their departments and roles
app.get("/employees/details/:id", async (req, res) => {
  const employeeData = await employee.findByPk(req.params.id);
  if (!employeeData) {
    return res.status(404).send({ message: "Employee not found" });
  }

  const detailedEmployee = await getEmployeeDetails(employeeData);
  return res.json({ employee: detailedEmployee });
});

// Endpoint to get employees by department
app.get("/employees/department/:departmentId", async (req, res) => {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { departmentId: req.params.departmentId },
  });

  const employeesWithDetails = [];
  for (let empDep of employeeDepartments) {
    const employeeData = await employee.findByPk(empDep.employeeId);
    const detailedEmployee = await getEmployeeDetails(employeeData);
    employeesWithDetails.push(detailedEmployee);
  }

  return res.json({ employees: employeesWithDetails });
});

// Endpoint to get employees by role
app.get("/employees/role/:roleId", async (req, res) => {
  const employeeRoles = await employeeRole.findAll({
    where: { roleId: req.params.roleId },
  });

  const employeesWithDetails = [];
  for (let empRole of employeeRoles) {
    const employeeData = await employee.findByPk(empRole.employeeId);
    const detailedEmployee = await getEmployeeDetails(employeeData);
    employeesWithDetails.push(detailedEmployee);
  }

  return res.json({ employees: employeesWithDetails });
});

// Endpoint to get employees sorted by name
app.get("/employees/sort-by-name", async (req, res) => {
  const order = req.query.order || "ASC";
  const employees = await employee.findAll({ order: [["name", order]] });

  const employeesWithDetails = [];
  for (let employeeData of employees) {
    const detailedEmployee = await getEmployeeDetails(employeeData);
    employeesWithDetails.push(detailedEmployee);
  }

  return res.json({ employees: employeesWithDetails });
});

// Endpoint to add a new employee and associate with departments and roles
app.post("/employees/new", async (req, res) => {
  const { name, email, departmentId, roleId } = req.body;

  const employeeData = await employee.create({ name, email });

  if (departmentId) {
    await employeeDepartment.create({
      employeeId: employeeData.id,
      departmentId,
    });
  }

  if (roleId) {
    await employeeRole.create({ employeeId: employeeData.id, roleId });
  }

  const detailedEmployee = await getEmployeeDetails(employeeData);
  return res.json({ employee: detailedEmployee });
});

// Endpoint to update employee details and their associations
app.post("/employees/update/:id", async (req, res) => {
  const { name, email, departmentId, roleId } = req.body;
  const employeeData = await employee.findByPk(req.params.id);

  if (!employeeData) {
    return res.status(404).send({ message: "Employee not found" });
  }

  if (name) employeeData.name = name;
  if (email) employeeData.email = email;

  await employeeData.save();

  if (departmentId) {
    await employeeDepartment.destroy({
      where: {
        employeeId: parseInt(employeeData.id),
      },
    });
    await employeeDepartment.create({
      employeeId: employeeData.id,
      departmentId,
    });
  }

  if (roleId) {
    await employeeRole.destroy({
      where: { employeeId: employeeData.id },
    });
    await employeeRole.create({ employeeId: employeeData.id, roleId });
  }

  const detailedEmployee = await getEmployeeDetails(employeeData);
  return res.json({ employee: detailedEmployee });
});

// Endpoint to delete an employee
app.post("/employees/delete", async (req, res) => {
  try {
    const employeeData = await employee.findByPk(req.body.id);
    if (!employeeData) {
      return res.status(404).json({ message: "Employee not found" });
    } else {
      await employeeDepartment.destroy({
        where: { employeeId: parseInt(req.body.id) },
      });
      await employeeRole.destroy({
        where: { employeeId: parseInt(req.body.id) },
      });
      await employeeData.destroy();

      return res.json({
        message: `Employee with ID ${req.body.id} has been deleted.`,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
