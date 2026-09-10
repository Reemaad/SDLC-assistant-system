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
| sprint | A planning cycle with a fixed start date and end date.                          |
|      capacity  |             The working time available to the team during a sprint.                  |
|      team  |                 The Development or QA team being analyzed.              |
|       availability |   The time a team member can work after leave and other commitments are deducted.                            |


What capacity-analysis promises to others:

- GET /v1/sprint/{id} returns the sprint capacity details or a clear 404.

---



## Context 2: reports

Owner: Dev Team
Purpose: Store capacity reports.


| Word                                                                                                   | What it means inside Checkout |
|--------------------------------------------------------------------------------------------------------| ----------------------------- |
| period                                                                                                 | Dev or QA capacity period     |
| sprint                                                                                                 | A planning cycle with a fixed start date and end date.                          |
| report	                                                                                                |A capacity form completed by the Development or QA team before a sprint.|
| development report |	A report containing developer availability, planned work, dependencies, and risks. |
| QA report                                                                                              |	A report containing tester availability, testing effort, environments, blockers, and risks.|
| reported                                                                                               | capacity	The amount of working time declared by the team.|
| team                                                                                                   |	The Development or QA team that owns the report.|
| status                                                                                                 |	The report’s current state: draft, submitted, or approved.|
| version                                                                                                |	The revision number of an approved report.|
| submission date                                                                                        |	The date and time when the team submitted the report.|
| sprint reference                                                                                       |	The identifier of the sprint for which the report was created.|
|                                                                                                        |                               |


What Reports promises to others:

- It stores Development and QA capacity reports.
- Every report contains report_id, team, sprint_id, period_start, period_end, reported_capacity, status, and version.
- Reports must be submitted before the sprint begins.
- An approved report cannot be changed without creating a new version.
- A missing report returns a clear 404.

---



## The border between them

The word period is the dangerous one.

- In capacity-analysis, a period is a sprint format period.
- In reports, a period is a Dev or QA capacity period.

**Rule:** Dev capacity period is diff from QA capacity period as Dev period could be 1 or 2 weeks depending on spring format.

Team
- In Reports, a team identifies who submitted the report.
- In Capacity Analysis, a team is the group whose total capacity is calculated.

**Rule:** Every report and capacity result must contain a stable team_id. Team names must not be used as identifiers.

## Relationship Type

Reports provides the approved input used by Capacity Analysis.
Capacity Analysis must use the report’s report_id, version, team_id, and sprint_id when producing a result.
It must not modify report data.