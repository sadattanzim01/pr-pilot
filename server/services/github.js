const { Octokit } = require('@octokit/rest');

function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

// Fetch the PR diff
async function getPRDiff(owner, repo, pull_number) {
  const octokit = getOctokit();
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: 'diff' }
  });
  return data;
}

// Fetch list of files changed in the PR
async function getPRFiles(owner, repo, pull_number) {
  const octokit = getOctokit();
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number
  });
  return data;
}

// Fetch contents of a file from the repo
async function getFileContent(owner, repo, path) {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch {
    return null;
  }
}

// Post a review comment on the PR
async function postReviewComment(owner, repo, pull_number, body) {
  const octokit = getOctokit();
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    body,
    event: 'COMMENT'
  });
}

module.exports = { getPRDiff, getPRFiles, getFileContent, postReviewComment };