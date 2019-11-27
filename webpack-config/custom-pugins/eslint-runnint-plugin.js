
/**
 * 
 * @param {Object} options env variable inject in files when webpack is ran 
 */
class EslineRunningPlugin{
    constructor(useEslint) {
        this.useEslint = useEslint
    }

    apply(compiler) {
        compiler.plugin('entryOption', (compilation, callback)  => {
            this.useEslint && lg.eslintRun()
        });
    }
}

module.exports = EslineRunningPlugin