# Workflow Validator Agent

## Purpose
This agent validates and lints GitHub Actions workflow files to ensure they are syntactically correct and follow best practices.

## When to Use This Agent
- Before committing new workflow files
- When modifying existing workflows
- As part of CI/CD validation
- When troubleshooting workflow failures

## What This Agent Does

### 1. YAML Syntax Validation
- Validates YAML syntax using Python's yaml module
- Checks for parsing errors
- Ensures proper indentation and structure

### 2. YAML Linting
- Runs yamllint with standard configuration
- Checks for:
  - Line length issues
  - Trailing whitespace
  - Indentation consistency
  - Document formatting
  - Bracket spacing

### 3. GitHub Actions Schema Validation
- Validates workflow schema against GitHub Actions specifications
- Checks required fields (name, on, jobs)
- Validates job structure and steps
- Ensures proper use of GitHub Actions syntax

## Usage

### Manual Validation
```bash
# Build the validator (first time only)
cd scripts/validate-workflows
go build -o validate-workflows .

# Validate a specific workflow file
./scripts/validate-workflows/validate-workflows .github/workflows/your-workflow.yml

# Validate all workflows
./scripts/validate-workflows/validate-workflows .github/workflows/

# With verbose output
./scripts/validate-workflows/validate-workflows -v .github/workflows/
```

### In GitHub Actions
The workflow validator runs automatically on:
- Push to workflows directory
- Pull requests modifying workflows
- Manual workflow dispatch

### Common Issues and Fixes

#### 1. Syntax Error: YAML Parsing
**Issue**: Special characters like `@` in strings
**Fix**: Properly quote strings containing special characters
```yaml
# Bad
script: |
  @code-review Review the changes

# Good
script: |
  # Use escaping or different formatting
  Review the changes with code-review agent
```

#### 2. Line Too Long
**Issue**: Lines exceeding 80 characters
**Fix**: Break long lines appropriately
```yaml
# Bad
- name: This is a very long step name that exceeds the character limit

# Good
- name: >
    This is a very long step name
    that exceeds the character limit
```

#### 3. Trailing Spaces
**Issue**: Whitespace at end of lines
**Fix**: Remove trailing spaces (most IDEs can do this automatically)

#### 4. Empty Lines
**Issue**: Too many blank lines at end of file
**Fix**: Ensure files end with exactly one newline

## Configuration

### YAMLLint Configuration
The agent uses a custom `.yamllint` configuration file that balances strictness with practicality:
- Line length: 120 characters (relaxed for workflows)
- Allows inline mappings
- Requires document start only for strict mode
- Allows truthy values for GitHub Actions compatibility

## Integration Points

### Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Validate changed workflow files before commit
changed_workflows=$(git diff --cached --name-only --diff-filter=ACM | grep "^.github/workflows/.*\.yml$")
if [ -n "$changed_workflows" ]; then
  python3 scripts/validate-workflows.py $changed_workflows
  if [ $? -ne 0 ]; then
    echo "Workflow validation failed. Please fix errors before committing."
    exit 1
  fi
fi
```

### CI/CD Pipeline
Integrated via `.github/workflows/workflow-validation.yml`

## Best Practices

1. **Test locally before pushing**: Run validation on your machine before pushing workflows
2. **Use consistent formatting**: Follow the repository's YAML style guide
3. **Keep workflows readable**: Prioritize clarity over brevity
4. **Document complex logic**: Add comments for non-obvious workflow steps
5. **Validate dependencies**: Ensure referenced actions exist and use appropriate versions

## Error Reference

### Critical Errors (Must Fix)
- **Syntax errors**: YAML parsing failures - workflow will not run
- **Schema errors**: Missing required fields or invalid structure
- **Reference errors**: Invalid action references or missing secrets

### Warnings (Should Fix)
- **Formatting issues**: Line length, spacing, indentation
- **Style inconsistencies**: Document start markers, bracket spacing
- **Deprecated syntax**: Using older GitHub Actions syntax

### Info (Nice to Have)
- **Optimization suggestions**: Ways to simplify or improve workflows
- **Security recommendations**: Best practices for handling secrets and permissions

## Tools Used

1. **Go YAML parser** (gopkg.in/yaml.v3): For syntax validation
2. **Go validator**: Custom validation logic for GitHub Actions workflow structure
3. **yamllint**: For linting and style checking (optional)
4. **actionlint** (optional): Advanced workflow validation

## Implementation Details

The validator is written in **Go** for:
- ⚡ **Better performance**: Compiled binary, fast execution
- 📦 **Easy distribution**: Single binary, no runtime dependencies
- 🔒 **Type safety**: Compile-time type checking
- 🌐 **Portability**: Works on any platform with Go support
- 🎯 **CI/CD friendly**: Lightweight and fast in pipelines

## Examples

### Example 1: Valid Workflow
```yaml
---
name: Valid Workflow

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

### Example 2: Common Mistakes Fixed
```yaml
# Before (has issues)
name: My Workflow
on:
  push:
    branches: [ main ]  # Extra spaces in brackets
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "This line is way too long and exceeds the character limit we should follow"  
      # Trailing space above

# After (fixed)
---
name: My Workflow
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: >
          echo "This line is way too long and exceeds
          the character limit we should follow"
```

## Maintenance

- Review and update validation rules quarterly
- Keep yamllint configuration in sync with team preferences
- Update GitHub Actions schema as new features are released
- Document new common issues as they arise

## Related Documentation

- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [YAML Specification](https://yaml.org/spec/)
- [yamllint Documentation](https://yamllint.readthedocs.io/)

---

**Agent Type**: Validation & Quality Assurance  
**Expertise**: GitHub Actions, YAML, CI/CD  
**Last Updated**: 2026-01-31
