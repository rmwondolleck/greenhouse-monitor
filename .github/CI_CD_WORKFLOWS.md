# CI/CD Workflows Documentation

This document provides comprehensive information about the CI/CD workflows that have been implemented for the Greenhouse Monitor project.

## Overview

The repository now includes a complete CI/CD pipeline that automates the entire software development lifecycle, from code commit to production deployment. These workflows work in conjunction with the existing SDLC automation and custom agents to provide a robust development and deployment experience.

## Workflows Summary

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **ci.yml** | PR, Push to main | Continuous Integration | ~5-7 min |
| **cd.yml** | Push to main | Continuous Deployment | ~3-5 min |
| **code-quality.yml** | PR, Push, Weekly | Code Quality Checks | ~4-6 min |
| **release.yml** | Version tags | Release Management | ~6-8 min |
| **health-check.yml** | Weekly | Repository Health | ~3-4 min |

## Detailed Workflow Documentation

### 1. Continuous Integration (ci.yml)

**Purpose**: Validates all code changes through comprehensive testing before they reach production.

**Triggers**:
- Pull requests to `main` branch
- Pushes to `main` branch
- Manual workflow dispatch

**Jobs**:

#### 1.1 Lint and Type Check
- Runs TypeScript compiler in strict mode
- Validates server-side TypeScript
- Checks all TypeScript files for errors
- **Exit criteria**: All type checks must pass

#### 1.2 Build
- Builds server (TypeScript → JavaScript)
- Builds client (Vite → optimized bundle)
- Verifies build artifacts exist
- Uploads artifacts for downstream jobs
- **Exit criteria**: Both builds succeed and artifacts are present

#### 1.3 Test
- Downloads build artifacts
- Runs mock sensor tests
- Validates server startup
- **Exit criteria**: Tests complete without errors

#### 1.4 Security
- Runs `npm audit` for vulnerabilities
- Checks for outdated dependencies
- **Exit criteria**: No high-severity vulnerabilities (continues on moderate)

#### 1.5 Summary
- Generates comprehensive CI report
- Shows status of all jobs
- Provides quick overview in GitHub UI
- **Always runs**: Even if previous jobs fail

**Usage**:
```bash
# Automatically runs on PR
git checkout -b feature/my-feature
git push origin feature/my-feature
# Create PR → CI runs automatically

# Manual trigger
GitHub Actions → Continuous Integration → Run workflow
```

**Best Practices**:
- ✅ Always wait for CI to pass before merging
- ✅ Review CI summary for any warnings
- ✅ Fix security vulnerabilities before merging
- ❌ Don't bypass CI checks

---

### 2. Continuous Deployment (cd.yml)

**Purpose**: Automatically deploys validated code to the Raspberry Pi production environment.

**Triggers**:
- Push to `main` branch (after merge)
- Manual workflow dispatch

**Jobs**:

#### 2.1 Build and Deploy
- Full CI pipeline (type check, build)
- Creates deployment package (.tar.gz)
- Uploads artifact with 30-day retention
- Comments on related issues
- **Exit criteria**: Build succeeds and package created

#### 2.2 Post-Deployment Checks
- Waits for auto-deployment
- Generates deployment summary
- **Exit criteria**: Deployment package verified

**Deployment Package Contents**:
```
greenhouse-monitor-deploy.tar.gz
├── dist/                 # Built application
├── package.json          # Dependencies
├── package-lock.json     # Locked versions
└── .env.example          # Configuration template
```

**Usage**:
```bash
# Automatic deployment
git merge feature-branch
git push origin main
# CD runs automatically

# Manual deployment
GitHub Actions → Continuous Deployment → Run workflow
Environment: production (or staging)
```

**Raspberry Pi Integration**:
- The deployment package is created by GitHub Actions
- Raspberry Pi polls for changes every 5 minutes (via cron job)
- Auto-deploys when changes detected
- Monitor deployment: `ssh rwondoll@greenhouse.local 'tail -f ~/deploy.log'`

