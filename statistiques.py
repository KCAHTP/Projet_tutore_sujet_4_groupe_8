from flask import Blueprint, jsonify
from modele_bdd import Evaluation, Classe
from datetime import date

stats_bp = Blueprint('statistiques', __name__)

@stats_bp.route('/statistiques', methods=['GET'])
def get_statistiques():

	toutes = Evaluation.query.all()
	total = len(toutes)

	terminées = len([e for e in toutes if e.statut == 'terminée'])
	planifiées = len([e for e in toutes if e.statut == 'planifiée'])
	en_cours = len([e for e in toutes if e.statut == 'en cours'])
	en_retard= len([e for e in toutes if e.statut == 'planifiée' and e.date < date.today()])

#pourcentage d'avancement global
	if total > 0:
		pourcentage = round((terminées / total)*100, 2)
	else:
		pourcentage = 0

#Statistiques par classe
	classes = Classe.query.all()
	stats_par_classe = []
	for c in classes:
		evals_classe = [e for e in toutes if e.classe_id == c.id]
		total_classe = len(evals_classe)
		terminées_classe = len([e for e in evals_classe if e.statut == 'terminée'])

		if total_classe > 0:
			pourcentage_classe = round((terminées_classe / total_classe) * 100, 2)
		else:
			pourcentage_classe = 0
		stats_par_classe.append({
			 'classe': c.nom,
			 'total_evaluations': total_classe,
			 'terminées': terminées_classe,
			 'avancement': f"{pourcentage_classe}%"
		})
	return jsonify({
		 'total_evaluations': total,
		 'terminées': terminées,
		 'planifiées': planifiées,
		 'en_cours': en_cours,
		 'en_retard': en_retard,
		 'avancement_global': f"{pourcentage}%",
		 'statistiques_par_classe': stats_par_classe
	})

