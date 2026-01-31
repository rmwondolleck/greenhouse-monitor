# GitHub Actions Workflows

This directory contains GitHub Actions workflows that automate various tasks and integrate with the custom agents in `.github/agents/`.

## 📋 Workflows Overview

### Core Workflows

#### 1. **test.yml** - Test Build
- **Triggers**: Push to non-main branches, PRs to main
- **Purpose**: Validates builds before merging
- **Actions**:
  - Type checking
  - Server build
  - Client build
  - Build artifact verification

#### 2. **build-validation.yml** - Build and Validate
- **Triggers**: Push to main, manual dispatch
- **Purpose**: Validates main branch builds and prepares for deployment
- **Actions**:
  - Full build process
  - Artifact verification
  - Deployment information display

#### 3. **workflow-validation.yml** - Workflow Validation
- **Triggers**: Push/PR to `.github/workflows/`, manual dispatch
- **Purpose**: Validate and lint GitHub Actions workflow files
- **Features**:
  - YAML syntax validation
  - GitHub Actions schema validation
  - Style and formatting checks with yamllint
  - Prevents invalid workflows from being merged
- **Related Agent**: See `.github/agents/workflow-validator.agent.md`

### Agent Integration Workflows

#### 4. **issue-triage.yml** - Issue Triage and Labeling
- **Triggers**: Issues opened or edited
- **Purpose**: Automatically categorize and route issues
- **Features**:
  - Auto-labeling based on content
  - Component detection (frontend, backend, hardware)
  - Workflow suggestions (brainstorming, investigation)
  - Agent guidance comments

#### 5. **pr-review-reminder.yml** - PR Review Reminder
- **Triggers**: PRs opened or synchronized
- **Purpose**: Ensure quality through code review
- **Features**:
  - Review checklist addition
  - Code review agent reminders
  - PR auto-labeling
  - Testing guidance

#### 6. **agent-helper.yml** - Agent Workflow Helper
- **Triggers**: Manual workflow dispatch
- **Purpose**: Create structured issues with agent guidance
- **Task Types**:
  - Brainstorming (planning and exploration)
  - Implementation (coding tasks)
  - Review (code review tasks)
  - Documentation (doc updates)

#### 7. **label-management.yml** - Label Management
- **Triggers**: Manual dispatch, workflow file changes
- **Purpose**: Maintain consistent label system
- **Features**:
  - Creates all required labels
  - Updates label colors and descriptions
  - Ensures repository-wide consistency

#### 8. **post-merge.yml** - Post-Merge Actions
- **Triggers**: Push to main branch
- **Purpose**: Update issues and notify about deployment
- **Features**:
  - Updates related issues with merge info
  - Deployment status notifications
  - Auto-labeling with deployment status

#### 9. **agent-docs.yml** - Agent Workflow Documentation
- **Triggers**: Manual dispatch, changes to agent files
- **Purpose**: Keep workflow documentation up-to-date
- **Features**:
  - Auto-generates comprehensive workflow docs
  - Updates on agent or workflow changes

#### 10. **create-issues.yml** - Create Issues from Templates
- **Triggers**: Manual workflow dispatch
- **Purpose**: Bulk-create GitHub issues from markdown templates
- **Modes**:
  - `dry-run`: Preview what will be created
  - `create-all`: Create all issue templates
  - `create-high-priority`: Create only high-priority issues
  - Specific file: Create a single issue by filename
- **Features**:
  - Parses issue templates in `docs/github-issues/`
  - Checks for duplicates before creating
  - Supports labels and milestones
  - Rate limiting to respect GitHub API

#### 11. **sdlc-automation.yml** - SDLC Automation for Issue Resolution
- **Triggers**: Manual workflow dispatch, scheduled daily at 2 AM UTC
- **Purpose**: Automate the complete SDLC for resolving issues using custom agents
- **Features**:
  - Analyzes and prioritizes open issues
  - Creates brainstorming plans (Phase 1)
  - Sets up feature branches with scaffolding (Phase 2)
  - Provides code review guidance (Phase 3)
  - Creates draft PRs with implementation checklists (Phase 4)
  - Integrates with @brainstorming, @coding, and @code-review agents
- **Modes**:
  - `dry-run`: Preview the process without creating PRs
  - Process specific issues or all open issues
  - Configurable max issues per run
- **See**: [SDLC Automation Documentation](../SDLC_AUTOMATION.md)

### CI/CD Workflows

