from flask import Blueprint, render_template, request, redirect, url_for
from modele_bdd import bdd, EmploiDuTemps, Precedence, EC, Classe, Enseignant

bp = Blueprint("main", __name__)


#EMPLOI DU TEMPS

@bp.route("/emplois-du-temps")
def liste_emplois():
    emplois = EmploiDuTemps.query.all()
    return render_template("emplois_du_temps.html", emplois=emplois)


@bp.route("/emplois-du-temps/ajouter", methods=["GET", "POST"])
def ajouter_emploi():
    if request.method == "POST":
        nouvel_emploi = EmploiDuTemps(
            ec_id=request.form["ec_id"],
            classe_id=request.form["classe_id"],
            enseignant_id=request.form["enseignant_id"],
            date=request.form["date"],
            heure_debut=request.form["heure_debut"],
            heure_fin=request.form["heure_fin"],
        )
        bdd.session.add(nouvel_emploi)
        bdd.session.commit()
        return redirect(url_for("main.liste_emplois"))
    ecs = EC.query.all()
    classes = Classe.query.all()
    enseignants = Enseignant.query.all()
    return render_template("ajouter_emploi.html", ecs=ecs, classes=classes, enseignants=enseignants)


@bp.route("/emplois-du-temps/supprimer/<int:id>")
def supprimer_emploi(id):
    emploi = EmploiDuTemps.query.get_or_404(id)
    bdd.session.delete(emploi)
    bdd.session.commit()
    return redirect(url_for("main.liste_emplois"))


#PRECEDENCES 

@bp.route("/precedences")
def liste_precedences():
    precedences = Precedence.query.all()
    return render_template("precedences.html", precedences=precedences)


@bp.route("/precedences/ajouter", methods=["GET", "POST"])
def ajouter_precedence():
    if request.method == "POST":
        nouvelle_precedence = Precedence(
            ec_avant_id=request.form["ec_avant_id"],
            ec_apres_id=request.form["ec_apres_id"],
        )
        bdd.session.add(nouvelle_precedence)
        bdd.session.commit()
        return redirect(url_for("main.liste_precedences"))
    ecs = EC.query.all()
    return render_template("ajouter_precedence.html", ecs=ecs)


@bp.route("/precedences/supprimer/<int:id>")
def supprimer_precedence(id):
    precedence = Precedence.query.get_or_404(id)
    bdd.session.delete(precedence)
    bdd.session.commit()
    return redirect(url_for("main.liste_precedences"))

# ELEMENTS CONSTITUTIFS

@bp.route("/ec")
def liste_ec():
    ecs = EC.query.all()
    return render_template("ec.html", ecs=ecs)
 
 
@bp.route("/ec/ajouter", methods=["GET", "POST"])
def ajouter_ec():
    if request.method == "POST":
        nouvel_ec = EC(
            nom=request.form["nom"],
            volume_horaire=request.form["volume_horaire"],
            classe_id=request.form["classe_id"],
            enseignant_id=request.form["enseignant_id"],
        )
        bdd.session.add(nouvel_ec)
        bdd.session.commit()
        return redirect(url_for("main.liste_ec"))
    classes = Classe.query.all()
    enseignants = Enseignant.query.all()
    return render_template("ajouter_ec.html", classes=classes, enseignants=enseignants)
 
 
@bp.route("/ec/supprimer/<int:id>")
def supprimer_ec(id):
    ec = EC.query.get_or_404(id)
    bdd.session.delete(ec)
    bdd.session.commit()
    return redirect(url_for("main.liste_ec"))
