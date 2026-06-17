from create_bdd import app
from modele_bdd import bdd, Classe

with app.app_context():
    Classe.query.delete()
    bdd.session.commit()
    print("Toutes les classes supprimées.")