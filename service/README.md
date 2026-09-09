## Rules we never break
No real password, key or token is never written ina file here.
We always write place holder `{DB_PASSWORD}` instead.


## Commands
Run capacityAnalysisBefore.js:
`docker run --rm -v "$(pwd):/app" -w /app node:22 node service/before/capacity-analysis-before.js`

Run app.js:
`docker run --rm -v "$(pwd):/app" -w /app node:22 node service/app.js`

Run containers:
`docker compose up -d --build`
`docker compose logs --tail 20 report`

## Old Architucture Issues
    - Hard to maintain
    - Hard to add features
    - Expensive deployment


## New Architucture
Monolith Microservices



## TODOs
    - Add jira integration service
    - Add (package.json) & (server.js) & (Dockerfile) to capacity anaysis service & integration service
    -

