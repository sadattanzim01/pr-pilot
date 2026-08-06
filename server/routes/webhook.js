const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { reviewPullRequest } = require('../services/reviewer');

//Verify the webhook request is genuinely from GitHub using HMAC signature
//gitHub signs every request with our GITHUB_WEBHOOK_SECRET — we check it matches
function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  //recreate the expected signature using our secret
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  //timingSafeEqual prevents timing attacks when comparing signatures
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

//POST /webhook/github — receives all GitHub events for connected repos
router.post('/github', async (req, res) => {
  //reject requests that don't have a valid GitHub signature
  if (!verifySignature(req)) {
    console.log('❌ Invalid webhook signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.headers['x-github-event']; // e.g. "pull_request", "push"
  const payload = req.body;

  console.log(`📦 Received GitHub event: ${event}`);

  //only process pull request events
  if (event === 'pull_request') {
    const { action, pull_request, repository } = payload;

    //trigger review when a PR is opened, updated, or reopened
    if (action === 'opened' || action === 'synchronize' || action === 'reopened') {
      console.log(`🔀 PR #${pull_request.number} ${action}: ${pull_request.title}`);

      //run the review in the background — don't make GitHub wait for it
      //if we awaited this, GitHub might time out and retry the webhook
      reviewPullRequest({
        repo: repository.full_name,
        pr_number: pull_request.number,
        title: pull_request.title,
      }).catch(console.error);
    }
  }

  //respond to GitHub immediately so it knows we received the event
  res.status(200).json({ received: true });
});

module.exports = router;