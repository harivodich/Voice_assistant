from providers.tts_provider import generate_speech
from utils.logger import get_logger

logger = get_logger('tts_service')


def text_to_speech(text):
    if not text:
        logger.warning('tts_empty_input')
        return None

    logger.info('tts_start', extra={
        "textLength": len(text)
    })

    audio_buffer = generate_speech(text)

    audio_size = None
    try:
        audio_size = len(audio_buffer.getvalue())
    except Exception:
        audio_size = 'unknown'

    logger.info('tts_done', extra={
        "audioSize": audio_size
    })

    return audio_buffer