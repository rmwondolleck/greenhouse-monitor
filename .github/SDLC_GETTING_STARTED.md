# Getting Started with SDLC Automation

This guide will walk you through using the SDLC Automation workflow to automatically process and resolve issues using custom agents.

## Quick Start

### 1. Dry Run (Preview Mode)

Start with a dry run to see how the workflow operates without creating actual PRs:

1. Navigate to **Actions** tab in GitHub
2. Select **SDLC Automation - Issue Resolution**
3. Click **Run workflow**
4. Configure:
   - **issue_numbers**: Leave empty (processes all open issues)
   - **dry_run**: `true` ✅
   - **max_issues**: `1`
5. Click **Run workflow**

The workflow will:
- Analyze your open issues
- Select the highest priority issue
- Create a brainstorming plan
- Post comments to the issue with guidance
- NOT create any PRs (dry run mode)

### 2. First Real Execution

Once you're comfortable with the dry run, execute for real:

1. **Actions** → **SDLC Automation - Issue Resolution** → **Run workflow**
2. Configure:
   - **issue_numbers**: `42` (pick a specific, simple issue)
   - **dry_run**: `false` ❌
   - **max_issues**: `1`
3. Click **Run workflow**

The workflow will:
- ✅ Create a brainstorming plan
- ✅ Create a feature branch
- ✅ Set up implementation scaffolding
- ✅ Create a draft PR
- ✅ Post detailed comments with next steps

### 3. Complete the Implementation

After the workflow creates the draft PR:

#### A. Checkout the Branch
```bash
# Find the branch name from the issue comment
git fetch origin
git checkout auto/issue-42-1706659200  # Example branch name
```

#### B. Implement Using @coding Agent

Open GitHub Copilot Chat in your IDE:

```
@coding Implement the solution for issue #42: [Issue Title]

Context:
- [Paste the issue description]
- [Paste the brainstorming plan from the workflow comments]

Please implement following the project conventions.
```

The @coding agent will generate the implementation code.

#### C. Review Using @code-review Agent

After implementing:

```
@code-review Review the changes in src/components/TemperatureAlert.tsx

Check for:
- TypeScript type safety
- Error handling
- Performance considerations
- Security issues
```

Address any feedback from the code review agent.

#### D. Test Your Changes

```bash
# Type check
npm run type-check

# Build
npm run build

# If applicable, run the app
npm run dev:server
```

#### E. Push and Update PR

```bash
git add .
git commit -m "feat: implement solution for issue #42"
git push origin auto/issue-42-1706659200
```

Then in GitHub:
1. Go to the PR
2. Mark as **Ready for review** (remove draft status)
3. Request human review
4. Wait for approval
5. Merge!

## Usage Scenarios

### Scenario 1: Process All Open Issues (Scheduled)

The workflow runs automatically every day at 2 AM UTC with these defaults:
- Processes 1 highest-priority open issue
- Creates draft PRs for manual implementation
- Posts guidance comments to issues

No action needed - it runs on its own!

### Scenario 2: Process Specific Issues

When you have specific issues you want to tackle:

```
Actions → SDLC Automation → Run workflow

Settings:
  issue_numbers: "5,7,12"
  dry_run: false
  max_issues: 3
```

This processes issues #5, #7, and #12 simultaneously (up to the max_issues limit).

### Scenario 3: Bulk Processing

Process multiple high-priority issues:

```
Actions → SDLC Automation → Run workflow

Settings:
  issue_numbers: (leave empty)
  dry_run: false
  max_issues: 5
```

This will process up to 5 open issues, prioritized by labels.

### Scenario 4: Testing a New Issue

After creating a new issue, test the workflow immediately:

```
Actions → SDLC Automation → Run workflow

Settings:
  issue_numbers: "50"  (your new issue number)
  dry_run: true
  max_issues: 1
```

Review the generated plan before executing.

## Understanding the Output

### Issue Comments

The workflow adds several comments to your issue:

#### 1. Processing Start
```
🤖 AUTOMATION MODE (or 🔍 DRY RUN MODE)

Starting SDLC automation workflow for this issue.

Workflow Run: [View details](...)

📋 SDLC Process
- [ ] Phase 1: Brainstorming & Planning
- [ ] Phase 2: Implementation
- [ ] Phase 3: Code Review
- [ ] Phase 4: Create Pull Request

The workflow will update this comment with progress.
```

#### 2. Phase 1 Complete
```
✅ Phase 1 Complete: Brainstorming & Planning

Issue Type: feature
Approach: Design new feature following existing patterns...

Key Considerations:
- Follow existing code conventions
- Maintain backward compatibility
- Add appropriate error handling

Areas Affected: src/components/**, src/pages/**

Proceeding to implementation phase...
```

