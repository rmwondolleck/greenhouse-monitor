# Issue Creator - Usage Examples

This document shows how to create GitHub issues from the templates in this directory.

## 🎯 Recommended: GitHub Copilot Agent

**The best way to create issues is using the @issue-creator agent in GitHub Copilot Chat.**

### Quick Start with Agent

1. **Open GitHub Copilot Chat** (VS Code, GitHub.com, or your IDE)
2. **Type**: `@issue-creator review all issue templates`
3. **The agent shows** all 7 issues with priorities and time estimates
4. **Ask to create**: `@issue-creator create all high-priority issues`

That's it! The agent creates issues directly using GitHub's native MCP tools.

---

## Agent Walkthrough

### Step 1: Review Available Issues

**You type in Copilot Chat**:
```
@issue-creator show me all available issues and their priorities
```

**Agent responds with**:
```
📋 Issue Templates Found (7 total):

High Priority (Phase 1-3):
1. Issue #1: Extend Local Storage and Improve MQTT Reliability
   ⏱️  2-3h | 🏷️  enhancement, mqtt, priority-high, phase-1

2. Issue #2: HomeAssistant MQTT Integration & Alerts
   ⏱️  1-2h | 🏷️  enhancement, homeassistant, monitoring, priority-high

3. Issue #3: Deploy MariaDB on Kubernetes
   ⏱️  2-3h | 🏷️  infrastructure, kubernetes, database, priority-high

[... and 4 more ...]

Would you like me to create any of these issues?
```

### Step 2: Ask Questions

**You**: `@issue-creator which issues should I do first?`

**Agent explains**:
```
I recommend starting with Phase 1 issues in this order:

1. Issue #1 (High Priority) - Enhanced Local Storage & MQTT
   - No dependencies, provides foundation for reliability
   - Time: 2-3 hours

2. Issue #2 (High Priority) - HomeAssistant Integration
   - Depends on #1 for MQTT improvements
   - Time: 1-2 hours

These give you immediate value: better resilience and monitoring!
```

### Step 3: Create Issues

**You**: `@issue-creator create issues #1 and #2`

**Agent responds**:
```
Creating issues...

✅ Issue #1 created successfully!
   Title: Issue #1: Extend Local Storage and Improve MQTT Reliability
   Labels: enhancement, mqtt, priority-high, phase-1
   Link: https://github.com/rmwondolleck/greenhouse-monitor/issues/123

✅ Issue #2 created successfully!
   Title: Issue #2: HomeAssistant MQTT Integration & Alerts
   Labels: enhancement, homeassistant, monitoring, priority-high, phase-2
   Link: https://github.com/rmwondolleck/greenhouse-monitor/issues/124

Done! Created 2 issues. You can start with #1 first.
```

---

## Common Agent Commands

### Review Issues
```
@issue-creator show me all available issues
@issue-creator what's in the issue templates?
@issue-creator explain the issue priorities
```

### Create Specific Issues
```
@issue-creator create issue #1
@issue-creator create issue #1 about MQTT reliability
@issue-creator create issues #1, #2, and #3
```

### Create by Criteria
```
@issue-creator create all high-priority issues
@issue-creator create all Phase 1 issues
@issue-creator create issues for this week
```

### Check Before Creating
```
@issue-creator does issue #1 already exist?
@issue-creator check for duplicate issues before creating
@issue-creator list existing issues first
```

---

## Why Use the Agent?

### ✅ Advantages
- **Native GitHub integration** - Uses MCP (Model Context Protocol)
- **No setup required** - Just use Copilot Chat
- **Interactive** - Ask questions, get explanations
- **Smart** - Checks for duplicates automatically
- **Flexible** - Create one, some, or all issues
- **Instant** - Creates issues in real-time
- **Context-aware** - Understands dependencies

### 🚀 Better Than Scripts
- No environment variables to configure
- No GITHUB_TOKEN needed (uses your auth)
- No command line needed
- More flexible and interactive
- Better error handling and explanations

---

## Alternative: CLI Scripts

For automation or if you don't have GitHub Copilot, you can use the CLI scripts:

---

## ⚠️ Historical Note: CLI Scripts (REMOVED)

**NPM scripts have been completely removed from this project.**

The following commands NO LONGER WORK (included for historical reference only):

```bash
# These commands DO NOT EXIST anymore
npm run create-issues:dry-run            # REMOVED
npm run create-issues                    # REMOVED  
npm run create-issues -- --file X.md     # REMOVED
```

**Why removed:**
- Agent provides superior experience
- No GITHUB_TOKEN setup needed
- More interactive and flexible
- Native GitHub integration
- Less code to maintain

**For automation:** Use GitHub Actions instead of NPM scripts. GitHub Actions can create issues directly via the GitHub API in workflows.

---

## Real-World Example

**Scenario**: You want to improve your greenhouse monitoring system.

### Using the Agent (Recommended)

