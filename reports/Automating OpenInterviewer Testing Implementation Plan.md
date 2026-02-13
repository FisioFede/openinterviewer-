# Implementation Plan - OpenInterviewer Automation & Stress Test

# Goal Description
The goal is to stress test the `openinterviewer` application by automating the creation of 5 studies (5 questions each), 50 participants (10 per study), and simulating 50 interviews with various personas, including malicious injection attempts. Finally, we will trigger analysis for all interviews and compile a report on system stability and findings.

## User Review Required
> [!IMPORTANT]
> This automation will generate a significant amount of data in the local database.
> **Constraint Check**: Study setup via direct DB interaction, Chat simulation via Puppeteer.

## Proposed Changes
I will create a standalone TypeScript script (e.g., `scripts/automate_test.ts`) that runs within the project's context.

### Automation Script
#### [NEW] scripts/automate_test.ts
- **Study Creation & Participant Generation (Direct DB)**:
    - Connect to the database (likely using Prisma).
    - clear/reset relevant tables (optional, or just add new).
    - Create 5 studies with 5 questions each.
    - Create 10 participants per study and generate invite links.
- **Interview Simulation (Puppeteer)**:
    - Launch headless browsers using Puppeteer.
    - Navigate to the generated participant links.
    - Simulate conversation:
        - Detect AI questions from the DOM.
        - Generate answers using a simple heuristic or a connected LLM (if available/configured, otherwise pre-canned responses based on personas).
        - **Personas**:
            - *Standard User*: Normal, helpful answers.
            - *Terse User*: Short, one-word answers.
            - *Malicious User*: Injects SQLi, XSS strings, and Prompt Injection attempts (e.g., "Ignore previous instructions").
- **Analysis Trigger**:
    - Call the analysis endpoint for each completed interview (or trigger via UI if required/possible).

## Verification Plan
### Automated Tests
- Run `npx tsx scripts/automate_test.ts`.
- The script itself will log progress and any errors found during the interview process (e.g., application crashes, stuck UI).

### Manual Verification
- Check the generated Report artifact (if the script outputs one, or checks the logs).
- Verify data in the web UI.
- Review the analysis results for the Malicious User to see if the system handled it gracefully.
