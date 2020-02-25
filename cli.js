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
    password: "root",
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
                    updateEmployeeRole();
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
    // Selecting all managers
    var managers = ["none"]
    var query = "SELECT * from employee WHERE manager_id IS NOT NULL";
    connection.query(query, function (err, res){
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            managers.push(res[i].first_name +" "+ res[i].last_name);
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
                message: "What is the employee's role?",
                choices: roles
            },
            {
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: managers
            }
        ]).then(res => {
            // If manager ID is NULL
            if(res.manager == "none"){
                connection.query("SELECT * FROM role WHERE ?",
                {
                    title: res.role
                }, function (err, data) {
                    if (err) throw err;
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
        }
        // If manager ID is not null
        else{
            // For loop to get corresponding ID of manager
            for (let i = 0; i < managers.length; i++) {
                if (res.manager == managers[i]){
                    var managerID = i++
                }
                
            }
            connection.query("SELECT * FROM role WHERE ?",
                {
                    title: res.role
                }, function (err, data) {
                    if (err) throw err;
                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: res.first,
                            last_name: res.last,
                            role_id: data[0].id,
                            manager_id: managerID
                        }, function (err, res) {
                            if (err) throw err;
                            employeeSearch()
                        }
                    )
                }
            )
        }        
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
function updateEmployeeRole(){
    // Get a list of every employee
    var employees = []
    var query = "SELECT first_name, last_name FROM employee"
    connection.query(query, function (err, res){
        if(err) throw err;
        for (var i = 0; i < res.length; i++) {
            employees.push(res[i].first_name +" "+ res[i].last_name);
        }
    })
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
                type: "list",
                name: "employee",
                message: "Which employee would you like to update their role?",
                choices: employees
            },
            {
                type: "list",
                name: "newRole",
                message: "What is the employee's new role?",
                choices: roles
            }
        ])

// Ask which employee's role should be updated

}