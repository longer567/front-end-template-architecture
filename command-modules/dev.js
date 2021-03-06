module.exports = (program, args) => {
  program
    .action(function () {
      devRun(arguments)
    })
}

async function devRun(args) {
  const fs = require('fs')
  const path = require('path')
  const cwdPath = (filepath) => path.resolve(process.cwd(), filepath)
  if (!lg.exist(cwdPath('./lg-config.js')))
    lg.logs("The 'lg-config.js' file is required to execute this command.")

  const webpack = require('webpack')
  const configBase = require('../webpack-config/config-base')('dev')
  const WebpackDevServer = require('webpack-dev-server')
  const { dev } = require(cwdPath('./lg-config.js'))
  const mockData = require(cwdPath('./mock.js'))
  const mockLg = require('../util/mock-config')

  configBase.plugins.unshift(new webpack.HotModuleReplacementPlugin())

  const compiler = webpack({
    ...configBase
  })
  
  const devServer = new WebpackDevServer(compiler, {
    ...dev.devServer_config,
    before: mockLg(mockData, dev)
  })

  devServer.listen(dev.devServer_config.port || 3001)
}