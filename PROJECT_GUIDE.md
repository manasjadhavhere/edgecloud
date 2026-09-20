# EdgeCloud — Complete Project Guide

Welcome to the comprehensive guide for **EdgeCloud**. This document explains the architecture, file structure, and what each piece of code does in the project. If you are new to the codebase or need a refresher, read on!

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Routing & Pages](#routing--pages)
5. [Components](#components)
6. [Hooks & Utilities](#hooks--utilities)
7. [Firebase Integration](#firebase-integration)
8. [Data Flow](#data-flow)

---

## Project Overview
**EdgeCloud** is a real-time, interactive word cloud game designed for events and corporate conferences (e.g., ET Edge). 
The host creates a "fill-in-the-blanks" sentence (e.g., "The future of business is `__`"). A QR code is presented to the audience. Participants scan the QR code to join the session on their phones, where they type in their answers. As responses roll in, the results page dynamically updates a live word cloud and a leaderboard showing the top 10 most common answers.

---

## Tech Stack
- **Framework**: React + Vite
- **Routing**: `react-router-dom` v7
- **Database / Real-time Sync**: Firebase Realtime Database (`firebase`)
- **Word Cloud Engine**: `wordcloud` (wordcloud2.js)
- **Icons**: `lucide-react`
- **QR Codes**: `qrcode.react`
- **Image Export**: `html2canvas` (for downloading the word cloud as PNG)

---

## Folder Structure
All application source code lives inside the `src/` directory.

```text
src/
├── assets/         # Static assets like images/logos
├── components/     # Reusable UI elements and visuals
├── data/           # Static JSON data (e.g., mock data)
├── hooks/          # Custom React hooks (logic reuse)
├── pages/          # Main route components (Screens)
├── utils/          # Helper functions and business logic
├── App.jsx         # Main router and route definitions
├── firebase.js     # Firebase initialization and config
├── index.css       # Global styles and vanilla CSS design system
└── main.jsx        # React DOM entry point
```

---

## Routing & Pages
The application routes are defined in `src/App.jsx`. Each page handles a specific step of the user journey.

- **`/` (`Landing.jsx`)**: The home page. Welcomes users and typically offers entry points (e.g., "Login as Host").
- **`/host-login` (`HostLogin.jsx`)**: The authentication page where a host logs in to manage an event.
- **`/select-event` (`HostSelectEvent.jsx`)**: The dashboard where a logged-in host can pick an existing event or create a new one.
- **`/host` (`Host.jsx`)**: The active host control panel for a running game. Here, the host sets the sentence with blanks (`__`), sees active participants, and displays the QR code for joining.
- **`/join/:gameId` (`Join.jsx`)**: The participant flow. Attendees scan the QR code, which brings them to this URL. They enter their name, read the sentence, and submit their answer(s).
- **`/results/:gameId` (`Results.jsx`)**: The visual centerpiece. It listens to Firebase for new answers in real-time and renders the animated Word Cloud and Top 10 Leaderboard.

---

## Components
Located in `src/components/`, these are building blocks used across pages.

**Visual & Background Effects**:
- **`B2BBackground.jsx`**: Provides a professional corporate background suitable for B2B events.
- **`BgGrid.jsx`**: Renders a subtle grid overlay for a modern aesthetic.
- **`BottomRightWaves.jsx`**: Decorative wave SVGs positioned at the bottom right.
- **`FloatingOrbs.jsx`**: Animated, floating gradient orbs that move in the background.
- **`Confetti.jsx`**: Triggers a confetti animation (used during celebrations or game ends).

**Functional Components**:
- **`WordCloudViz.jsx`**: The core component that takes a list of word frequencies and renders the word cloud using the `wordcloud` library on an HTML `<canvas>`.
- **`Top10Table.jsx`**: Renders the animated leaderboard table, calculating percentages and showing the most popular answers.
- **`QRDisplay.jsx`**: Uses `qrcode.react` to generate a scannable QR code based on the current `gameId` URL, allowing attendees to join frictionlessly.
- **`HowToPlay.jsx`**: A modal or section containing instructions on how participants should interact with the game.

---

## Hooks & Utilities
To keep the React components clean, logic is abstracted into hooks and utility functions.

**Hooks (`src/hooks/`)**:
- **`useGame.js`**: A custom React hook that encapsulates interactions with Firebase. It handles joining a game, sending participant answers, and setting up real-time listeners for game state updates.

**Utilities (`src/utils/`)**:
- **`wordCount.js`**: Contains logic to process raw text submissions. It strips punctuation, normalizes cases, and aggregates counts to produce the frequency data needed by the word cloud and leaderboard.
- **`drawIconicTrophy.js`**: Contains specific canvas drawing logic to create a "Trophy" shape. This acts as a mask so that words in the cloud form the shape of a trophy.
- **`masks.js`**: Provides various image masking functions or shapes that dictate the layout boundaries of the word cloud.
- **`theme.js`**: Stores color palettes, theme constants, and configuration for styling the word cloud and components consistently.

**Data (`src/data/`)**:
- **`iconicBrandWords.json`**: Contains a list of sample words/data that can be used for testing the word cloud rendering or demoing the app without live participants.

---

## Firebase Integration
The app relies heavily on **Firebase Realtime Database** for a "zero-backend" architecture.

- **`src/firebase.js`**: Initializes the Firebase app with the config (API keys, DB URL) and exports the `database` instance.
- **Setup**: Detailed instructions on configuring this database are located in `SETUP.md`.
- **Structure**: The database stores sessions under a `games/` node. Each game contains the sentence configuration, game status, and a sub-node of `responses` pushed by the participants via `Join.jsx`.

---

## Data Flow
Here is the lifecycle of a typical session:
1. **Creation**: Host creates a session in `HostSelectEvent.jsx`, generating a `gameId`.
2. **Configuration**: Host types a sentence like `"Tech is __"` in `Host.jsx`. This updates the database.
3. **Sharing**: Host displays the QR Code via `QRDisplay.jsx`.
4. **Joining**: Audience scans the code, opening `Join.jsx`. They see `"Tech is __"` and type `"Awesome"`.
5. **Submission**: `Join.jsx` pushes `"Awesome"` to the Firebase `responses` node for that `gameId`.
6. **Real-time Sync**: `Results.jsx` is listening to Firebase. It receives the new word.
7. **Processing**: `wordCount.js` recalculates the frequencies.
8. **Visualization**: `WordCloudViz.jsx` redraws the word cloud with the new data, and `Top10Table.jsx` updates the rankings.
