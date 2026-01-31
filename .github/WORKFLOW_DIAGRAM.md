# Agent Workflow Diagram

## 🔄 Complete Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREATE ISSUE / FEATURE REQUEST              │
│                                                                 │
│  User creates issue with descriptive title and body            │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Triggers: issue-triage.yml
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTO-LABELING & TRIAGE                       │
│                                                                 │
│  ✓ Analyze title/body for keywords                             │
│  ✓ Apply type labels (bug, enhancement, etc.)                  │
│  ✓ Apply component labels (frontend, backend, etc.)            │
│  ✓ Apply workflow labels (needs-brainstorming, etc.)           │
│  ✓ Add agent workflow guidance comment                         │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        ├─── Has "needs-brainstorming" label?
                        │
                        ▼ YES
┌─────────────────────────────────────────────────────────────────┐
│              STEP 1: BRAINSTORMING PHASE                        │
│                                                                 │
│  User: @brainstorming [question about feature/solution]        │
│                                                                 │
│  Agent provides:                                                │
│  • Multiple solution approaches                                │
│  • Technical considerations                                     │
│  • Best practices advice                                        │
│  • Hardware/resource implications                               │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: IMPLEMENTATION PHASE                       │
│                                                                 │
│  User: @coding [implementation request]                        │
│                                                                 │
│  Agent provides:                                                │
│  • Code implementation                                          │
│  • Following project conventions                                │
│  • Error handling                                               │
│  • Test guidance                                                │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ User creates branch & implements
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE PULL REQUEST                          │
│                                                                 │
│  User creates PR from feature branch to main                   │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Triggers: pr-review-reminder.yml
                        │          test.yml
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│            PR AUTO-PROCESSING & BUILD TESTS                     │
│                                                                 │
│  ✓ Add review checklist comment                                │
│  ✓ Auto-label PR (bug, enhancement, etc.)                      │
│  ✓ Add code review agent reminder                              │
│  ✓ Run type checks                                             │
│  ✓ Build server                                                │
│  ✓ Build client                                                │
│  ✓ Verify build artifacts                                      │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: CODE REVIEW PHASE                          │
│                                                                 │
│  User: @code-review Review changes in [files]                  │
│                                                                 │
│  Agent checks:                                                  │
│  • Correctness & functionality                                  │
│  • TypeScript type safety                                       │
│  • Error handling                                               │
│  • Performance & resource usage                                 │
│  • Security considerations                                      │
│  • Hardware integration                                         │
│  • Code quality & maintainability                               │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Address feedback & iterate
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MERGE TO MAIN                              │
│                                                                 │
│  PR approved and merged                                         │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Triggers: build-validation.yml
                        │          post-merge.yml
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│            POST-MERGE ACTIONS & DEPLOYMENT                      │
│                                                                 │
│  ✓ Validate build on main                                      │
│  ✓ Update related issues with merge info                       │
│  ✓ Add deployment status comment                               │
│  ✓ Apply "ready-to-merge" label to issues                      │
│  ✓ Display deployment instructions                             │
│                                                                 │
│  Raspberry Pi auto-deploys within 5 minutes                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Manual Workflow: Agent Helper

```
┌─────────────────────────────────────────────────────────────────┐
│          USER: Actions → Agent Workflow Helper                  │
│                                                                 │
│  Select task type:                                              │
│  • brainstorming    → Planning & exploration                   │
│  • implementation   → Coding tasks                             │
│  • review           → Code review tasks                        │
│  • documentation    → Doc updates                              │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Triggers: agent-helper.yml
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│           CREATE STRUCTURED ISSUE WITH GUIDANCE                 │
│                                                                 │
│  ✓ Generate appropriate title                                  │
│  ✓ Create detailed issue body                                  │
│  ✓ Add workflow-specific guidance                              │
│  ✓ Link to relevant agent documentation                        │
│  ✓ Apply correct labels                                        │
│  ✓ Provide agent usage examples                                │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
        [Follow standard workflow from top]
```

## 🏷️ Label Management Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│      USER: Actions → Label Management → Run workflow           │
│                                                                 │
│  OR: Push changes to label-management.yml                      │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Triggers: label-management.yml
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              ENSURE ALL LABELS EXIST & ARE UPDATED              │
│                                                                 │
│  For each label:                                                │
│  ✓ Check if exists                                             │
│  ✓ Create if missing                                           │
│  ✓ Update color and description if exists                      │
│                                                                 │
│  Label categories:                                              │
│  • Type (bug, enhancement, documentation, etc.)                │
│  • Component (frontend, backend, hardware, etc.)               │
│  • Workflow (needs-brainstorming, code-review, etc.)           │
│  • Priority (high, medium, low)                                │
│  • Status (in-progress, blocked, etc.)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Documentation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│   Changes to .github/agents/** or .github/workflows/agent-*    │
│                                                                 │
│   OR: Manual trigger via Actions                               │
└────────────────────────┬────────────────────────────────────────┘
                        │
                        │ Triggers: agent-docs.yml
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│          REGENERATE AGENT WORKFLOW DOCUMENTATION                │
│                                                                 │
│  ✓ Generate comprehensive AGENT_WORKFLOWS.md                   │
│  ✓ Include all workflow details                                │
│  ✓ Document label system                                       │
│  ✓ Provide usage examples                                      │
│  ✓ Auto-commit if changes detected                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🔑 Key Integration Points

### Agent → Workflow Integration
- Agents provide guidance within comments/conversations
- Workflows provide structure and automation
- Together they create a seamless development experience

### Workflow → Issue/PR Integration
- Automatic labeling based on content
- Guidance comments added automatically
- Status tracking via labels
- Deployment notifications on merge

### Build → Deployment Integration
- CI validates all changes
- Main branch triggers deployment info
- Raspberry Pi auto-deploys from main
- Issues updated with deployment status

## 📊 Workflow Success Metrics

Track these to measure workflow effectiveness:

1. **Time to Label**: Issues labeled within seconds
2. **Review Coverage**: All PRs get review checklist
3. **Build Success**: Builds validated before merge
4. **Deployment Speed**: Auto-deploy within 5 minutes
5. **Issue Closure**: Issues auto-updated on merge

---

**Legend:**
- `─` Flow direction
- `✓` Completed action
- `│▼` Sequential flow
- `├───` Conditional branch
- `[Text]` External process

