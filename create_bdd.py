from flask import Flask
from modele_bdd import bdd
from routes import bp
from alertes import alerte_bp
from evaluations import eval_bp
from statistiques import stats_bp
from flask_cors import CORS
import os
from auth import auth_bp

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///plateforme.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

bdd.init_app(app)
app.register_blueprint(bp)
app.register_blueprint(alerte_bp)
app.register_blueprint(eval_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(auth_bp)

with app.app_context():
    bdd.create_all()
    print("Base de données créée.")

if __name__ == "__main__":
    app.run(debug=True)
