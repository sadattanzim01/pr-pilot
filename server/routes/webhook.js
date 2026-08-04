const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { reviewPullRequest } = require('../services/reviewer');

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

router.post('/github', async (req, res) => {
  if (!verifySignature(req)) {
    console.log('❌ Invalid webhook signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`📦 Received GitHub event: ${event}`);

  if (event === 'pull_request') {
    const { action, pull_request, repository } = payload;

    if (action === 'opened' || action === 'synchronize' || action === 'reopened') {
      console.log(`🔀 PR #${pull_request.number} ${action}: ${pull_request.title}`);

      // Run review in background (don't await — respond to GitHub immediately)
      reviewPullRequest({
        repo: repository.full_name,
        pr_number: pull_request.number,
        title: pull_request.title,
      }).catch(console.error);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;