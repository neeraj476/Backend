const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: true }));

app.set("view engine","views");
app.set("views" , path.join(__dirname,"/views"))


const mysql = require("mysql2");


const { faker } = require('@faker-js/faker');

function createRandomUser() {
    return [
        faker.string.uuid(),
       faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),

        faker.internet.password(),

    ];
}

// let users = [];
// for (let i = 0; i < 100; i++) {
//     users.push(createRandomUser());
// }

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'instagram',
    password: "Neeraj@12345"
});



// let q = "INSERT INTO user (id, username, email, password) VALUES ?;";

// try {
//     connection.query(q, [users], (err, result) => {
//         if (err) throw err;
//         console.log(result);
//     });
// } catch (err) {
//     console.log(err);
// }


app.listen("3000", () => {
    console.log("app is listing at port 3000");
})

app.get("/users", (req, res) => {
    try{
        let q = `SELECT * FROM user ;`;
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let users = result;
            res.render("users.ejs",{users});
        });
    }catch(err){
          res.send(err);  
    }

})
app.get("/user/:id", (req, res) => {
    try {
        let { id } = req.params;
        let q = `SELECT * FROM user WHERE id = ?`;
        
        connection.query(q, [id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("An error occurred while fetching user details.");
                return;
            }
            let user = result[0]; // Assuming only one user is returned
            res.render("edituser.ejs", { user }); // Pass 'user' instead of 'users' to the template
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An unexpected error occurred.");
    }
});
app.patch("/user/:id", (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body; // Extract the form data

    // SQL query to get the user's current password from the database
    const getPasswordQuery = `SELECT password FROM user WHERE id = ?`;

    connection.query(getPasswordQuery, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("An error occurred while verifying the password.");
            return;
        }

        if (result.length === 0) {
            res.status(404).send("User not found.");
            return;
        }

        const dbPassword = result[0].password; // Current password from the database

        // Compare the password entered by the user with the database password
        if (password !== dbPassword) {
            res.status(403).send("Incorrect password. Update failed.");
            return;
        }

        // SQL query to update the user's details if the password matches
        const updateQuery = `UPDATE user SET username = ?, email = ? WHERE id = ?`;

        connection.query(updateQuery, [username, email, id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error(updateErr);
                res.status(500).send("An error occurred while updating user details.");
                return;
            }

            console.log(updateResult); // Debugging: Log update result
            res.redirect("/users"); // Redirect to the users list after successful update
        });
    });
});



