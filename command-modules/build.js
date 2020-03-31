module.exports = (program, args) => {
    program
        .action(function () {
            devRun(args)
        })
}

function devRun(args) {
    const path = require('path')
    if (!lg.exist(path.resolve(process.cwd(), './lg-config.js')))
        lg.logs("The 'lg-config.js' file is required to execute this command.")

    const webpack = require('webpack')
    const {
        CleanWebpackPlugin
    } = require('clean-webpack-plugin');

    const config = require(path.resolve(process.cwd(), './lg-config.js'))[args[3]]
    if (!config)
        lg.logs(`config ${args[3]} is not exist in lg-conofig.js`)

    const configBase = require('../webpack-config/config-base')([args[3]])
    configBase.plugins.unshift(new CleanWebpackPlugin())

    const compiler = webpack({
        ...configBase
    })

    const watching = compiler.watch({
        aggregateTimeout: 300,
    }, (err, stats) => {
        console.log(stats.toString({
            colors: true,
            chunks: true
        }))
        process.exit(0)
    })
}