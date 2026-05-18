from pathlib import Path
import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "intent_model.pkl"

intent_model = joblib.load(MODEL_PATH)


CALENDAR_KEYWORDS = [
    "nhắc",
    "lịch",
    "đặt lịch",
    "tạo lịch",
    "hẹn",
    "meeting",
    "cuộc họp",
    "remind",
    "schedule",
    "deadline",
    "báo thức"
]

CONTROL_KEYWORDS = [
    "mở",
    "open",
    "truy cập",
    "vào",
    "youtube",
    "google",
    "facebook",
    "github",
    "gmail",
    "chatgpt",
    "gemini",
    "tiktok",
    "instagram"
]

PERSONALIZE_KEYWORDS = [
    "tôi thích",
    "mình thích",
    "tôi tên",
    "mình tên",
    "tôi là",
    "mình là",
    "tôi học",
    "mình học",
    "tôi sống",
    "mình sống",
    "quê tôi",
    "trả lời ngắn",
    "giải thích kỹ",
    "nói lịch sự"
]


def predict_intent(text: str):

    text = str(text).strip()
    text_lower = text.lower()


    if any(k in text_lower for k in CALENDAR_KEYWORDS):
        return "calendar"

    if any(k in text_lower for k in CONTROL_KEYWORDS):
        return "control_device"

    if any(k in text_lower for k in PERSONALIZE_KEYWORDS):
        return "personalize"

    X = pd.DataFrame({
        "text": [text]
    })

    probs = intent_model.predict_proba(X)[0]
    labels = intent_model.classes_

    best_idx = probs.argmax()

    best_label = labels[best_idx]
    best_score = probs[best_idx]

    print("[INTENT PROBS]:", {
        label: round(float(score), 3)
        for label, score in zip(labels, probs)
    })

    if best_score < 0.45:
        return "qa"

    return best_label