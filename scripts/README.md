# Scripts

This directory contains utility scripts for managing the Greenhouse Monitor project.

## Issue Creator Agent (`issue-creator.ts`)

The Issue Creator Agent is a tool that reviews issue templates in `docs/github-issues/` and creates GitHub issues from them automatically.

### Features

- ✅ Parses markdown issue templates with metadata (title, labels, milestone)
- ✅ Creates GitHub issues via REST API
- ✅ Checks for existing issues to avoid duplicates
- ✅ Dry-run mode for testing
- ✅ Support for creating individual or all issues
- ✅ Rate limiting to respect GitHub API limits

### Setup

1. **Create a GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name (e.g., "Greenhouse Issue Creator")
   - Select scope: `repo` (full control of private repositories)
   - Click "Generate token"
   - Copy the token

2. **Configure environment variables:**
   ```bash
   # Add to .env file
   GITHUB_TOKEN=your_github_token_here
   GITHUB_OWNER=rmwondolleck
   GITHUB_REPO=greenhouse-monitor
   ```

### Usage

#### Create all issues (dry run first)
```bash
# Preview what will be created
npm run create-issues:dry-run

# Create all issues
npm run create-issues
```

#### Create a specific issue
```bash
# Dry run for a specific file (both formats supported)
npm run create-issues -- --dry-run --file ISSUE_01_local_storage_mqtt_reliability.md
npm run create-issues -- --dry-run --file=ISSUE_01_local_storage_mqtt_reliability.md

# Create a specific issue (both formats supported)
npm run create-issues -- --file ISSUE_01_local_storage_mqtt_reliability.md
npm run create-issues -- --file=ISSUE_01_local_storage_mqtt_reliability.md
```

### Issue Template Format

Issue templates in `docs/github-issues/` should follow this format:

```markdown
# Issue Title Here

## Labels
`label1`, `label2`, `label3`

## Milestone
Milestone Name

## Description

Your issue description here...

## Tasks

- [ ] Task 1
- [ ] Task 2
```

The parser extracts:
- **Title**: First H1 heading (`# Issue Title`)
- **Labels**: Comma-separated list in the Labels section
- **Milestone**: Text under Milestone heading (note: milestone creation not yet supported)
- **Body**: Everything from Description onwards

### Troubleshooting

#### "GITHUB_TOKEN environment variable is required"
Make sure you've added `GITHUB_TOKEN` to your `.env` file.

#### "GitHub API error: 401"
Your token may be invalid or expired. Generate a new one.

#### "GitHub API error: 422"
This usually means:
- Label doesn't exist in the repository (run label management workflow first)
- Issue title is too long or invalid

#### Rate Limiting
The script includes a 1-second delay between issue creation to avoid hitting GitHub's rate limits. If you get rate limited (HTTP 429), wait a few minutes before trying again.

### Best Practices

1. **Always run dry-run first** to preview what will be created
2. **Run label management workflow** before creating issues to ensure all labels exist
3. **Review existing issues** before running the script to avoid duplicates
4. **Keep your token secure** - never commit it to the repository

### Future Enhancements

- [ ] Support milestone creation/assignment by name
- [ ] Support assignee assignment
- [ ] Bulk operations with better progress reporting
- [ ] Interactive mode for selecting which issues to create
- [ ] Support for issue templates in `.github/ISSUE_TEMPLATE/`
