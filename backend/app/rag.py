from typing import List, Dict
from dataclasses import dataclass
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

@dataclass
class Doc:
    id: str
    text: str

class TinyRetriever:
    def __init__(self, docs: List[Doc]):
        self.docs = docs
        self.corpus = [d.text for d in docs]
        self.ids = [d.id for d in docs]
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.X = self.vectorizer.fit_transform(self.corpus)

    def search(self, query: str, k: int = 3):
        qv = self.vectorizer.transform([query])
        import numpy as np
        from sklearn.metrics.pairwise import cosine_similarity
        sims = cosine_similarity(qv, self.X).ravel()
        top_idx = sims.argsort()[::-1][:k]
        results = []
        for i in top_idx:
            results.append({"id": self.ids[i], "score": float(sims[i]), "snippet": self.corpus[i][:300]})
        return results

def draft_answer(question: str, hits, catalog_map):
    if not hits:
        return "I couldn't find anything relevant in the catalog."
    top_id = hits[0]["id"]
    item = catalog_map.get(top_id)
    if not item:
        return f"Top match is {top_id}, but details are missing."
    q = question.lower()
    if "owner" in q or "who owns" in q:
        return f"{item['name']} is owned by {item['owner']}."
    if "upstream" in q or "source" in q or "comes from" in q:
        ups = item.get("upstream", [])
        if ups:
            return f"{item['name']} has upstream sources: {', '.join(ups)}."
        return f"{item['name']} has no recorded upstream sources."
    if "downstream" in q or "impacted" in q or "break" in q:
        downs = item.get("downstream", [])
        if downs:
            return f"If {item['name']} changes, downstream datasets impacted: {', '.join(downs)}."
        return f"No downstream datasets recorded for {item['name']}."
    tags = ", ".join(item.get("tags", [])) or "none"
    return f"Top match: {item['name']} (owner: {item['owner']}, tags: {tags})."
