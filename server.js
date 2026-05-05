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

// const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'admin123',  // Αντικαταστήστε με τον δικό σας κωδικό
//   database: 'restaurant_db'
// });

// connection.connect(err => {
//   if (err) {
//     console.error("Σφάλμα σύνδεσης στη MariaDB:", err);
//   } else {
//     console.log("Συνδέθηκε επιτυχώς στη MariaDB!");
//   }
// });

app.use(express.json()); // Middleware για να διαβάζουμε JSON

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8); // Κρυπτογράφηση του κωδικού

  connection.query('INSERT INTO users (username, password) VALUES (?, ?)', 
  [username, hashedPassword], 
  (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Εγγραφή επιτυχής!", userId: result.insertId });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Λάθος username ή password" });
    }

    const user = results[0];

    // Ελέγχουμε αν ο κωδικός που εισήγαγε ο χρήστης ταιριάζει με το hash στη βάση
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Λάθος username ή password" });
    }

    // Δημιουργία JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, "mysecretkey", { expiresIn: "1h" });

    res.json({ message: "Σύνδεση επιτυχής!", token });
  });
});

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  
  if (!token) {
    return res.status(403).json({ message: "Απαγορεύεται η πρόσβαση! Απαιτείται token." });
  }

  jwt.verify(token.split(" ")[1], "mysecretkey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Μη έγκυρο token" });
    }
    req.user = decoded; // Αποθηκεύουμε τα στοιχεία του χρήστη στο request
    next();
  });
};

app.get('/restaurants', verifyToken, (req, res) => {
  connection.query('SELECT * FROM restaurants', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