#### 3. Phase 2 Complete
```
⚠️ Phase 2: Implementation

A feature branch has been created: `auto/issue-42-1706659200`

Manual Action Required: ...

Recommended Approach:
[Checkout instructions and @coding agent usage]
```

#### 4. Phase 3 Guidance
```
📝 Phase 3: Code Review

After implementing changes, use the code review agent:
[Instructions and @code-review agent usage]
```

#### 5. Phase 4 Complete
```
🎉 Phase 4 Complete: Pull Request Created

A draft PR has been created: #67

Branch: `auto/issue-42-1706659200`
PR: [link]

The PR is in draft mode and requires manual implementation...
```

### Pull Request Content

The created PR includes:

```markdown
## Automated SDLC Workflow

This PR was created by the SDLC automation workflow.

**Resolves**: #42
**Issue Type**: feature
**Workflow Run**: [View details](...)

### Original Issue
[Issue body pasted here]

### Implementation Plan
**Approach**: ...
**Considerations**: ...

### ⚠️ Manual Steps Required

1. Checkout this branch locally
2. Use the @coding agent to implement
3. Use the @code-review agent to review
4. Push your changes
5. Request manual review before merging

### Checklist
- [ ] Code implemented using @coding agent
- [ ] Code reviewed using @code-review agent
- [ ] Tests pass
- [ ] Documentation updated (if needed)
- [ ] Ready for human review
```

## Best Practices

### ✅ DO

- **Start with dry runs** to understand the workflow
- **Process one issue at a time** initially
- **Use specific issue numbers** when learning
- **Read the generated plans** carefully
- **Follow the guidance** in the issue comments
- **Use the custom agents** as instructed (@coding, @code-review)
- **Test your changes** before marking PR ready
- **Request human review** before merging

### ❌ DON'T

- **Don't skip the dry run** on first use
- **Don't process too many issues** at once initially (max_issues > 3)
- **Don't ignore the brainstorming plan**
- **Don't skip code review** even if the code looks good
- **Don't merge without human review**
- **Don't forget to test** your implementation
- **Don't leave draft PRs** hanging - complete or close them

## Troubleshooting

### No Issues Were Processed

**Possible causes:**
- No open issues in the repository
- All issues were already processed
- max_issues limit too low

**Solution:**
Check the workflow logs in Actions tab to see what issues were found.

### Branch Already Exists

**Cause:** Previous run created a branch that wasn't deleted.

**Solution:**
```bash
git push origin --delete auto/issue-42-1234567890
```

Or specify different issues to process.

### Draft PR Created But I Don't See It

**Cause:** Draft PRs are sometimes hidden in the PR list.

**Solution:**
Click "Draft" filter in the PR list, or check the issue comments for the PR link.

### Workflow Failed

**Cause:** Various reasons (permissions, API limits, etc.)

**Solution:**
1. Check the workflow run logs in Actions tab
2. Look for error messages in red
3. Re-run the workflow if it was a temporary issue
4. Create an issue if the problem persists

### Code Review Agent Suggestions Are Wrong

**Cause:** AI agents can make mistakes.

**Solution:**
Use your judgment. The agents provide suggestions, but you make the final decisions.

## Advanced Usage

### Custom Labels

Add labels to issues to control prioritization:
- `priority:high` - Process first (score: +20)
- `bug` - High priority (score: +10)
- `enhancement` - Medium priority (score: +5)

### Scheduled Runs

The workflow runs daily at 2 AM UTC. To change:

Edit `.github/workflows/sdlc-automation.yml`:
```yaml
schedule:
  - cron: '0 14 * * *'  # 2 PM UTC
```

### Disable Scheduled Runs

Comment out or remove the `schedule` section:
```yaml
# schedule:
#   - cron: '0 2 * * *'
```

### Integration with Other Workflows

The SDLC automation integrates with existing workflows:
- **issue-triage.yml** - Labels issues automatically
- **pr-review-reminder.yml** - Adds checklists to PRs
- **test.yml** - Validates builds
- **post-merge.yml** - Updates issues on merge

## Next Steps

1. ✅ Run your first dry run
2. ✅ Execute on a simple issue
3. ✅ Complete the implementation manually
4. ✅ Review the results
5. ✅ Process more issues
6. ✅ Customize the workflow for your needs

## Support

Need help?
- 📖 Read [SDLC_AUTOMATION.md](SDLC_AUTOMATION.md) for detailed docs
- 🔍 Check [Troubleshooting](#troubleshooting) section
- 📝 Create an issue with `help-wanted` label
- 💬 Ask in GitHub Discussions

---

**Remember**: The workflow provides structure and guidance, but human expertise is essential for implementation!
