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
                "Remove Employee",
                "Add Department",
                "Add Role",
                "Update Employee Role",
                "Update Employee Manager",
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

                case "Remove Employee":
                    removeEmployee();
                    break;

                case "Add Department":
                    addDepartment();
                    break;

                case "Add Role":
                    addRole();
                    break;

                case "Update Employee Role":
                    updateEmployeeRole();
                    break;

                case "Update Employee Manager":
                    updateEmployeeManager();
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
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    })
    // Selecting all managers
    var managers = ["none"]
    var query = "SELECT * FROM employee WHERE manager_id IS NOT NULL";
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
                        }, function (err, data) {
                            if (err) throw err;
                            console.log(res.first+" "+res.last+" has been added to the database.")
                            runSearch();
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
                        }, function (err, data) {
                            if (err) throw err;
                            console.log(res.first+" "+res.last+" has been added to the database.")
                            runSearch();
                        }
                    )
                }
            )
        }        
    })
}
function removeEmployee(){
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function (err, res){
        if (err) throw err;
        inquirer
            .prompt([
                {   
                    name: 'employeeChosen',
                    type: 'rawlist',
                    choices: function() {
                        var employeesArray = [];
                            for (var i = 0; i < res.length; i++) {
                                employeesArray.push(res[i].first_name +" "+ res[i].last_name);
                            }
                            return employeesArray;
                        },
                    message: 'Which employee do you want to remove?',
                },
            ]).then(function(res){
                // Takes selected employee and separates their first and last name into an array
                var fullNameArry = res.employeeChosen.split(" ");
                connection.query(
                    "DELETE FROM employee WHERE ? AND ?",
                    [
                        {
                            first_name: fullNameArry[0]
                        },
                        {
                            last_name: fullNameArry[1]
                        }
                    ],
                    function(err, data){
                        if (err) throw err;
                        console.log(res.employeeChosen+" has been deleted from the database.")
                        runSearch()
                    }
                )
            })
    })
}
function addDepartment() {
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
            runSearch()
        })
}

function addRole() {
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
                }
            )
            runSearch()
        })
}
function updateEmployeeRole(){    
    // Selecting every role and pushing it into a list
    var roles = []
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    })
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function (err, res){
        inquirer
        .prompt([
            {
                name: "employeeChosen",
                type: "rawlist",
                choices: function(){
                    var employeesArray = []
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        employeesArray.push(res[i].first_name +" "+ res[i].last_name);
                    }
                    return employeesArray;
                },
                message: "Which employee would you like to update their role?"
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles
            }
        ]).then(res =>{
            // Loop that gets corresponding ID of selected role
            for (let i = 0; i < roles.length; i++) {
                if (res.role == roles[i]){
                    var roleID = i + 1;
                }
            }
            // Takes selected employee and separates their first and last name into an array
            var fullNameArry = res.employeeChosen.split(" ");

            // Updating Employee's role
            connection.query("UPDATE employee SET ? WHERE ? AND ?",
            [
                {
                    role_id : roleID
                },
                {
                    first_name: fullNameArry[0]
                },
                {
                    last_name: fullNameArry[1]
                }
            ],
            function(err, data){
                if (err) throw err;
                console.log(res.employeeChosen+ "'s role has been updated to role id: "+ roleID, res.role)
                runSearch()
            }
            )
        })
    })
}
function updateEmployeeManager(){
    var query = "SELECT first_name, last_name FROM employee";
    connection.query(query, function (err, res){
        if (err) throw err;
    inquirer
        .prompt([
            {
                name: "employeeChosen",
                type: "rawlist",
                choices: function (){
                    var employeesArray = []
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        employeesArray.push(res[i].first_name +" "+ res[i].last_name);
                    }
                    return employeesArray;
                },
                message: "which employee's manager would you like to update?"
            },
            {
                name: "managerChosen",
                type: "rawlist",
                choices: function (){
                    var employeesArray = []
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        employeesArray.push(res[i].first_name +" "+ res[i].last_name);
                    }
                    return employeesArray;
                },
                message: "which employee do you want to set as manager for the selected employee?",
            }
        ]).then(res =>{
             // Takes selected employee and separates their first and last name into an array
            var employeeNameArry = res.employeeChosen.split(" ");
            // Takes selected manager and separates their first and last name into an array
            var managerNameArry = res.managerChosen.split(" ");
            // Get id of manager
            connection.query("SELECT id from employee WHERE ? AND ?",
            [
                {
                    first_name: managerNameArry[0]
                },
                {
                    last_name: managerNameArry[1]
                }
            ],
            function(err, data){
                if (err) throw err;
                connection.query("UPDATE employee SET ? WHERE ? AND ?",
                [
                    {
                        manager_id: data[0].id
                    },
                    {
                        first_name: employeeNameArry[0]
                    },
                    {
                        last_name: employeeNameArry[1]
                    }
                ],
                function(err, results){
                    if (err) throw err;
                    console.log("Successfully updated " + res.employeeChosen + "'s manager to " + res.managerChosen)
                    runSearch()
                })
            })
            
        })
    })
}