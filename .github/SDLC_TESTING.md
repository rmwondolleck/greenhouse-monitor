# SDLC Automation Testing & Validation

This document provides test cases and validation procedures for the SDLC Automation workflow.

## Pre-Test Checklist

Before testing the workflow, ensure:

- [ ] Workflow file exists: `.github/workflows/sdlc-automation.yml`
- [ ] Workflow YAML is valid (no syntax errors)
- [ ] Repository has GitHub Actions enabled
- [ ] At least one open issue exists for testing
- [ ] Custom agents are properly configured in `.github/agents/`
- [ ] Required labels exist (run label-management workflow if needed)

## Test Case 1: YAML Validation

**Objective**: Verify the workflow YAML is syntactically correct.

**Steps**:
```bash
npm install -g js-yaml
js-yaml .github/workflows/sdlc-automation.yml
```

**Expected Result**: No errors, valid YAML output.

**Status**: ✅ PASSED (validated during development)

## Test Case 2: Dry Run - Single Issue

**Objective**: Test the workflow in dry run mode with a specific issue.

**Prerequisites**: 
- At least one open issue in the repository

**Steps**:
1. Go to Actions → SDLC Automation - Issue Resolution
2. Click "Run workflow"
3. Set:
   - `issue_numbers`: (a valid open issue number, e.g., "1")
   - `dry_run`: `true`
   - `max_issues`: `1`
4. Click "Run workflow"
5. Wait for completion

**Expected Results**:
- ✅ Workflow runs without errors
- ✅ Issue receives comments with brainstorming plan
- ✅ Issue receives implementation guidance
- ✅ Issue receives code review guidance
- ✅ Issue receives dry run summary comment
- ✅ NO branch is created
- ✅ NO PR is created

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 3: Dry Run - All Open Issues

**Objective**: Test the workflow in dry run mode processing multiple issues.

**Prerequisites**: 
- Multiple open issues in the repository

**Steps**:
1. Go to Actions → SDLC Automation - Issue Resolution
2. Click "Run workflow"
3. Set:
   - `issue_numbers`: (leave empty)
   - `dry_run`: `true`
   - `max_issues`: `3`
4. Click "Run workflow"
5. Wait for completion

**Expected Results**:
- ✅ Workflow runs without errors
- ✅ Up to 3 highest priority issues are processed
- ✅ Each issue receives all guidance comments
- ✅ NO branches are created
- ✅ NO PRs are created
- ✅ Summary shows correct count of processed issues

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 4: Full Execution - Single Issue

**Objective**: Test the complete workflow with PR creation.

**Prerequisites**: 
- One open issue suitable for testing (ideally a simple enhancement or documentation issue)

