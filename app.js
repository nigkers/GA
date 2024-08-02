
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'event_listing'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  let searchQuery = req.query.q || '';
  let ageGroup = req.query.age || '';

  let sql = 'SELECT * FROM events WHERE eventName LIKE ?';
  let values = [`%${searchQuery}%`];

  if (ageGroup && ageGroup !== 'All Ages') {
    sql += ' AND recommendedAge = ?';
    values.push(ageGroup);
  }

  db.query(sql, values, (err, results) => {
    if (err) throw err;
    res.render('index', { events: results, age: ageGroup });
  });
});

app.get('/events/new', (req, res) => {
  res.render('new');
});

app.post('/events', (req, res) => {
  let newEvent = {
    eventName: req.body.eventName,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
    recommendedAge: req.body.recommendedAge
  };

  let sql = 'INSERT INTO events SET ?';
  db.query(sql, newEvent, (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/events/:id/edit', (req, res) => {
  let sql = 'SELECT * FROM events WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    res.render('edit', { event: result[0] });
  });
});

app.post('/events/:id', (req, res) => {
  let updatedEvent = {
    eventName: req.body.eventName,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
    recommendedAge: req.body.recommendedAge
  };

  let sql = 'UPDATE events SET ? WHERE id = ?';
  db.query(sql, [updatedEvent, req.params.id], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/events/:id/delete', (req, res) => {
  let sql = 'DELETE FROM events WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/events/:id/save', (req, res) => {
  let savedEvent = {
    userId: 1,  
    eventId: req.params.id
  };

  let sql = 'INSERT INTO saved_events SET ?';
  db.query(sql, savedEvent, (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/saved', (req, res) => {
  let sql = `SELECT events.* FROM events
             JOIN saved_events ON events.id = saved_events.eventId
             WHERE saved_events.userId = ?`;

  db.query(sql, [1], (err, results) => { 
    if (err) throw err;
    res.render('saved', { events: results });
  });
});

app.post('/saved/:id/remove', (req, res) => {
  let sql = 'DELETE FROM saved_events WHERE eventId = ? AND userId = ?';
  db.query(sql, [req.params.id, 1], (err, result) => { 
    if (err) throw err;
    res.redirect('/saved');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
