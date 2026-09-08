# SDLC Assistant System - Context Map

A bounded context is a boundary where one word has exactly one meaning.
Two contexts may use the same word differently. That is fine, as long as
we write it down here and translate at the border.

We start with two contexts. More will follow later.

---

## Context 1: capacity-analysis

Owner: Dev Team
Purpose: Dev & QA team capacity.


| Word   | What it means inside capacity-analysis            |
| ------ | ------------------------------------------------- |
| period | Sprint's perios (e.g. 2 weeks or 3 weeks format). |


What capacity-analysis promises to others:

- GET /v1/sprint/{id} returns the sprint capacity details or a clear 404.

---



## Context 2: reports

Owner: Dev Team
Purpose: Store capacity reports.


| Word   | What it means inside Checkout |
| ------ | ----------------------------- |
| period | Dev or QA capacity period     |


What reports promises to others:

- It stored capacity report data.

---



## The border between them

The word period is the dangerous one.

- In capacity-analysis, a period is a sprint format period.
- In reports, a period is a Dev or QA capacity period.

Rule: Dev capacity period is diff from QA capacity period as Dev period could be 1 or 2 weeks depending on spring format.