**Chat conversation**:
```
You: @issue-creator I want to start implementing long-term storage. 
     What issues are available?

Agent: I found 7 issue templates for long-term storage implementation.
       Let me show you the high-priority ones:
       
       1. Enhanced Local Storage & MQTT (2-3h) - Foundation work
       2. HomeAssistant Integration (1-2h) - Monitoring & alerts
       3. MariaDB on Kubernetes (2-3h) - Database infrastructure
       
       I recommend starting with #1 and #2 first. Would you like me 
       to create these?

You: Yes, create #1 and #2

Agent: ✅ Created Issue #1: Enhanced Local Storage & MQTT Reliability
       https://github.com/rmwondolleck/greenhouse-monitor/issues/123
       
       ✅ Created Issue #2: HomeAssistant MQTT Integration & Alerts
       https://github.com/rmwondolleck/greenhouse-monitor/issues/124
       
       Great! Start with #1 - it provides the foundation for #2.

You: What should I do after these are done?

Agent: After completing #1 and #2, you'll have solid local storage 
       and monitoring. Next steps:
       
       - Issue #3: MariaDB on K8s (provides long-term database)
       - Issue #4: Migrate HA to MariaDB (connect everything)
       
       Want me to create these now or wait until #1 and #2 are done?
```

**Result**: Interactive, helpful, creates exactly what you need when you need it.

---

## Comparison: Agent Only

| Feature | Agent |
|---------|-------|
| **Setup** | None - uses Copilot |
| **Interaction** | Conversational |
| **Duplicate Check** | Automatic |
| **Customization** | On-the-fly in chat |
| **Explanations** | Full context and dependencies |
| **Selective Creation** | Create any combination |
| **Error Handling** | Helpful messages in chat |
| **Learning Curve** | Natural language |
| **Best For** | Everything - it's the only option |

**Note**: NPM scripts have been removed. The agent is now the exclusive way to create issues.

---

## Getting Started

### Using the Agent (Only Option)
1. Open GitHub Copilot Chat
2. Type: `@issue-creator show me available issues`
3. Follow the conversation to create what you need

### For Automation
If automation is needed, use **GitHub Actions** to create issues via GitHub API directly in workflows. The NPM scripts have been removed.

---

## Tips for Using the Agent

1. **Start with "show me"** - Always review what's available first
   ```
   @issue-creator show me all available issues
   ```

2. **Ask for recommendations** - The agent knows dependencies
   ```
   @issue-creator which issues should I create first?
   ```

3. **Create incrementally** - Don't create all at once
   ```
   @issue-creator create just the high-priority issues
   ```

4. **Verify first** - Check for existing issues
   ```
   @issue-creator check if any of these issues already exist
   ```

5. **Get explanations** - Understand what each issue does
   ```
   @issue-creator explain what issue #3 is about
   ```

---

## Troubleshooting

### "I don't see the @issue-creator agent"
- Make sure GitHub Copilot is enabled
- Check that you're in the greenhouse-monitor repository
- Try refreshing your IDE or browser

### "The agent says it can't create issues"
- The agent uses GitHub MCP tools which require proper permissions
- Make sure you're authenticated with GitHub
- Check your GitHub access to the repository

### "I need automation"
- **Use GitHub Actions** instead of NPM scripts
- Create a workflow file that uses GitHub API to create issues
- See GitHub Actions documentation for examples

---

## What Gets Created

Whether using agent or CLI, each issue includes:

```
📋 Issue Templates Found:

═══════════════════════════════════════════════════════════════

1. Issue #1: Extend Local Storage and Improve MQTT Reliability
   📄 File: ISSUE_01_local_storage_mqtt_reliability.md
   🔥 Priority: high
   ⏱️  Time: 2-3h
   📍 Phase: phase-1
   🏷️  Labels: enhancement, mqtt, priority-high, phase-1

2. Issue #2: HomeAssistant MQTT Integration & Alerts
   📄 File: ISSUE_02_homeassistant_integration.md
   🔥 Priority: high
   ⏱️  Time: 1-2h
   📍 Phase: phase-2
   🏷️  Labels: enhancement, homeassistant, monitoring, priority-high, phase-2

[... 5 more issues ...]
```

### Step 2: Gather Additional Information

You'll be prompted for optional information to customize the issues:

#### Planned Start Date
```
📅 When would you like to start this project? 
   (e.g., "next week", "Feb 1", or press Enter to skip):
```

**Examples:**
- `February 1, 2026`
- `next week`
- `this weekend`
- _(just press Enter to skip)_

#### Assignee
```
👤 Who should be assigned to these issues? 
   (GitHub username or press Enter to skip):
```

**Examples:**
- `rmwondolleck`
- `myusername`
- _(just press Enter to skip)_

#### Additional Notes
```
📝 Any additional notes or context for these issues? 
   (press Enter to skip):
```

**Examples:**
- `Starting with Phase 1 this week, then will proceed based on results`
- `Need to coordinate with K8s cluster availability`
- `Priority is getting alerts working first`
- _(just press Enter to skip)_

### Step 3: Confirmation

Before creating any issues, you'll be asked to confirm:

```
✅ Ready to create 7 issues + 1 tracking issue. Continue? (yes/no):
```

