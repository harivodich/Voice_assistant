import os
import json
import numpy as np

from scripts.text_preprocessing import normalize_text
from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FAQ_EMBEDDINGS_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "faq_embeddings.npy"
)

FAQ_INDEX_MAP_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "faq_index_map.json"
)


model = SentenceTransformer("intfloat/multilingual-e5-small")


FAQ_EMBEDDINGS = np.load(FAQ_EMBEDDINGS_PATH)

with open(FAQ_INDEX_MAP_PATH, "r", encoding="utf-8") as f:
    FAQ_INDEX_MAP = json.load(f)


FAQ_BLOCK_KEYWORDS = [
    "hướng dẫn",
    "cách",
    "làm sao",
    "như thế nào",
    "tại sao",
    "gợi ý",
    "nên",
    "help"
]

def retrieve_faq(query: str):

    query = normalize_text(query)

    query_embedding = model.encode(
        [f"query: {query}"],
        normalize_embeddings=True
    )[0].astype(np.float32)

    scores = np.dot(
        FAQ_EMBEDDINGS,
        query_embedding
    )

    top_k = 3

    top_indices = np.argsort(scores)[::-1][:top_k]

    results = []

    for idx in top_indices:

        score = float(scores[idx])

        if score < 0.88:
            continue

        faq_item = FAQ_INDEX_MAP[idx]

        results.append({
            "question": faq_item["question"],
            "answer": faq_item["answer"],
            "score": round(score, 4)
        })

    if not results:
        return None

    best_result = results[0]

    return best_result["answer"]

