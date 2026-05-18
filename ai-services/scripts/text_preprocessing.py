import re
import unicodedata

def remove_accents(text):

    text = unicodedata.normalize("NFKD", text)

    text = "".join(
        [c for c in text if not unicodedata.combining(c)]
    )

    return text


def normalize_text(text):

    text = text.lower()

    text = unicodedata.normalize("NFC", text)

    text = re.sub(r"http\S+|www\S+|https\S+", " ", text)

    text = re.sub(r"\S+@\S+", " ", text)

    text = re.sub(r"\b\d{9,11}\b", " ", text)

    text = re.sub(r"[^a-zA-ZÀ-ỹ0-9\s]", " ", text)

    text = re.sub(r"\d+", " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    return text