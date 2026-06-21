from flask import Blueprint, request, jsonify
from modele_bdd import bdd, EmploiDuTemps, Precedence, EC, Classe, Enseignant
from datetime import datetime

bp = Blueprint("main", __name__)


# HELPERS DE SÉRIALISATION

def serialize_emploi(e):
    return {
        "id": e.id,
        "ec_id": e.ec_id,
        "classe_id": e.classe_id,
        "enseignant_id": e.enseignant_id,
        "date": e.date.isoformat() if e.date else None,
        "heure_debut": e.heure_debut.isoformat() if e.heure_debut else None,
        "heure_fin": e.heure_fin.isoformat() if e.heure_fin else None,
    }


def serialize_precedence(p):
    return {
        "id": p.id,
        "ec_avant_id": p.ec_avant_id,
        "ec_apres_id": p.ec_apres_id,
    }


def serialize_ec(ec):
    return {
        "id": ec.id,
        "nom": ec.nom,
        "volume_horaire": ec.volume_horaire,
        "classe_id": ec.classe_id,
        "enseignant_id": ec.enseignant_id,
    }


def serialize_classe(c):
    return {"id": c.id, "nom": c.nom, "niveau": c.niveau}


def serialize_enseignant(en):
    return {"id": en.id, "nom": en.nom, "prenom": en.prenom}


# EMPLOIS DU TEMPS

@bp.route("/api/emplois-du-temps", methods=["GET"])
def liste_emplois():
    emplois = EmploiDuTemps.query.all()
    return jsonify([serialize_emploi(e) for e in emplois])


@bp.route("/api/emplois-du-temps", methods=["POST"])
def ajouter_emploi():
    data = request.get_json()
    nouvel_emploi = EmploiDuTemps(
        ec_id=data["ec_id"],
        classe_id=data["classe_id"],
        enseignant_id=data["enseignant_id"],
        date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
        heure_debut=datetime.strptime(data["heure_debut"], "%H:%M").time(),
        heure_fin=datetime.strptime(data["heure_fin"], "%H:%M").time(),
    )
    bdd.session.add(nouvel_emploi)
    bdd.session.commit()
    return jsonify(serialize_emploi(nouvel_emploi)), 201


@bp.route("/api/emplois-du-temps/<int:id>", methods=["DELETE"])
def supprimer_emploi(id):
    emploi = EmploiDuTemps.query.get_or_404(id)
    bdd.session.delete(emploi)
    bdd.session.commit()
    return jsonify({"message": "supprimé"}), 200


# PRÉCÉDENCES

@bp.route("/api/precedences", methods=["GET"])
def liste_precedences():
    precedences = Precedence.query.all()
    return jsonify([serialize_precedence(p) for p in precedences])


@bp.route("/api/precedences", methods=["POST"])
def ajouter_precedence():
    data = request.get_json()
    nouvelle_precedence = Precedence(
        ec_avant_id=data["ec_avant_id"],
        ec_apres_id=data["ec_apres_id"],
    )
    bdd.session.add(nouvelle_precedence)
    bdd.session.commit()
    return jsonify(serialize_precedence(nouvelle_precedence)), 201


@bp.route("/api/precedences/<int:id>", methods=["DELETE"])
def supprimer_precedence(id):
    precedence = Precedence.query.get_or_404(id)
    bdd.session.delete(precedence)
    bdd.session.commit()
    return jsonify({"message": "supprimé"}), 200


# ELEMENTS CONSTUTIFS

@bp.route("/api/ec", methods=["GET"])
def liste_ec():
    ecs = EC.query.all()
    return jsonify([serialize_ec(ec) for ec in ecs])


@bp.route("/api/ec", methods=["POST"])
def ajouter_ec():
    data = request.get_json()
    nouvel_ec = EC(
        nom=data["nom"],
        volume_horaire=data["volume_horaire"],
        classe_id=data["classe_id"],
        enseignant_id=data["enseignant_id"],
    )
    bdd.session.add(nouvel_ec)
    bdd.session.commit()
    return jsonify(serialize_ec(nouvel_ec)), 201


@bp.route("/api/ec/<int:id>", methods=["DELETE"])
def supprimer_ec(id):
    ec = EC.query.get_or_404(id)
    bdd.session.delete(ec)
    bdd.session.commit()
    return jsonify({"message": "supprimé"}), 200


# CLASSES et ENSEIGNANTS (Menu déroulant)

@bp.route("/api/classes", methods=["GET"])
def liste_classes():
    classes = Classe.query.all()
    return jsonify([serialize_classe(c) for c in classes])


@bp.route("/api/enseignants", methods=["GET"])
def liste_enseignants():
    enseignants = Enseignant.query.all()
    return jsonify([serialize_enseignant(en) for en in enseignants])

@bp.route("/api/enseignants", methods=["POST"])
def ajouter_enseignant():
    data = request.get_json()
    nouvel_enseignant = Enseignant(
        nom=data["nom"],
        prenom=data["prenom"],
        disponibilites=data.get("disponibilites"),
    )
    bdd.session.add(nouvel_enseignant)
    bdd.session.commit()
    return jsonify(serialize_enseignant(nouvel_enseignant)), 201