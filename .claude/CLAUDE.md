# Claude Code Configuration Example

Add this to your .claude/CLAUDE.md file:

## Custom Instructions

This project uses auto-generated multi-agent workflows.

When running workflows:
- Follow orchestrator instructions exactly
- Always return JSON responses as specified
- Do not skip validation steps
- Report all errors clearly

## Agents

- @orchestrator: Coordinates the fullstack development workflow
- @requirements-analyzer: Analyzes the project requirements
- @frontend-implementer: Implements the frontend using Next.js and React
- @backend-implementer: Implements the backend using Supabase
- @code-reviewer: Reviews code and makes approval decisions
- @quality-validator: Validates code quality and adherence to standards
