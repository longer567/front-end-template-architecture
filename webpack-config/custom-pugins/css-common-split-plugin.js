class CssCommonSplitPlugin{
    constructor() {
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback)  => {
            for (let filename in compilation.assets) {
                    if (filename.endsWith('.css'))
                    {   
                        let temp_file_content = compilation.assets[filename].source();
                        console.log('css', temp_file_content)
                    }
              }
            callback()
        });
    }
}

module.exports = CssCommonSplitPlugin