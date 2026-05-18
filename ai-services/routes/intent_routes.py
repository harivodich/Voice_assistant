from flask import Blueprint, request, jsonify
from services.intent_service import classify_intent
from utils.logger import get_logger

intent_bp = Blueprint("intent", __name__, url_prefix="/intent")

logger = get_logger('intent_routes')


@intent_bp.route("/predict", methods=["POST"])
def predict():
    logger.info('intent_request')

    data = request.get_json(silent=True) or {}
    text = data.get("text")

    if not text:
        logger.warning('intent_no_text')
        return jsonify({"success": False, "message": "Text required"}), 400

    logger.info('intent_received', extra={
        "textLength": len(text)
    })

    intent = classify_intent(text)

    return jsonify({
        "success": True,
        "intent": intent
    })