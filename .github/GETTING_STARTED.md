# Getting Started with Agent Workflows

Welcome! This guide will help you get started with the automated agent workflows in the Greenhouse Monitor project.

## 🚀 Quick Start (5 minutes)

### Step 1: Setup Labels (One-Time, 30 seconds)
After this PR is merged:

1. Go to **Actions** tab
2. Click **Label Management** in the left sidebar
3. Click **Run workflow** button (green button on the right)
4. Click **Run workflow** to confirm
5. Wait ~10 seconds for completion

✅ **Result**: All required labels are now created in your repository!

### Step 2: Create Your First Issue (1 minute)

1. Go to **Issues** tab
2. Click **New issue**
3. Enter a title like: "Add temperature alert feature"
4. Add a description (mention "feature" or "enhancement")
5. Click **Submit new issue**

✅ **Result**: Issue is automatically labeled and you'll receive workflow guidance!

### Step 3: Use an Agent (2 minutes)

In the issue you just created, add a comment:
```
@brainstorming How should we implement temperature alerts when it exceeds 30°C?
```

✅ **Result**: The brainstorming agent will provide design suggestions and approaches!

### Step 4: Create a PR (1 minute)

1. Make some changes in a branch
2. Create a Pull Request to main
3. Wait a few seconds

✅ **Result**: PR is auto-labeled with a review checklist!

---

## 📖 Understanding the Workflow

### The Agent Workflow Cycle

```
1. CREATE ISSUE
   ↓ (auto-labeled in ~5 seconds)
   
2. BRAINSTORM WITH @brainstorming
   ↓ (get design ideas)
   
3. IMPLEMENT WITH @coding
   ↓ (write code)
   
4. CREATE PR
   ↓ (auto-checklist added)
   
5. REVIEW WITH @code-review
   ↓ (quality check)
   
6. MERGE
   ↓ (auto-deployment notification)
   
7. DEPLOY
   ✅ (Raspberry Pi auto-deploys)
```

---

## 🏷️ Understanding Auto-Labels

Labels are automatically applied based on keywords:

### Type Labels (What kind of work?)
| Use in Title/Body | Gets Label |
|-------------------|------------|
| bug, error, broken, fix | `bug` 🔴 |
| feature, enhancement | `enhancement` 🔵 |
| documentation, readme | `documentation` 📘 |

### Component Labels (What part?)
| Mention in Issue | Gets Label |
|------------------|------------|
| frontend, react, ui, dashboard | `frontend` ⚛️ |
| backend, server, api, express | `backend` 🖥️ |
| sensor, lcd, hardware, raspberry | `hardware` 🔧 |
| mqtt, messaging | `mqtt` 📡 |

### Example Issue
```
Title: "Add temperature alert feature"
Body: "We need a feature to alert via MQTT when temperature exceeds 30°C"

Auto-labels: enhancement, mqtt, needs-brainstorming
```

---

## 🤖 Using the Agents

### @brainstorming - Planning & Ideas
**Use when**: Planning features, exploring options, thinking through decisions

**Example**:
```
@brainstorming How should we add support for multiple greenhouses?
```

**You'll get**: Multiple solution approaches, technical considerations, tradeoffs

---

### @coding - Implementation
**Use when**: Writing code, fixing bugs, refactoring

**Example**:
```
@coding Add a new endpoint to get the last 24 hours of temperature data
```

**You'll get**: Code implementation following project conventions

---

### @code-review - Quality Check
**Use when**: Before merging, after implementing, checking for issues

**Example**:
```
@code-review Review the changes in server.ts for potential issues
```

**You'll get**: Feedback on correctness, security, performance, best practices

---

## 🛠️ Manual Workflows

### Agent Workflow Helper
**Use**: Create structured issues with agent guidance

**How**:
1. Actions → Agent Workflow Helper → Run workflow
2. Select task type:
   - `brainstorming` - For planning
   - `implementation` - For coding tasks
   - `review` - For code review
   - `documentation` - For doc updates
3. Enter description
4. Issue created with proper setup!

---

## 📋 Common Workflows

### Adding a New Feature
```
1. Create issue: "Feature: Add temperature alerts"
   → Auto-labeled: enhancement, needs-brainstorming

2. Comment: @brainstorming How should we implement this?
   → Get design suggestions

3. Comment: @coding Implement the alert system
   → Get code implementation

4. Create PR from your branch
   → Auto-labeled with review checklist

5. Comment: @code-review Review the implementation
   → Get quality feedback

6. Address feedback, then merge
   → Issue updated with deployment info
```

### Fixing a Bug
```
1. Create issue: "Bug: Sensor reading returns null"
   → Auto-labeled: bug, needs-investigation

2. Comment: @coding Fix the sensor reading bug
   → Get fix implementation

3. Create PR
   → Review checklist added

4. Comment: @code-review Review the fix
   → Get review

5. Merge
   → Deployment notification sent
```

### Updating Documentation
```
1. Use Agent Helper workflow OR create issue
2. Comment: @coding Update the installation instructions
3. Create PR
4. Merge (no need for extensive review on docs)
```

---

## 💡 Pro Tips

### 1. Use Descriptive Titles
❌ Bad: "Fix it"
✅ Good: "Fix sensor timeout error on DHT11 read"

### 2. Reference Issues in Commits
```bash
git commit -m "Add temperature alerts (fixes #123)"
```
This auto-closes issue #123 on merge!

### 3. Check Actions Tab
Monitor workflow runs: Repository → Actions tab

### 4. Use Keywords for Auto-Labeling
Include keywords in issue title/body for better labeling:
- bug, error, broken, fix
- feature, enhancement, add
- frontend, backend, hardware
- critical, urgent (for high priority)

### 5. Follow the Checklist
PRs include a review checklist - go through it before merging!

---

## 🎯 What Happens Automatically

You don't need to do anything for these:

✅ **Issues get labeled** within 5-10 seconds
✅ **Issues get workflow guidance** in a comment
✅ **PRs get review checklist** when opened
✅ **PRs get labeled** based on content
✅ **Builds are tested** on every PR
✅ **Issues are updated** when PRs merge
✅ **Deployment info posted** after merge to main

---

## 📚 Need More Help?

### Documentation
- [Workflow Guide](.github/workflows/README.md) - Complete workflow documentation
- [Quick Reference](.github/QUICK_REFERENCE.md) - Quick commands and tips
- [Workflow Diagrams](.github/WORKFLOW_DIAGRAM.md) - Visual workflow flows
- [Agent Docs](.github/agents/README.md) - Agent capabilities and usage

### Getting Help
Create an issue with the `help-wanted` label!

---

## 🎉 You're Ready!

You now know how to:
- ✅ Create issues that auto-label
- ✅ Use agents for brainstorming, coding, and review
- ✅ Create PRs with auto-checklists
- ✅ Follow the automated workflow
- ✅ Track deployments

**Start by creating your first issue and watch the automation work!**

Happy coding! 🌱🌡️

