# EdgeCloud ☁️

A real-time, interactive word cloud game designed for events and business conferences (ET Edge).

## 🚀 Features
- **Host Dashboard**: Custom fill-in-the-blank sentence creator with dynamic blank insertion (`__`).
- **QR Code Sharing**: Instant client-side QR code generation for venue participants to scan and join.
- **Participant Flow**: Frictionless join flow — enter name, fill in blanks in real-time, and view live game status.
- **Live Real-time Sync**: Synchronized game state across hundreds of devices powered by Firebase Realtime Database.
- **Interactive Word Cloud**: Vibrant, dynamic canvas word cloud visualizer powered by `wordcloud2`.
- **Top 10 Leaderboard**: Animated rankings table displaying frequency counts and percentages.
- **Instant Export**: Export high-resolution word cloud graphics to PNG with one click.
- **Zero-Backend Architecture**: Deploys seamlessly on Vercel as a static SPA.

## 🛠️ Tech Stack
- **Framework**: React + Vite
- **Real-Time Data**: Firebase Realtime Database
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS Design System (Plus Jakarta Sans & Fredoka One typography)
- **Deployment**: Vercel

## 📦 Setup & Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Firebase in `src/firebase.js` (refer to `SETUP.md`).
3. Run development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
