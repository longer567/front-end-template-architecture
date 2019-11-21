class CssCommonSplitPlugin{
    constructor() {
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback)  => {
            for (let filename in compilation.assets) {
                    if (filename.endsWith('.css'))
                    {   
                        let temp_file_content = compilation.assets[filename].source();
                    }
              }
            callback()
        });
    }
}

module.exports = CssCommonSplitPlugin