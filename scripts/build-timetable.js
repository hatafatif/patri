#!/usr/bin/env node
// Build step for Vercel: fetches every train and route once and saves them to build/timetable.json,
// which api/index.js loads instead of fetching ~110 routes on every cold start.
const fs = require('fs');
const path = require('path');
const { Timetable } = require('../data');

Timetable.fetchRaw()
  .then(raw => {
    const out = path.join(__dirname, '..', 'build', 'timetable.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(raw));
    const routes = Object.values(raw.routes).filter(r => r.length).length;
    console.log(`Saved ${raw.trains.length} trains and ${routes} routes to ${path.relative(process.cwd(), out)}`);
    if (routes < raw.trains.length * 0.8) throw new Error(`Only ${routes} of ${raw.trains.length} routes loaded`);
  })
  .catch(e => {
    console.error('Could not build the timetable:', e.message);
    process.exit(1);
  });
