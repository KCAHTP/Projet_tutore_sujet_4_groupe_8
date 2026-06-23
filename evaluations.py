from flask import Blueprint, request, jsonify
from modele_bdd import bdd, Evaluation
from datetime import datetime

eval_bp = Blueprint('evaluations', __name__)


# Route 1 : Lister toutes les évaluations
@eval_bp.route('/api/evaluations', methods=['GET'])
def get_evaluations():
    evaluations = Evaluation.query.all()
    result = []
    for e in evaluations:
        result.append({
            'id': e.id,
            'ec_id': e.ec_id,
            'classe_id': e.classe_id,
            'date': str(e.date),
            'type': e.type,
            'statut': e.statut
        })
    return jsonify(result)


# Route 2 : Modifier le statut d'une évaluation
@eval_bp.route('/api/evaluations/<int:id>', methods=['PUT'])
def update_evaluation(id):
    eval = Evaluation.query.get(id)
    if not eval:
        return jsonify({'message': "Cette évaluation n'a pas été trouvée"}), 404
    data = request.get_json()
    eval.statut = data.get('statut', eval.statut)
    bdd.session.commit()
    return jsonify({'message': 'Le statut a été mis à jour avec succès'})


# Route 3 : Ajouter une évaluation

@eval_bp.route('/api/evaluations', methods=['POST'])
def add_evaluation():
    data = request.get_json()
    nouvelle = Evaluation(
        ec_id=data['ec_id'],
        classe_id=data['classe_id'],
        date=datetime.strptime(data['date'], "%Y-%m-%d").date(),
        type=data['type'],
        statut=data['statut']
    )
    bdd.session.add(nouvelle)
    bdd.session.commit()
    return jsonify({'message': 'Evaluation ajoutée avec succès'})
