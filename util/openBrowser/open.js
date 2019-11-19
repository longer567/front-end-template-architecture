const path = require('path')
const child_exec = require('child_process').exec

module.exports = (tabPath) =>
    child_exec(`osascript ${path.resolve(__dirname, './chromeInMac.applescript')} ${tabPath}`)