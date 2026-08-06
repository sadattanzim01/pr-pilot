const Anthropic = require('@anthropic-ai/sdk');
const { getPRDiff, getPRFiles, getFileContent, postReviewComment } = require('./github');
const { storePullRequest, updatePRReview } = require('./rag');

async function reviewPullRequest({ repo, pr_number, title }) {
  //split "owner/repoName" into separate variables for GitHub API calls
  const [owner, repoName] = repo.split('/');

  console.log(`🤖 Starting review for PR #${pr_number}: ${title}`);

  //step 1: Save PR to database immediately with status "pending"
  await storePullRequest(repo, pr_number, title);

  //step 2: Fetch the git diff (the actual code changes in the PR)
  let diff;
  try {
    diff = await getPRDiff(owner, repoName, pr_number);
  } catch (err) {
    console.error('❌ Failed to fetch diff:', err.message);
    return;
  }

  //step 3: Fetch the full content of changed files for extra context
  //limit to 5 files and 2000 chars each to stay within Claude's context window
  let filesContext = '';
  try {
    const files = await getPRFiles(owner, repoName, pr_number);
    for (const file of files.slice(0, 5)) {
      const content = await getFileContent(owner, repoName, file.filename);
      if (content) {
        filesContext += `\n\n--- FILE: ${file.filename} ---\n${content.slice(0, 2000)}`;
      }
    }
  } catch (err) {
    console.error('⚠️ Could not fetch file contents:', err.message);
  }

  //step 4: Build the prompt and send everything to Claude for review
  //initialize Anthropic client here so it picks up the API key from .env
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are an expert code reviewer. Review the following pull request and provide specific, actionable feedback.

PR Title: ${title}
Repository: ${repo}

## Git Diff:
\`\`\`diff
${diff.toString().slice(0, 6000)}
\`\`\`

## File Context:
${filesContext}

Please provide a structured code review with the following sections:

## 📋 Summary
Brief overview of what this PR does.

## ✅ Strengths
What's done well in this PR.

## 🐛 Issues Found
List any bugs, errors, or problems. Be specific with line references.

## 💡 Suggestions
Improvements for code quality, performance, or readability.

## 🔒 Security Concerns
Any security issues to address (or "None found" if clean).

## ✨ Overall Assessment
A final verdict: Approve / Request Changes / Comment only.

Be concise, specific, and constructive. Reference specific lines or functions where possible.`;

  let review;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    review = response.content[0].text;
    console.log('✅ Claude review generated');
  } catch (err) {
    console.error('❌ Claude API error:', err.message);
    return;
  }

  //step 5: Post Claude's review as a comment directly on the GitHub PR
  try {
    await postReviewComment(owner, repoName, pr_number, review);
    console.log('✅ Review posted to GitHub PR');
  } catch (err) {
    console.error('❌ Failed to post to GitHub:', err.message);
  }

  //step 6: Update the database record with the completed review
  await updatePRReview(repo, pr_number, review);
  console.log('✅ Review saved to database');
}

module.exports = { reviewPullRequest };