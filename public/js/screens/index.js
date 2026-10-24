// The screens registry: Patri's pages as templates, composed only from registered components plus layout
// markup (docs/COMPONENTS.md, "Screens"). Each is <Name>Screen(data, options) and returns an HTML string.
// Views render through these with live data; the library previews call them with the frozen samples in
// _sample.js. `npm run ds` bundles this file as window.Patri.screens and the samples as window.Patri.samples.
export { HomeScreen } from './HomeScreen.js';
export { SearchScreen } from './SearchScreen.js';
export { RouteScreen } from './RouteScreen.js';
export { TrainScreen } from './TrainScreen.js';
export { StopsScreen } from './StopsScreen.js';
export { ReplayScreen } from './ReplayScreen.js';
export { AlertsScreen } from './AlertsScreen.js';
export { StationScreen } from './StationScreen.js';
// Wires every component inside a rendered screen.
export { bindScreen } from './_layout.js';
