/**
 * Created by Harry on 26.03.2015.
 */

'use strict';

/*eslint-disable camelcase*/

var urlDefObj = {
		id: null,
		error: null,
		format: {},
		ageGate: false,
		formatId: 0,
		needSig: false,
		sig: null,
		url: '',
		isLive: false,
		getUrl: getUrlFromObj
	},
	defaults = {
		method: 'GET',  // HTTP method to use, such as "GET", "POST", "PUT", "DELETE", etc.
		async: true,   // whether or not to perform the operation asynchronously
		headers: {},     // list of HTTP request headers
		type: 'text', // "", "arraybuffer", "blob", "document", "json", "text"
		data: null,   // data to send (plain object)
		timeout: 30000,  // amount of milliseconds a request can take before being terminated
		onload: null,   // callback when the request has successfully completed
		onerror: null,   // callback when the request has failed
		ontimeout: null    // callback when the author specified timeout has passed before the request could complete
	},
	defaultsKeys = Object.keys(defaults),
	getInfoCallback = null,
	getUrlCallback = null,
//in python library it is _formats array
	formats = {
		5: {ext: 'flv', width: 400, height: 240},
		6: {ext: 'flv', width: 450, height: 20},
		//13: {ext: '3gp'},
		17: {ext: '3gp', width: 176, height: 144},
		18: {ext: 'mp4', width: 640, height: 360},
		22: {ext: 'mp4', width: 1280, height: 720},
		34: {ext: 'flv', width: 640, height: 360},
		35: {ext: 'flv', width: 854, height: 480},
		36: {ext: '3gp', width: 320, height: 240},
		37: {ext: 'mp4', width: 1920, height: 1080},
		38: {ext: 'mp4', width: 4096, height: 3072},
		43: {ext: 'webm', width: 640, height: 360},
		44: {ext: 'webm', width: 854, height: 480},
		45: {ext: 'webm', width: 1280, height: 720},
		46: {ext: 'webm', width: 1920, height: 1080},
		59: {ext: 'mp4', width: 854, height: 480},
		78: {ext: 'mp4', width: 854, height: 480},


		//3d videos
		82: {ext: 'mp4', height: 360, formatNote: '3D', preference: -20},
		83: {ext: 'mp4', height: 480, formatNote: '3D', preference: -20},
		84: {ext: 'mp4', height: 720, formatNote: '3D', preference: -20},
		85: {ext: 'mp4', height: 1080, formatNote: '3D', preference: -20},
		100: {ext: 'webm', height: 360, formatNote: '3D', preference: -20},
		101: {ext: 'webm', height: 480, formatNote: '3D', preference: -20},
		102: {ext: 'webm', height: 720, formatNote: '3D', preference: -20},

		// Apple HTTP Live Streaming
		92: {ext: 'mp4', height: 240, formatNote: 'HLS', preference: -10},
		93: {ext: 'mp4', height: 360, formatNote: 'HLS', preference: -10},
		94: {ext: 'mp4', height: 480, formatNote: 'HLS', preference: -10},
		95: {ext: 'mp4', height: 720, formatNote: 'HLS', preference: -10},
		96: {ext: 'mp4', height: 1080, formatNote: 'HLS', preference: -10},
		132: {ext: 'mp4', height: 240, formatNote: 'HLS', preference: -10},
		151: {ext: 'mp4', height: 72, formatNote: 'HLS', preference: -10},

		////DASH mp4 video
		'133': {'ext': 'mp4', 'height': 240, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'134': {'ext': 'mp4', 'height': 360, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'135': {'ext': 'mp4', 'height': 480, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'136': {'ext': 'mp4', 'height': 720, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'137': {'ext': 'mp4', 'height': 1080, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'138': {'ext': 'mp4', 'format_note': 'DASH video', 'acodec': false, 'preference': -40}, // # Height can vary (https://github.com/rg3/youtube-dl/issues/4559)
		'160': {'ext': 'mp4', 'height': 144, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'264': {'ext': 'mp4', 'height': 1440, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'298': {'ext': 'mp4', 'height': 720, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'fps': 60, 'vcodec': 'h264'},
		'299': {'ext': 'mp4', 'height': 1080, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'fps': 60, 'vcodec': 'h264'},
		'266': {'ext': 'mp4', 'height': 2160, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'vcodec': 'h264'},
		//
		//		 	//Dash mp4 audio
		//			'139': {'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'vcodec': false, 'abr': 48, 'preference': -50, 'container': 'm4a_dash'},
		//			'140': {'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'vcodec': false, 'abr': 128, 'preference': -50, 'container': 'm4a_dash'},
		//			'141': {'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'vcodec': false, 'abr': 256, 'preference': -50, 'container': 'm4a_dash'},
		//
		//			//Dash webm
		'167': {'ext': 'webm', 'height': 360, 'width': 640, 'format_note': 'DASH video', 'acodec': false, 'container': 'webm', 'vcodec': 'VP8', 'preference': -40},
		'168': {'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'acodec': false, 'container': 'webm', 'vcodec': 'VP8', 'preference': -40},
		'169': {'ext': 'webm', 'height': 720, 'width': 1280, 'format_note': 'DASH video', 'acodec': false, 'container': 'webm', 'vcodec': 'VP8', 'preference': -40},
		'170': {'ext': 'webm', 'height': 1080, 'width': 1920, 'format_note': 'DASH video', 'acodec': false, 'container': 'webm', 'vcodec': 'VP8', 'preference': -40},
		'218': {'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'acodec': false, 'container': 'webm', 'vcodec': 'VP8', 'preference': -40},
		'219': {'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'acodec': false, 'container': 'webm', 'vcodec': 'VP8', 'preference': -40},
		'278': {'ext': 'webm', 'height': 144, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'container': 'webm', 'vcodec': 'VP9'},
		'242': {'ext': 'webm', 'height': 240, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'243': {'ext': 'webm', 'height': 360, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'244': {'ext': 'webm', 'height': 480, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'245': {'ext': 'webm', 'height': 480, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'246': {'ext': 'webm', 'height': 480, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'247': {'ext': 'webm', 'height': 720, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'248': {'ext': 'webm', 'height': 1080, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'271': {'ext': 'webm', 'height': 1440, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'272': {'ext': 'webm', 'height': 2160, 'format_note': 'DASH video', 'acodec': false, 'preference': -40},
		'302': {'ext': 'webm', 'height': 720, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'fps': 60, 'vcodec': 'VP9'},
		'303': {'ext': 'webm', 'height': 1080, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'fps': 60, 'vcodec': 'VP9'},
		'308': {'ext': 'webm', 'height': 1440, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'fps': 60, 'vcodec': 'VP9'},
		'313': {'ext': 'webm', 'height': 2160, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'vcodec': 'VP9'},
		'315': {'ext': 'webm', 'height': 2160, 'format_note': 'DASH video', 'acodec': false, 'preference': -40, 'fps': 60, 'vcodec': 'VP9'},
		//
		//			//Dash webm audio
		//			'171': {'ext': 'webm', 'vcodec': false, 'format_note': 'DASH audio', 'abr': 128, 'preference': -50},
		//			'172': {'ext': 'webm', 'vcodec': false, 'format_note': 'DASH audio', 'abr': 256, 'preference': -50},
		//
		//			//Dash webm audio with opus inside
		//			'249': {'ext': 'webm', 'vcodec': false, 'format_note': 'DASH audio', 'acodec': 'opus', 'abr': 50, 'preference': -50},
		//			'250': {'ext': 'webm', 'vcodec': false, 'format_note': 'DASH audio', 'acodec': 'opus', 'abr': 70, 'preference': -50},
		//			'251': {'ext': 'webm', 'vcodec': false, 'format_note': 'DASH audio', 'acodec': 'opus', 'abr': 160, 'preference': -50},

		//conn (unnamed)
		conn: {protocol: 'conn'},

		//RTMP (unnamed)
		rtmp: {protocol: 'rtmp'}
	},
	parseSig = true,
	dashArr = [],
	hashUrl = {}, info = {}, YoutubeDL = {};

/**
 * getting valid url for urlMap object
 * it's need if needSig = true
 * @param {function}  callback ( error, url )
 * @param {boolean} parseSignature on/od parsing signature if it need default true
 * @return {string} url to play
 */
function getUrlFromObj ( callback, parseSignature ) {
	parseSig = parseSignature !== false;
	getUrlCallback = callback || null;

	if ( this.needSig ) {
		getSig(this);
		return null;
	}
	onGetUrlDone(this.error, this);
	return this.url;
}

/**
 * parse url parse to object
 * @param {string}  url address from parse
 * @return {Object} result of parsing
 */
function urlToObj ( url ) {
	var results = {}, get, getVar, i,
		rx = new RegExp('^(([^:/\\?#]+):)?(//(([^:/\\?#]*)(?::([^/\\?#]*))?))?([^\\?#]*)(\\?([^#]*))?(#(.*))?$'),
		parts = rx.exec(url);

	get = parts[8].substring(1).split('&');
	for ( i = 0; i < get.length; i++ ) {
		getVar = get[i].split('=');
		results[getVar[0]] = getVar[1] || '';
	}
	return results;
}

/**
 * Method to send ajax requests.
 *
 * @param {string} url address
 * @param {Object} options Plain object with call parameters
 * @return {XMLHttpRequest|Boolean} false in case of wrong params
 */
function ajax ( url, options ) {
	var i, headersKeys, client;

	// init
	options = options || {};
	// valid non-empty string
	if ( url && (typeof url === 'string' || url instanceof String) && url.length > 0 ) {
		// plain object is given as param
		if ( options && typeof options === 'object' ) {
			// extend with default options
			for (i = 0; i < defaultsKeys.length; i++) {
				// in case not redefined
				if ( options[defaultsKeys[i]] === undefined ) {
					options[defaultsKeys[i]] = defaults[defaultsKeys[i]];
				}
			}
		}

		client = new XMLHttpRequest();
		// init a request
		client.open(options.method, url, options.async);

		// apply the given headers
		if ( options.headers && typeof options.headers === 'object' ) {
			headersKeys = Object.keys(options.headers);
			for ( i = 0; i < headersKeys.length; i++ ) {
				client.setRequestHeader(headersKeys[i], options.headers[headersKeys[i]]);
			}
		}

		// set response type and timeout
		client.responseType = options.type;
		client.timeout = options.timeout;

		// callbacks
		if ( options.onload && typeof options.onload === 'function' ) {
			client.onload = function () {
				options.onload.call(this, this.response || this.responseText, this.status);
			};
		}
		client.onerror = options.onerror;
		client.ontimeout = options.ontimeout;

		// actual request
		client.send(options.data ? options.data : null);

		return client;
	}
	return false;
}

/**
 * callback get information about video
 * @param {Object} e error
 * @param {Object} i information
 * @param {Object} [urlObj] best quality from urlMap
 */
function onGetMapDone ( e, i, urlObj ) {
	if ( typeof getInfoCallback === 'function' ) {
		getInfoCallback(e, i, urlObj);
	}
}

/**
 * callback get information about video
 * @param {Object} e error
 * @param {Object} urlObj from urlMap
 */
function onGetUrlDone ( e, urlObj ) {
	if ( typeof getUrlCallback === 'function' ) {
		urlObj = urlObj || {};
		getUrlCallback(e, urlObj.url);
	}
}

/**
 * set default values
 */
function clear () {
	hashUrl = {};
	dashArr = [];
	info = {
		ageGate: false,
		dash: false,
		author: '',
		description: '',
		lengthSeconds: 0,
		playerUrl: null,
		thumb: null,
		title: '',
		uploadDate: '',
		uploaderId: '',
		url: '', //recomended to play highest resolution
		urlMap: [],
		urlMapBad: [], //no supported formats
		videoId: null,
		viewCount: '',
		ypc_video_rental_bar_text: null,
		error: null
	};
}

/**
 * start getting urls map
 * @param {string} id video id
 */
function getUrls ( id ) {
	var url;

	clear();
	info.videoId = id;
	url = 'https://www.youtube.com/watch?v=' + info.videoId + '&gl=US&hl=en&has_verified=1&bpctr=9999999999';
	ajax(url, {onload: parseUrls});
}

/**
 * start parsing urls map
 * @param {String} responseText answer result
 */
function parseUrls ( responseText ) {
	var regExp;

	info.playerUrl = null;
	regExp = /swfConfig.*?"(https?:\/\/.*?watch.*?-.*?\.swf)"/;
	if ( responseText.search(regExp) !== -1 ) {
		info.error = {};
		info.error.message = 'Flash player is not supported';
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info, null);
		return;
	}

	regExp = /player-age-gate-content">/;

	if ( responseText.search(regExp) !== -1 ) {
		info.ageGate = true;
		ajax('https://www.youtube.com/embed/' + info.videoId, {onload: parseAgeGate});
		return null;
	}
	info.ageGate = false;
	parseInfo(responseText);
}

/**
 * get age_gate pages
 * @param {string} responseText answer result
 */
function parseAgeGate ( responseText ) {
	var regExp, matchObject, urlTemp, url;

	try {
		regExp = /<link itemprop="url" href="http:\/\/www.youtube.com\/(?:user|channel)\/([^"]+)">/;
		matchObject = regExp.exec(responseText);
		if ( matchObject ) {
			info.uploaderId = matchObject[1];
		} else {
			info.uploaderId = null;
		}

		regExp = /<span itemprop="thumbnail".*?href="(.*?)">/;
		matchObject = regExp.exec(responseText);
		if ( matchObject ) {
			info.thumb = matchObject[1];
		}

		regExp = /id="eow-date.*?>(.*?)<\/span>/;
		matchObject = regExp.exec(responseText);
		if ( matchObject ) {
			info.uploadDate = matchObject[1];
		} else {
			regExp = /id="watch-uploader-info".*?>.*?(?:Published|Uploaded|Streamed live) on (.*?)<\/strong>/;
			matchObject = regExp.exec(responseText);
			if (matchObject) {
				info.uploadDate = matchObject[1];
			} else {
				info.uploadDate = '';
			}
		}

		regExp = /<h4[^>]*>\s*Category\s*<\/h4>\s*<ul[^>]*>\s*(.*?)\s*<\/ul>/;
		matchObject = regExp.exec(responseText);
		if ( matchObject ) {
			regExp = /<a[^<]+>(.*?)<\/a>/g;
			matchObject = regExp.exec(matchObject[1]);
			if ( matchObject[1] ) {
				info.category = matchObject[1];
			}
		}


		regExp = /id="eow-description"[^>]*>(.*)?<\/p>/;
		matchObject = regExp.exec(responseText);
		if ( matchObject ) {
			info.description = matchObject[1];
		} else {
			regExp = /<meta name="description" content="([^"]+)"/;
			matchObject = regExp.exec(responseText);
			if (matchObject) {
				info.description = matchObject[1];
			} else {
				info.description = '';
			}
		}

		urlTemp = 'https://youtube.googleapis.com/v/' + info.videoId;
		urlTemp = encodeURIComponent(urlTemp);
		regExp = /sts":\s*(\d+)/;
		matchObject = regExp.exec(responseText);
		url = 'https://www.youtube.com/get_video_info?eurl=' + urlTemp + '&sts=' + matchObject[1] + '&video_id=' + info.videoId;
		ajax(url, {onload: function( unsw ) {
			parseInfoAge(unsw, responseText);
		}});
	} catch (e) {
		info.error = {};
		info.error.message = e.message;
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info);
	}


}

/**
 * parse age_gate pages
 * @param {string} responseText answer result
 * @param {string} embedPage answer result
 */
function parseInfoAge ( responseText, embedPage ) {
	var s1 = responseText.split(';'),
		videoInfo = {},
		getVar, get, i, j;

	try {
		for ( i = 0; i < s1.length; i++ ) {
			get = s1[i].split('&');
			for ( j = 0; j < get.length; j++ ) {
				getVar = get[j].split('=');
				videoInfo[getVar[0]] = getVar[1] || '';
			}
		}

		if ( videoInfo.view_count ) {
			info.viewCount = videoInfo.view_count;
		} else {
			info.viewCount = 0;
		}

		if ( videoInfo.author ) {
			info.author = videoInfo.author;
		} else {
			info.author = '';
		}

		if ( videoInfo.title ) {
			info.title = videoInfo.title;
		} else {
			info.title = '';
		}

		info.category = '';

		if ( videoInfo.length_seconds ) {
			info.lengthSeconds = parseInt(videoInfo.length_seconds, 10);
		} else {
			info.lengthSeconds = 0;
		}

		if ( videoInfo.ypc_video_rental_bar_text ) {
			info.ypc_video_rental_bar_text = videoInfo.ypc_video_rental_bar_text;
		} else {
			info.ypc_video_rental_bar_text = null;
		}

		if ( videoInfo.thumbnail_url ) {
			info.thumb = videoInfo.thumbnail_url;
		} else {
			info.thumb = null;
		}
		getPlayerInfo(responseText, videoInfo, embedPage);
	} catch (e) {
		info.error = {};
		info.error.message = e.message;
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info);
	}
}

/**
 * getting urls and info from response
 * @param {string} responseText answer result
 */
function parseInfo ( responseText )  {
	var regExp,	matchObject, ytplayerConfig,
		videoInfo;

	try {
		regExp = /;ytplayer\.config\s*=\s*({.*?});ytplayer/;
		matchObject = regExp.exec(responseText);
		if ( matchObject ) {
			ytplayerConfig = JSON.parse(matchObject[1]);
			videoInfo = ytplayerConfig.args;
		} else {
			info.dash = true;
			getDash();
			return;
		}

		getInfo(responseText, videoInfo);
		getPlayerInfo(responseText, videoInfo);
	} catch (e) {
		info.error = {};
		info.error.message = e.message;
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info);
	}
}


function getDash ( i ) {
	var arr = ['&el=info', '&el=embedded', '&el=detailpage', '&el=vevo', ''];

	i = i || 0;
	if ( i < arr.length ) {
		ajax('https://www.youtube.com/get_video_info?&video_id=' + info.videoId + arr[i] + '&ps=default&eurl=&gl=US&hl=en', {onload: function ( responseText ) {
			getDashLoad(responseText, i);
		}});
	} else if ( dashArr.length === 0 ) {
		info.error = {};
		info.error.message = '"token" parameter not in video info for unknown reason and no dash';
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info, null);
	} else {

	}
}

function getDashLoad ( responseText, c ) {
	var s1 = responseText.split(';'),
		videoInfo = {},
		getVar, get, i, j;

	for ( i = 0; i < s1.length; i++ ) {
		get = s1[i].split('&');
		for ( j = 0; j < get.length; j++ ) {
			getVar = get[j].split('=');
			videoInfo[getVar[0]] = getVar[1] || '';
		}
	}

	if ( videoInfo.token ) {
		if ( videoInfo.view_count ) {
			info.viewCount = videoInfo.view_count;
		} else {
			info.viewCount = 0;
		}

		if ( videoInfo.author ) {
			info.author = videoInfo.author;
		} else {
			info.author = '';
		}

		if ( videoInfo.title ) {
			info.title = videoInfo.title;
		} else {
			info.title = '';
		}

		info.category = '';

		if ( videoInfo.length_seconds ) {
			info.lengthSeconds = parseInt(videoInfo.length_seconds, 10);
		} else {
			info.lengthSeconds = 0;
		}

		if ( videoInfo.ypc_video_rental_bar_text ) {
			info.ypc_video_rental_bar_text = videoInfo.ypc_video_rental_bar_text;
		} else {
			info.ypc_video_rental_bar_text = null;
		}

		if ( videoInfo.thumbnail_url ) {
			info.thumb = videoInfo.thumbnail_url;
		} else {
			info.thumb = null;
		}

		if ( videoInfo.use_cipher_signature ) {
			if ( videoInfo.dashmpd ) {
				dashArr.push(decodeURIComponent(videoInfo.dashmpd));
			}
		}
		getPlayerInfo(responseText, videoInfo);
	} else {
		getDash(++c);
	}
}

/**
 * getting info from response
 * @param {string} responseText answer result
 * @param {Object} videoInfo parsed info
 */
function getInfo ( responseText, videoInfo ) {
	var regExp, matchObject;

	if ( videoInfo.view_count ) {
		info.viewCount = videoInfo.view_count;
	} else {
		info.viewCount = 0;
	}

	if ( videoInfo.author ) {
		info.author = videoInfo.author;
	} else {
		info.author = '';
	}

	regExp = /<link itemprop="url" href="http:\/\/www.youtube.com\/(?:user|channel)\/([^"]+)">/;
	matchObject = regExp.exec(responseText);
	if ( matchObject ) {
		info.uploaderId = matchObject[1];
	} else {
		info.uploaderId = null;
	}

	if ( videoInfo.title ) {
		info.title = videoInfo.title;
	} else {
		info.title = '';
	}

	regExp = /<span itemprop="thumbnail".*?href="(.*?)">/;
	matchObject = regExp.exec(responseText);
	if ( matchObject ) {
		info.thumb = matchObject[1];
	} else {
		if ( videoInfo.thumbnail_url ) {
			info.thumb = videoInfo.thumbnail_url;
		} else {
			info.thumb = null;
		}
	}

	regExp = /id="eow-date.*?>(.*?)<\/span>/;
	matchObject = regExp.exec(responseText);
	if ( matchObject ) {
		info.uploadDate = matchObject[1];
	} else {
		regExp = /id="watch-uploader-info".*?>.*?(?:Published|Uploaded|Streamed live) on (.*?)<\/strong>/;
		matchObject = regExp.exec(responseText);
		if (matchObject) {
			info.uploadDate = matchObject[1];
		} else {
			info.uploadDate = '';
		}
	}

	info.category = '';
	regExp = /<h4[^>]*>\s*Category\s*<\/h4>\s*<ul[^>]*>\s*(.*?)\s*<\/ul>/;
	matchObject = regExp.exec(responseText);
	if ( matchObject ) {
		regExp = /<a[^<]+>(.*?)<\/a>/g;
		matchObject = regExp.exec(matchObject[1]);
		if (matchObject[1]) {
			info.category = matchObject[1];
		}
	}


	regExp = /id="eow-description"[^>]*>(.*)?<\/p>/;
	matchObject = regExp.exec(responseText);
	if ( matchObject ) {
		info.description = matchObject[1];
	} else {
		regExp = /<meta name="description" content="([^"]+)"/;
		matchObject = regExp.exec(responseText);
		if (matchObject) {
			info.description = matchObject[1];
		} else {
			info.description = '';
		}
	}

	if ( videoInfo.length_seconds ) {
		info.lengthSeconds = parseInt(videoInfo.length_seconds, 10);
	} else {
		info.lengthSeconds = 0;
	}


	if ( videoInfo.ypc_video_rental_bar_text ) {
		info.ypc_video_rental_bar_text = videoInfo.ypc_video_rental_bar_text;
	} else {
		info.ypc_video_rental_bar_text = null;
	}
}

/**
 * getting video urls and players from response
 * @param {string} responseText answer result
 * @param {Object} videoInfo parsed info
 * @param {string} embedPage answer result
 */
function getPlayerInfo ( responseText, videoInfo, embedPage ) {
	var encodedUrlMap, tempStr, hashes,
		hash, tempUrl, format, regExp,
		matchObject, jsplayerUrlJson = null,
		encodedUrlMapArray, tempObj, isLive,
		j, i;

	if ( videoInfo.livestream == 1 || videoInfo.live_playback == 1 ) {
		isLive = true;
	}

	if ( !videoInfo.token ) {
		if ( videoInfo.reason ) {
			info.error = {};
			info.error.message = 'YouTube said: ' + videoInfo.reason;
			info.error.videoId = info.videoId;
		} else {
			info.error = {};
			info.error.message = '"token" parameter not in video info for unknown reason';
			info.error.videoId = info.videoId;
		}
		onGetMapDone(info.error, info);
		return;
	}

	if ( 'ypc_video_rental_bar_text' in videoInfo && !info.author ) {
		info.error = {};
		info.error.message = '"rental" videos not supported';
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info);
		return;
	}


	if ( videoInfo.conn && videoInfo.conn[0] ) {
		info.url = videoInfo.conn[0];
		info.urlMap = [
			Object.create(urlDefObj)
		];
		info.urlMap[0].url = info.url;
		info.urlMap[0].isLive = isLive;
		info.urlMap.format = formats.conn;
		onGetMapDone(info.error, info, info.urlMap[0]);
		return;
	}

	info.urlMap = [];

	if ( 'rtmpe%3Dyes' in videoInfo ) {
		info.error = {};
		info.error.message = 'rtmpe downloads are not supported';
		info.error.videoId = info.videoId;
		onGetMapDone(info.error, info);
		return;
	}

	if ( videoInfo.url_encoded_fmt_stream_map || videoInfo.adaptive_fmts ) {
		encodedUrlMap = (videoInfo.url_encoded_fmt_stream_map || '') + ',' + (videoInfo.adaptive_fmts || '');
		encodedUrlMapArray = encodedUrlMap.split(',');
		for ( i in encodedUrlMapArray ) {
			tempUrl = '';
			format = {};
			if ( !encodedUrlMapArray[i] ) {
				continue;
			}
			if ( info.ageGate || info.dash ) {
				tempStr = decodeURIComponent(encodedUrlMapArray[i]);
			} else {
				tempStr = encodedUrlMapArray[i];
			}
			hashes = tempStr.slice(tempStr.indexOf('?') + 1).split('&');
			tempStr = [];
			for ( j = 0; j < hashes.length; j++ ) {
				hash = hashes[j].split('=');
				tempStr.push(hash[0]);
				tempStr[hash[0]] = decodeURI(hash[1]);
			}
			if ( 'itag' in tempStr && 'url' in tempStr ) {
				format = tempStr.itag;
				tempUrl = decodeURI(decodeURI(decodeURIComponent(tempStr.url.replace(/\+/g, '%20'))));
				if ( format in formats ) {
					if ( 'ratebypass' in tempStr ) {
						tempUrl += '&ratebypass=yes';
					}
					if ( 'sig' in  tempStr ) {
						tempUrl += '&signature=' + tempStr.sig;
					} else {
						if ( 's' in tempStr ) {
							regExp = /"assets":.+?"js":\s*("[^"]+")/;
							matchObject = regExp.exec(embedPage? embedPage : responseText);
							if ( matchObject && matchObject[1] ) {
								jsplayerUrlJson = matchObject[1];
								regExp = /"(.*)"/;
								matchObject = regExp.exec(jsplayerUrlJson);
								if ( matchObject && matchObject[1] ) {
									jsplayerUrlJson = matchObject[1];
								}
							}
							if ( !jsplayerUrlJson ) {
								return;
							}
							tempObj = Object.create(urlDefObj, {
								format: {value: formats[format]},
								formatId: {value: parseInt(format, 10)},
								sig: {value: tempStr.s},
								playerUrl: {value: jsplayerUrlJson}
							});
							tempObj.url = tempUrl;
							tempObj.needSig = true;
							tempObj.isLive = isLive;
							info.urlMap.push(tempObj);
							continue;
						}
					}
					tempObj = Object.create(urlDefObj, {
						format: {value: formats[format]},
						formatId: {value: parseInt(format, 10)},
						sig: {value: tempStr.s},
						playerUrl: {value: jsplayerUrlJson}
					});
					tempObj.url = tempUrl;
					tempObj.needSig = false;
					tempObj.isLive = isLive;
					info.urlMap.push(tempObj);

				} else {
					tempObj = Object.create(urlDefObj, {
						format: {value: formats[format]},
						formatId: {value: parseInt(format, 10)},
						sig: {value: tempStr.s},
						playerUrl: {value: jsplayerUrlJson}
					});
					tempObj.url = tempUrl;
					tempObj.needSig = false;
					tempObj.isLive = isLive;
					info.urlMapBad.push(tempObj);
				}

			}
		}
		if ( info.urlMap.length ) {
			info.urlMap.sort(function (a, b) {
				if (a.formatId < b.formatId) {
					return -1;
				}
				if (a.formatId > b.formatId) {
					return 1;
				}
				return 0;
			});

			info.urlMap.sort(function (a, b) {
				if (a.format.height > b.format.height) {
					return -1;
				}
				if (a.format.height < b.format.height) {
					return 1;
				}
				return 0;
			});
			info.url = info.urlMap[0].needSig ? null : info.urlMap[0].url;
			onGetMapDone(info.error, info, info.urlMap[0]);
			return;
		}
		onGetMapDone(info.error, info);
		return;

	}

	if ( videoInfo.hlsvp ) {
		ajax(decodeURIComponent(videoInfo.hlsvp), {onload: function ( unsw ) {
			parsseM3U(unsw);
		}});
		return;
	}
}

function parsseM3U ( responseText ) {
	var tempArr = responseText.split('\n'),
		tempObj = null,
		tempNumber = 0,
		i;

	for ( i = 0; i < tempArr.length; i++ ) {
		if ( tempArr[i].startsWith('#') ) {
			continue;
		}
		tempNumber = /itag\/(\d+?)\//.exec(tempArr[i]);
		if ( tempNumber && tempNumber.length >= 2 ) {
			tempNumber = tempNumber[1];
		}
		if ( tempNumber in formats ) {
			tempObj = Object.create(urlDefObj, {
				format: {value: formats[tempNumber]},
				formatId: {value: parseInt(tempNumber, 10)},
				sig: {value: ''},
				playerUrl: {value: ''}
			});
			tempObj.url = tempArr[i];
			tempObj.needSig = false;
			info.urlMap.push(tempObj);
		} else {
			tempObj = Object.create(urlDefObj, {
				format: {value: formats[tempNumber]},
				formatId: {value: parseInt(tempNumber, 10)},
				sig: {value: ''},
				playerUrl: {value: ''}
			});
			tempObj.url = tempArr[i];
			tempObj.needSig = false;
			info.urlMapBad.push(tempObj);
		}
	}

	if ( info.urlMap.length ) {
		info.urlMap.sort(function (a, b) {
			if (a.formatId < b.formatId) {
				return -1;
			}
			if (a.formatId > b.formatId) {
				return 1;
			}
			return 0;
		});

		info.urlMap.sort(function (a, b) {
			if (a.format.height > b.format.height) {
				return -1;
			}
			if (a.format.height < b.format.height) {
				return 1;
			}
			return 0;
		});
		info.url = info.urlMap[0].needSig ? null : info.urlMap[0].url;
		onGetMapDone(info.error, info, info.urlMap[0]);
		return;
	}
	onGetMapDone(info.error, info);
}


/**
 * get signature from urlMap object
 * @param {Object} obj from urlMap
 * @return {boolean} no errors
 */
function getSig ( obj ) {
	var encryptedSig, regExp, matchObject, playerUrl, hashes, hash, i;

	encryptedSig = obj.sig;
	playerUrl = obj.playerUrl;
	if (!playerUrl) {
		obj.error = {};
		obj.error.videoId = info.videoId;
		obj.error.message = 'Cannot decrypt signature without player_url';
		obj.error.playerUrl = obj.playerUrl;
		onGetUrlDone(obj.error, obj);
		return false;
	}
	playerUrl = playerUrl.replace(/\\\//g, '/');
	if (playerUrl.indexOf('//') === 0) {
		playerUrl = 'https:' + playerUrl;
	}
	hashes = encryptedSig.split('.');
	hash = [];
	for ( i in hashes ) {
		hash.push(hashes[i].length);
	}
	hash = hash.join('.');
	hash = playerUrl + '_' + hash;
	if (!(hash in hashUrl)) {
		regExp = /.*?-([a-zA-Z0-9_-]+)(?:\/watch_as3|\/html5player(?:-new)?|\/base)?\.([a-z]+)$/;
		matchObject = regExp.exec(playerUrl);
		if (!matchObject || !matchObject[2]) {
			obj.error = {};
			obj.error.videoId = info.videoId;
			obj.error.message = 'Cannot identify player';
			obj.error.playerUrl = obj.playerUrl;
			onGetUrlDone(obj.error, obj);
			return false;
		}
		if (matchObject[2] === 'js') {
			if ( parseSig !== false ) {
				ajax(playerUrl, {onload: getSigParseJS});
				return true;
			} else {
				obj.error = {};
				obj.error.videoId = info.videoId;
				obj.error.message = 'Parsing signature is off';
				obj.error.playerUrl = obj.playerUrl;
				onGetUrlDone(obj.error, obj);
				return false;
			}
		}
		if (matchObject[2] === 'swf') {
			obj.error = {};
			obj.error.videoId = info.videoId;
			obj.error.message = 'Flash player is not supported';
			obj.error.playerUrl = obj.playerUrl;
			onGetUrlDone(obj.error, obj);
			return false;
		}
		obj.error = {};
		obj.error.videoId = info.videoId;
		obj.error.playerUrl = obj.playerUrl;
		obj.error.message = 'Player type is not detected';
		onGetUrlDone(obj.error, obj);
	} else {
		obj.url += '&signature=' + hashUrl[hash];
		onGetUrlDone(obj.error, obj);
	}

	function getSigParseJS ( responseText ) {
		var jsplayer, func;

		regExp = /\.sig\|\|([a-zA-Z0-9$]+)\(/;
		matchObject = regExp.exec(responseText);
		responseText = responseText.replace(/}\)\(\);$/m, '');
		try {
			//responseText = '(function(){' + responseText;
			//responseText += 'return ' + matchObject[1] + '("' + obj.sig + '");})()';
			responseText += 'return ' + matchObject[1] + '("' + obj.sig + '");} func1.call(window,{});';
			responseText = responseText.replace('var _yt_player={};(function', 'var _yt_player={};function func1');
			//console.log(responseText);
			/*eslint-disable no-eval */
			//var navigator = window.navigator;navigator.platform = "Linux sh4";
			jsplayer = eval(responseText);
			//func = eval(responseText);
			//jsplayer = func.call(window, {});
			/*eslint-enable no-eval */
		} catch (e) {
			obj.error = {};
			obj.error.videoId = info.videoId;
			obj.error.playerUrl = obj.playerUrl;
			obj.error.message = e.message;
			onGetUrlDone(obj.error, obj);
			return;
		}
		hashUrl[hash] = jsplayer;
		obj.url += '&signature=' + jsplayer;
		obj.needSig = false;
		onGetUrlDone(obj.error, obj);
	}

	return true;
}


/**
 * enter point to start getting and parsing information about video
 * @param {string} str link to video or video id
 * @param {function} callback ( error, information, bestFormat object )
 * @return {boolean} no any errors
 */
YoutubeDL.getInfo = function ( str, callback ) {
	var urlObj = {};

	getInfoCallback = callback || null;
	if ( str && str.indexOf('http') === 0 ) {
		urlObj = urlToObj(str);
		if (!urlObj.v) {
			info.error = {};
			info.error.videoId = info.videoId;
			info.error.message = 'URL has not video id';
			return false;
		}
	} else {
		urlObj.v = str;
	}
	getUrls(urlObj.v);
	return true;
};


module.exports = YoutubeDL;
