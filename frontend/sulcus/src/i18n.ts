
namespace Sulcus {

	export interface SulcusCorpus {
		global_error: string
		, welcome_name: Gyrus.spfmPattern
		, welcome_name_short: ['Bienvenue § !', { n: 0 }]
		, disconnected: string
		, cancel: string
		, close: string
		, options: string
	}

	export let i18n_en: SulcusCorpus = {
		global_error: 'Une erreur est survenue, veuillez nous excuser pour le désagrément.'
		, welcome_name: Gyrus.spfm('Hello {0}')
		, welcome_name_short: ['Bienvenue § !', { n: 0 }]
		, disconnected: 'Vous avez été déconnecté et allez être dirigé vers la page d\'identification.'
		, cancel: 'Annuler'
		, close: 'Fermer'
		, options: 'Options'
	}

	export let i18n_fr: SulcusCorpus = {
		global_error: 'Une erreur est survenue, veuillez nous excuser pour le désagrément.'
		, welcome_name: Gyrus.spfm('Bonjour {0}')
		, welcome_name_short: ['Bienvenue § !', { n: 0 }]
		, disconnected: 'Vous avez été déconnecté et allez être dirigé vers la page d\'identification.'
		, cancel: 'Annuler'
		, close: 'Fermer'
		, options: 'Options'

	}
}





