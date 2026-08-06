const express = require('express');
const router = express.Router();
const pool = require('../services/db');
const { Octokit } = require('@octokit/rest');

//GET /api/reviews- fetch all PR reviews from the database, newest first
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

//GET /api/user — fetch the logged-in GitHub user's profile
//the frontend sends the OAuth token in the Authorization header
router.get('/user', async (req, res) => {
  try {
    //extract token from "Bearer <token>" header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    //use the token to call GitHub API and get user info
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;