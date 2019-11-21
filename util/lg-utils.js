const fs = require('fs');
const path = require('path');

// global lg Object
Object.defineProperty(global, 'lg', {
	value: Object.create(null)
})

lg.logs = (err) => {
	console.log(err);
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
 * @param {Object} opt {url, data, method}
 */
lg.request = (opt) => {
	const url = new URL(opt.url)
	const protocolrequire = require(url.protocol.substr(0, protocol.length - 1))
	return new Promise((resolve, reject) => {
		protocolrequire.request({
			hostname: url.hostname,
			path: url.pathname,
			method: (opt.method || 'POST'),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(opt.data)
			}
		}, res => {
			let chunks = ''
			res.on('data', (chunk) => {
				chunks += chunk
			})
			res.on('end', () => {
				resolve(JSON.parse(chunks))
			})
		}).on('err', err => {
			reject(err)
		}).write(opt.data).end()
	})
}

lg.exist = (p) => (fs.existsSync || path.existsSync)(p);

/**
 * @param {Function} func A function need debounce
 * @param {String} delay debounce delay time
 */
lg.debounce = function(func, delay){
	var timeout;
	return function(...args) {
		clearTimeout(timeout)
		var context = this
		timeout = setTimeout(function(){
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