const pool = require('./db');

// Store PR record in database
async function storePullRequest(repoFullName, prNumber, title) {
  await pool.query(
    `INSERT INTO pull_requests (repo_full_name, pr_number, title, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (repo_full_name, pr_number) DO UPDATE SET status = 'pending'`,
    [repoFullName, prNumber, title]
  );
}

// Update PR with completed review
async function updatePRReview(repoFullName, prNumber, review) {
  await pool.query(
    `UPDATE pull_requests SET review = $1, status = 'completed'
     WHERE repo_full_name = $2 AND pr_number = $3`,
    [review, repoFullName, prNumber]
  );
}

// Get all reviewed PRs
async function getReviewedPRs() {
  const result = await pool.query(
    `SELECT * FROM pull_requests ORDER BY created_at DESC`
  );
  return result.rows;
}

module.exports = { storePullRequest, updatePRReview, getReviewedPRs };