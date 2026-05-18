import pandas as pd
import matplotlib.pyplot as plt

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "data_R.csv"

df = pd.read_csv(DATA_PATH)

counts = df["label"].value_counts()

plt.figure(figsize=(8,5))

counts.plot(kind="bar")

plt.xlabel("Intent")
plt.ylabel("Samples")
plt.title("Intent Distribution")

plt.tight_layout()

OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

plt.savefig(OUTPUT_DIR / "intent_distribution.png")

print("Saved.")