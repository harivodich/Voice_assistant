from faster_whisper import WhisperModel

model = WhisperModel(
    "medium",
    device="cpu",
    compute_type="int8"
)

DOMAIN_PROMPT = "Hội thoại tiếng Việt về AI và công nghệ."

def transcribe_audio(audio_path):

    try:

        segments, info = model.transcribe(
            audio_path,
            language="vi",
            beam_size=5,
            vad_filter=True,
            initial_prompt=DOMAIN_PROMPT
        )

        text = "".join(
            segment.text for segment in segments
        ).strip()

        return text.lower()

    except Exception as e:

        print("STT ERROR:", e)
        return ""