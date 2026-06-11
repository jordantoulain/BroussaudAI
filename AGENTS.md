# AGENTS.md

**Layout:** ./web is the frontend, ./api is the backend, ./mcp is the mcp server.
**Stack:** Next.js, React, TailwindCSS, Supabase, Python

## Fundamental Principles (Absolute Priority)

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
* **Before implementing:** State your assumptions explicitly. If uncertain, ask.
* **Interpretations:** If multiple interpretations exist, present them - don't pick silently.
* **Alternatives:** If a simpler approach exists, say so. Push back when warranted.
* **Blockers:** If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
* **Strict necessity:** No features beyond what was asked. No abstractions for single-use code.
* **No overengineering:** No "flexibility" or "configurability" that wasn't requested. No error handling for impossible scenarios.
* **Conciseness:** If you write 200 lines and it could be 50, rewrite it.
* **Golden rule:** Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
* **Existing code:** Don't "improve" adjacent code, comments, or formatting. Don't refactor things that aren't broken. Match existing style. If you notice unrelated dead code, mention it - don't delete it.
* **Cleanup:** Remove imports/variables/functions that YOUR changes made unused.
* **The test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
* Transform tasks into verifiable goals (e.g., "Fix the bug" → "Write a test that reproduces it, then make it pass").
* For multi-step tasks, state a brief plan: `1. [Step] → verify: [check]`.
* *Strong success criteria let you loop independently.*

---

## Context & Memory
* **`MEMORY.md`:** Auto-generate and maintain a highly concise `MEMORY.md` file at the root of the project.
* **Purpose:** Store only the most critical, frequently accessed project data to minimize token usage and prevent redundant document searches. 
* **Workflow:** **Must be read at the very beginning of every single request.** Keep it extremely brief and only update it with high-value context.

## Style & UI
* **Theme & Colors:** Light theme (`neutral` background from 100 to 400). Accent colors at 500 (e.g., `red-500`) with white text.
* **Pure Tailwind:** Utility classes only (zero hex codes).
* **Custom CSS:** Only when absolutely necessary.
* **Restrictions:** `border` and `shadow` classes are **strictly forbidden** unless explicitly requested.

## Architecture & Code
* **DRY Principle:** Share and reuse code as much as possible.
* **Shared Components:** Centralize reusable elements in `/shared` rather than duplicating per feature.
* **Comments:** Limited to a single line maximum. Must be clear and concise.

## Database (Supabase)
* **IDs:** `UUID` mandatory for all primary and foreign keys.
* **CRUD:** Mandatory implementation of both Soft-Delete (status/date) AND Hard-Delete.

## Documentation (`./docs`)
* **Auto-generation:** If the `./docs` folder or a required file is missing, **create it immediately** using the structure below.
* **IMPORTANT:** Update on every modification to reflect the actual state of the code.
* **Required Structure:**
  * `/docs/changelog.md`: Real-time modification tracking with **strict format**:
    `dd/mm/yyyy`
    `- [feat/fix/chore/docs/style/perf/test] - Concise description`
  * `/docs/plan.md`: Full architecture, project structure, and API routes table (`METHOD /route : description`).
  * `/docs/references.md`: Project references (external documentation, versions, dependencies).
  * `/docs/ui.md`: Specific UI/UX rules.
  * `/docs/registry.md`: Registry of reusable functions/components (Name, Description, Path).
  * `/docs/features.md`: List of features (Description, Path, Used Components/Functions).

## Version Control (Git)
* **No Auto-Commits:** Strictly forbidden to execute `git commit` or `git push` without explicit permission.

## Security (Critical)
* **Environment:** Strictly forbidden to read `.env` files.
* **Data Leak:** Immediately report and remove any detected API key or token.
* **Continuous Audit:** Systematically analyze generated code at each step to validate its security.

## Autoimprovement
* Suggest to add new rules to AGENTS.md based on user input, when a change request could be generalized as a rule.
* Suggest updates to the README.md file according to feature changes or additions