#!/bin/sh
npm run cards
node jobs/update_cards.js
node --max-old-space-size=32000 --expose_gc jobs/populate_analytics.js
