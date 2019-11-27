const CLIEngine = require("eslint").CLIEngine;
const path = require('path')

const eslintFilePath = path.resolve(process.cwd(), 'eslint.js')
const eslintConfig = require(eslintFilePath)
const dectectionPath = (e) => path.resolve(process.cwd(), e)

const additionLintData = {}

const cli = new CLIEngine({
    baseConfig: eslintConfig.eslintArray[0].eslintData,
    ...additionLintData
});
const fileArr = eslintConfig.eslintArray[0].eslintFilePath.map(i => dectectionPath(i))
const report = cli.executeOnFiles(fileArr)

let resultGather = {
    warnings: [],
    errors: []
}

report.results.forEach(({
    filePath,
    messages,
    errorCount,
    warningCount,
    fixableErrorCount,
    fixableWarningCount
}) => {
    if (messages.length) {
        messages.forEach(({
            severity,
            line,
            column,
            ruleId,
            message
        }) => {
            if (severity === 1) {
                resultGather.warnings.push({
                    filePath,
                    line,
                    column,
                    ruleId,
                    message
                })
            } else if (severity === 2) {
                resultGather.errors.push({
                    filePath,
                    line,
                    column,
                    ruleId,
                    message
                })
            }
        })
    }
})

/**
 * 
 * @param {String} level level for detection entry (error || warning)
 * @param {Object} e detection entry ({
 *      filePath,
 *      ruleId,
 *      message,
 *      line,
 *      column,
 * })
 */
const formatResultGather = (level, {
    filePath,
    ruleId,
    message,
    line,
    column
}) => `${level}: ${message} (${ruleId})\n` + 
        `\n         At line:${line} and column:${column} of ${filePath}\n`

resultGatherText = {
    warningText: resultGather.warnings.map(i => formatResultGather('warning', i)),
    errorText: resultGather.errors.map(i => formatResultGather('error', i))
}

module.exports = resultGatherText