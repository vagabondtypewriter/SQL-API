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

// 
app.get('/getAllUsers', (req, res) => {
  // TODO add specific functionality for admin panel as requested
  console.log("Got a new request");

  const { offset, limit } = req.query;

  console.log("Limit: ", limit);
  console.log("Offset: ", limit);
  let sql = 'SELECT user_id, display_name, hashed_password, email FROM user';
  
  if (limit !== undefined) {
    console.log("Sending with limit");
    sql += ` LIMIT ${parseInt(limit)}`;
    if (offset !== undefined) {
      console.log("Sending with offset");
      sql += ` OFFSET ${parseInt(offset)}`;
    }
  }

  // if offset is not defined, it becomes ignored

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
