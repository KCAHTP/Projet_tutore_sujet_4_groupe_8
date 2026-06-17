from flask import Blueprint, jsonify
from modele_bdd import Evaluation, EC
from datetime import date, timedelta

alerte_bp = Blueprint('alertes', __name__)


@alerte_bp.route('/alertes', methods=['GET'])
def get_alertes():
    alertes = []
    evaluations = Evaluation.query.all()
    tous_les_ec = EC.query.all()

    for e in evaluations:
        # Alerter si une évaluation est en retard
        if e.statut == 'planifiée' and e.date <= date.today():
            alertes.append({
                'type': 'RETARD',
                'message': f"Il y a un retard, l'évaluation numéro {e.id} était prévue le {e.date} mais n'a toujours pas été faite ! Il faudrait penser à la reprogrammer très vite",
                'evaluation_id': e.id
            })

        # Alerter si l'évaluation approche
        if e.statut == 'planifiée' and date.today() <= e.date <= date.today() + timedelta(days=3):
            alertes.append({
                'type': 'BIENTÔT',
                'message': f"L'évaluation numéro {e.id} est prévue dans moins de trois (03) jours !",
                'evaluation_id': e.id
            })

    # Alerter si une EC n'a pas encore d'évaluation programmée
    ec_avec_evaluation = [e.ec_id for e in evaluations]
    for ec in tous_les_ec:
        if ec.id not in ec_avec_evaluation:
            alertes.append({
                'type': 'NON PROGRAMMEE',
                'message': f"L'EC {ec.nom} n'a pas encore d'évaluation programmée !",
                'ec_id': ec.id
            })

    if not alertes:
        alertes.append({'message': 'Aucune alerte pour le moment, passez une excellente journée !'})

    return jsonify(alertes)
