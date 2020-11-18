# HackerNews Aggregator

### A simple nodejs project using hackernews public api
# 

## Quick Start

install with: `npm ci`

for development: `npm run-script dev` : utilizes nodemon via npx

for server start : `npm run-script start` 

recommended node version : `12^`

#

## Endpoints

`localhost:3000/` : default root

`/recent` : Gets the last 250 items and returns the most frequently used words in titles.

`/historical` : Gets the last 1000 items, filters only comments and returns the most used words. 