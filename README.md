# 🌌 Cosmic Synastre (Do-Graph)

A high-performance, local-first spatial task manager and second-brain visualizer. 

Traditional to-do lists are linear, forcing complex, interconnected thoughts into rigid vertical columns. This project replaces the linear list with a **Force-Directed Physics Graph**, allowing tasks, goals, and thoughts to organize themselves organically based on their relationships, shared context, and timelines.

## 🚀 Core Philosophy
The human brain does not store information in isolated folders; it stores it in associative webs. Cosmic Synastre is designed to mimic that behavior. Simply write what you are thinking and tag it. The engine calculates the similarity between your thoughts and physically pulls related concepts together on the screen.

## ☁️ Try it Out
**Live Demo:** [https://do-graph.pages.dev/](https://do-graph.pages.dev/)
---

## 🧠 How to Use (The Essentials)

### 1. The Command Bar
A frictionless, CLI-style input system. No clicking through menus.
* **Syntax:** Create nodes instantly using prefixes: `!` for Goals, `/` for Tasks, `.` for Thoughts.
* **Binding:** Use `@` to tether a task to a specific parent goal (e.g., `/ Finish UI @ProjectX`).
* **Tagging:** Use `#` to assign context (e.g., `#coding`).
* **Autocomplete:** The engine scans your existing universe and provides a navigable dropdown for quick tagging.
* **Editing:** Click any node to instantly pull its raw syntax back into the command bar to edit it.

### 2. The Notebook Timeline
Nodes are bound to an invisible grid based on the month they were created. As time passes, your universe automatically expands left-to-right, top-to-bottom, creating distinct, glowing "Nebulae" for each month of your life.

### 3. 100% Private (Local-First)
Your brain belongs to you. 
* All data is saved directly to your browser's LocalStorage. 
* Zero cloud databases, zero telemetry. 
* Use the built-in UI buttons to instantly export your entire universe as a `.json` backup to your hard drive, import past backups, or wipe the canvas clean.

---

## 🛠️ Tech Stack
* **UI Shell:** React (Vite)
* **Rendering:** HTML5 Canvas API
* **Physics Engine:** D3.js (`d3-force`, `d3-zoom`, `d3-quadtree`)
* **State Management:** Zustand (with Persist Middleware)

## 💻 Running it Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/nishantprime/Do-Graph.git
   ```

2. Install dependencies:
   ```bash
   cd Do-Graph
   npm install
   ```

3. Ignite the universe:
   ```bash
   npm run dev
   ```
## ⚙️ Under the Hood (Architecture & Mechanics)
For developers curious about how the graph calculates interactions and renders at 60FPS:

### Emergent Mathematics (The Edge Matrix)
Relationships are calculated mathematically, not just assigned.
*  **Parent-Child:** Hard structural tethers between Tasks and Goals (Solid Lime lines).
*  **Tag Similarity:** Uses the Jaccard Index to calculate tag overlap. If two nodes share $\ge 70\%$ of their tags, they form a strong bond, attaching a physical spring to pull them together. Nodes sharing 40%-69% (or exact 1-to-1 matches) draw a faint background thread without altering the physics layout.
*  **Evolutionary Bridges:** Major goals in different months that share heavy context will draw massive, sweeping bezier curves across the timeline to show long-term progression.

### Force-Directed Physics & Canvas Rendering
* **D3.js Physics:** Nodes act as physical objects. Repulsive electrostatic charges push nodes apart to prevent overlapping, while dynamic springs pull related items into orbital clusters.
* **HTML5 Canvas:** Bypasses the HTML DOM entirely. Capable of rendering thousands of interacting nodes, dynamic radii, and heavy bloom effects without frame drops.
* **Interactive Raycasting:** Hovering or clicking a node bypasses React state. It calculates the Pythagorean distance from the mouse to the node centers using a D3 Quadtree, isolating the selected node and its 1st-degree neighbors while instantly dimming the rest of the universe.

### State Management Architecture Built with Zustand. 
The entire graph state is held in a lightweight, centralized store, ensuring that the Command Bar, the Canvas, and the LocalStorage database remain perfectly synced without heavy prop-drilling or Context API re-renders.
---

## 📋 To Do-
* Take the app on cloud with account based storage.
