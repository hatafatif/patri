#!/usr/bin/env node
// Follow a train live in the terminal.
//   node track.js           list trains that have live tracking
//   node track.js <number>  follow that train number, e.g. node track.js 7
const { getTrains, getRoute, connectLive, requestInstances, onPositions, normalize } = require('./lib');

const clock = ms => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

// "21:11" -> "9:11 PM"
function ampm(t) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function delayText(min) {
  if (Math.abs(min) < 1) return 'on time';
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  return `${h ? `${h} h ` : ''}${m} min ${min > 0 ? 'late' : 'early'}`;
}

async function main() {
  const arg = process.argv[2];
  const trains = await getTrains();

  if (!arg) {
    for (const t of trains.filter(t => t.IsLive).sort((a, b) => a.TrainNumber - b.TrainNumber)) {
      console.log(`${String(t.TrainNumber).padStart(5)}  ${t.TrainName.trim()}  (${t.TrainDescription.trim()})`);
    }
    console.log('\nFollow one with: node track.js <number>');
    return;
  }

  const train = trains.find(t => String(t.TrainNumber) === arg);
  if (!train) {
    console.error(`No train with number ${arg}. Run without arguments to list them.`);
    process.exit(1);
  }

  const route = await getRoute(train.TrainId);
  const stationName = id => route.find(s => String(s.StationDetailsId) === id)?.StationName.trim() ?? `station ${id}`;

  console.log(`${train.TrainName.trim()}: ${train.TrainDescription.trim()}, ${route.length} stops`);

  const print = (id, p) =>
    console.log(
      `[${clock(p.updatedAt)}] run ${id}  ${String(p.speed).padStart(3)} km/h  ${delayText(p.lateBy)}  ` +
        `${stationName(p.prevStation)} -> ${stationName(p.nextStation)}` +
        `${p.nextEta ? ` (ETA ${ampm(p.nextEta)})` : ''}  ${p.lat.toFixed(5)},${p.lon.toFixed(5)}`
    );

  const socket = connectLive();
  let runs = new Set();

  socket.on('connect', async () => {
    try {
      const instances = await requestInstances(socket, train.TrainNumber);
      runs = new Set(Object.keys(instances));
      if (!runs.size) console.log('No live runs for this train right now.');
      for (const [id, raw] of Object.entries(instances)) print(id, normalize(raw));
    } catch (e) {
      console.error(e.message);
    }
  });
  socket.on('connect_error', e => console.error('Connection error:', e.message));
  onPositions(socket, (id, p) => runs.has(id) && print(id, p));
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
