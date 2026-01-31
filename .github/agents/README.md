# Custom Agents for Greenhouse Monitor

This directory contains custom agent configurations for GitHub Copilot to assist with the Greenhouse Monitor project.

## Available Agents

### 🧠 Brainstorming Agent (`brainstorming.md`)
**Purpose**: Help explore ideas, plan features, and think through technical decisions.

**Use this agent when:**
- Planning new features or improvements
- Exploring architecture decisions
- Brainstorming solutions to problems
- Thinking through integration approaches
- Considering new sensor or monitoring capabilities

**Example prompts:**
- "How should we add support for multiple greenhouses?"
- "What's the best way to implement temperature alerts?"
- "Should we add a soil moisture sensor? How would we integrate it?"

### 💻 Coding Agent (`coding.md`)
**Purpose**: Write, modify, and improve code with deep knowledge of the project structure and standards.

**Use this agent when:**
- Implementing new features
- Fixing bugs
- Refactoring code
- Adding new sensors or hardware support
- Modifying the frontend or backend

**Example prompts:**
- "Add a new endpoint to get the last 24 hours of temperature data"
- "Implement a function to check if temperature exceeds a threshold"
- "Add a new React component to display system health metrics"

### 🔍 Code Review Agent (`code-review.md`)
**Purpose**: Review code changes for quality, correctness, security, and adherence to project standards.

**Use this agent when:**
- Before committing significant changes
- After implementing new features
- When you want a second opinion on code quality
- To check for security vulnerabilities
- To ensure consistency with project standards

**Example prompts:**
- "Review the changes in server.ts for potential issues"
- "Check this new component for memory leaks"
- "Review this PR for security and performance issues"

### ✅ Workflow Validator Agent (`workflow-validator.agent.md`)
**Purpose**: Validate and lint GitHub Actions workflow files to ensure they are syntactically correct and follow best practices.

**Use this agent when:**
- Creating new workflow files
- Modifying existing workflows
- Troubleshooting workflow failures
- Ensuring workflows follow best practices

**Example prompts:**
- "Validate the workflow file I just created"
- "Check all workflows for syntax errors"
- "Why is my workflow failing to parse?"

**Features:**
- ✅ YAML syntax validation
- ✅ GitHub Actions schema validation
- ✅ Style and formatting linting (yamllint)
- ✅ Automatic CI/CD integration
- ✅ Common issue detection and fixes

### 🎫 Issue Creator Agent (`issue-creator.agent.md`)
**Purpose**: **Directly create GitHub issues** from markdown templates in `docs/github-issues/` using GitHub's native MCP tools.

**This agent creates issues natively - no NPM scripts needed!**

**Use this agent when:**
- Creating issues from pre-written templates
- Understanding issue priorities and dependencies
- Deciding which issues to tackle first
- Checking for existing issues before creating
- Getting explanations about what each issue does

**Example prompts:**
- "Show me all available issue templates"
- "Create all high-priority issues"
- "Create issue #1 about MQTT reliability"
- "Which issues should I create first and why?"
- "Check if issue #3 already exists"
- "Explain the dependencies between issues"

**Features:**
- ✅ **Direct issue creation** via GitHub MCP (Model Context Protocol)
- ✅ Creates issues directly from Copilot Chat - no scripts!
- ✅ Parses issue templates to extract metadata
- ✅ Checks for existing issues to avoid duplicates
- ✅ Explains priorities and implementation order
- ✅ Interactive and conversational
- ✅ Provides immediate links to created issues

**How it works:**
1. You ask in Copilot Chat: `@issue-creator show me available issues`
2. Agent reads templates from `docs/github-issues/`
3. Agent shows you what's available with priorities
4. You ask: `@issue-creator create issues #1 and #2`
5. Agent creates them directly using GitHub MCP tools
6. Agent provides links to the created issues

**Advantages over NPM scripts:**
- 🚀 Native GitHub integration (no GITHUB_TOKEN setup)
- 💬 Conversational and interactive
- 🎯 Create exactly what you need
- 🔍 Smart duplicate detection
- ⚡ Instant creation from chat
- 📚 Explains context and dependencies

## How to Use These Agents

### In GitHub Copilot Chat
1. Reference the agent in your conversation:
   ```
   @brainstorming How should we implement email alerts?
   @coding Add a new sensor reading endpoint
   @code-review Check this implementation for issues
   ```

2. The agent will respond with context-aware advice based on:
   - Project structure and technology stack
   - Coding standards and best practices
   - Hardware constraints (Raspberry Pi)
   - Network constraints (private network, outbound only)

## Project Context

All agents are aware of:
- **Tech Stack**: TypeScript, Node.js, Express, React, Tailwind CSS
- **Hardware**: Raspberry Pi, DHT11 sensor, 16x2 LCD display
- **Environment**: Runs on private network with no inbound access
- **Storage**: JSON file-based data storage
- **Integration**: MQTT support for external monitoring

## Agent Capabilities

### What Agents Know
- ✅ Project structure and file organization
- ✅ Technology stack and dependencies
- ✅ Coding standards and conventions
- ✅ Hardware constraints and considerations
- ✅ Security model (private network)
- ✅ Build and test commands

### What Agents Can Help With
- ✅ Feature planning and architecture
- ✅ Code implementation and modification
- ✅ Error handling and edge cases
- ✅ Security and performance reviews
- ✅ Hardware integration patterns
- ✅ Testing strategies

## Tips for Best Results

1. **Be Specific**: Provide clear context and requirements
   - ❌ "Make it better"
   - ✅ "Add error handling for when the DHT11 sensor fails to read"

2. **Ask Follow-up Questions**: Agents can provide more detail
   - "Can you explain that approach in more detail?"
   - "What are the tradeoffs of that solution?"

3. **Use the Right Agent**: Choose the agent that matches your task
   - Planning → Brainstorming Agent
   - Implementation → Coding Agent
   - Quality Check → Code Review Agent

4. **Provide Context**: Share relevant code, error messages, or requirements
   - Include error messages when debugging
   - Share code snippets when asking for reviews
   - Mention specific files or components

## Updating Agents

These agent configurations can be updated as the project evolves:
- Add new patterns or conventions
- Update technology stack information
- Include new best practices
- Refine agent responsibilities

To update an agent, simply edit the corresponding `.md` file.

## Questions?

If you have questions about using these agents or suggestions for improvements, feel free to update this README or the individual agent files.

---

**Happy coding!** 🌱🌡️
