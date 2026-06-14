from flask_sqlalchemy import SQLAlchemy

bdd = SQLAlchemy()


class Classe(bdd.Model):
    __tablename__ = "Classe"

    id = bdd.Column(bdd.Integer, primary_key=True)
    nom = bdd.Column(bdd.String(100), nullable=False)
    niveau = bdd.Column(bdd.String(50), nullable=False)

    ecs = bdd.relationship("EC", backref="classe", lazy=True)
    emplois_du_temps = bdd.relationship("EmploiDuTemps", backref="classe", lazy=True)


class Enseignant(bdd.Model):
    __tablename__ = "Enseignant"

    id = bdd.Column(bdd.Integer, primary_key=True)
    nom = bdd.Column(bdd.String(100), nullable=False)
    prenom = bdd.Column(bdd.String(100), nullable=False)
    disponibilites = bdd.Column(bdd.Text, nullable=True)

    ecs = bdd.relationship("EC", backref="enseignant", lazy=True)
    emplois_du_temps = bdd.relationship("EmploiDuTemps", backref="enseignant", lazy=True)


class EC(bdd.Model):
    __tablename__ = "EC"

    id = bdd.Column(bdd.Integer, primary_key=True)
    nom = bdd.Column(bdd.String(150), nullable=False)
    volume_horaire = bdd.Column(bdd.Integer, nullable=False)
    classe_id = bdd.Column(bdd.Integer, bdd.ForeignKey("Classe.id"), nullable=False)
    enseignant_id = bdd.Column(bdd.Integer, bdd.ForeignKey("Enseignant.id"), nullable=False)

    emplois_du_temps = bdd.relationship("EmploiDuTemps", backref="ec", lazy=True)
    evaluations = bdd.relationship("Evaluation", backref="ec", lazy=True)
    precedences_avant = bdd.relationship(
        "Precedence", foreign_keys="Precedence.ec_avant_id", backref="ec_avant", lazy=True
    )
    precedences_apres = bdd.relationship(
        "Precedence", foreign_keys="Precedence.ec_apres_id", backref="ec_apres", lazy=True
    )


class Precedence(bdd.Model):
    __tablename__ = "Precedence"

    id = bdd.Column(bdd.Integer, primary_key=True)
    ec_avant_id = bdd.Column(bdd.Integer, bdd.ForeignKey("EC.id"), nullable=False)
    ec_apres_id = bdd.Column(bdd.Integer, bdd.ForeignKey("EC.id"), nullable=False)


class EmploiDuTemps(bdd.Model):
    __tablename__ = "EmploiDuTemps"

    id = bdd.Column(bdd.Integer, primary_key=True)
    ec_id = bdd.Column(bdd.Integer, bdd.ForeignKey("EC.id"), nullable=False)
    classe_id = bdd.Column(bdd.Integer, bdd.ForeignKey("Classe.id"), nullable=False)
    enseignant_id = bdd.Column(bdd.Integer, bdd.ForeignKey("Enseignant.id"), nullable=False)
    date = bdd.Column(bdd.Date, nullable=False)
    heure_debut = bdd.Column(bdd.Time, nullable=False)
    heure_fin = bdd.Column(bdd.Time, nullable=False)


class Evaluation(bdd.Model):
    __tablename__ = "Evaluation"

    id = bdd.Column(bdd.Integer, primary_key=True)
    ec_id = bdd.Column(bdd.Integer, bdd.ForeignKey("EC.id"), nullable=False)
    classe_id = bdd.Column(bdd.Integer, bdd.ForeignKey("Classe.id"), nullable=False)
    date = bdd.Column(bdd.Date, nullable=True)
    type = bdd.Column(bdd.String(50), nullable=False)
    statut = bdd.Column(bdd.String(50), nullable=False, default="planifie")
