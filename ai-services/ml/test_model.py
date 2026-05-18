import joblib

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "intent_model.pkl"

pipeline = joblib.load(MODEL_PATH)

while True:

    text = input("Input: ")

    pred = pipeline.predict([text])[0]

    print("Predicted intent:", pred)