const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: "Καλώς ήρθατε στο backend API!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const restaurants = [
  { id: 1, name: "Taverna Giannis", location: "Αθήνα" },
  { id: 2, name: "El Greco", location: "Θεσσαλονίκη" }
];

app.get('/restaurants', (req, res) => {
  res.json(restaurants);
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/restaurants', (req, res) => {
  const newRestaurant = req.body;
  newRestaurant.id = restaurants.length + 1;
  restaurants.push(newRestaurant);
  res.status(201).json(newRestaurant);
});

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Βάλτε τον δικό σας κωδικό!
  database: 'restaurant_db'
});

connection.connect(err => {
  if (err) {
    console.error("Σφάλμα σύνδεσης στη MariaDB:", err);
  } else {
    console.log("Συνδέθηκε επιτυχώς στη MariaDB!");
  }
});

app.get('/restaurants', (req, res) => {
  connection.query('SELECT * FROM restaurants', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.use(express.json());  // Middleware για να διαβάζουμε JSON

app.post('/restaurants', (req, res) => {
  const { name, location } = req.body;

  connection.query('INSERT INTO restaurants (name, location) VALUES (?, ?)', 
  [name, location], 
  (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, name, location });
  });
});
