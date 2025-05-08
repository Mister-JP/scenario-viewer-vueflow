# Scenario Viewer with Vue Flow

**Scenario Viewer VueFlow** is an interactive web application built with Vue 3, TypeScript, Vite, and the powerful Vue Flow library. It allows users to create, visualize, and manage interconnected scenarios and markdown notes in a dynamic flowchart-style interface. The application features user authentication, customizable node types (scenario cards and markdown notes), resizable nodes, edge management, and the ability to save and load workspace layouts.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Main Scenario Viewer Page](#main-scenario-viewer-page)
    - [Adding Nodes](#adding-nodes)
    - [Editing Nodes](#editing-nodes)
    - [Resizing Nodes](#resizing-nodes)
    - [Connecting Nodes (Edges)](#connecting-nodes-edges)
    - [Deleting Edges](#deleting-edges)
    - [Managing Host URL](#managing-host-url)
    - [Saving and Loading Layouts](#saving-and-loading-layouts)
    - [Other Controls](#other-controls)
  - [Markdown Test Page](#markdown-test-page)
- [Key Components](#key-components)
- [State Management (Pinia Stores)](#state-management-pinia-stores)
- [Routing](#routing)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

*   **Interactive Flowchart Interface:** Powered by Vue Flow for creating and managing node-based diagrams.
*   **Custom Node Types:**
    *   **Scenario Card Nodes:** Embed external content (e.g., other web pages, scenarios) via iframes. The content source is determined by a configurable global `hostUrl` and a per-node `scenarioId`.
    *   **Markdown Nodes:** Create and edit rich text notes using Markdown. Includes a modal editor and live preview.
*   **Node Customization:**
    *   Resizable nodes for flexible layout design.
    *   Editable scenario IDs for Scenario Card Nodes.
    *   Editable Markdown content for Markdown Nodes.
*   **Edge Management:**
    *   Create connections (edges) between nodes by dragging from handles.
    *   Delete edges by double-clicking on them.
*   **Workspace Persistence:**
    *   Save the current workspace (nodes, edges, and host URL configuration) to a local JSON file.
    *   Load a previously saved workspace from a JSON file.
*   **User Authentication:**
    *   Simple signup and login system (mock authentication using `localStorage`).
    *   Protected routes requiring authentication.
*   **Vue Flow Integration:**
    *   Includes Minimap for easy navigation of large graphs.
    *   Provides Controls for zoom, fit-to-view, etc.
    *   Customizable Background pattern.
*   **Markdown Support:**
    *   Integrated `marked` library for Markdown parsing and rendering.
    *   Dedicated `MarkdownLabel` component for displaying styled Markdown.
    *   `MarkdownTestPage` for isolated Markdown rendering tests.
*   **Modern Tech Stack:** Built with Vue 3 (Composition API, `<script setup>`), TypeScript, Vite, and Pinia for state management.
*   **Styling:** Utilizes Tailwind CSS for a utility-first approach to styling.

## Tech Stack

*   **Frontend Framework:** Vue 3.js
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Routing:** Vue Router
*   **State Management:** Pinia
*   **Diagramming/Flowchart:** Vue Flow (`@vue-flow/core`, `@vue-flow/background`, `@vue-flow/controls`, `@vue-flow/minimap`)
*   **Markdown Processing:** `marked`
*   **Styling:** Tailwind CSS, PostCSS
*   **Development Utilities:** `vue-tsc` (for TypeScript checking)

## Project Structure

```
scenario-viewer-vueflow/
├── .vscode/                 # VS Code settings (e.g., recommended extensions)
├── public/                  # Static assets (e.g., vite.svg)
├── src/
│   ├── assets/              # Project-specific assets (e.g., vue.svg)
│   ├── components/          # Reusable Vue components
│   │   ├── EditMarkdownNodeModal.vue
│   │   ├── MarkdownLabel.vue
│   │   ├── MarkdownNode.vue
│   │   └── ScenarioCardNode.vue
│   ├── pages/               # Top-level page components for routes
│   │   ├── LoginPage.vue
│   │   ├── MarkdownTestPage.vue
│   │   ├── ScenarioViewerPage.vue
│   │   └── SignupPage.vue
│   ├── router/              # Vue Router configuration (index.ts)
│   ├── stores/              # Pinia state management stores
│   │   ├── auth.ts          # Authentication store
│   │   └── workspace.ts     # Workspace (nodes, edges, hostUrl) store
│   ├── App.vue              # Root Vue component
│   ├── main.ts              # Application entry point
│   ├── index.css            # Tailwind CSS base, components, utilities
│   ├── style.css            # Global styles
│   └── vite-env.d.ts        # Vite environment type definitions
├── .gitignore               # Git ignore file
├── index.html               # Main HTML entry point for Vite
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── README.md                # This file
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.app.json        # TypeScript configuration for the application
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.node.json       # TypeScript configuration for Node.js environment (e.g., vite.config.ts)
└── vite.config.ts           # Vite build tool configuration
```

## Prerequisites

*   Node.js (v18.x or later recommended)
*   npm, yarn, or pnpm (this guide will use npm examples)

## Getting Started

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Mister-JP/scenario-viewer-vueflow.git
    cd scenario-viewer-vueflow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    (Or `yarn install` or `pnpm install`)

### Running the Development Server

To start the development server with hot-reloading:

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173` (Vite's default port, but may vary).

### Building for Production

To build the application for production:

```bash
npm run build
```

This command will type-check the project using `vue-tsc` and then build the static assets into the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Usage

### Authentication

*   **Signup:** If you don't have an account, navigate to the `/signup` page (or will be redirected if not logged in) to create one. This mock system stores user credentials in `localStorage`.
*   **Login:** Navigate to the `/login` page.
    *   A default user `user` with password `password` is usually available if no users have been registered yet (check `src/stores/auth.ts` for any hardcoded initial users if applicable, though the current setup initializes with an empty user list or from localStorage).
*   Once logged in, you will be redirected to the main Scenario Viewer page.

### Main Scenario Viewer Page (`/`)

This is the core page where you interact with the scenario and markdown nodes.

#### Adding Nodes

*   **Add Scenario Node:** Click the "Add Scenario" button in the header. You will be prompted to enter a "Scenario ID". This ID is used in conjunction with the global "Host URL" to form the `src` for the iframe within the Scenario Card Node.
*   **Add Markdown Node:** Click the "Add Note" button in the header. A new Markdown Node will be added to the canvas with default content.

#### Editing Nodes

*   **Scenario Card Node:**
    *   **Edit Scenario ID:** Click the pencil (✏️) icon in the header of a Scenario Card Node. A prompt will appear allowing you to change its `scenarioId`.
*   **Markdown Node:**
    *   **Edit Content:** Double-click anywhere on a Markdown Node. A modal window will open with a textarea where you can edit the Markdown content. Click "Save Content" to apply changes or "Cancel" to discard.

#### Resizing Nodes

Both Scenario Card Nodes and Markdown Nodes are resizable.
*   Hover over the bottom-right corner of a node until a resize cursor appears.
*   Click and drag to change the node's width and height. Minimum dimensions are enforced.

#### Connecting Nodes (Edges)

*   Nodes have handles (small circles) on their Top, Right, Bottom, and Left sides.
*   To create an edge, click and drag from a handle on one node to a handle on another node.
*   Edges are directed and will have an arrowhead pointing to the target node.

#### Deleting Edges

*   Double-click on any edge connecting two nodes.
*   A confirmation dialog will appear. Confirm to delete the edge.

#### Managing Host URL

*   The "Host URL" is displayed in the header (e.g., `Host: http://localhost:8080`). This URL serves as the base for iframe content in Scenario Card Nodes. For a scenario node with ID `my-scenario`, the iframe `src` would be `http://localhost:8080?scenario=my-scenario` (assuming the host URL doesn't end with a `/` and the query parameter structure is `?scenario=`).
*   **Edit Host URL:** Click the "Edit Host" button in the header. A prompt will appear allowing you to change the global Host URL. This change is saved in `localStorage` and affects all Scenario Card Nodes.

#### Saving and Loading Layouts

*   **Save Layout:** Click the "Save Layout" button in the header. This will serialize the current state of your workspace (nodes, their positions, data, styles; edges; and the current Host URL) into a JSON file and trigger a download.
*   **Load Layout:** Click the "Load Layout" button in the header. This will open a file dialog. Select a previously saved JSON layout file. The workspace will be cleared and populated with the data from the loaded file.

#### Other Controls

*   **Fit View:** Click the "Fit View" button to adjust the viewport to neatly display all nodes currently on the canvas.
*   **Logout:** Click the "Logout" button in the header (visible when logged in) to end your session and return to the login page.
*   **Vue Flow Controls:** Use the on-canvas controls (usually in the bottom-left or as configured) for zooming, panning, and fitting the view.
*   **Minimap:** A small minimap (usually in the bottom-right) provides an overview of the entire workspace and can be used for quick navigation.

### Markdown Test Page (`/md`)

*   Accessible via the `/md` route (requires authentication).
*   This page features a textarea for Markdown input and a live preview pane using the `MarkdownLabel` component.
*   It's designed for testing the Markdown rendering capabilities in isolation. Changes made here are not saved.

## Key Components

*   **`ScenarioCardNode.vue`:** Custom Vue Flow node that embeds external content in an iframe. Supports resizing and editing of its associated `scenarioId`.
*   **`MarkdownNode.vue`:** Custom Vue Flow node for displaying and editing Markdown content. Supports resizing and uses `MarkdownLabel` for rendering and `EditMarkdownNodeModal` for editing.
*   **`EditMarkdownNodeModal.vue`:** A modal dialog component for editing Markdown content in a textarea.
*   **`MarkdownLabel.vue`:** A component that takes a Markdown string as a prop, parses it using `marked`, and renders the HTML output. It includes specific styling for various Markdown elements.
*   **`ScenarioViewerPage.vue`:** The main page orchestrating the Vue Flow canvas, node/edge management, and UI controls.
*   **`LoginPage.vue` & `SignupPage.vue`:** Pages for user authentication.

## State Management (Pinia Stores)

*   **`src/stores/auth.ts`:** Manages authentication state (e.g., `isAuthenticated`, `currentUser`), user registration, login, and logout logic. Persists some data to `localStorage`.
*   **`src/stores/workspace.ts`:** Manages the state of the Vue Flow workspace, including:
    *   `nodes`: An array of all nodes on the canvas.
    *   `edges`: An array of all connections between nodes.
    *   `hostUrl`: The global host URL for Scenario Card Nodes.
    *   Functions for updating node data, dimensions, scenario IDs, host URL, and removing edges.

## Routing

Routing is handled by `vue-router` and configured in `src/router/index.ts`.
*   `/login`: Login page.
*   `/signup`: Signup page.
*   `/`: Main Scenario Viewer page (requires authentication).
*   `/md`: Markdown Test page (requires authentication).
*   Navigation guards are in place to redirect unauthenticated users to the login page for protected routes and to redirect authenticated users away from login/signup pages.

## Scripts

The following scripts are available in `package.json`:

*   `npm run dev`: Starts the Vite development server with HMR.
*   `npm run build`: Type-checks with `vue-tsc` and builds the project for production into the `dist/` folder.
*   `npm run preview`: Serves the production build locally from the `dist/` folder.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these general steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them with clear, descriptive messages.
4.  Push your changes to your forked repository.
5.  Create a Pull Request to the original repository.

Please ensure your code adheres to the existing style and that any new features are appropriately documented.

## License

This project is likely open source. Please check for a `LICENSE` file in the repository or assume a standard open-source license like MIT if one is not present and you intend to use or distribute this code. (Typically, you would add a `LICENSE` file, e.g., MIT).
