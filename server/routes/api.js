const express = require('express');
const router = express.Router();
const pool = require('../services/db');
const { Octokit } = require('@octokit/rest');

// Get all reviewed PRs
router.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pull_requests ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get GitHub user info
router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;