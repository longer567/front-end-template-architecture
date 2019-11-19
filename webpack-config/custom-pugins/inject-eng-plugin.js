const path = require('path')
const fs = require('fs')

class InjectEngPlugin {
    /**
     * 
     * @param {String} assets_path engine.js inject path in html at dist
     */
    constructor(env) {
        this.env = env
    }

    apply(compiler) {
        compiler.plugin('emit', async (compilation, callback) => {

            const env_param = this.env
            const assets_path = require(path.resolve(process.cwd(), 'lg-config.js'))[env_param || 'prod'].publicPath

            const dir = path.resolve(process.cwd(), `dist`)
                env_param === 'prod' && !lg.exist(dir) && fs.mkdirSync(dir)
            
            // env_param !== 'prod' ? lg.exist(dir) && fs.rmdirSync(dir) : !lg.exist(dir) && fs.mkdirSync(dir)

            for (let filename in compilation.assets) {
                const file_element = filename.split('.').pop()
                if (['html'].includes(file_element)) {
                    const temp_file_content = compilation.assets[filename].source();
                    const inject_position = temp_file_content.indexOf('<head>') + 6

                    compilation.assets[filename] = {
                        source: function () {
                            return `${temp_file_content.slice(0, inject_position)}<script src='${assets_path}engine.js'></script> ${temp_file_content.slice(inject_position)}`
                        },
                        size: function () {
                            return compilation.assets[filename].length
                        }
                    }
                }

                // if webpack-dev-serve open
                // if (filename.indexOf('hot-update') <= -1)
                // {
                //     !lg.exist(path.resolve(dir, filename.split('/')[0])) && fs.mkdirSync(path.resolve(dir, filename.split('/')[0]))
                //     fs.writeFileSync(path.resolve(dir, filename), compilation.assets[filename].source())   
                // }
            }
            if (env_param === 'prod') {
                const readStream = fs.createReadStream(path.resolve(process.cwd(), 'engine.js'))
                const writeStream = fs.createWriteStream(path.resolve(process.cwd(), 'dist/engine.js'))

                await readStream.on('data', (data) => {
                    writeStream.write(data)
                })
            }

            callback()
        });
    }
}

module.exports = InjectEngPlugin