from flask import Blueprint, request, jsonify
from modele_bdd.py import bdd, Evaluation

eval_bp = Blueprint('evaluations', __name__)

#Route 1 : Lister toutes les evaluations
@eval_bp.route('/evaluations', methods=['GET'])
def get_evaluations():
	evaluations = Evaluation.query.all()
	result = []
	for e in evaluations:
		result.append({ 'id': e.id, 'ec_id': e.ec_id, 'classe_id': e.classe_id, 'date': str(e.date), 'type': e.type, 'statut': e.statut })
	return jsonify(result)

#Route 2: Modifier le statut d'une evaluation(terminé, planifié, en cours, en retard)
@eval_bp.route('/evaluations/<int:id>',methods=['PUT'])
def update_evaluation(id):
	eval = Evaluation.query.get(id)
	if not eval:
		return jsonify( {'message': f"Cette Evaluation n'a pas été trouvé "}), 404
	data = request.get_json()
	eval.statut = data.get('statut', eval.statut)
	bdd.session.commit()
	return jsonify( {'message': 'Le statut a été mis à jour avec succès'})

#Route 3: Ajouter une évaluation
@eval_bp.route('/evaluations', methods=['POST'])
def add_evaluation():
	data = request.get_json()
	nouvelle = Evaluation(ec_id=data['ec_id'], classe_id=data['classe_id'], date=data['date'], type=data['type'], statut=data['statut'])
	bdd.session.add(nouuvelle)
	bdd.session.commit()
	return jsonify('mesage':'Evaluation ajoutée avec succès')
