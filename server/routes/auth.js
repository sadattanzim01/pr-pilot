const express = require('express');
const router = express.Router();
const axios = require('axios');

//GET /auth/github — redirect user to GitHub's OAuth login page
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'repo user', // request access to repos and user profile
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

//GET /auth/github/callback — GitHub redirects here after user approves
router.get('/github/callback', async (req, res) => {
  const { code } = req.query; // GitHub sends a one-time code in the URL

  try {
    //Exchange the one-time code for a permanent access token
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = response.data.access_token;

    //send the token to the frontend via URL parameter
    //React will grab it, save it to localStorage, and clean the URL
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${accessToken}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

module.exports = router;