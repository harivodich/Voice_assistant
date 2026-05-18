import pandas as pd
import re
import unicodedata
from sklearn.model_selection import train_test_split
from text_preprocessing import (
    normalize_text,
    remove_accents
)
df = pd.read_csv("data/data_R.csv")

print("Dataset shape:", df.shape)
print(df.head())

# Xóa dòng bị thiếu text hoặc label
df = df.dropna(subset=["raw_text", "label"])

df["raw_text"] = df["raw_text"].astype(str)
df["label"] = df["label"].astype(str)

df["normalized_text"] = df["raw_text"].apply(normalize_text)

df["normalized_no_accent"] = df["normalized_text"].apply(remove_accents)


before = len(df)

df = df.drop_duplicates(
    subset=["normalized_text", "label"]
).reset_index(drop=True)

after = len(df)

print(f"Removed duplicates: {before - after}")


df = df[df["normalized_text"].str.len() > 2]


print("\nIntent Distribution:")
print(df["label"].value_counts())


train_df, temp_df = train_test_split(
    df,
    test_size=0.2,
    random_state=42,
    stratify=df["label"]
)
val_df, test_df = train_test_split(
    temp_df,
    test_size=0.5,
    random_state=42,
    stratify=temp_df["label"]
)
train_df["split"] = "train"
val_df["split"] = "validation"
test_df["split"] = "test"

final_df = pd.concat(
    [train_df, val_df, test_df],
    ignore_index=True
)

train_df["split"] = "train"
test_df["split"] = "test"

final_df = pd.concat(
    [train_df, val_df, test_df],
    ignore_index=True
)


final_df = final_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


output_path = "data/intent_dataset.csv"

final_df.to_csv(output_path, index=False, encoding="utf-8-sig")

print("\nPreprocessing completed successfully!")
print("Saved to:", output_path)


print("\nFinal dataset info:")
print(final_df.info())

print("\nSample data:")
print(final_df.head())