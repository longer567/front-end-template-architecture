module.exports = (program, args) => {
  program
    .action(function () {
      devRun(arguments)
    })
}

async function devRun(args) {
  const fs = require('fs')
  const url = require('url')
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

  const compiler = webpack({
    ...configBase,
  })

  const devServer = new WebpackDevServer(compiler, {
    ...dev.devServer_config,
    before: mockLg(mockData, dev),
    after(app, server, compiler) {
      app.get('*.*', (req, res) => {
        fs.readFile(path.resolve(process.cwd(), './engine.js'), (err, data) => {
          if (err)
            lg.logs(err)
          res.end(data)
        })
      })
    }
  })

  devServer.listen(dev.devServer_config.port || 3001)
}