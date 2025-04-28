const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON sent by Unity
app.use(express.json());

// Folder to store player data
const DATA_DIR = path.join(__dirname, 'playerData');

// Create the folder if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Endpoint to save player data
app.post('/save/:userId', (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    console.warn(`Empty data received for user ${userId}. Not saving.`);
    return res.status(400).send({ message: 'No data provided' });
  }

  const filePath = path.join(DATA_DIR, `${userId}.json`);

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error(`Error saving data for ${userId}:`, err);
      return res.status(500).send({ message: 'Failed to save data' });
    }
    console.log(`Data saved successfully for user: ${userId}`);
    res.send({ message: 'Data saved successfully' });
  });
});

// Endpoint to load player data
app.get('/load/:userId', (req, res) => {
  const userId = req.params.userId;
  const filePath = path.join(DATA_DIR, `${userId}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`No save file found for user: ${userId}`);
    return res.status(404).send({ message: 'No data found for user' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file for ${userId}:`, err);
      return res.status(500).send({ message: 'Failed to read data' });
    }

    if (!data) {
      console.warn(`Save file for ${userId} is empty.`);
      return res.status(404).send({ message: 'No data found for user' });
    }

    try {
      const parsedData = JSON.parse(data);
      res.send(parsedData);
    } catch (parseError) {
      console.error(`Corrupted JSON for ${userId}:`, parseError);
      res.status(500).send({ message: 'Corrupted save file' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});