#### 11. **ci.yml** - Continuous Integration
- **Triggers**: PRs to main, push to main, manual dispatch
- **Purpose**: Comprehensive CI pipeline for code validation
- **Features**:
  - TypeScript type checking (strict mode)
  - Build verification (server and client)
  - Test execution (mock sensors)
  - Security audit (npm audit)
  - Build artifact upload
  - CI summary report
- **Jobs**:
  - Lint and typecheck
  - Build application
  - Run tests
  - Security scan
  - Generate summary

#### 12. **cd.yml** - Continuous Deployment
- **Triggers**: Push to main, manual dispatch
- **Purpose**: Automated deployment to Raspberry Pi
- **Features**:
  - Full build process
  - Deployment package creation
  - Artifact upload with retention
  - Automatic issue commenting for deployed changes
  - Deployment status notifications
- **Environment**: Production (configurable)

#### 13. **code-quality.yml** - Code Quality Checks
- **Triggers**: PRs to main, push to main, weekly schedule, manual
- **Purpose**: Monitor and maintain code quality
- **Features**:
  - TypeScript quality analysis
  - Dependency review (PRs only)
  - Code metrics (lines of code, structure)
  - Build size analysis
  - Security scanning (secrets detection)
  - Quality score calculation
- **Schedule**: Weekly on Mondays at 9 AM UTC

#### 14. **release.yml** - Release Management
- **Triggers**: Version tags (v*.*.*), manual dispatch
- **Purpose**: Create versioned releases with packages
- **Features**:
  - Full test and build pipeline
  - Release package creation (.tar.gz)
  - Deployment script generation
  - SHA256 checksums
  - Automated release notes
  - GitHub release creation
- **Package Contents**: Built artifacts, dependencies, documentation, deploy script

#### 15. **health-check.yml** - Repository Health Check
- **Triggers**: Weekly schedule (Mondays 8 AM UTC), manual dispatch
- **Purpose**: Proactive repository health monitoring
- **Features**:
  - Outdated dependency detection
  - Security vulnerability scanning
  - Build status validation
  - Documentation completeness check
  - Workflow inventory
  - Health score calculation (0-100)
  - Auto-creates issues for critical problems
- **Auto-Issue Creation**: Creates issues for build failures or security vulnerabilities

## 🎯 Using the Workflows

### Automatic Workflows

These run automatically - no action needed:

1. **When you create an issue**:
   - Gets auto-labeled based on content
   - Receives agent workflow guidance
   - Component labels added automatically

2. **When you create a PR**:
   - Builds are tested automatically
   - Review checklist is added
   - Component labels applied

3. **When you merge to main**:
   - Related issues are updated
   - Deployment info is posted
   - Build is validated

### Manual Workflows

These can be run manually from the Actions tab:

1. **Agent Workflow Helper**:
   ```
   Actions → Agent Workflow Helper → Run workflow
   - Select task type (brainstorming/implementation/review/documentation)
   - Enter description
   - Issue created with proper setup
   ```

2. **Label Management**:
   ```
   Actions → Label Management → Run workflow
   - Creates/updates all labels
   - Ensures consistency
   ```

3. **Agent Workflow Documentation**:
   ```
   Actions → Agent Workflow Documentation → Run workflow
   - Regenerates workflow documentation
   - Updates AGENT_WORKFLOWS.md
   ```

4. **Create Issues from Templates**:
   ```
   Actions → Create Issues from Templates → Run workflow
   - Choose mode: dry-run, create-all, or create-high-priority
   - Optional: specify a single issue file
   - Creates issues with proper labels and formatting
   ```
   
   **Modes:**
   - `dry-run`: Preview issues without creating them
   - `create-all`: Create all 7 issue templates
   - `create-high-priority`: Create only issues #1, #2, #3
   - Specific file: Enter filename like `ISSUE_01_local_storage_mqtt_reliability.md`

5. **SDLC Automation**:
   ```
   Actions → SDLC Automation - Issue Resolution → Run workflow
   - Choose specific issues or process all open issues
   - Set dry_run to preview without creating PRs
   - Configure max_issues to limit processing
   - Workflow will follow complete SDLC for each issue
   ```
   
   **Options:**
   - `issue_numbers`: Comma-separated list (e.g., "1,2,3") or empty for all
   - `dry_run`: true (preview) or false (execute)
   - `max_issues`: Maximum number of issues to process (default: 1)
   
   **See**: [SDLC Automation Guide](../SDLC_AUTOMATION.md) for detailed usage

6. **Repository Health Check**:
   ```
   Actions → Repository Health Check → Run workflow
   - Scans for outdated dependencies
   - Checks for security vulnerabilities
   - Validates build status
   - Reviews documentation
   - Generates health score
   - Auto-creates issues for critical problems
   ```

