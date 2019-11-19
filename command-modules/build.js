module.exports = (program, args) => {
    program
        .action(function () {
            devRun(arguments)
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
    const configBase = require('../webpack-config/config-base')('prod')
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
    });
}