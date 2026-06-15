# 🌌 Cosmic Synastre (Do-Graph)

A high-performance, local-first spatial task manager and second-brain visualizer. 

Traditional to-do lists are linear, forcing complex, interconnected thoughts into rigid vertical columns. This project replaces the linear list with a **Force-Directed Physics Graph**, allowing tasks, goals, and thoughts to organize themselves organically based on their relationships, shared context, and timelines.

## ☁️ Try it Out -
https://do-graph.pages.dev/

## 🚀 Core Philosophy & Motive
The human brain does not store information in isolated folders; it stores it in associative webs. Cosmic Synastre is designed to mimic that associative behavior. Instead of manually moving tasks into folders, you simply write what you are thinking and tag it. The engine calculates the mathematical similarity between your thoughts and physically pulls related concepts together on the screen.

## 🧠 Features

### 1. The Command Bar Engine
A frictionless, CLI-style input system. No clicking through menus or forms.
* **Syntax Parsing:** Create nodes instantly using prefix triggers (`!` for Goals, `/` for Tasks, `.` for Thoughts).
* **Structural Binding:** Use `@` to tether a task to a specific parent goal.
* **Context Tagging:** Use `#` to assign contextual tags.
* **Real-time Autocomplete:** The engine scans your existing universe and provides a navigable dropdown for quick tagging.
* **Excel-Style Editing:** Click any node to instantly pull its raw syntax back into the command bar for rapid editing.

### 2. Emergent Mathematics (The Edge Matrix)
Relationships are calculated, not just assigned.
* **Parent-Child (Structural):** Hard tethers between Tasks and Goals (Solid Lime lines).
* **Strong Tag Similarity:** Uses the **Jaccard Index** to calculate tag overlap between nodes. If two nodes share $\ge 70\%$ of their tags, they form a strong bond, glowing brightly and attaching a physical spring to pull them together.
* **Weak Tag Correlation:** Nodes sharing 40%-69% of their tags (or exact 1-to-1 tag matches) draw a faint background thread, showing visual correlation without altering the physics of the layout.
* **Evolutionary Bridges:** Major goals in different months that share heavy context will draw massive, sweeping curves across the timeline to show long-term progression.

### 3. Force-Directed Physics & Canvas Rendering
* **D3.js Physics:** Nodes act as physical objects. Repulsive electrostatic charges push nodes apart to prevent overlapping, while dynamic springs pull related items into orbital clusters. 
* **HTML5 Canvas:** Bypasses the DOM entirely. Capable of rendering thousands of interacting nodes, dynamic radii, and heavy shadow-blur bloom effects at a locked 60FPS.
* **Interactive Raycasting:** Hovering or clicking a node calculates the Pythagorean distance from the mouse to the node centers, isolating the selected node and its 1st-degree neighbors while dimming the rest of the universe.

### 4. The Notebook Grid Timeline
Nodes are bound to an invisible grid based on the month they were created. As time passes, the universe expands left-to-right, top-to-bottom, creating distinct, glowing "Nebulae" for each month of your life, allowing you to infinitely pan through your history.

### 5. Absolute Privacy (Local-First)
Your brain belongs to you. 
* Built with `Zustand` and persisted directly to your browser's LocalStorage. 
* Zero cloud databases, zero telemetry, zero latency. 
* Built-in tools to instantly export your entire universe as a physical `.json` file to your hard drive, or wipe it completely.

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
