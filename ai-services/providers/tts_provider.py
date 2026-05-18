
from io import BytesIO
from gtts import gTTS

def generate_speech(text):

    mp3_buffer = BytesIO()
    
    tts = gTTS(
        text=text,
        lang="vi"
    )
    
    tts.write_to_fp(mp3_buffer)

    mp3_buffer.seek(0)

    return mp3_buffer

