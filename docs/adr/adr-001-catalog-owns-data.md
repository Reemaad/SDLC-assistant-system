# ADR-001: Separate Reporting and Capacity Analysis into Independent Services

Date: 2026-09-08

Deciders: Technical Lead, Solutions Architecture Lead

## Context

The Assistant Portal provides reporting and team capacity analysis. Keeping these functions in the Backend API would increase coupling and make independent scaling and maintenance difficult.

## Decision

Reporting and capacity analysis will be separated into two independent services inside the Assistant Portal:

* Report Service
* Capacity Analysis Service

The Backend API will communicate with both services through internal APIs.

## Consequences

* Each service can be developed, deployed, and scaled independently.
* Changes to reporting will not directly affect capacity analysis.
* The Backend API will have fewer responsibilities.
* Additional service communication, deployment, and monitoring are required.

## Status

Accepted