from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

# Identifiants admin (Pour la démonstration)

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({"message": "Connexion réussie", "success": True}), 200

    return jsonify({"message": "Identifiants incorrects", "success": False}), 401
