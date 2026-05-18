from flask import Blueprint, request
from flask import jsonify
from services.faq_service import retrieve_faq

faq_bp = Blueprint("faq_bp", __name__)


@faq_bp.route("/faq", methods=["POST"])
def faq_route():
    data = request.get_json()

    query = data.get("query", "")

    if not query:
        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400

    intent = retrieve_faq(query)

    return jsonify({
        "success": True,
        "intent": intent
    })