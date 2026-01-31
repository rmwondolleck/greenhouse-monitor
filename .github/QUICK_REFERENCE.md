# GitHub Actions Quick Reference

## 🚀 Quick Commands

### Run Manual Workflows

#### Create Structured Task Issue
```
GitHub UI → Actions → Agent Workflow Helper → Run workflow
Select: brainstorming | implementation | review | documentation
```

#### Setup/Update Labels
```
GitHub UI → Actions → Label Management → Run workflow
```

#### Regenerate Documentation
```
GitHub UI → Actions → Agent Workflow Documentation → Run workflow
```

## 🏷️ Label Quick Reference

| Label | Color | Use Case |
|-------|-------|----------|
| `bug` | 🔴 | Something is broken |
| `enhancement` | 🔵 | New feature request |
| `documentation` | 📘 | Docs need updating |
| `frontend` | ⚛️ | React/UI changes |
| `backend` | 🖥️ | Server/API changes |
| `hardware` | 🔧 | Sensor/GPIO work |
| `needs-brainstorming` | 💭 | Need to plan first |
| `code-review` | 👀 | Ready for review |
| `priority:high` | 🔥 | Do this ASAP |

## 📝 Issue Keywords for Auto-Labeling

Include these in issue title/body for automatic labeling:

### Type Keywords
- **Bug**: bug, error, fix, broken
- **Enhancement**: feature, enhancement, new feature
- **Documentation**: doc, readme, documentation

### Component Keywords
- **Frontend**: dashboard, react, ui, frontend, tailwind
- **Backend**: server, api, backend, express, endpoint
- **Hardware**: sensor, lcd, raspberry, dht11, hardware
- **MQTT**: mqtt, messaging

### Priority Keywords
- **High Priority**: critical, urgent

## 🤖 Agent Quick Reference

### When to Use Each Agent

| Agent | Use When | Example |
|-------|----------|---------|
| @brainstorming | Planning features, exploring options | "How should we add email alerts?" |
| @coding | Writing/fixing code | "Add temperature threshold endpoint" |
| @code-review | Before merging changes | "Review server.ts changes" |

## 📋 Workflow Triggers

| Workflow | Automatic Trigger | Manual Trigger |
|----------|------------------|----------------|
| Issue Triage | ✅ Issue opened/edited | ❌ |
| PR Review Reminder | ✅ PR opened | ❌ |
| Test Build | ✅ Push to branch | ❌ |
| Build Validation | ✅ Push to main | ✅ |
| Post-Merge | ✅ Merge to main | ❌ |
| Agent Helper | ❌ | ✅ |
| Label Management | ❌ | ✅ |
| Agent Docs | ❌ | ✅ |

## 🔄 Development Flow Examples

### Feature Development
```
1. Create issue with "feature" keyword
   → Auto-labeled: enhancement, needs-brainstorming
   
2. Comment: @brainstorming How should we implement X?
   → Get design suggestions
   
3. Comment: @coding Implement X feature
   → Create implementation
   
4. Create PR from branch
   → Auto-labeled, review checklist added
   
5. Comment: @code-review Review changes
   → Get review feedback
   
6. Merge PR
   → Issue updated, deployment notification sent
```

### Bug Fix
```
1. Create issue with "bug" keyword
   → Auto-labeled: bug, needs-investigation
   
2. Comment: @coding Fix the X bug
   → Implement fix
   
3. Create PR
   → Review checklist added
   
4. Comment: @code-review Review the fix
   → Get review
   
5. Merge
   → Deployment notification
```

## 🔍 Troubleshooting

### Workflow Not Running
```bash
# Check workflow runs
GitHub → Actions tab

# View logs
Actions → Select run → Click job → Expand steps
```

### Labels Not Applied
```bash
# Run Label Management workflow first
Actions → Label Management → Run workflow

# Check issue content has keywords
Edit issue → Add keywords like "bug", "feature", etc.
```

### Need to Retrigger Workflow
```bash
# For PR workflows
Push new commit to PR branch

# For issue workflows
Edit issue description (add/remove space)

# For manual workflows
Actions → Select workflow → Run workflow
```

## 📚 Documentation Links

- [Workflow Documentation](.github/workflows/README.md)
- [Agent Documentation](.github/agents/README.md)
- [Agent Workflows Guide](.github/AGENT_WORKFLOWS.md)
- [Main README](README.md)

## 💡 Pro Tips

1. **Use Keywords**: Include "bug", "feature", etc. in issue titles for auto-labeling
2. **Reference Issues**: Use "fixes #123" in commit messages to auto-close issues
3. **Check Actions**: Monitor Actions tab for workflow status
4. **Agent Context**: Give agents full context about what you're trying to do
5. **Review First**: Always use @code-review before merging significant changes

---

**Need Help?** Create an issue with the `help-wanted` label!

