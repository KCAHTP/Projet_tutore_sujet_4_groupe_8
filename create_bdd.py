from flask import Flask
from modele_bdd import bdd

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///plateforme.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

bdd.init_app(app)

with app.app_context():
    bdd.create_all()
    print("Base de données créée.")

if __name__ == "__main__":
    app.run(debug=True)
