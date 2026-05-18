import os
import json
import numpy as np


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

    query = query.strip().lower()

    # block câu hỏi mở
    if any(k in query for k in FAQ_BLOCK_KEYWORDS):
        return None

    # encode
    query_embedding = model.encode(
        [f"query: {query}"],
        normalize_embeddings=True
    )[0].astype(np.float32)

    scores = np.dot(FAQ_EMBEDDINGS, query_embedding)

    best_idx = int(np.argmax(scores))

    best_score = float(scores[best_idx])

    # threshold (giữ lại để tránh trả sai)
    if best_score < 0.88:
        return None

    faq_item = FAQ_INDEX_MAP[best_idx]

    return faq_item.get("answer")


