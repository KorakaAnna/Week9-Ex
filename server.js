const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: "Καλώς ήρθατε στο backend API!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

