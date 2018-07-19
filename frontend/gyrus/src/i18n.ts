
namespace Gyrus {

	export interface spfmPattern {
		(...a: any[]): string;
	}

	// TODO (4) : Check data coherency (texts added afterward)
	// TODO (5) : check pattern validity on creating spfPattern
	// spf : string pattern factory. See http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
	// multiple
	export let spfm = function (pattern: string): spfmPattern {
		return function (...args: any[]) {
			return pattern.replace(/{(\d+)}/g, function (_match, number) {
				return typeof args[number] !== 'undefined' ? args[number] : '(?)';
			});
		}
	}

	interface spf2Pattern {
		(v: number, m: number): string;
	}

	// value / maxValue pattern
	export let spf2 = function (pattern: string): spf2Pattern {
		return function (v: number, m: number) {
			return pattern.replace(/{(\d+)}/g, function (_match, number) {
				return number == 0 ? String(v) : String(m);
			});
		}
	}

	interface spf3Pattern {
		(v: number, m: number, r: number): string;
	}

	// value / maxValue / regain pattern
	export let spf3 = function (pattern: string): spf3Pattern {
		return function (v: number, m: number, r: number) {
			return pattern.replace(/{(\d+)}/g, function (_match, number) {
				if (number == 0) return String(v)
				else if (number == 1) return String(m)
				else return String(r);
			});
		}
	}

	interface GyrusCorpus {
		global_error: string
		, welcome_name: spfmPattern
		, welcome_name_short: ['Bienvenue § !', { n: 0 }]
		, disconnected: string
		, cancel: string
		, close: string
		, options: string
		, x_messages: string[]
		, detector: { canvas: string, webgl: string, workers: string, websocket: string, file_protocol: string }
		, websocket_connected: string
		, websocket_disconnected: string
		, loading: string
	}

	export let i18n_en: GyrusCorpus = {
		global_error: 'Une erreur est survenue, veuillez nous excuser pour le désagrément.'
		, welcome_name: spfm('Hello {0}')
		, welcome_name_short: ['Bienvenue § !', { n: 0 }]
		, disconnected: 'Vous avez été déconnecté et allez être dirigé vers la page d\'identification.'
		, cancel: 'Annuler'
		, close: 'Fermer'
		, options: 'Options'
		, x_messages: ['Unkown command', 'Server error', 'Database error', 'Session expired', 'Login error', 'Invalid captcha', 'Invalid code', 'Invalid mail', 'Name not available', 'Mail not available', 'Password is too weak']
		, detector: { canvas: 'Canvas', webgl: 'WebGl', workers: 'Workers', websocket: 'WebSocket', file_protocol: 'file:// protocol not allowed' }
		, websocket_connected: 'Websocket connected'
		, websocket_disconnected: 'Websocket disconnected'
		, loading: 'Loading'
	}

	export let i18n_fr: GyrusCorpus = {
		global_error: 'Une erreur est survenue, veuillez nous excuser pour le désagrément.'
		, welcome_name: spfm('Bonjour {0}')
		, welcome_name_short: ['Bienvenue § !', { n: 0 }]
		, disconnected: 'Vous avez été déconnecté et allez être dirigé vers la page d\'identification.'
		, cancel: 'Annuler'
		, close: 'Fermer'
		, options: 'Options'
		, x_messages: ['Commande inconnue', 'Erreur serveur', 'Erreur base de donnée', 'Session expirée', "Erreur d'identification", 'Captcha invalide', 'Code invalide', 'Email invalide', 'Nom indisponible', 'E-mail indisponible', 'Mot de passe trop faible']
		, detector: { canvas: 'Canvas', webgl: 'WebGl', workers: 'Workers', websocket: 'WebSocket', file_protocol: 'Protocole file:// non supporté' }
		, websocket_connected: 'Websocket connecté'
		, websocket_disconnected: 'Websocket déconnecté'
		, loading: 'Chargement'
	}

}

// current langage selection TODO (2) : dynamic configuration on page ? from server configuration ? from browser langage ?
let i18n = {
	gyrus: Gyrus.i18n_fr,
	sulcus: Sulcus.i18n_fr
}



