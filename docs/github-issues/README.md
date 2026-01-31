# GitHub Issues Summary

This directory contains detailed issue templates for implementing long-term storage and year-over-year analysis capabilities for the Greenhouse Monitor project.

## Issue Overview

| # | Title | Phase | Priority | Time | Dependencies |
|---|-------|-------|----------|------|--------------|
| 1 | [Enhanced Local Storage & MQTT Reliability](ISSUE_01_local_storage_mqtt_reliability.md) | Phase 1 | High | 2-3h | None |
| 2 | [HomeAssistant MQTT Integration & Alerts](ISSUE_02_homeassistant_integration.md) | Phase 2 | High | 1-2h | #1 |
| 3 | [Deploy MariaDB on Kubernetes](ISSUE_03_k8s_mariadb.md) | Phase 3 | High | 2-3h | None |
| 4 | [Migrate HomeAssistant to External Database](ISSUE_04_ha_database_migration.md) | Phase 4 | Medium | 1-2h | #3 |
| 5 | [Automated Weekly Backups to NAS](ISSUE_05_automated_backups.md) | Phase 5 | Medium | 2-3h | #3, #4 |
| 6 | [Year-over-Year Analysis Dashboard](ISSUE_06_year_over_year_dashboard.md) | Phase 6 | Medium | 4-6h | #4 |
| 7 | [Outdoor Sensor Support](ISSUE_07_outdoor_sensor_support.md) | Phase 7 | Low | 6-8h | #1-6 |

**Total Estimated Time**: 20-30 hours

## Implementation Sequence

### Quick Wins (Week 1)
Start here for immediate improvements:
- ✅ Issue #1: Extend local storage to 14 days, improve MQTT reliability
- ✅ Issue #2: Set up HomeAssistant alerts for offline detection

### Infrastructure (Week 2)
Can be done in parallel with Week 1:
- ✅ Issue #3: Deploy MariaDB on Kubernetes
- ✅ Issue #4: Migrate HA to external database

### Reliability (Week 3)
- ✅ Issue #5: Set up automated backups to NAS

### Analytics (Week 3-4)
- ✅ Issue #6: Build year-over-year dashboard

### Future Enhancements
- ⏳ Issue #7: Add outdoor sensor support (when ready)

## Parallel vs Sequential

### Can Be Done in Parallel:
- **Issues #1 + #2 + #3**: Different systems (Pi, HA, K8s)
- **Issue #5**: Can start once #3 is done, doesn't block #4 or #6

### Must Be Sequential:
- **#1 → #2**: HA integration needs improved MQTT topics
- **#3 → #4**: HA migration needs database running
- **#4 → #6**: Dashboard needs historical data in database

## Labels Used

- `enhancement` - New features or improvements
- `infrastructure` - K8s, database, networking
- `mqtt` - MQTT broker and messaging
- `homeassistant` - HA integration
- `database` - Database setup and queries
- `kubernetes` - K8s deployments
- `backup` - Backup and disaster recovery
- `frontend` - React UI components
- `analytics` - Data analysis features
- `hardware` - Physical sensor hardware
- `sensors` - Sensor integration
- `monitoring` - System health monitoring
- `priority-high` - Critical path items
- `priority-medium` - Important but not blocking
- `priority-low` - Nice to have
- `phase-1` through `phase-7` - Implementation phases
- `future` - Future enhancements

## Milestones

- **Phase 1**: Enhanced Local Storage & MQTT Reliability
- **Phase 2**: HomeAssistant MQTT Integration
- **Phase 3**: MariaDB on Kubernetes
- **Phase 4**: HomeAssistant Database Migration
- **Phase 5**: Automated Backups to NAS
- **Phase 6**: Year-over-Year Analysis Dashboard
- **Phase 7**: Multi-Sensor Support (Future)

## Creating Issues in GitHub

### ⭐ Use GitHub Copilot Agent

**Use the @issue-creator agent directly in GitHub Copilot Chat**

The native agent creates issues using GitHub's MCP (Model Context Protocol) - no scripts or setup needed!

