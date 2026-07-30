# CLAUDE.md

This file is the source of truth for how Claude (and any other AI assistant) should work in this
repository. It defines development standards, architecture rules, coding conventions, and
collaboration expectations. Follow it in every session, alongside `DESIGN.md`.

> **Status:** This project is newly initialized — no code has been committed yet. The sections
> below establish the standards new code must follow. As the tech stack is chosen, update the
> "Tech Stack" section and any stack-specific conventions so this file stays accurate.

## Project Overview

- **Name:** brotherhood-mutual
- **Tech Stack:** _TBD — update this section once the primary language/framework is chosen._
- **Purpose:** _TBD — summarize what this project does in 2-3 sentences._

## Development Standards

- **Small, reviewable changes.** Prefer focused commits/PRs over large, sprawling ones. A change
  should do one thing and be easy to review in isolation.
- **Tests accompany behavior changes.** New features and bug fixes should include tests that
  demonstrate the behavior. Do not mark work complete without running the test suite.
- **Everything must build and lint clean.** Before considering work done, run the project's
  build, lint, and test commands (once established) and fix any failures — don't hand off broken
  state.
- **Commit messages explain why, not what.** The diff shows what changed; the message should
  explain the reasoning, trade-offs, or context that isn't obvious from the code.
- **No dead code, no commented-out blocks.** Delete code that isn't used instead of leaving it
  disabled "just in case." Git history preserves it if it's ever needed again.
- **Document decisions, not mechanics.** Prefer updating `DESIGN.md` or ADRs for significant
  architectural decisions over long comment blocks in code.

## Architecture Rules

- **Separation of concerns.** Keep business logic, data access, and presentation/UI layers
  distinct. Avoid reaching across layers directly (e.g., UI code should not talk to a database
  directly if a service/data layer exists).
- **Explicit boundaries.** Modules/packages should have a clear public interface. Internal
  implementation details should not be imported directly from outside the module.
- **No hidden global state.** Prefer explicit dependency passing (constructor/function
  parameters, dependency injection) over singletons and module-level mutable state.
- **Fail loudly at boundaries, fail safely internally.** Validate and handle errors at system
  boundaries (user input, external APIs, file I/O). Trust internal invariants once validated —
  don't re-validate the same data repeatedly through the call stack.
- **Configuration over hardcoding.** Environment-specific values (URLs, credentials, feature
  flags) belong in configuration, not hardcoded in source. Never commit secrets or credentials.
- **New dependencies require justification.** Adding a new library/framework should solve a real,
  current need — not a hypothetical future one. Prefer the standard library or an existing
  dependency when it reasonably covers the need.

## Coding Conventions

- **Naming:** Use descriptive, unambiguous names. Avoid abbreviations except well-known ones
  (`id`, `url`, `config`). Consistent casing per language convention (e.g., `camelCase` for
  JS/TS, `snake_case` for Python/Ruby — update once the stack is chosen).
- **Formatting:** Use an automated formatter (e.g., Prettier, Black, gofmt) rather than manual
  style debates. Once configured, formatting should never be a discussion point in review.
- **Comments:** Default to no comments. Only add a comment when the *why* isn't obvious from the
  code itself — a non-obvious constraint, a workaround for a specific bug, a subtle invariant.
  Never write comments that just restate what the code does.
- **Error handling:** Handle errors where there's enough context to do something meaningful
  (retry, fallback, user-facing message, or a clear failure). Don't swallow errors silently.
- **Functions/methods:** Keep them small and focused on one responsibility. If a function needs
  a "and" in its description, consider splitting it.
- **No premature abstraction.** Three similar lines of code are better than an early abstraction
  built for a use case that doesn't exist yet. Extract shared logic once a real third use
  appears, not before.

## AI Collaboration Instructions

- **Read `DESIGN.md` and this file first** at the start of any nontrivial task, and follow them
  as the source of truth for this project.
- **Match scope to the request.** Implement what was asked; don't bundle in unrelated
  refactors, cleanups, or new features. Flag adjacent issues instead of fixing them unprompted.
- **Prefer editing existing files over creating new ones**, and avoid creating new documentation
  files unless explicitly requested.
- **Keep changes minimal and consistent** with the conventions in this file — new code should
  look like it belongs, not like a different author wrote it.
- **Run tests/build/lint before declaring work done.** If there's no test suite yet for a given
  area, say so explicitly rather than claiming untested code works.
- **Ask before high-impact actions:** force-pushes, history rewrites, deleting branches/files not
  authored this session, schema/migration changes, or anything hard to reverse.
- **Update this file when standards change.** If a decision in a session establishes a new
  convention or architecture rule, reflect it here so future sessions (AI or human) follow it
  too.
