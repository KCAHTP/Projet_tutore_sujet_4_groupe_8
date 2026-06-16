from create_bdd import app
from modele_bdd import bdd, Classe

with app.app_context():
    classes = [
        Classe(nom="TC1", niveau="L1"),
        Classe(nom="TC2", niveau="L2"),
        Classe(nom="IRS", niveau="L3"),
        Classe(nom="ISI", niveau="L3"),
        Classe(nom="Sidsad", niveau="M1"),
        Classe(nom="RS", niveau="M1"),
        Classe(nom="Cybersecurite", niveau="M1"),
        Classe(nom="SI", niveau="M1"),
        Classe(nom="Sidsad", niveau="M2"),
        Classe(nom="RS", niveau="M2"),
        Classe(nom="Cybersecurite", niveau="M2"),
        Classe(nom="SI", niveau="M2"),
    ]
    bdd.session.add_all(classes)
    bdd.session.commit()
    print(f"{len(classes)} Classes insérées.")