youtube-dl - get link to videos from youtube.com

# DESCRIPTION
 **youtube-dl** get link to download videos from youtube.com . 
It use only Java Script without jQuery and pyton program youtube-dl.

#EXAMPLE

/**
 * callback get information about video
 * @param {Object} e error
 * @param {Object} i information
 * @param {Object} [urlObj] best quality from urlMap
 */
 
function onGetMapDone ( e, i, urlObj ) {
	if ( e ) {
		console.log(e);
	} else {
		console.log(i);
		urlObj.getUrl(onGetUrlDone);
	}
}

/**
 * callback get video url
 * @param {Object} e error
 * @param {string} url
 */
 
function onGetUrlDone ( e, url ) {
	if ( e ) {
		console.log(e);
	} else {
		console.log(url);
	}
}

YoutubeDL.getInfo('https://www.youtube.com/watch?v=w8t9VK-5vt8', onGetMapDone);