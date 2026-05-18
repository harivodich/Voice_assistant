import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(os.path.dirname(__file__))

FAQ_PATH = os.path.join(BASE_DIR, "data", "faq_knowledge.json")
EMBED_PATH = os.path.join(BASE_DIR, "models", "faq_embeddings.npy")
MAP_PATH = os.path.join(BASE_DIR, "models", "faq_index_map.json")


print("Loading embedding model...")
model = SentenceTransformer("intfloat/multilingual-e5-small")

with open(FAQ_PATH, "r", encoding="utf-8") as f:
    faq_data = json.load(f)

questions = [
    "query: " + item["question"].strip().lower()
    for item in faq_data
]

print("Encoding FAQ...")
embeddings = model.encode(
    questions,
    normalize_embeddings=True
)

np.save(EMBED_PATH, embeddings)

with open(MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(faq_data, f, ensure_ascii=False, indent=2)

print("Saved embeddings to:", EMBED_PATH)
print("Saved index map to:", MAP_PATH)