# Scripts

This directory contains utility scripts for the Greenhouse Monitor project.

## Workflow Validation

### validate-workflows (Go)
Validates GitHub Actions workflow files for syntax and structure.

**Built with Go for:**
- ⚡ Better performance (compiled binary)
- 📦 No runtime dependencies
- 🌐 Cross-platform portability
- 🎯 Lightweight for CI/CD

**Build:**
```bash
cd scripts/validate-workflows
go build -o validate-workflows .
```

**Usage:**
```bash
# Validate a specific workflow
./scripts/validate-workflows/validate-workflows .github/workflows/your-workflow.yml

# Validate all workflows
./scripts/validate-workflows/validate-workflows .github/workflows/

# With verbose output
./scripts/validate-workflows/validate-workflows -v .github/workflows/
```

**What it validates:**
- ✅ YAML syntax correctness
- ✅ GitHub Actions workflow structure
- ✅ Required fields (name, on, jobs)
- ✅ Job structure (runs-on, steps)

**Related:**
- Agent documentation: `.github/agents/workflow-validator.agent.md`
- CI workflow: `.github/workflows/workflow-validation.yml`
- YAML lint config: `.yamllint`

## Issue Creation

**⚠️ DEPRECATED: NPM Scripts Removed**

Issue creation scripts have been removed from this project. We now use **GitHub Copilot's native @issue-creator agent** instead.

### Use the GitHub Copilot Agent

To create issues from templates in `docs/github-issues/`, use the @issue-creator agent in GitHub Copilot Chat:

```
@issue-creator show me all available issues
@issue-creator create all high-priority issues
@issue-creator create issues #1 and #2
```

**Benefits of using the agent:**
- ✅ No setup required (no GITHUB_TOKEN needed)
- ✅ Natural conversation interface
- ✅ Interactive and flexible
- ✅ Smart duplicate detection
- ✅ Native GitHub integration via MCP

### Documentation

For detailed instructions on using the @issue-creator agent:
- **Agent Details**: [.github/agents/issue-creator.agent.md](../.github/agents/issue-creator.agent.md)
- **Usage Examples**: [docs/github-issues/USAGE_EXAMPLE.md](../docs/github-issues/USAGE_EXAMPLE.md)
- **Quick Start**: [README.md](../README.md#issue-creator-agent)

### Migration Notes

The previous NPM scripts (`create-issues`, `create-issues:interactive`) have been completely removed. All issue creation now goes through the GitHub Copilot agent, which provides a superior user experience with native GitHub integration.

If you're looking for the old scripts, they were removed in favor of the agent-based approach. The agent uses GitHub's MCP (Model Context Protocol) to create issues directly from Copilot Chat without any additional setup or scripting.
