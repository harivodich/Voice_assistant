from flask import Blueprint, request, jsonify, send_file
from services.tts_service import text_to_speech
from utils.logger import get_logger

tts_bp = Blueprint("tts", __name__, url_prefix="/tts")

logger = get_logger('tts_routes')


@tts_bp.route("/speak", methods=["POST"])
def speak():
    logger.info('tts_request')

    data = request.get_json(silent=True) or {}
    text = data.get("text")

    if not text:
        logger.warning('tts_no_text')
        return jsonify({"success": False, "message": "Text required"}), 400

    logger.info('tts_received', extra={
        "textLength": len(text)
    })

    audio_buffer = text_to_speech(text)

    return send_file(
        audio_buffer,
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3"
    )