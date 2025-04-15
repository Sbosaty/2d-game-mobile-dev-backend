const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const fs = require('fs');

// Load Firebase credentials
const serviceAccount = require('./firebaseKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // parse JSON from Unity

// Save game data
app.post('/save/:userId', async (req, res) => {
  const userId = req.params.userId;
  const gameData = req.body;

  try {
    await db.collection('gameData').doc(userId).set(gameData);
    res.status(200).send({ message: 'Data saved successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send({ error: 'Failed to save data.' });
  }
});

// Load game data
app.get('/load/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const doc = await db.collection('gameData').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: 'No data found for user.' });
    }

    res.status(200).send(doc.data());
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).send({ error: 'Failed to load data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
