# ⚡ Focus Rhythm `v0.1.0-beta`

> **Native Ubuntu Desktop Pomodoro & Flow Timer built with a Cyberpunk visual identity.**
>
> ⚠️ **Status: Active Beta (v0.1.0-beta)** — *Focus Rhythm is in active, open development. Some UI tweaks, edge-case fixes, and optimizations are currently in progress.*

---

### 🎙️ The Story Behind This Project

> *"After a long break, I came back to my desk and I wanted something that runs seamlessly on my Ubuntu setup—something where I can just set a timer, lock in, and work consistently.*
>
> *So I spent hours messing around with Vite, React, TypeScript, and Electron coding because this is my very first time building a desktop native app. I know it's probably not the 'best' or most feature-bloated Pomodoro app out there right now, but it's completely worth it for me. It taught me a lot about building native Linux desktop software, handling system notifications, IPC bridges, and sound synthesis. There are a few bugs left, but I will definitely keep improving it over time!"*
>
> — **Muhammad Umar**

---

## 🛠️ How to Set Up & Build for Your PC (Fast & Easy)

You can clone the repository and either run the native desktop app directly or generate your own `.AppImage` / `.deb` installer with one command:

### 1. Clone & Install Dependencies
Make sure you have **Node.js** (v18+) and **npm** installed on your Ubuntu machine:
```bash
git clone https://github.com/MUmarOfficial/focus-rythm.git
cd focus-rythm
npm install
```

### 2. Run Directly in Desktop Mode
Want to use Focus Rhythm immediately without packaging? Run:
```bash
npm run dev
```
This spins up the Vite dev server and opens the native Electron desktop application right on your screen.

### 3. Build Your Own `.AppImage` or `.deb`
You can produce clean, native Linux binaries directly on your machine:

- **To build the `.deb` installer:**
  ```bash
  npm run dist
  ```
  *(The `.deb` file will be created in the `release/` folder: `release/focus-rhythm_0.1.0-beta_amd64.deb`)*

- **To build BOTH `.AppImage` and `.deb`:**
  ```bash
  npm run dist:all
  ```
  *(Files will be output to the `release/` directory)*

---

## 🚀 How to Install & Run Your Built Binaries on Ubuntu

### Option A: Install the `.deb` Package
The `.deb` package integrates Focus Rhythm directly into your Ubuntu desktop environment (searchable in your Application Dash and pinnable to the Ubuntu Dock):

1. Navigate to the `release/` directory:
   ```bash
   cd release
   ```
2. Install the package using `dpkg`:
   ```bash
   sudo dpkg -i focus-rhythm_0.1.0-beta_amd64.deb
   ```
3. If Ubuntu prompts for any missing dependencies, resolve them with:
   ```bash
   sudo apt-get install -f
   ```
4. Launch **Focus Rhythm** from your Ubuntu application menu or terminal:
   ```bash
   focus-rhythm
   ```

*To remove/uninstall at any time:*
```bash
sudo apt remove focus-rhythm
```

---

### Option B: Run the Portable `.AppImage`
The `.AppImage` runs without needing root permissions or installation:

1. Navigate to the `release/` folder and grant execution permissions:
   ```bash
   chmod +x "Focus Rhythm-0.1.0-beta.AppImage"
   ```
2. Launch it:
   ```bash
   ./"Focus Rhythm-0.1.0-beta.AppImage"
   ```
*(Note for Ubuntu 22.04+ / 24.04: If AppImages do not execute on your system, install the FUSE library via `sudo apt install libfuse2`)*

---

## 🛡️ Is It Safe? (Privacy & Security First)

As Linux users, we value privacy and security. Focus Rhythm is designed with **strict native isolation and zero telemetry**:

- 🔒 **100% Offline & Private:** Zero network tracking, no analytics, no external telemetry servers, and no accounts required. All focus statistics, streaks, and preferences stay completely offline inside your local `localStorage`.
- 🛡️ **Hardened Electron Architecture:**
  - `contextIsolation: true` protects the internal environment.
  - `nodeIntegration: false` ensures renderer code cannot execute arbitrary system shell commands.
  - `sandbox: true` confines browser renderer processes.
  - All inter-process communication is routed through a typed, explicit `preload.cjs` IPC bridge (`desktop:notify`, `desktop:minimize`, `desktop:setFullscreen`).
