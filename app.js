const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const bcrypt = require('./bcrypt');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'testUser',
  password: 'testPassword',
  database: 'smart_sandbox'
});

const app = express();
app.use(cors());
app.use(express.json({extended : true}));
app.use(express.urlencoded({ extended: true }));

app.get('/getUsers', (req, res) => {
  const offset = req.query.offset;
  const limit = req.query.limit;

  let sql = 'SELECT * FROM user';

  if (limit !== undefined) {
    console.log("Sending with limit");
    sql += ` LIMIT ${parseInt(limit)}`;
  } else {
    console.log("Sending with default limit");
    sql += ` LIMIT 20`;
  }
  if (offset !== undefined) {
    console.log("Sending with offset");
    sql += ` OFFSET ${parseInt(offset)}`;
  }

  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});


app.get('/getUser', (req, res) => {
  console.log("init");
console.log(req);
  const user_id = req.query.user_id;
  const display_name = req.query.display_name;
  const email = req.query.email;

  const definedFields = [user_id, display_name, email].filter(field => field !== undefined);
  if (definedFields.length !== 1) {
    res.status(400).json({ error: 'Exactly one of user_id, display_name, or email must be defined.' });
    return;
  }

  let sql = 'SELECT * FROM user WHERE ';
  let params = [];

  if (user_id !== undefined) {
    sql += 'user_id = ?';
    params.push(parseInt(user_id));
  } else if (display_name !== undefined) {
    sql += 'display_name LIKE ?';
    params.push(display_name);
  } else if (email !== undefined) {
    sql += 'email = ?';
    params.push(email);
  }

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

app.get('/deleteUser', (req, res) => {
  const user_id = req.query.user_id;

  if (user_id === undefined) {
    res.status(400).json({ error: 'user_id is required in the query parameters.' });
    return;
  }

  let sql = 'DELETE FROM user WHERE user_id = ?';

  pool.query(sql, [parseInt(user_id)], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

app.post('/createUser', async (req, res) => {
  let { display_name, password, email } = req.body;
  console.log("req.name: " + display_name);
  console.log("req.pass: " + password);
  console.log("req.email: " + email);
  password = await bcrypt.encryptPassword(password)
  .catch(err => {
    console.error('Error encrypting password:', err);
    // Handle the error appropriately, e.g., return an error response
    res.status(500).json({ error: 'Internal Server Error' });
    return; // Ensure to return from the function after handling the error
  });

  if (!display_name || !password || !email) {
    res.status(400).json({ error: 'display_name, password, and email are required in the request body.' });
    return;
  }

  let sql = `INSERT INTO user (display_name, hashed_password, email, added) VALUES (?, ?, ?, NOW())`; // Using NOW() to insert current timestamp
  let params = [display_name, password, email];
  console.log(sql + " " + params);
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'User created successfully.' });
  });
});


app.get('/getNumUsers', (req, res) => {

  let sql = `SELECT COUNT(*) FROM user;`; 
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    } else {
      console.log(res.json(results));
      res.json(results);
    }
  });
});

app.get('/editUser', async (req, res) => {
  const user_id = req.query.user_id;
  const display_name = req.query.display_name;
  const password = req.query.password;
  const email = req.query.email;

  if (!user_id) {
    res.status(400).json({ error: 'user_id is required in the request body.' });
    return;
  }

  let sql = 'UPDATE user SET ';
  let params = [];
  let setValues = [];

  if (display_name) {
    setValues.push('display_name = ?');
    params.push(display_name);
  }
  if (password) {
    const hashedPassword = await bcrypt.encryptPassword(password); // Await here
    setValues.push('hashed_password = ?');
    params.push(hashedPassword);
  }
  if (email) {
    setValues.push('email = ?');
    params.push(email);
  }

  if (setValues.length === 0) {
    res.status(400).json({ error: 'At least one field (display_name, password, or email) is required for updating.' });
    return;
  }

  setValues.push('modified = NOW()');
  sql += setValues.join(', ');
  sql += ' WHERE user_id = ?';
  params.push(user_id);

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ message: 'User updated successfully.' });
  });
});


const port = process.env.PORT || 9998;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
