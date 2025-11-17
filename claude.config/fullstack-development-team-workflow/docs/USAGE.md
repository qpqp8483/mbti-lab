# Usage Guide

## Running the Workflow

```bash
/my-workflow <task description>
```

## What Happens

1. Orchestrator reads your task
2. Executes agents in sequence
3. Each agent produces output files
4. Orchestrator validates all outputs
5. Shows final summary

## Troubleshooting

- If an agent fails, orchestrator will ask if you want to retry
- Check the docs/ folder for output files
- Review .iteration file for loop count