- 🔊 **Zero External Audio Fetching:** Transition chimes are generated programmatically on-the-fly via the browser **Web Audio API** oscillator. No unverified remote sound files or external assets are downloaded.
- 📖 **Transparent Open Source:** Every single line of code is available for your inspection and review.

---

## ⚡ Features at a Glance

### ⏱️ 1. Focus Protocols & Custom Intervals
- **Classic 25/5:** 4 cycles of 25m focus & 5m recharge (100m total).
- **Power Hour:** 50m intense sprint & 10m cooldown.
- **Deep Work:** 30m flow blocks & 5m rest.
- **Ultradian 90/20:** Circadian peak performance & recovery rhythm.
- **Quick Burst:** 15m rapid momentum sprint & 3m pause.
- **2-Hour & 4-Hour Sessions:** Long marathons with structured rest intervals.
- **Custom Mode:** Configure custom total session, work block, and break block lengths.

### 🎨 2. Cyberpunk Visual Identity & FX Control
- **Vapor Digits:** Digital countdown clock with adaptive chromatic styling (Emerald `#00ff88` during focus, Cyan `#00d4ff` during break).
- **Adjustable FX Modes:**
  - `FULL`: CRT scanline raster + animated ambient noise.
  - `LOW`: Subtle static grid texture with reduced GPU draw.
  - `OFF`: Crisp modern dark UI with minimal visual effects.
- **Distinctive Typography:** Features *Orbitron*, *JetBrains Mono*, and *Share Tech Mono*.

### 🔔 3. Native Ubuntu Desktop Notifications & Chimes
- **Desktop Alerts:** Receives native Ubuntu notifications when work rounds end or breaks finish, even when the window is minimized.
- **Dual-Tone Audio Synthesizer:** Distinct rising chime (660Hz ➔ 880Hz) when starting focus, and calming falling tone (440Hz ➔ 330Hz) when resting. Can be toggled on/off with one click.

### 🧠 4. Dynamic Quotes & Active Rest Prompts
- **During Focus:** Cycles stoic, discipline, and momentum prompts to keep your focus sharp.
- **During Rest:** Actionable physical and mental prompts (eye rest, hydration, movement) plus scientific explanations of cognitive recovery.

### 📊 5. Focus Analytics & Streak Telemetry
- **Streak Tracker:** Tracks current daily streak and personal longest streak.
- **Visual Trend Charts:** 7-Day and 30-Day focus distribution charts powered by Recharts.
- **Telemetry Overview:** Total focused minutes, completed rounds, and active daily averages.
- **Data Management:** Option to clear recorded telemetry whenever you want.

### 🎛️ 6. In-Session Flow State Controls
- **+5 Min Flow Boost:** Add 5 minutes to your current focus block if you are in the zone.
- **Skip Break:** Advance directly to the next work round when inspiration strikes.
- **Soft Pause / Resume:** Pause with sub-second accuracy.
- **Minimize to Dock:** Quickly stow the window to your Ubuntu panel.

---

## 💻 Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Desktop Shell:** [Electron 44](https://www.electronjs.org/)
- **Bundler:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Visuals:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Packager:** [electron-builder](https://www.electron.build/)

---

## 🤝 Roadmap & Upcoming Improvements

- [ ] Global keyboard shortcut listener (e.g. `Ctrl+Alt+Space` to pause/resume anywhere)
- [ ] Ubuntu System Tray indicator icon with remaining time badge
- [ ] Sound volume slider and custom chime presets
- [ ] Export session logs to CSV / JSON

---

## 📄 License & Credits

Created by **Muhammad Umar** ([@MUmarOfficial](https://github.com/MUmarOfficial)).

Feedback, bug reports, and pull requests are very welcome! 🚀
