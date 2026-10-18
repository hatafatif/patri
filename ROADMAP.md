# Patri roadmap

Things we want to do. The order is not decided yet.

## UX/UI overhaul

The app is too confusing right now.

What we know so far:

- **Who uses it:** passengers, people picking someone up or seeing them off, trip planners and railfans.
- **Main device:** phones, often on mobile data.
- **Core job:** "Where's my train?", meaning the live position and status of one specific train.
- **How people find their train:** by searching its name or number ("28 Shalimar"), or by picking From → To cities.
- **Biggest pain points:**
  - On phones the map and the list have a fixed split. You can't drag the panel, so the map is too small when you want it and in the way when you don't.
  - Finding things takes too many steps or tabs.
- **Direction:** open on "My trains", the trains a person follows or viewed recently, each with its live status. Search sits below that, then the full map.
- **Possible bug:** at phone width the home map loads empty, with no outline and no train dots.

## Mobile app (Capacitor)

Wrap the web app in Capacitor to make an installable mobile app.

- There's no Capacitor setup in the repo yet.
- The frontend calls the API on relative paths (`/api/...`). Inside a native shell those calls need to point at the deployed API instead.
