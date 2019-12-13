const chokidar = require('chokidar')
const Mock = require('mockjs')
const path = require('path')
const openBrowser = require('./openBrowser/open')

let beforePath = []

const saveDelay = 500;

const watcher = chokidar.watch(process.cwd(), {
    ignored: path.resolve(process.cwd(), './node_modules'),
    persistent: true,
    interval: 200,
})

const hooksListener = (app, data) => {
    const afterPath = data.apiList.map(i => i.url)
    const deletePath = beforePath.filter(t => !afterPath.find(i => i === t))

    deletePath.forEach(i => {
        app._router.stack.splice(app._router.stack.findIndex(t => t.path === i), 1)
    })

    const routeStack = app._router.stack

    const nowRoute = routeStack.map(i => i.route).filter(i => i !== undefined)
    // mockjs path, '*', '*.*', '_webpack_dev_server_'
    const nowRoutePath = nowRoute.map(i => i.path)

    data.apiList.forEach(({
        url
    }) => {
        const nowData = require(path.resolve(process.cwd(), 'mock.js')).apiList.find(i => i.url === url)
        if (!nowRoutePath.includes(data.prefix + url))
            app[nowData.method.toLocaleLowerCase()](data.prefix + url, (req, res) => {
                setTimeout(() => {
                    res.json(Mock.mock(nowData.handle))
                }, require(path.resolve(process.cwd(), 'mock.js')).delay);
            })
    })
}

const changeFile = (app, devBase, p) => {
    if (p.indexOf('mock.js') > -1) {
        delete require.cache[path.resolve(process.cwd(), 'mock.js')]
        hooksListener(app, require(path.resolve(process.cwd(), 'mock.js')))
    }

    whatFileControll(p, 'mock.js', devBase)     
}

const whatFileControll = (p, e, devBase) => p.indexOf(e) > -1 && openBrowser(`${devBase.devServer_config.https || 'http'}://${devBase.devServer_config.host || 'localhost'}:${devBase.devServer_config.port || '3001'}${devBase.path || '/'}`)

module.exports = (mockData, devBase) => (app, server, compiler) => {

    watcher.on('ready', () => {
        devBase.useMock && hooksListener(app, mockData)
    }).on('change', async p => {
        devBase.useMock && lg.debounce(changeFile, saveDelay)(app, devBase, p)
        whatFileControll(p, 'engine.js', devBase)
        console.log('file changed effectivation')
    })
}