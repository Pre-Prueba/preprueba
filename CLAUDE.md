# Claude Code Working Rules

## Skill discovery (use before every task)

Before starting any task, invoke the `skill-discovery` skill to identify relevant skills, then read only the matched SKILL.md files on demand. Never assume all skills are loaded.

```
/skill-discovery
```

## Token optimization tools (use before every task)

Before reading any file or making any change, always use these tools first:

1. **code-review-graph** — query the knowledge graph instead of reading files directly.
   - Use `crg_find_symbol` to locate functions/classes by name.
   - Use `crg_get_file_summary` to understand a file without reading it whole.
   - Use `crg_get_dependencies` to find what a file imports/exports.
   - Use `crg_search` for free-text search across the codebase.
   - Only fall back to `Read` if the graph cannot answer the question.

2. **context-mode** — offload heavy tool outputs before they enter context.
   - Use `ctx_execute` instead of Bash for commands with large output (builds, test runs, installs).
   - Use `ctx_fetch_and_index` instead of WebFetch for URLs with long content.
   - Use `ctx_search` to query already-indexed results instead of re-running commands.
   - Use `ctx_stats` to monitor context usage if something feels heavy.

3. **RTK** — prefix every Bash command with `rtk` to filter output before it enters context.
   - `rtk git status`, `rtk tsc`, `rtk next build`, `rtk vitest run`, etc.
   - Even in chains: `rtk git add . && rtk git commit -m "msg"`
   - Full reference in `~/.claude/CLAUDE.md`.

4. **Caveman mode** — always active. Respond terse, drop filler, keep technical substance.
   - If caveman is not active at session start, activate it immediately.

## Anti-loop rules

- Before editing, read the full target file and any directly related files.
- Do not edit the same file repeatedly by trial and error.
- Plan all related changes first, then make one complete edit.
- If you need to edit the same file more than 3 times, stop immediately.
- When stopped, re-read the user request, explain what went wrong, and propose a new plan before continuing.

## Design and CSS rules

- For visual changes, inspect the existing design system first: colors, fonts, spacing, shadows, border radius, layout rhythm, and responsive behavior.
- Do not randomly change CSS values until it "looks better".
- When changing a page design, update the page and its CSS together in one coherent pass.
- Keep the landing page visually consistent with the hero section.
- Reuse existing tokens, classes, CSS variables, and design patterns when possible.
- Avoid creating duplicate styles when an existing class or pattern can be reused.

## Completion rules

- Before saying the task is done, verify that the change actually matches the user request.
- Summarize exactly what changed and which files were touched.
- If something could not be completed, say it clearly instead of pretending it is finished.

## When stuck

- Do not retry the same approach more than twice.
- Summarize what you tried, what failed, and what you need from the user.
- Ask for guidance instead of continuing blindly.

## When the user corrects you

- Stop.
- Re-read the correction.
- Quote back the actual requirement in your own words.
- Continue only after aligning the next action with that correction.