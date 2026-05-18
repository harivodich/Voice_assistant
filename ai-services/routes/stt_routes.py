from flask import Blueprint, request, jsonify
from services.stt_service import speech_to_text
from utils.logger import get_logger

stt_bp = Blueprint("stt", __name__, url_prefix="/stt")

logger = get_logger('stt_routes')


@stt_bp.route("/transcribe", methods=["POST"])
def transcribe():
    logger.info('stt_request')

    if "audio" not in request.files:
        logger.warning('stt_no_audio')
        return jsonify({"success": False, "message": "Audio required"}), 400

    audio = request.files["audio"]

    logger.info('stt_file_received', extra={
        "filename": audio.filename
    })

    text = speech_to_text(audio)

    return jsonify({
        "success": True,
        "text": text
    })