**Best Practices**:
- ✅ Verify CI passed before deployment
- ✅ Monitor deployment logs on Raspberry Pi
- ✅ Test dashboard after deployment: http://greenhouse.local:3000
- ✅ Check related issues for deployment confirmation
- ❌ Don't deploy with failing tests

---

### 3. Code Quality (code-quality.yml)

**Purpose**: Maintains high code quality standards through automated analysis.

**Triggers**:
- Pull requests to `main` branch
- Push to `main` branch
- Weekly schedule (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Jobs**:

#### 3.1 TypeScript Quality
- Runs TypeScript in strict mode
- Reports all type errors
- Generates quality report
- **Exit criteria**: No critical type errors

#### 3.2 Dependency Review
- **PR only**: Reviews dependency changes
- Checks for security vulnerabilities in new deps
- Prevents malicious packages
- **Exit criteria**: No moderate+ vulnerabilities

#### 3.3 Code Metrics
- Counts lines of code by language
- Analyzes project structure
- **Exit criteria**: Always succeeds (informational)

#### 3.4 Build Size Check
- Measures total build size
- Lists artifact sizes
- Tracks bundle size over time
- **Exit criteria**: Always succeeds (informational)

#### 3.5 Security Scan
- Runs `npm audit`
- Detects potential secrets in code
- Generates security report
- **Exit criteria**: Continues on error (informational)

#### 3.6 Summary
- Calculates overall quality score
- Highlights areas needing attention
- **Always runs**: Provides comprehensive view

**Usage**:
```bash
# Automatic on PR
# Already runs as part of CI

# Manual trigger
GitHub Actions → Code Quality → Run workflow

# Weekly automatic run
Scheduled for Mondays at 9 AM UTC
```

**Quality Score Calculation**:
```
Base Score: 100 points
- TypeScript errors: -10 per major issue
- Security vulnerabilities: -20 to -40
- Build failures: -30
- Outdated dependencies: -5

Score Ranges:
- 90-100: Excellent 🌟
- 70-89: Good ✅
- 50-69: Fair ⚠️
- <50: Needs Attention ❌
```

**Best Practices**:
- ✅ Review weekly quality reports
- ✅ Address security vulnerabilities promptly
- ✅ Keep dependencies up to date
- ✅ Monitor build size growth
- ❌ Don't ignore quality warnings

---

### 4. Release Management (release.yml)

**Purpose**: Creates versioned releases with deployment packages.

**Triggers**:
- Push tags matching `v*.*.*` (e.g., v1.0.0, v2.1.3)
- Manual workflow dispatch with version input

**Jobs**:

#### 4.1 Create Release
- Runs full test suite
- Builds production artifacts
- Creates release directory structure
- Generates deployment script
- Creates .tar.gz package
- Generates SHA256 checksum
- Creates automated release notes
- Publishes GitHub release

**Release Package Contents**:
```
greenhouse-monitor-v1.0.0.tar.gz
├── dist/                 # Built application
├── package.json          # Dependencies
├── package-lock.json     # Locked versions
├── README.md             # Documentation
├── .env.example          # Configuration template
└── deploy.sh             # Deployment script
```

**Usage**:

**Option 1: Tag-based Release (Recommended)**
```bash
# Create and push a version tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
# Release workflow runs automatically
```

**Option 2: Manual Release**
```bash
# From GitHub Actions UI
GitHub Actions → Release → Run workflow
Version: v1.2.0
```

**Release Notes**:
- Automatically generated from git commits
- Shows changes since last release
- Includes installation instructions
- Lists system requirements

**Download and Install**:
```bash
# Download release
wget https://github.com/rmwondolleck/greenhouse-monitor/releases/download/v1.2.0/greenhouse-monitor-v1.2.0.tar.gz

# Verify checksum
sha256sum -c greenhouse-monitor-v1.2.0.tar.gz.sha256

# Extract
tar -xzf greenhouse-monitor-v1.2.0.tar.gz

# Install
cd greenhouse-monitor-v1.2.0
npm ci --production
cp .env.example .env
# Edit .env with your settings

# Run
npm run start:pi
```

**Versioning Guidelines**:
```
vMAJOR.MINOR.PATCH

MAJOR: Breaking changes (v1.0.0 → v2.0.0)
MINOR: New features (v1.0.0 → v1.1.0)
PATCH: Bug fixes (v1.0.0 → v1.0.1)

Examples:
- Bug fix: v1.0.0 → v1.0.1
- New feature: v1.0.1 → v1.1.0
- Breaking change: v1.1.0 → v2.0.0
```

**Best Practices**:
- ✅ Follow semantic versioning
- ✅ Test before creating release
- ✅ Update CHANGELOG.md before tagging
- ✅ Verify release package downloads correctly
- ❌ Don't create releases from unmerged branches
- ❌ Don't skip version numbers

---

### 5. Repository Health Check (health-check.yml)

**Purpose**: Proactively monitors repository health and creates issues for problems.

**Triggers**:
- Weekly schedule (Mondays at 8 AM UTC)
- Manual workflow dispatch

**Jobs**:

#### 5.1 Health Check
- Checks for outdated dependencies
- Runs security vulnerability scan
- Validates build status
- Reviews documentation completeness
- Checks workflow files
- Generates health score (0-100)
- Auto-creates issues for critical problems

**Health Check Categories**:

1. **Dependencies** (📦)
   - Checks for outdated packages
   - Identifies major version updates
   - Suggests upgrade paths

2. **Security** (🔒)
   - Runs `npm audit`
   - Identifies vulnerabilities by severity
   - Checks for security advisories

3. **Build** (🏗️)
   - Validates build process
   - Checks for build failures
   - Verifies artifacts

4. **Documentation** (📚)
   - Checks README.md
   - Validates docs/ directory
   - Verifies .env.example

5. **Workflows** (⚙️)
   - Lists all workflows
   - Checks workflow syntax
   - Verifies workflow files

**Health Score Calculation**:
```
Base: 100 points

Deductions:
- Outdated dependencies: -10
- Security vulnerabilities: -30
- Build failure: -40

Final Score:
- 90-100: Excellent 🌟
- 70-89: Good ✅
- 50-69: Fair ⚠️
- <50: Needs Attention ❌
```

**Auto-Issue Creation**:
The workflow automatically creates GitHub issues for:
- Build failures (Priority: High)
- Security vulnerabilities (Priority: High)

Issues are labeled with:
- `automated`
- `health-check`
- `priority:high`

**Usage**:
```bash
# Automatic weekly run
Scheduled for Mondays at 8 AM UTC

# Manual trigger
GitHub Actions → Repository Health Check → Run workflow
```

**Best Practices**:
- ✅ Review weekly health reports
- ✅ Address auto-created issues promptly
- ✅ Keep health score above 80
- ✅ Update dependencies regularly
- ❌ Don't ignore health check issues

---

## Workflow Integration

### Integration with SDLC Automation

The CI/CD workflows integrate seamlessly with the existing SDLC automation:

```
Issue Created
    ↓
SDLC Automation (Brainstorming)
    ↓
Branch Created
    ↓
Code Implementation
    ↓
Push to Branch
    ↓
CI Workflow Runs (PR opened)
    ├─ Type Check
    ├─ Build
    ├─ Tests
    └─ Security Scan
    ↓
Code Review (Manual + Agent)
    ↓
Merge to Main
    ↓
CD Workflow Runs
    ├─ Build
    ├─ Deploy Package
    └─ Update Issues
    ↓
Production Deployment
```

### Integration with Custom Agents

The workflows complement the custom agents:

- **@brainstorming**: Plans features → CI validates implementation
- **@coding**: Implements features → CI tests code
- **@code-review**: Reviews code → CI provides automated checks
- **@issue-creator**: Creates issues → SDLC automation processes them

---

## Monitoring and Troubleshooting

### Viewing Workflow Runs

1. Go to repository **Actions** tab
2. Select workflow from left sidebar
3. Click on specific run to see details
4. Expand jobs to see step-by-step logs

### Common Issues

#### CI Failing on Type Check
```bash
# Solution: Fix TypeScript errors locally first
npm run type-check
# Fix errors, then push again
```

#### Build Failing
```bash
# Solution: Test build locally
npm run build
# Fix any errors, then commit and push
```

#### Security Vulnerabilities
```bash
# Solution: Update vulnerable packages
npm audit
npm audit fix
# For breaking changes:
npm audit fix --force
# Review changes carefully!
```

#### Deployment Not Updating Raspberry Pi
```bash
# Check deployment logs on Pi
ssh rwondoll@greenhouse.local 'tail -f ~/deploy.log'

# Verify auto-deploy cron is running
ssh rwondoll@greenhouse.local 'crontab -l'

# Manual deployment
ssh rwondoll@greenhouse.local
cd ~/greenhouse-monitor
git pull
npm run build
sudo systemctl restart greenhouse-monitor
```

---

## Best Practices

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Develop and test locally**
   ```bash
   npm run type-check
   npm run build
   npm run dev:server
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

4. **Wait for CI**
   - All checks must pass
   - Review CI summary
   - Address any issues

5. **Code review**
   - Use @code-review agent
   - Request human review
   - Address feedback

6. **Merge**
   - CI passes ✅
   - Reviews approved ✅
   - Squash and merge
   - CD deploys automatically

### Maintenance

- **Weekly**: Review health check reports
- **Monthly**: Update dependencies
- **Quarterly**: Review and update workflows
- **Per release**: Create version tag

---

## Configuration

### Workflow Permissions

All workflows use minimal required permissions:

```yaml
permissions:
  contents: read      # Read repository
  pull-requests: write # Comment on PRs
  issues: write       # Update issues
  checks: write       # Update check status
```

### Secrets Required

No additional secrets required! Workflows use:
- `GITHUB_TOKEN` (automatically provided)
- All other configuration from repository

### Environments

The CD workflow supports environments:
- `production` (default)
- `staging` (optional)

Configure in: Repository Settings → Environments

---

## Performance

### Workflow Execution Times

| Workflow | Average Duration | Peak Duration |
|----------|------------------|---------------|
| CI | 5-7 minutes | 10 minutes |
| CD | 3-5 minutes | 8 minutes |
| Code Quality | 4-6 minutes | 10 minutes |
| Release | 6-8 minutes | 12 minutes |
| Health Check | 3-4 minutes | 6 minutes |

### Optimization Tips

1. **Use caching**: All workflows cache `node_modules`
2. **Parallel jobs**: Independent jobs run in parallel
3. **Artifact reuse**: Build artifacts shared between jobs
4. **Conditional execution**: Jobs skip when not needed

---

## Future Enhancements

Potential improvements:

1. **Automated Testing**: Add unit and integration tests
2. **Performance Monitoring**: Track build and bundle sizes
3. **Deployment Strategies**: Blue-green or canary deployments
4. **Multi-Environment**: Staging environment support
5. **Notifications**: Slack/Discord integration
6. **Metrics Dashboard**: Workflow analytics
7. **Automated Rollback**: Revert on failure
8. **Docker Support**: Container-based deployment

---

## Support

For issues with workflows:

1. Check workflow logs in Actions tab
2. Review this documentation
3. Check workflow-specific README sections
4. Create issue with `workflow` label

---

## Summary

The CI/CD workflows provide:

✅ **Automated validation** for all code changes  
✅ **Continuous deployment** to production  
✅ **Code quality monitoring** with weekly checks  
✅ **Release management** with versioned packages  
✅ **Health monitoring** with proactive issue detection  

Together with the SDLC automation and custom agents, these workflows enable a fully automated development pipeline from issue creation to production deployment.
