const express = require('express');
const router = express.Router();
const User = require('../models/User');
const History = require('../models/History');

// ➕ Add a new user
router.post('/add-user', async (req, res) => {
  try {
    const { name } = req.body;
    const newUser = new User({ name });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// 🎲 Claim random points for user
router.post('/claim-points/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const randomPoints = Math.floor(Math.random() * 10) + 1;
    user.totalPoints += randomPoints;
    await user.save();

    const history = new History({
      userId: user._id,
      userName: user.name,
      points: randomPoints
    });
    await history.save();

    res.json({
      message: `${randomPoints} points added to ${user.name}`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim points' });
  }
});

// 🏆 Get leaderboard (sorted by totalPoints)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });

    const leaderboard = users.map((user, index) => ({
      name: user.name,
      totalPoints: user.totalPoints,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// 📜 Get claim history
router.get('/history', async (req, res) => {
  try {
    const history = await History.find().sort({ claimedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

module.exports = router;
