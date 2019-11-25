const fs = require('fs');
const path = require('path');
const request = require('request')

// global lg Object
Object.defineProperty(global, 'lg', {
	value: Object.create(null)
})

// used log after exit project
lg.logs = (e) => {
	console.log(e);
	process.exit(0);
}

lg.get = (url, data = '') => {
	const protocol = (new URL(url)).protocol
	const protocolrequire = require(protocol.substr(0, protocol.length - 1))
	return new Promise((resolve, reject) => {
		protocolrequire.get(url, {
			headers: {
				'User-Agent': 'fendoudexiaolong'
			}
		}, res => {
			let chunks = ''
			res.on('data', (chunk) => {
				chunks += chunk
			})
			res.on('end', () => {
				resolve(JSON.parse(chunks))
			})

		}).on('error', (err) => {
			reject(err)
		})
	})
}

/**
 * @param {String} url download url
 * @typedef {fs.WriteStream} path download file writeStream to disk's position
 */
lg.download = (url, path) => {
	const protocol = (new URL(url)).protocol
	const protocolrequire = require(protocol.substr(0, protocol.length - 1))
	return new Promise((resolve, reject) => {
		request(url).pipe(path).on('close', (res) => {
			resolve(res)
		})
	})
}

lg.exist = (p) => (fs.existsSync || path.existsSync)(p);

/**
 * @param {Function} func A function need debounce
 * @param {String} delay debounce delay time
 */
lg.debounce = function (func, delay) {
	var timeout;
	return function (...args) {
		clearTimeout(timeout)
		var context = this
		timeout = setTimeout(function () {
			func.apply(context, args)
		}, delay)
	}
}

lg.mkdirsSync = (dirname) => {
	if (lg.exist(dirname)) {
		return true;
	} else {
		if (lg.mkdirsSync(path.dirname(dirname))) {
			fs.mkdirSync(dirname);
			return true;
		}
	}
}


module.exports = lg