## Rules we never break
No real password, key or token is never written ina file here.
We always write place holder `{DB_PASSWORD}` instead.


## Commands
Run capacityAnalysisBefore.js:
`docker run --rm -v "$(pwd):/app" -w /app node:22 node service/before/capacity-analysis-before.js`

Run app.js:
`docker run --rm -v "$(pwd):/app" -w /app node:22 node service/core/app.js`

Run containers:
`docker compose up -d --build`
`docker compose logs --tail 20 report`
`docker compose up -d --build --scale report=3`

## Old Architucture Issues
    - Hard to maintain
    - Hard to add features

## New Architucture
Monolith Microservices



## TODOs
    - Add jira integration service -- Rand 
    - We will use redis from saving user's input of the capacity report -- Reema & Aljoharah
    - We need to complete context map -- Rawan