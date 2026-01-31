# Workflow Validator

A Go-based validator for GitHub Actions workflow files.

## Features

- ✅ YAML syntax validation
- ✅ GitHub Actions workflow structure validation
- ✅ Required fields checking (name, on, jobs)
- ✅ Job structure validation (runs-on, steps)
- ✅ Verbose mode for detailed output
- ✅ Directory and file validation
- ✅ Clear error and warning messages

## Why Go?

- ⚡ **Performance**: Compiled binary is significantly faster than interpreted Python
- 📦 **No dependencies**: Single binary, no runtime or package installation needed
- 🔒 **Type safety**: Compile-time type checking prevents runtime errors
- 🌐 **Portability**: Cross-platform, easy to distribute
- 🎯 **CI/CD friendly**: Lightweight, fast builds, no dependency overhead

## Building

```bash
cd scripts/validate-workflows
go build -o validate-workflows .
```

This creates a standalone executable that can be run without any dependencies.

## Usage

### Validate a single workflow file
```bash
./validate-workflows .github/workflows/your-workflow.yml
```

### Validate all workflows in a directory
```bash
./validate-workflows .github/workflows/
```

### Verbose mode
```bash
./validate-workflows -v .github/workflows/
```

### Help
```bash
./validate-workflows -h
```

## Exit Codes

- `0`: All validations passed
- `1`: One or more validation errors found

## What It Validates

### YAML Syntax
- Valid YAML structure
- Proper indentation
- Correct key-value pairs

### Workflow Structure
- Required `on` field (workflow triggers)
- Required `jobs` field
- At least one job defined
- Each job has `runs-on` field
- Each job has `steps` field
- Steps is a list/array

### Warnings (Non-blocking)
- Missing `name` field (recommended but not required)
- Jobs with no steps
- Non-standard file extensions

## Dependencies

- `gopkg.in/yaml.v3`: YAML parsing library

Install dependencies with:
```bash
go mod download
```

## Example Output

### Success
```
======================================================================
Validation Summary
======================================================================

✓ All validations passed!
======================================================================
```

### With Errors
```
======================================================================
Validation Summary
======================================================================

✗ Errors (1):
  ✗ workflow.yml: Job 'test' missing required 'steps' field
======================================================================
```

## Development

### Run tests
```bash
go test ./...
```

### Build for different platforms
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o validate-workflows-linux .

# macOS
GOOS=darwin GOARCH=amd64 go build -o validate-workflows-macos .

# Windows
GOOS=windows GOARCH=amd64 go build -o validate-workflows.exe .
```

## Integration

This validator is automatically run by the workflow validation CI:
- `.github/workflows/workflow-validation.yml`

See also:
- Agent documentation: `.github/agents/workflow-validator.agent.md`
- Scripts documentation: `scripts/README.md`