**Steps**:
1. Note the issue number (e.g., #42)
2. Go to Actions → SDLC Automation - Issue Resolution
3. Click "Run workflow"
4. Set:
   - `issue_numbers`: "42"
   - `dry_run`: `false`
   - `max_issues`: `1`
5. Click "Run workflow"
6. Wait for completion

**Expected Results**:
- ✅ Workflow runs without errors
- ✅ Issue receives all guidance comments
- ✅ Feature branch is created (format: `auto/issue-42-TIMESTAMP`)
- ✅ Automation marker file exists in `.github/automation/`
- ✅ Draft PR is created
- ✅ PR is properly linked to the issue
- ✅ PR contains complete implementation plan
- ✅ PR has checklist for completion
- ✅ PR is labeled with `automated` and `needs-implementation`
- ✅ Issue comment includes PR link

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 5: Issue Prioritization

**Objective**: Verify issues are prioritized correctly.

**Prerequisites**: 
- Multiple open issues with different labels:
  - One with `priority:high`
  - One with `bug`
  - One with `enhancement`
  - One with no special labels

**Steps**:
1. Go to Actions → SDLC Automation - Issue Resolution
2. Click "Run workflow"
3. Set:
   - `issue_numbers`: (leave empty)
   - `dry_run`: `true`
   - `max_issues`: `2`
4. Check the workflow logs to see which issues were selected

**Expected Results**:
- ✅ `priority:high` issue is selected first
- ✅ `bug` issue is selected before `enhancement`
- ✅ `enhancement` is selected before unlabeled issues
- ✅ Exactly 2 issues are processed

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 6: Scheduled Run

**Objective**: Verify the workflow runs on schedule.

**Note**: This test requires waiting for the scheduled time (2 AM UTC) or manually triggering to simulate.

**Steps**:
1. Wait until after 2 AM UTC
2. Check Actions tab for automatic workflow run
3. Review the workflow run

**Expected Results**:
- ✅ Workflow runs automatically at scheduled time
- ✅ Processes 1 issue by default (max_issues: 1)
- ✅ Uses dry_run: true by default (safe scheduled operation)

**Status**: ⏳ PENDING (requires waiting for scheduled time)

## Test Case 7: Error Handling - Invalid Issue Number

**Objective**: Test workflow behavior with invalid issue numbers.

**Steps**:
1. Go to Actions → SDLC Automation - Issue Resolution
2. Click "Run workflow"
3. Set:
   - `issue_numbers`: "99999"
   - `dry_run`: `true`
   - `max_issues`: `1`
4. Click "Run workflow"

**Expected Results**:
- ✅ Workflow completes without crashing
- ✅ Error is logged in workflow output
- ✅ No issues are processed (count: 0)
- ✅ Summary indicates no issues found

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 8: Integration with Custom Agents

**Objective**: Verify the workflow guidance correctly references custom agents.

**Steps**:
1. Run a dry run on any issue
2. Review the issue comments
3. Check for proper agent references

**Expected Results**:
- ✅ Comments mention `@brainstorming` agent
- ✅ Comments mention `@coding` agent
- ✅ Comments mention `@code-review` agent
- ✅ Instructions are clear and actionable
- ✅ Code examples are properly formatted

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 9: Multiple Issue Types

**Objective**: Test workflow with different issue types.

**Prerequisites**:
- One issue labeled `bug`
- One issue labeled `enhancement`
- One issue labeled `documentation`

**Steps**:
1. Run workflow in dry run mode for each issue separately
2. Compare the brainstorming plans

**Expected Results**:
- ✅ Bug issues get `bug-fix` approach
- ✅ Enhancement issues get `feature` approach
- ✅ Documentation issues get `documentation` approach
- ✅ Each type has appropriate considerations
- ✅ Affected areas are correctly identified based on labels

**Status**: ⏳ PENDING (requires manual testing)

## Test Case 10: Branch Cleanup

**Objective**: Verify old automation branches can be cleaned up.

**Steps**:
1. Create a test branch manually: `auto/issue-1-test`
2. Run workflow on issue #1
3. Observe the error or behavior

**Expected Results**:
- ✅ Workflow either:
  - Uses a unique timestamp to avoid conflicts, OR
  - Fails gracefully with clear error message

**Status**: ⏳ PENDING (requires manual testing)

## Integration Tests

### Integration Test 1: Complete SDLC Flow

**Objective**: Test the complete flow from workflow execution to merged PR.

**Steps**:
1. Run workflow with dry_run: false on a simple issue
2. Checkout the created branch locally
3. Use @coding agent to implement solution
4. Use @code-review agent to review changes
5. Push changes to the branch
6. Mark PR as ready for review
7. Merge the PR

**Expected Results**:
- ✅ All steps complete successfully
- ✅ Issue is automatically updated by post-merge workflow
- ✅ Issue can be closed
- ✅ No leftover branches or PRs

**Status**: ⏳ PENDING (requires manual testing)

### Integration Test 2: Workflow with Existing Workflows

**Objective**: Verify SDLC automation works with other workflows.

**Steps**:
1. Run SDLC automation to create a PR
2. Verify other workflows trigger:
   - test.yml runs on the PR
   - pr-review-reminder.yml adds checklist
3. Complete implementation and merge
4. Verify post-merge workflow runs

**Expected Results**:
- ✅ All workflows coexist without conflicts
- ✅ Labels are applied correctly
- ✅ All automation comments appear
- ✅ No duplicate or conflicting actions

**Status**: ⏳ PENDING (requires manual testing)

## Performance Tests

### Performance Test 1: Multiple Issues

**Objective**: Measure performance with multiple issues.

**Steps**:
1. Create 5 test issues
2. Run workflow with max_issues: 5
3. Measure total execution time

**Expected Results**:
- ✅ Completes within reasonable time (< 5 minutes)
- ✅ No timeouts
- ✅ All issues processed successfully

**Status**: ⏳ PENDING (requires manual testing)

## Security Tests

### Security Test 1: Token Permissions

**Objective**: Verify the workflow uses appropriate permissions.

**Steps**:
1. Review workflow permissions in YAML
2. Verify no excessive permissions requested

**Expected Results**:
- ✅ Only requests: `issues: write`, `contents: write`, `pull-requests: write`
- ✅ Uses `GITHUB_TOKEN` (no custom tokens required)
- ✅ No sensitive data exposed in logs

**Status**: ✅ PASSED (reviewed during development)

### Security Test 2: Input Validation

**Objective**: Verify user inputs are handled safely.

**Steps**:
1. Try various inputs in workflow dispatch:
   - Empty strings
   - Special characters
   - Very long strings
   - SQL injection attempts (should be irrelevant but test anyway)

**Expected Results**:
- ✅ All inputs handled safely
- ✅ No code injection possible
- ✅ No unexpected behavior

**Status**: ⏳ PENDING (requires manual testing)

## Documentation Tests

### Documentation Test 1: README Accuracy

**Objective**: Verify all documentation is accurate and up-to-date.

**Steps**:
1. Follow the quick start guide in SDLC_GETTING_STARTED.md
2. Verify all commands work as documented
3. Check all links are valid

**Expected Results**:
- ✅ All commands work as documented
- ✅ All links navigate to correct locations
- ✅ Examples match actual behavior
- ✅ No outdated information

**Status**: ⏳ PENDING (requires manual testing)

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: YAML Validation | ✅ PASSED | Validated with js-yaml |
| TC2: Dry Run - Single | ⏳ PENDING | Requires open issue |
| TC3: Dry Run - Multiple | ⏳ PENDING | Requires multiple issues |
| TC4: Full Execution | ⏳ PENDING | Requires open issue |
| TC5: Prioritization | ⏳ PENDING | Requires labeled issues |
| TC6: Scheduled Run | ⏳ PENDING | Requires waiting |
| TC7: Error Handling | ⏳ PENDING | - |
| TC8: Agent Integration | ⏳ PENDING | - |
| TC9: Issue Types | ⏳ PENDING | Requires different issue types |
| TC10: Branch Cleanup | ⏳ PENDING | - |
| IT1: Complete Flow | ⏳ PENDING | End-to-end test |
| IT2: Workflow Integration | ⏳ PENDING | - |
| PT1: Multiple Issues | ⏳ PENDING | - |
| ST1: Token Permissions | ✅ PASSED | Reviewed in code |
| ST2: Input Validation | ⏳ PENDING | - |
| DT1: README Accuracy | ⏳ PENDING | - |

## Test Execution Tracking

**Last Updated**: 2026-01-31

**Tester**: (To be assigned)

**Test Environment**: GitHub Actions in rmwondolleck/greenhouse-monitor repository

**Next Steps**:
1. Execute Test Case 2 (Dry Run - Single Issue)
2. If TC2 passes, proceed to TC3 and TC4
3. Execute all remaining test cases
4. Document any issues found
5. Update this document with results

## Issues Found During Testing

(To be populated during testing)

| Issue ID | Test Case | Description | Severity | Status |
|----------|-----------|-------------|----------|--------|
| - | - | - | - | - |

## Recommendations

After testing is complete:

1. **If all tests pass**: Mark workflow as production-ready
2. **If minor issues found**: Document workarounds and plan fixes
3. **If major issues found**: Fix before announcing workflow availability
4. **Update documentation**: Incorporate any learnings from testing

---

**Testing Status**: Ready for execution
**Workflow Status**: Implementation complete, awaiting validation
