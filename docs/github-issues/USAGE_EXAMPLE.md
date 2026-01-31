# Issue Creator - Usage Examples

This document shows how to use the issue creator tools to create GitHub issues from the templates in this directory.

## Quick Start

The **recommended approach** is to use the interactive mode, which guides you through the process:

```bash
# Preview what will be created (dry run)
npm run create-issues:interactive:dry-run

# Create all issues with tracking issue
npm run create-issues:interactive
```

## Interactive Mode Walkthrough

When you run `npm run create-issues:interactive`, here's what happens:

### Step 1: Issue Summary Display

The script will show you all available issue templates with their key information:

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
