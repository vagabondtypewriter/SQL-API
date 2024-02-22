const express = require('express');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'APItest'
});

const app = express();

app.use(express.urlencoded({ extended: true }));

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// GET ALL USERS
app.get('/getAllUsers', (req, res) => {
  console.log("Got a new request");

  const { offset, limit } = req.query;

  console.log("Limit: ", limit);
  console.log("Offset: ", limit);
  let sql = 'SELECT * FROM user';
  
  if (limit !== undefined) {
    console.log("Sending with limit");
    sql += ` LIMIT ${parseInt(limit)}`;
    if (offset !== undefined) {
      console.log("Sending with offset");
      sql += ` OFFSET ${parseInt(offset)}`;
    }
  }

  console.log("SQL: ", sql);

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

app.get('/getUser', (req, res) => {
  // Extract fields from query parameters
  const id = req.query.user_id;
  const displayName = req.query.display_name;
  const email = req.query.email;

  // Check if only one field is defined
  const definedFields = [id, displayName, email].filter(field => field !== undefined);
  if (definedFields.length !== 1) {
    res.status(400).json({ error: 'Exactly one of user_id, display_name, or email must be defined.' });
    return;
  }

  let sql = 'SELECT * FROM user WHERE ';
  let params = [];

  if (id !== undefined) {
    sql += 'user_id = ?';
    params.push(parseInt(id));
  } else if (displayName !== undefined) {
    sql += 'display_name LIKE ?';
    params.push(displayName);
  } else if (email !== undefined) {
    sql += 'email = ?';
    params.push(email);
  }

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

app.get('/deleteUser', (req, res) => {
  // Extract user_id from query parameters
  const id = req.query.user_id;

  // Check if user_id is not provided
  if (id === undefined) {
    res.status(400).json({ error: 'user_id is required in the query parameters.' });
    return;
  }

  let sql = 'DELETE FROM user WHERE user_id = ?';

  // Execute the query with user_id as parameter
  connection.query(sql, [parseInt(id)], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
