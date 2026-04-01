# Unify Recs

Unify Recs is a lightweight recommendation platform that brings videos, music, podcasts, movies, and news into one interface. It is built with plain HTML, CSS, and JavaScript and focuses on fast interaction, simple personalization, and a modern product-style UI.

## Demo Overview

The app provides:

- A unified feed across multiple content formats
- Live content fetching from public sources when available
- Three recommendation sections:
  - `Trending`
  - `Based on You`
  - `Explore New`
- Search, interest filters, content-type filters, and mood filters
- Interaction actions:
  - `Like`
  - `Dislike`
  - `Save`
  - `Not interested`
- Client-side behavior tracking using recent interactions and click counts
- Dynamic trending updates
- Light and dark themes
- Motion-rich UI with hover effects, click bounce, and mouse-reactive surfaces

## Tech Stack

- `HTML`
- `CSS`
- `JavaScript`
- No frontend framework
- Local browser storage for user state

## Project Structure

- `index.html`  
  Main app structure and UI layout

- `styles.css`  
  Theme system, responsive layout, card styling, and animations

- `app.js`  
  Recommendation logic, live data fetching, interaction tracking, rendering, and state persistence

- `package.json`  
  Simple local run script

## Run Locally

From the project folder:

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

## How It Works

### 1. Content aggregation

The app fetches content from public endpoints for:

- Videos
- Music
- Podcasts
- Movies
- News

If live sources fail, it falls back to local seed content so the app still works.

### 2. Personalization

Recommendations are influenced by:

- Selected interests
- Selected content type
- Selected mood
- Search query
- Likes, dislikes, saves, and hides
- Recent user interactions
- Click counts and trending score

### 3. Recommendation sections

- `Trending` ranks items with higher interaction momentum
- `Based on You` prioritizes interests and behavior signals
- `Explore New` surfaces fresher or more novel content

## Current Features

- Responsive product-style layout
- Sticky top navigation
- Search bar
- Collapsible filters
- Explanation text on every recommendation
- Click tracking with recent interaction history
- Save and hide support
- Theme toggle with persistence
- Hover and click animations

## Limitations

This is still a frontend-first prototype. It does not yet include:

- User authentication
- Backend persistence
- Cross-device sync
- Real provider API keys and premium integrations
- ML-based recommendation models

## Suggested Next Steps

- Add a backend API for storing profiles and interactions
- Replace public-source heuristics with stronger provider integrations
- Add user accounts and saved libraries
- Improve explanation quality with more explicit reasoning
- Add analytics and admin monitoring for trending and content quality

## GitHub Upload

If you plan to upload this project to GitHub, add a `.gitignore` with at least:

```gitignore
node_modules/
.DS_Store
*.log
.env
.env.*
dist/
build/
coverage/
.vscode/
.idea/
```

## Design Document

See [DESIGN.md](/Users/rohitkumawat/Downloads/week11/DESIGN.md) for the product and design rationale.
