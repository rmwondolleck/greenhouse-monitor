# SDLC Automation Workflow

This document describes the automated Software Development Life Cycle (SDLC) workflow that uses custom GitHub Copilot agents to iterate on the codebase and resolve open issues.

## Overview

The SDLC Automation workflow (`sdlc-automation.yml`) provides an automated process that follows the complete development lifecycle defined by the custom agents in `.github/agents/`. It can automatically:

1. Identify and prioritize open issues
2. Create a brainstorming plan for each issue
3. Set up a feature branch with implementation scaffolding
4. Create draft pull requests with guidance for using custom agents
5. Track progress through issue comments

## Workflow Phases

### Phase 1: Brainstorming & Planning 🧠

The workflow analyzes each issue and creates a plan based on:
- **Issue Type**: Bug fix, feature enhancement, or documentation
- **Approach**: Recommended implementation strategy
- **Considerations**: Key points to keep in mind
- **Affected Areas**: Which parts of the codebase will change

This phase mirrors the **@brainstorming** custom agent's purpose.

### Phase 2: Implementation 💻

The workflow:
- Creates a feature branch for the issue
- Sets up automation markers
- Provides guidance for using the **@coding** custom agent

**Manual Step Required**: A human developer must use the @coding agent to implement the actual solution.

### Phase 3: Code Review 🔍

The workflow provides guidance for using the **@code-review** custom agent to:
- Check code correctness and functionality
- Verify TypeScript type safety
- Ensure proper error handling
- Review performance and security
- Validate code quality

### Phase 4: Pull Request Creation 📝

The workflow creates a draft PR that:
- Links to the original issue
- Includes the implementation plan
- Provides a checklist for completion
- Marks the PR as needing implementation

## Usage

### Manual Trigger (Recommended for Testing)

1. Go to **Actions** → **SDLC Automation - Issue Resolution**
2. Click **Run workflow**
3. Configure options:
   - **issue_numbers**: Specific issues to process (e.g., "1,2,3") or leave empty for all
   - **dry_run**: Set to `true` to preview without creating PRs
   - **max_issues**: Maximum number of issues to process (default: 1)

### Scheduled Execution

The workflow runs automatically daily at 2 AM UTC to check for open issues.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `issue_numbers` | Comma-separated issue numbers to process | (empty - processes all) |
| `dry_run` | Preview mode - analyze without creating PRs | `true` |
| `max_issues` | Maximum number of issues to process | `1` |

## Issue Prioritization

The workflow prioritizes issues based on labels:
- **Priority:high** label: +20 points
- **bug** label: +10 points  
- **enhancement** label: +5 points

Issues are processed in order of priority score.

## Integration with Custom Agents

This workflow is designed to work seamlessly with the custom agents:

### Brainstorming Agent
The workflow's Phase 1 mirrors the brainstorming agent's planning process. For complex decisions, you can still invoke `@brainstorming` manually.

### Coding Agent
Phase 2 requires manual use of the `@coding` agent. Example:
```
@coding Implement the solution for issue #123: Add temperature alerts
```

### Code Review Agent
Phase 3 provides guidance for using `@code-review`. Example:
```
@code-review Review the changes in src/server/temperature-monitor.ts
```

## Workflow Output

### Issue Comments
The workflow adds comments to issues tracking:
- Workflow status and progress
- Links to workflow runs
- Implementation guidance
- PR links when created

### Pull Requests
Created PRs include:
- Reference to the original issue
- Implementation plan from Phase 1
- Checklist for completion
- Guidance for using custom agents
- Draft status (requires manual completion)

### Labels
The workflow adds labels to PRs:
- `automated`: Indicates workflow-created PR
- `needs-implementation`: Signals manual work required

## Example Workflow

### Dry Run Example
```bash
1. Navigate to Actions → SDLC Automation
2. Click "Run workflow"
3. Set:
   - issue_numbers: "42"
   - dry_run: true
   - max_issues: 1
4. Review the analysis in issue comments
5. No PRs are created
```

### Full Execution Example
```bash
1. Navigate to Actions → SDLC Automation
2. Click "Run workflow"
3. Set:
   - issue_numbers: "42,43"
   - dry_run: false
   - max_issues: 2
4. Wait for workflow completion
5. Check created draft PRs
6. For each PR:
   a. Checkout the branch locally
   b. Use @coding agent to implement
   c. Use @code-review agent to review
   d. Push changes and mark PR as ready
```

## Manual Implementation Steps

After the workflow creates a PR:

1. **Checkout the branch**:
   ```bash
   git fetch origin
   git checkout auto/issue-42-1234567890
   ```

2. **Implement using @coding agent**:
   Open GitHub Copilot Chat and run:
   ```
   @coding Implement the solution for issue #42
   ```

3. **Review using @code-review agent**:
   ```
   @code-review Review the changes in [modified files]
   ```

4. **Run tests**:
   ```bash
   npm run type-check
   npm run build
   ```

5. **Push changes**:
   ```bash
   git add .
   git commit -m "feat: implement solution for issue #42"
   git push origin auto/issue-42-1234567890
   ```

6. **Update PR**:
   - Mark as "Ready for review" 
   - Request human review
   - Wait for approval and merge

## Benefits

✅ **Automated Planning**: Consistent brainstorming approach for all issues
✅ **Structured Process**: Follows proven SDLC methodology
✅ **Agent Integration**: Leverages custom agents at each phase
✅ **Traceability**: Full history in issue and PR comments
✅ **Flexibility**: Works with dry run for testing
✅ **Prioritization**: Handles critical issues first
✅ **Safety**: Creates draft PRs requiring human approval

## Limitations

⚠️ **Manual Implementation Required**: The workflow cannot write code automatically - it requires human expertise using the @coding agent

⚠️ **Sequential Processing**: Issues are processed one at a time to avoid conflicts

⚠️ **Draft PRs**: All PRs are created as drafts requiring manual completion

⚠️ **Network Access**: Requires GitHub Actions to run successfully

## Troubleshooting

### Workflow doesn't start
- Check if there are open issues in the repository
- Verify workflow permissions in repository settings
- Check Actions tab for error messages

### No issues processed
- Verify issues are labeled appropriately
- Check `max_issues` setting
- Look at workflow logs for filtering details

### PRs not created
- Verify `dry_run` is set to `false`
- Check repository permissions
- Review workflow logs for errors

### Branch already exists
- Clean up stale branches from previous runs
- Use specific issue numbers instead of processing all

## Future Enhancements

Potential improvements to consider:

1. **AI-Powered Code Generation**: Integration with advanced code generation models
2. **Automated Testing**: Run tests automatically after implementation
3. **Conflict Resolution**: Handle merge conflicts automatically
4. **Progress Tracking**: Dashboard showing SDLC progress
5. **Rollback Capability**: Automatic rollback if tests fail
6. **Multi-Issue Dependencies**: Handle related issues together
7. **Learning System**: Improve planning based on past successes

## Related Documentation

- [Agent Documentation](.github/agents/README.md)
- [Workflow Diagram](.github/WORKFLOW_DIAGRAM.md)
- [Quick Reference](.github/QUICK_REFERENCE.md)
- [Getting Started](.github/GETTING_STARTED.md)

## Support

For questions or issues with the SDLC automation workflow:
1. Check the [workflow logs](../../actions/workflows/sdlc-automation.yml)
2. Review the [troubleshooting section](#troubleshooting)
3. Create an issue with the `workflow` label