Type `yes` or `y` to proceed, or `no` to cancel.

### Step 4: Issue Creation

The script will create each issue and show progress:

```
📝 Creating issues...

📄 Processing: ISSUE_01_local_storage_mqtt_reliability.md
   Title: Issue #1: Extend Local Storage and Improve MQTT Reliability
   ✅ Created: #123 - https://github.com/rmwondolleck/greenhouse-monitor/issues/123

[... more issues ...]

📋 Creating tracking issue...
   ✅ Created tracking issue: #130 - https://github.com/.../issues/130
```

### Step 5: Summary

Finally, you'll see a summary:

```
═══════════════════════════════════════════════════════════════
📊 Summary:
   ✅ Created: 7 issues
   ⏭️  Skipped: 0 issues
   ❌ Failed: 0 issues
   📋 Tracking issue: #130
═══════════════════════════════════════════════════════════════

🎉 Issues created successfully!

🔗 View them at: https://github.com/rmwondolleck/greenhouse-monitor/issues
```

## What Gets Created

### 1. Sub-Issues (7 issues)

Each issue is created with:
- **Title** from the template
- **Body** with full content from the template
- **Labels** specified in the template
- **Custom context** from your inputs (if provided):
  ```markdown
  ---

  **Assigned to**: @rmwondolleck

  **Additional Context**: Starting with Phase 1 this week
  ```

### 2. Tracking Issue (1 issue)

A master tracking issue that:
- Links to all sub-issues by number (replaces #TBD with actual issue numbers)
- Includes architecture diagram and overview
- Shows implementation sequence and time estimates
- Contains your custom context (start date, notes)
- Uses checkboxes to track progress:
  ```markdown
  ### Phase 1: Enhanced Local Storage & MQTT Reliability (High Priority)
  - [ ] #123 - Enhanced Local Storage & MQTT Reliability (2-3h)
  
  ### Phase 2: HomeAssistant Integration (High Priority)
  - [ ] #124 - HomeAssistant MQTT Integration & Alerts (1-2h)
  ```

## Example Tracking Issue Body

Here's what the tracking issue looks like after creation with custom context:

```markdown
# Long-Term Storage Implementation - Tracking Issue

## Description
[... overview content ...]

## Sub-Issues

### Phase 1: Enhanced Local Storage & MQTT Reliability (High Priority)
- [ ] #123 - Enhanced Local Storage & MQTT Reliability (2-3h)

### Phase 2: HomeAssistant Integration (High Priority)
- [ ] #124 - HomeAssistant MQTT Integration & Alerts (1-2h)

[... more phases ...]

## Additional Information

**Planned Start Date**: February 1, 2026

**Notes**: Starting with Phase 1 this week, then will proceed based on results
```

## Batch Mode (Non-Interactive)

If you prefer non-interactive batch operations:

```bash
# Create all issues at once
npm run create-issues

# Create a specific issue
npm run create-issues -- --file ISSUE_01_local_storage_mqtt_reliability.md

# Dry run
npm run create-issues:dry-run
```

**Note:** Batch mode does NOT create the tracking issue or add custom context.

## Prerequisites

Before running the issue creator, you need:

### 1. GitHub Personal Access Token

Create a token with `repo` scope:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Greenhouse Issue Creator")
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token

### 2. Environment Variables

Add to your `.env` file:

```bash
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=rmwondolleck
GITHUB_REPO=greenhouse-monitor
```

## Troubleshooting

### "GITHUB_TOKEN environment variable is required"

Make sure you've added `GITHUB_TOKEN` to your `.env` file.

### "GitHub API error: 401"

Your token may be invalid or expired. Generate a new one.

### "Issue already exists"

The script checks for existing issues with the same title. If an issue already exists, it will be skipped. This prevents duplicates.

### Dry Run Always Recommended

Always run with `--dry-run` first to preview what will be created:

```bash
npm run create-issues:interactive:dry-run
```

This shows you exactly what would be created without making any API calls.

## Tips

1. **Use dry-run first**: Always preview with dry-run mode before creating issues
2. **All or nothing**: The interactive mode creates all issues together, which ensures the tracking issue can properly link to them
3. **Check existing issues**: Review your repository's existing issues before running to avoid duplicates
4. **Keep token secure**: Never commit your `.env` file or share your GitHub token
5. **Rate limiting**: The script includes delays between API calls to respect GitHub's rate limits

## Next Steps

After creating the issues:

1. **Review the tracking issue** - This is your central place to track progress
2. **Check off completed items** - As you complete each sub-issue, check it off in the tracking issue
3. **Start with Phase 1** - The issues are ordered by priority and dependencies
4. **Reference issues in commits** - Use `#123` in commit messages to link to issues
5. **Update issues as needed** - Add comments, update descriptions as you learn more

## Questions?

- **Script issues**: See [scripts/README.md](../../scripts/README.md)
- **Template questions**: See individual issue files in this directory
- **Architecture questions**: See [LONG_TERM_STORAGE_PLAN.md](../LONG_TERM_STORAGE_PLAN.md)
