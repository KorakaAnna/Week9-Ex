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
