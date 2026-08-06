const pool = require('./db');

// Insert a new PR into the database with status "pending"
// If the PR already exists (same repo + number), reset it to pending
async function storePullRequest(repoFullName, prNumber, title) {
  await pool.query(
    `INSERT INTO pull_requests (repo_full_name, pr_number, title, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (repo_full_name, pr_number) DO UPDATE SET status = 'pending'`,
    [repoFullName, prNumber, title]
  );
}

// Update the PR record with Claude's completed review text
async function updatePRReview(repoFullName, prNumber, review) {
  await pool.query(
    `UPDATE pull_requests SET review = $1, status = 'completed'
     WHERE repo_full_name = $2 AND pr_number = $3`,
    [review, repoFullName, prNumber]
  );
}

//fetch all reviewed PRs ordered by newest first
async function getReviewedPRs() {
  const result = await pool.query(
    `SELECT * FROM pull_requests ORDER BY created_at DESC`
  );
  return result.rows;
}

module.exports = { storePullRequest, updatePRReview, getReviewedPRs };