# Design Document

## Project

Unify Recs

## Goal

Build a clean, unified recommendation experience that helps users discover content across different formats from one place instead of using disconnected platforms.

The product should feel simple, modern, and immediately understandable to a new user.

## Product Direction

The app is designed around one core principle:

`Recommendations should be the center of the experience.`

Instead of overwhelming the user with settings, the interface prioritizes:

- fast discovery
- clear interactions
- visible personalization
- minimal friction

## UX Decisions

### 1. Simplified layout

The layout was reduced to a clear vertical flow:

1. Top navigation
2. Minimal hero section
3. Compact filter panel
4. Feed sections

This keeps attention on the recommendation cards rather than on explanatory panels.

### 2. Top navigation

The top bar includes:

- brand
- search
- refresh action
- theme toggle

These are the most important utility actions and should always remain easy to access.

### 3. Minimal hero

The hero is intentionally short and direct:

- one headline
- one CTA
- basic live status

This reduces cognitive load and helps a new user understand the product within a few seconds.

### 4. Feed-first experience

The feed is split into three product-like sections:

- `Trending`
- `Based on You`
- `Explore New`

This makes the recommendation logic easier to understand and mirrors patterns used by streaming and discovery platforms.

### 5. Filters as optional controls

Filters are placed inside a collapsible panel so they support the experience without dominating it.

The filters use:

- interests
- content type
- mood

This keeps personalization lightweight and easy to use.

## Visual Design

### Palette

The design uses warm editorial tones for light mode and cooler deep tones for dark mode.

Primary goals:

- modern but approachable
- high contrast
- not visually noisy
- distinct card separation

### Typography

Two type families are used:

- `Fraunces` for display and hierarchy
- `Space Grotesk` for interface and readable body text

This creates a stronger product identity than a generic system-only UI.

### Cards

Recommendation cards are the primary interface object.

Each card contains:

- title
- content type
- description
- tag
- recommendation reason
- interaction buttons

Cards are designed to be:

- easy to scan
- visually separated
- clearly interactive

## Motion Design

Motion was added to improve responsiveness and delight without making the interface chaotic.

### Current motion patterns

- hover lift on cards
- mouse-reactive tilt on hero and cards
- animated button effects
- click bounce on controls
- shimmer loading cards
- shiny animated hero title
- theme transition feel through palette change

### Intent

Motion is used to:

- reinforce interactivity
- improve perceived polish
- guide attention
- make the interface feel product-level

## Recommendation Logic

The current system is client-side and heuristic-based.

It combines:

- selected interests
- content type filters
- mood filters
- search query
- recent interactions
- click counts
- likes / dislikes / saves / hides
- freshness
- popularity
- novelty

### Section logic

#### Trending

Ranks by interaction momentum and general popularity.

#### Based on You

Ranks by preference and user-behavior signals.

#### Explore New

Ranks by novelty and freshness while avoiding overfitting to the same items.

## State Management

The app stores lightweight client-side state in `localStorage`:

- recent interactions
- click counts
- likes
- dislikes
- saves
- hidden items
- selected interests
- theme

This makes the experience feel persistent without requiring a backend.

## Accessibility Notes

Current improvements include:

- button-based actions
- visible focus states
- semantic inputs and labels
- responsive layout

Further improvements still recommended:

- reduced-motion mode
- ARIA enhancement for dynamic recommendation updates
- deeper keyboard navigation review

## Scalability Direction

For a more production-ready system, the next architectural step would be:

1. move recommendation logic to a backend service
2. persist user profiles in a database
3. connect stronger third-party content providers
4. improve ranking with hybrid recommendation models
5. add authentication and cross-device sync

## Why This Version Is Better Than The Original Prototype

Compared to the earlier version, this redesign:

- reduces clutter
- makes the feed the main focus
- improves first-use clarity
- makes interactions obvious
- introduces cleaner recommendation grouping
- improves visual hierarchy
- adds stronger product-style polish

## Future UI Improvements

- onboarding modal for first-time users
- recent activity panel
- saved content library page
- animated page transitions
- user profile sidebar
- richer content previews