**How to use**:
1. Open GitHub Copilot Chat (in VS Code, GitHub.com, or your IDE)
2. Type: `@issue-creator review all issue templates`
3. The agent will show you all available issues with priorities
4. Ask it to create issues: `@issue-creator create all high-priority issues`

**Example commands**:
```
@issue-creator show me all available issues
@issue-creator create issue #1 about MQTT reliability
@issue-creator create all Phase 1 issues
@issue-creator which issues should I create first?
@issue-creator create issues #1, #2, and #3
```

**Benefits:**
- ✅ **Native GitHub integration** - Creates issues directly via MCP
- ✅ **Interactive** - Ask questions, customize before creating
- ✅ **Smart duplicate detection** - Checks existing issues first
- ✅ **Explains dependencies** - Shows you what to build first
- ✅ **Real-time** - Creates issues immediately in the chat
- ✅ **No setup required** - Just use Copilot Chat

See [USAGE_EXAMPLE.md](USAGE_EXAMPLE.md) for a detailed walkthrough.

---

### Manual Creation (For Review)
1. Go to GitHub repository → Issues → New Issue
2. Copy content from each markdown file
3. Add appropriate labels and milestone
4. Assign to yourself

This is useful when you want to review the exact content before creating.
```bash
# Install GitHub CLI if needed
# brew install gh  (macOS)
# sudo apt install gh  (Linux)

# Authenticate
gh auth login

# Create issues from templates
gh issue create --title "Enhanced Local Storage & MQTT Reliability" \
  --body-file docs/github-issues/ISSUE_01_local_storage_mqtt_reliability.md \
  --label "enhancement,mqtt,priority-high,phase-1"

# ... repeat for each issue
```

## Progress Tracking

Copy this checklist to track your progress:

```markdown
## Implementation Progress

### Phase 1: Enhanced Local Storage & MQTT Reliability
- [ ] Issue #1 created
- [ ] Issue #1 in progress
- [ ] Issue #1 completed
- [ ] Issue #1 tested

### Phase 2: HomeAssistant MQTT Integration
- [ ] Issue #2 created
- [ ] Issue #2 in progress
- [ ] Issue #2 completed
- [ ] Issue #2 tested

### Phase 3: MariaDB on Kubernetes
- [ ] Issue #3 created
- [ ] Issue #3 in progress
- [ ] Issue #3 completed
- [ ] Issue #3 tested

### Phase 4: HomeAssistant Database Migration
- [ ] Issue #4 created
- [ ] Issue #4 in progress
- [ ] Issue #4 completed
- [ ] Issue #4 tested
- [ ] 2+ years of data accumulated

### Phase 5: Automated Backups to NAS
- [ ] Issue #5 created
- [ ] Issue #5 in progress
- [ ] Issue #5 completed
- [ ] Issue #5 tested
- [ ] Restore tested

### Phase 6: Year-over-Year Analysis Dashboard
- [ ] Issue #6 created
- [ ] Issue #6 in progress
- [ ] Issue #6 completed
- [ ] Issue #6 tested

### Phase 7: Outdoor Sensor Support (Future)
- [ ] Hardware acquired
- [ ] Issue #7 created
- [ ] Issue #7 in progress
- [ ] Issue #7 completed
- [ ] Issue #7 tested
```

## Getting Help

If you encounter issues during implementation:

1. **Check documentation** in each issue
2. **Search existing issues** in repository
3. **Review logs**: 
   - Pi: `journalctl -u greenhouse-monitor -f`
   - K8s: `kubectl logs -n greenhouse <pod> --tail=100`
   - HA: `/config/home-assistant.log`
4. **Common problems** documented in each issue's troubleshooting section

## Contributing

When working on an issue:

1. Create a feature branch: `git checkout -b feature/issue-1-mqtt-reliability`
2. Commit often with clear messages
3. Reference issue in commits: `git commit -m "feat: extend storage to 14 days (#1)"`
4. Open PR when ready: Link to issue in PR description
5. Wait for CI checks (if configured)
6. Merge when approved

## Questions?

Refer to the main [LONG_TERM_STORAGE_PLAN.md](../LONG_TERM_STORAGE_PLAN.md) for architecture overview and detailed planning.
