
# Streamlit Custom Component: Industry & Niche Picker (React UI, no search)

This repository packages the React picker UI as a Streamlit custom component.
- **No search** for industry/niche (as requested).
- Selections are returned to Streamlit as `{industry: [niche, ...], ...}`.
- Includes an example Streamlit app (`example_app.py`) with JSON/CSV export and shareable URL via `st.query_params`.

## Quick start

### 1) Install frontend deps & build
```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/` (Vite build). Commit this folder so Streamlit Cloud can serve the component without building.

### 2) Run the example app
```bash
pip install streamlit pandas
streamlit run example_app.py
```

### 3) Deploy
- Push the whole repo to GitHub (including `frontend/dist` and `data.json`).
- On Streamlit Community Cloud, create a new app with **app file**: `example_app.py`.

## Data
- `data.json` contains `{ "industry": string, "niches": string[] }[]`.
- The copy here was generated from your Excel workbook (sheet names → industries; sheet cells → niches).

## Dev mode (optional)
- To hot-reload the frontend, run `npm run dev` in `frontend`, then in `industry_niche_component/component.py` set `_RELEASE = False` and point `DEV_SERVER_URL` to the dev server URL.


**Note:** This archive includes a prebuilt `frontend/dist` that uses UMD builds (React + streamlit-component-lib via CDN). No Node build is required on Streamlit Cloud.