7. **Create Release**:
   ```
   Actions → Release → Run workflow
   - Enter version number (e.g., v1.0.0)
   - Creates GitHub release
   - Generates release packages
   - Includes deployment scripts
   ```

## 🏷️ Label System

### Type Labels
- `bug` 🔴 - Something isn't working
- `enhancement` 🔵 - New feature or request
- `documentation` 📘 - Documentation improvements
- `refactoring` 🔄 - Code refactoring

### Component Labels
- `frontend` ⚛️ - React frontend / UI changes
- `backend` 🖥️ - Express server / API changes
- `hardware` 🔧 - Hardware integration
- `mqtt` 📡 - MQTT integration
- `testing` 🧪 - Testing related

### Workflow Labels
- `needs-brainstorming` 💭 - Needs planning
- `needs-investigation` 🔍 - Needs investigation
- `code-review` 👀 - Ready for review
- `ready-to-merge` ✅ - Ready to merge

### Priority Labels
- `priority:high` 🔴 - High priority
- `priority:medium` 🟡 - Medium priority
- `priority:low` 🟢 - Low priority

### Status Labels
- `in-progress` 🚧 - Work in progress
- `blocked` 🚫 - Blocked by something
- `good-first-issue` 🌱 - Good for newcomers
- `help-wanted` 🙋 - Extra attention needed

## 🔄 Workflow Integration with Agents

### Feature Development Flow
```
Issue Created
    ↓
Auto-labeled (needs-brainstorming)
    ↓
Use @brainstorming agent
    ↓
Use @coding agent
    ↓
Create PR (auto review checklist)
    ↓
Use @code-review agent
    ↓
Merge (auto-deployment notification)
```

### Bug Fix Flow
```
Bug Issue Created
    ↓
Auto-labeled (bug, needs-investigation)
    ↓
Use @coding agent
    ↓
Create PR (auto review checklist)
    ↓
Use @code-review agent
    ↓
Merge (auto-deployment notification)
```

## 🛠️ Customization

### Adding New Labels

Edit `.github/workflows/label-management.yml`:

```javascript
{ 
  name: 'your-label', 
  color: 'hexcolor', 
  description: 'Description' 
}
```

Then run the Label Management workflow.

### Modifying Auto-Labeling Rules

Edit `.github/workflows/issue-triage.yml`:

```javascript
if (title.includes('keyword') || body.includes('keyword')) {
  labels.push('label-name');
}
```

### Adding New Agent Workflow Types

Edit `.github/workflows/agent-helper.yml` to add new task types:

```yaml
options:
  - brainstorming
  - implementation
  - review
  - documentation
  - your-new-type  # Add here
```

Then add the case handling in the script section.

## 📊 Monitoring Workflows

View workflow runs:
```
Repository → Actions tab
```

Check specific workflow:
```
Actions → Select workflow name → View runs
```

View logs:
```
Actions → Select run → Click on job → Expand steps
```

## 🚀 Best Practices

1. **Use Descriptive Titles**: Include keywords for better auto-labeling
   - ✅ "Bug: Sensor reading returns null"
   - ✅ "Feature: Add temperature alerts"
   - ❌ "Fix it"

2. **Reference Issues**: Use keywords in commit messages
   - `fixes #123` - Closes the issue
   - `closes #123` - Closes the issue
   - `see #123` - References the issue

3. **Follow Checklists**: Use the PR review checklist provided

4. **Use Agent Helper**: For structured task creation

5. **Test Before Merging**: Ensure builds pass and reviews are complete

## 🔒 Permissions

Workflows use these permissions:
- `issues: write` - For labeling and commenting
- `pull-requests: write` - For PR comments and labels
- `contents: read/write` - For reading code and updating docs

All actions use `GITHUB_TOKEN` with minimal required permissions.

## 🐛 Troubleshooting

### Workflow Not Running

1. Check workflow file syntax (YAML)
2. Verify trigger conditions
3. Check repository settings → Actions

### Labels Not Applied

1. Run Label Management workflow first
2. Check auto-labeling logic in issue-triage.yml
3. Verify keywords in issue title/body

### Permission Errors

1. Check workflow permissions in workflow file
2. Verify repository Actions settings
3. Ensure GITHUB_TOKEN has required permissions

## 📚 Additional Resources

- [Custom Agents Documentation](../agents/README.md)
- [Agent Workflow Guide](../AGENT_WORKFLOWS.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Questions?** Open an issue with the `help-wanted` label!

