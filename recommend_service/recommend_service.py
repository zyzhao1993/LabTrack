# recommend_service.py
from fastapi import FastAPI, Body
from sentence_transformers import SentenceTransformer
import numpy as np

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或者指定你的前端地址 http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

@app.post("/recommend")
def recommend(user_list: list[str] = Body(...), all_items: list[str] = Body(...)):
    if not user_list or not all_items:
        return {"suggestions": []}
    user_emb = np.mean(model.encode(user_list), axis=0)
    item_embs = model.encode(all_items)
    scores = np.dot(item_embs, user_emb)
    top_indices = np.argsort(scores)[::-1][:3]
    return {"suggestions": [all_items[i] for i in top_indices], "scores": [float(scores[i]) for i in top_indices]}