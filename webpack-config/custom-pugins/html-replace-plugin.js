/**
 * 
 * @param {Object} options env variable inject in files when webpack is ran 
 */
class HtmlReplacePlugin {
    constructor(options) {
        this.options = options
        console.log(this.options)
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {
            for (let filename in compilation.assets) {
                const file_element = filename.split('.').pop()
                if (['html', 'js'].includes(file_element)) {
                    let temp_file_content = compilation.assets[filename].source();
                    const options = this.options;

                    for (let option_item in options) {
                        temp_file_content = (Buffer.isBuffer(temp_file_content) ? temp_file_content.toString('utf8') : temp_file_content).replace(new RegExp(`LG_CONFIG_${option_item.toUpperCase()}`, 'g'), options[option_item])
                    }

                    compilation.assets[filename] = {
                        source: function () {
                            return temp_file_content
                        },
                        size: function () {
                            return compilation.assets[filename].length
                        }
                    }
                }
            }

            callback()
        });
    }
}

module.exports = HtmlReplacePlugin