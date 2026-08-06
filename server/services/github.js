const { Octokit } = require('@octokit/rest');

//create an authenticated GitHub API client using our token from .env
function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

//fetch the raw diff of a PR (the +/- line changes)
async function getPRDiff(owner, repo, pull_number) {
  const octokit = getOctokit();
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: 'diff' } // tells GitHub to return diff format, not JSON
  });
  return data;
}

//fetch the list of files changed in a PR (filenames + change stats)
async function getPRFiles(owner, repo, pull_number) {
  const octokit = getOctokit();
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number
  });
  return data;
}

//fetch the full contents of a specific file from the repo
//returns null if the file doesn't exist or can't be read
async function getFileContent(owner, repo, path) {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    //GitHub returns file content as base64 — decode it to readable text
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch {
    return null;
  }
}

//post Claude's review as a comment on the GitHub PR
async function postReviewComment(owner, repo, pull_number, body) {
  const octokit = getOctokit();
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    body,
    event: 'COMMENT' // posts as a comment, not an approval or change request
  });
}

module.exports = { getPRDiff, getPRFiles, getFileContent, postReviewComment };