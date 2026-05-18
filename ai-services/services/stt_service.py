import os
import uuid
from providers.whisper_provider import transcribe_audio
from utils.logger import get_logger

logger = get_logger('stt_service')


def speech_to_text(audio_file):
    logger.info('stt_start')

    if not audio_file:
        logger.warning('stt_no_audio_file')
        return None

    os.makedirs("temp", exist_ok=True)

    filename = audio_file.filename or "audio.wav"
    extension = filename.split(".")[-1] if "." in filename else "wav"

    file_name = f"{uuid.uuid4()}.{extension}"
    temp_path = os.path.join("temp", file_name)

    audio_file.save(temp_path)

    logger.info('stt_file_saved', extra={
        "tempPath": temp_path,
        "filename": filename
    })

    try:
        logger.info('stt_transcribing')

        text = transcribe_audio(temp_path)

        logger.info('stt_done', extra={
            "textLength": len(text) if text else 0
        })

        return text

    except Exception as e:
        logger.error('stt_failed', extra={
            "error": str(e),
            "tempPath": temp_path
        })
        raise

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info('stt_temp_deleted')