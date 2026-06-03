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

    faq_result = retrieve_faq(query)

    if faq_result is None:
        return jsonify({
            "success": False,
            "message": "No FAQ matched"
        }), 404

    return jsonify({
        "success": True,
        "data": faq_result
    })
