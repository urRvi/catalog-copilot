# Catalog Copilot: Data Catalog + Lineage Explorer

Full-stack **data catalog + lineage explorer** with a lightweight **retrieval-based copilot**.
- React + TypeScript frontend (search, details, lineage, copilot)
- FastAPI backend (datasets/lineage APIs, TF-IDF `/api/ask`)
- **Single Docker deploy**: builds FE and serves it via FastAPI

## Quickstart (Local)

### Dev mode (separate FE/BE)
```bash
# Backend
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000

# Frontend (new terminal)
cd ../frontend
npm install
# create .env with: VITE_API_URL=http://localhost:8000
npm run dev  # http://localhost:5173
```

### Single container
```bash
docker build -t catalog-copilot .
docker run -p 8000:8000 catalog-copilot
# Visit http://localhost:8000
```

## APIs
- `GET /api/datasets` — list/search datasets
- `GET /api/datasets/{id}` — dataset details
- `GET /api/lineage/{id}` — upstream/downstream
- `POST /api/ingest` — add/merge dataset JSON
- `POST /api/ask` — tiny retrieval QA (answer + sources)

## Deploy (Railway example)
- New Project → Deploy from GitHub → pick this repo
- Expose port **8000**
- Done (UI + API served from one URL)

## Roadmap
- Postgres + SQLAlchemy
- Cytoscape graph for lineage
- FAISS + sentence-transformers for better retrieval
- Tests (pytest + Playwright) & GitHub Actions
