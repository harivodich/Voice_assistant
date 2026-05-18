from providers.intent_provider import predict_intent
from utils.logger import get_logger

logger = get_logger('intent_service')


def classify_intent(text):
    if not text:
        logger.warning('intent_empty_input')
        return None

    logger.info('intent_start', extra={
        "textLength": len(text)
    })

    intent = predict_intent(text)

    logger.info('intent_done', extra={
        "intent": intent
    })

    return intent