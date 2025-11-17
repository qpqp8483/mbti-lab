# Architecture

## Workflow Structure

```
[Orchestrator] (agent) → [Requirements Analyzer] (agent) → [Frontend Implementer] (agent) → [Backend Implementer] (agent) → [Code Reviewer] (agent) → [Quality Validator] (agent) → [Coding Standards] (document)
```

## Agents

### Orchestrator
- Agent: @orchestrator
- Output: 
- Model: sonnet

### Requirements Analyzer
- Agent: @requirements-analyzer
- Output: outputs/specs/requirements-analysis.md
- Model: sonnet

### Frontend Implementer
- Agent: @frontend-implementer
- Output: 
- Model: sonnet

### Backend Implementer
- Agent: @backend-implementer
- Output: 
- Model: sonnet

### Code Reviewer
- Agent: @code-reviewer
- Output: outputs/review/code-review.md
- Model: sonnet

### Quality Validator
- Agent: @quality-validator
- Output: outputs/validation/code-quality-validation.md
- Model: haiku
