const https = require('https')
const ora = require('ora')
const chalk = require('chalk');

const URLArr = [
    'tinypng.com',
    'tinyjpg.com'
]

const randomArr = (e) => e[Math.floor((Math.random(0, 1) * e.length))]

/**
 * @returns {Object} request options
 */
const randomReqHeaders = () => {
    const randomHost = randomArr(URLArr)
    const randomIp = (new Array(4).fill(0).map(i => Math.floor(Math.random(0, 1) * 255))).join('.')
    return {
        headers: {
            'Content-Type': 'application/octet-stream',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
            'X-Forwarded-For': randomIp,
            'Postman-Token': Date.now()
        },
        method: 'POST',
        hostname: randomHost,
        path: '/web/shrink',
        rejectUnauthorized: false
    }
}

/**
 * 
 * @param {Buffer} file file buffer 
 * @returns {Object} {input:{"size":Number,"type":String},"output":{"size":Number,"type":String,"width":Number,"height":Number,"ratio":Number,"url":String}}
 */
const upLoadImage = (file) => {
    const opt = randomReqHeaders()
    return new Promise((resolve) => {
        const req = https.request(opt, (res) => {
            let body = ''
            res.on('data', (chunk) => {
                body += chunk
            })
            res.on('end', () => {
                resolve(JSON.parse(body))
            })
        })
        req.write(file, 'binary')
        req.end()
    })
}
/**
 * 
 * @param {String} filePathName Online imageUrl pathName in 'tiny(jpg|png).com'
 * @returns {Buffer} compress img Buffer file
 */
const downLoadImage = (filePathName) => {
    return new Promise((resolve) => {
        const req = https.request({
            headers: {
                'responseType': 'blob'
            },
            hostname: randomHost,
            path: filePathName,
            method: 'GET'
        }, (res) => {
            res.setEncoding('binary')
            let imgData = ''
            res.on("data", chunk => {
                imgData += chunk;
            });
            res.on('end', () => {
                resolve(new Buffer(imgData, 'binary'))
            })
        })
        req.end()
    })
}

/**
 * 
 * @param {String} imgOriginBuffer Upload file buffer
 * @returns {Object} {
    imgCompressBuffer: Buffer,
    uploadFileResult: String
 * }
 */
const fileCompress = async (imgOriginBuffer) => {
    const uploadFileResult = await upLoadImage(imgOriginBuffer)
    const {
        output
    } = uploadFileResult
    const uploadOutputFileUrl = new URL(output.url)
    const filePathName = uploadOutputFileUrl.pathname
    const imgCompressBuffer = await downLoadImage(filePathName)
    return {
        imgCompressBuffer,
        uploadFileResult
    }
}

class compressImageLgPlugin{
    constructor(options) {
        this.options = options
        console.log(this.options)
    }

    apply(compiler) {
        compiler.plugin('emit', async (compilation, callback) => {
            const spinner = ora(`Compressed image start`).start();
            spinner.color = 'yellow';
            spinner.text = `Compressing image`;
            for (let filename in compilation.assets) {
                const file_element = filename.split('.').pop()
                if (['png', 'jpg'].includes(file_element)) {
                    let temp_file_content = compilation.assets[filename].source();
                    const options = this.options;

                    const {
                        imgCompressBuffer,
                        uploadFileResult
                    } = await fileCompress(temp_file_content)

                    compilation.assets[filename] = {
                        source: function () {
                            return imgCompressBuffer
                        },
                        size: function () {
                            return uploadFileResult.output.size
                        }
                    }

                    spinner.succeed(`Successfully compressed ${chalk.blueBright(filename)} image, the size changed from ${chalk.greenBright(Math.floor(uploadFileResult.input.size/1000))}kb to ${chalk.greenBright(Math.floor(uploadFileResult.output.size/1000))}kb`)
                }
            }

            callback()
        });
    }
}

module.exports = compressImageLgPlugin