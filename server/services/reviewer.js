const Anthropic = require('@anthropic-ai/sdk');
const { getPRDiff, getPRFiles, getFileContent, postReviewComment } = require('./github');
const { storePullRequest, updatePRReview } = require('./rag');

async function reviewPullRequest({ repo, pr_number, title }) {
  const [owner, repoName] = repo.split('/');

  console.log(`🤖 Starting review for PR #${pr_number}: ${title}`);

  // Step 1: Store PR in database as pending
  await storePullRequest(repo, pr_number, title);

  // Step 2: Fetch the diff
  let diff;
  try {
    diff = await getPRDiff(owner, repoName, pr_number);
  } catch (err) {
    console.error('❌ Failed to fetch diff:', err.message);
    return;
  }

  // Step 3: Fetch changed files and their contents
  let filesContext = '';
  try {
    const files = await getPRFiles(owner, repoName, pr_number);
    for (const file of files.slice(0, 5)) { // limit to 5 files
      const content = await getFileContent(owner, repoName, file.filename);
      if (content) {
        filesContext += `\n\n--- FILE: ${file.filename} ---\n${content.slice(0, 2000)}`;
      }
    }
  } catch (err) {
    console.error('⚠️ Could not fetch file contents:', err.message);
  }

  // Step 4: Send to Claude for review
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

  // Step 5: Post review comment to GitHub PR
  try {
    await postReviewComment(owner, repoName, pr_number, review);
    console.log('✅ Review posted to GitHub PR');
  } catch (err) {
    console.error('❌ Failed to post to GitHub:', err.message);
  }

  // Step 6: Save completed review to database
  await updatePRReview(repo, pr_number, review);
  console.log('✅ Review saved to database');
}

module.exports = { reviewPullRequest };