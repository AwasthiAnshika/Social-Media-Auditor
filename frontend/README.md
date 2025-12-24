# Frontend

This folder contains the Vite + React frontend for the Social Media Auditor app.

Quick start
 - Install dependencies:
	 ```bash
	 cd frontend
	 npm install
	 ```

 - Run the dev server:
	 ```bash
	 npm run dev
	 ```

 - Build for production:
	 ```bash
	 npm run build
	 ```

 - Preview the production build:
	 ```bash
	 npm run preview
	 ```

Notes & troubleshooting
- Node: use a modern Node.js (18+) for best compatibility.
- If you see missing package errors, run `npm install` inside `frontend`.
- If you changed CSS and don't see the update, restart the dev server and hard-refresh your browser.

Project structure (important files)
- `src/index.css` — global styles and theme variables (the new dark/glass theme lives here). To change colors and gradients, edit the CSS variables at the top of this file.
- `src/components/*` — main UI components: `Header.jsx`, `LandingPage.jsx`, `Analyzing.jsx`, `EmailCollection.jsx`.
- `src/assets/` — local images and SVGs used by the UI.
- `index.html` — HTML entry; Google Fonts are loaded here.

Theme compatibility
- The project includes legacy utility classes (like `bg-vb-bg`, `text-vb-text`, `bg-vb-accent`) — these are mapped in `src/index.css` to the new dark/glass palette. If you want to fully migrate components to the new utilities, edit `src/index.css` and replace legacy class uses in the components.

Styling tools
- Tailwind CSS directives are present in `src/index.css`. If you modify Tailwind config or add new utilities, re-run the dev server.

Running backend + frontend together
- From the project root you can run both servers (if configured) with:
	```bash
	npm run dev:all
	```
	This delegates to the backend `dev` script and the frontend dev script.

Customization checklist
- Colors & gradients: edit `:root` variables in `src/index.css`.
- Spacing, radii, shadows: adjust the `.glass-card`, `.btn-primary`, and utility classes in `src/index.css`.
- Copy/text: update component strings in `src/components/*`.

If you'd like, I can:
- Add a design token file (JSON/CSS) for easier theme changes.
- Replace legacy `vb-*` classes across the components with the new utilities.
- Add more polished SVG illustrations into `src/assets/`.

Enjoy — open `http://localhost:3000` after starting the frontend dev server to view the app.

