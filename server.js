const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON from Unity
app.use(express.json());

// Directory where we store user data
const DATA_DIR = path.join(__dirname, 'playerData');

// Create the directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Endpoint to save player data
app.post('/save/:userId', (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  const filePath = path.join(DATA_DIR, `${userId}.json`);
  
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error saving data:', err);
      return res.status(500).send({ message: 'Failed to save data' });
    }
    console.log(`Data saved for user: ${userId}`);
    res.send({ message: 'Data saved successfully' });
  });
});

// Endpoint to load player data
app.get('/load/:userId', (req, res) => {
  const userId = req.params.userId;

  const filePath = path.join(DATA_DIR, `${userId}.json`);

  if (!fs.existsSync(filePath)) {
    // If no data exists for user, send empty data
    return res.status(404).send({ message: 'No data found for user' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return res.status(500).send({ message: 'Failed to read data' });
    }
    res.send(JSON.parse(data));
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});