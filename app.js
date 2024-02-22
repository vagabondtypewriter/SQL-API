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

  // Extract query parameters
  const { offset, limit } = req.query;
  // SQL query to select user data with offset and limit


  console.log("Limit: ", limit);
  console.log("Offset: ", limit);
  let sql = 'SELECT user_id, display_name, hashed_password, email FROM user';
  
   // Add OFFSET and LIMIT clauses if offset and limit are provided
  if (limit !== undefined) {
    console.log("Sending with limit");
    sql += ` LIMIT ${parseInt(limit)}`;
  }

  // Add OFFSET and LIMIT clauses if offset and limit are provided
  if (offset !== undefined) {
    console.log("Sending with offset");
    sql += ` OFFSET ${parseInt(offset)}`;
  }

  console.log("SQL: ", sql);

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
