from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json, os
from typing import List, Dict, Any
from .rag import TinyRetriever, Doc, draft_answer

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "catalog.json")

app = FastAPI(title="Catalog Copilot: Explorer + Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_catalog() -> List[Dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def save_catalog(items: List[Dict[str, Any]]):
    with open(DATA_PATH, "w") as f:
        json.dump(items, f, indent=2)

def build_retriever(catalog: List[Dict]) -> TinyRetriever:
    docs = []
    for it in catalog:
        text = " ".join([
            it.get("name",""),
            it.get("description",""),
            "tags: " + ", ".join(it.get("tags", [])),
            "owner: " + it.get("owner",""),
            "upstream: " + ", ".join(it.get("upstream", [])),
            "downstream: " + ", ".join(it.get("downstream", [])),
        ])
        docs.append(Doc(id=it["id"], text=text))
    return TinyRetriever(docs)

@app.get("/healthz")
def health():
    return {"ok": True}

@app.get("/api/datasets")
def list_datasets(q: str = "", tag: str = "", limit: int = 50, offset: int = 0):
    items = load_catalog()
    if q:
        q_lower = q.lower()
        items = [i for i in items if q_lower in (i.get("name","")+i.get("description","")).lower()]
    if tag:
        items = [i for i in items if tag in i.get("tags", [])]
    total = len(items)
    return {"total": total, "items": items[offset: offset+limit]}

@app.get("/api/datasets/{ds_id}")
def get_dataset(ds_id: str):
    items = load_catalog()
    for it in items:
        if it["id"] == ds_id:
            return it
    return {"error": "not_found"}

@app.get("/api/lineage/{ds_id}")
def get_lineage(ds_id: str):
    items = load_catalog()
    m = {it["id"]: it for it in items}
    it = m.get(ds_id)
    if not it:
        return {"error": "not_found"}
    return {"id": ds_id, "upstream": it.get("upstream", []), "downstream": it.get("downstream", [])}

@app.post("/api/ingest")
def ingest(items: List[Dict] = Body(...)):
    existing = {i["id"]: i for i in load_catalog()}
    for it in items:
        existing[it["id"]] = it
    save_catalog(list(existing.values()))
    return {"ok": True, "count": len(existing)}

@app.post("/api/ask")
def ask(payload: Dict = Body(...)):
    question = payload.get("question", "")
    catalog = load_catalog()
    retriever = build_retriever(catalog)
    hits = retriever.search(question, k=3)
    catalog_map = {c["id"]: c for c in catalog}
    answer = draft_answer(question, hits, catalog_map)
    return {"answer": answer, "hits": hits}

# Serve frontend if built to /app/ui
static_dir = os.path.join(BASE_DIR, "ui")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="ui")
