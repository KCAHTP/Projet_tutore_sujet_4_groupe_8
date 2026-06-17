from create_bdd import app
from modele_bdd import bdd, Classe

classes_data = [
    ("TC1", "L1"),
    ("TC2", "L2"),
    ("IRS", "L3"),
    ("ISI", "L3"),
    ("SISAD", "M1"),
    ("SISD", "M1"),
    ("RSCS", "M1"),
    ("RSCAR", "M1"),
    ("SISAD", "M2"),
    ("SISD", "M2"),
    ("RSCS", "M2"),
    ("RSCAR", "M2"),
]

with app.app_context():
    for nom, niveau in classes_data:
        existe = Classe.query.filter_by(nom=nom, niveau=niveau).first()
        if not existe:
            bdd.session.add(Classe(nom=nom, niveau=niveau))
    bdd.session.commit()
    print(f"{len(classes_data)} classes insérées (ou déjà présentes).")
