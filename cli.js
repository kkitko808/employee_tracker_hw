var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table")
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "employee_tracker_db"
});

connection.connect(function (err) {
    if (err) throw err;
    runSearch();
});

function runSearch() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View all Employees",
                "View all Departments",
                "View all Roles",
                "Add Employee",
                "Add Department",
                "Add Role",
                "Update Employee Roles",
                "EXIT"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View all Employees":
                    employeeSearch();
                    break;

                case "View all Departments":
                    departmentSearch();
                    break;

                case "View all Roles":
                    roleSearch();
                    break;

                case "Add Employee":
                    addEmployee();
                    break;

                case "Add Department":
                    addDepartment();
                    break;

                case "Add Role":
                    addRole();
                    break;

                case "Update Employee Roles":
                    updateEmployee();
                    break;

                case "exit":
                    connection.end();
                    break;
            }
        });
}
function employeeSearch() {
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].first_name, res[i].last_name);
        }
        runSearch();
    });
}

function departmentSearch() {
    var query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].name);
        }
        runSearch();
    });
}

function roleSearch() {
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            console.log(res[i].title + ", Salary: ", res[i].salary);
        }
        runSearch();
    });
}

function addEmployee() {
    // Selecting every role and pushing it into a list
    var roles = []
    var query = "SELECT * from role";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    })

    inquirer
        .prompt([
            {
                name: "first",
                message: "What is the employee's first name?"
            },
            {
                name: "last",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role",
                message: "What is their role?",
                choices: roles
            }
        ]).then(res => {
            // Open conenction to get id of role
            connection.query("SELECT * FROM role WHERE ?",
                {
                    title: res.role
                }, function (err, data) {
                    if (err) throw err;
                    console.log(data[0].id)
                    // console.log("the role id for " + res.role + " is :" + res[1].id)
                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: res.first,
                            last_name: res.last,
                            role_id: data[0].id
                        }, function (err, res) {
                            if (err) throw err;
                            employeeSearch()
                        }
                    )
                }
            )
        })
}
function addDepartment() {
    // Selecting every role and pushing it into a list

    inquirer
        .prompt([
            {
                name: "name",
                message: "What is the department name?"
            }
        ]).then(res => {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: res.name,
                }, function (err, res) {
                    if (err) throw err;
                    departmentSearch()
                }
            )
        })
}

function addRole() {
    // Selecting every role and pushing it into a list

    inquirer
        .prompt([
            {
                name: "title",
                message: "What is the role title?"
            },
            {
                name: "salary",
                message: "What is the role's salary?"
            },
        ]).then(res => {
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: res.title,
                    salary: res.salary
                }, function (err, res) {
                    if (err) throw err;
                    roleSearch()
                }
            )
        })
}