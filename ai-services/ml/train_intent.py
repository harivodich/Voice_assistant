import pandas as pd
import joblib
from sklearn.metrics import f1_score
from pathlib import Path

from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "intent_dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "intent_model.pkl"

df = pd.read_csv(DATA_PATH, encoding="utf-8")
print("Dataset shape:", df.shape)

print("\nColumns:")
print(df.columns)

print("\nLabel distribution:")
print(df["label"].value_counts())

print("\nSplit distribution:")
print(df["split"].value_counts())

X_train = df[df["split"] == "train"]["normalized_text"].astype(str)
y_train = df[df["split"] == "train"]["label"]
X_val = df[df["split"] == "validation"]["normalized_text"].astype(str)
y_val = df[df["split"] == "validation"]["label"]
X_test = df[df["split"] == "test"]["normalized_text"].astype(str)
y_test = df[df["split"] == "test"]["label"]

features = FeatureUnion([

    (
        "word_tfidf",
        TfidfVectorizer(
            lowercase=True,
            analyzer="word",
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True
        )
    ),

    (
        "char_tfidf",
        TfidfVectorizer(
            lowercase=True,
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=10000,
            sublinear_tf=True
        )
    )
])

pipeline = Pipeline([

    ("features", features),

    (
        "clf",
        LogisticRegression(
            max_iter=3000,
            class_weight="balanced",
            C=2.0,
            random_state=42
        )
    )
])

pipeline.fit(X_train, y_train)

val_preds = pipeline.predict(X_val)

val_accuracy = accuracy_score(y_val, val_preds)

print("\nValidation Accuracy:")
print(val_accuracy)
print("\nValidation Report:")
print(classification_report(y_val, val_preds))
preds = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, preds)

print("\nAccuracy:")
print(accuracy)

f1 = f1_score(
    y_test,
    preds,
    average="weighted"
)

print("\nWeighted F1-score:")
print(f1)

print("\nClassification Report:")
print(classification_report(y_test, preds))

cm = confusion_matrix(y_test, preds)

plt.figure(figsize=(7,5))

sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=pipeline.named_steps["clf"].classes_,
    yticklabels=pipeline.named_steps["clf"].classes_
)

plt.xlabel("Predicted")
plt.ylabel("Actual")

plt.title("Intent Classification Confusion Matrix")

plt.tight_layout()

OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

plt.savefig(OUTPUT_DIR / "confusion_matrix.png")

plt.figure(figsize=(6,4))

df["label"].value_counts().plot(kind="bar")

plt.title("Intent Distribution")

plt.xlabel("Intent")

plt.ylabel("Count")

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "intent_distribution.png"
)

macro_f1 = f1_score(
    y_test,
    preds,
    average="macro"
)

print("\nMacro F1-score:")
print(macro_f1)
joblib.dump(pipeline, MODEL_PATH)

print("Model saved to:", MODEL_PATH)

with open(OUTPUT_DIR / "metrics.txt", "w", encoding="utf-8") as f:
    f.write(f"Validation Accuracy: {val_accuracy}\n")
    f.write(f"Test Accuracy: {accuracy}\n")
    f.write(f"Weighted F1-score: {f1}\n\n")

    f.write(classification_report(y_test, preds))
