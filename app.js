// packages
const express = require('express');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'APItest'
});

const app = express();

// Middleware to parse URL-encoded bodies (for query strings)
app.use(express.urlencoded({ extended: true }));

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Your route handler
app.get('/user', (req, res) => {
  console.log("Got a new request");

  // SQL query to select all fields from the user table
  let sql = 'SELECT user_id, display_name, hashed_password, email FROM user';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the results back to the browser
    res.json(results);
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
