// The component registry, in the order of docs/COMPONENTS.md. A component isn't real until it is
// listed here and there. Views import from this file; `npm run ds` bundles it as window.Patri.
export { AppBar } from './AppBar.js';                                            // 1
export { LanguageToggle, bindLanguageToggle } from './LanguageToggle.js';        // 2
export { LiveIndicator } from './LiveIndicator.js';                              // 3
export { Panel, bindPanel } from './Panel.js';                                   // 4
export { SearchField, bindSearchField } from './SearchField.js';                 // 5
export { SegmentedControl, bindSegmentedControl } from './SegmentedControl.js';  // 6
export { StationFields, bindStationFields } from './StationFields.js';           // 7
export { IconButton } from './IconButton.js';                                    // 8
export { FollowButton, bindFollowButton } from './FollowButton.js';              // 9
export { MapToggle, bindMapToggle } from './MapToggle.js';                       // 10
export { TrainBadge } from './TrainBadge.js';                                    // 11
export { StatusChip, StatusStrip } from './StatusChip.js';                       // 12
export { TrainCard } from './TrainCard.js';                                      // 13
export { TrainRow } from './TrainRow.js';                                        // 14
export { DepartureRow } from './DepartureRow.js';                                // 15
export { StopTimeline, bindStopTimeline } from './StopTimeline.js';              // 16
export { JourneyProgress } from './JourneyProgress.js';                          // 17
export { SectionHeader } from './SectionHeader.js';                              // 18
export { DetailGrid } from './DetailGrid.js';                                    // 19
export { LinkRow } from './LinkRow.js';                                          // 20
export { SpeedChart, bindSpeedChart } from './SpeedChart.js';                    // 21
export { MapMarkers, trainMarker, mapLabel, mapPaint, trainImages } from './MapMarkers.js';   // 22
export { Button } from './Button.js';                                            // 23
export { Card } from './Card.js';                                                // 24
export { PageHeader, bindPageHeader } from './PageHeader.js';                  // 25
export { Photo } from './Photo.js';                                              // 26
export { ReplayBar, bindReplayBar, syncReplayBar } from './ReplayBar.js';        // 27

// The one rule for a train's status.
export { statusTone } from './_shared.js';
