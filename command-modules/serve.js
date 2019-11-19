module.exports = (program) => {
    // joyerCommandServe(args.splice(3))
    program
        .version('0.0.1')
        .option('<path> -p, --port <port>', 'serve open path in port')
        .action(function () {
            lgServe(arguments)
        })
}

function lgServe(args) {

    const handler = require('serve-handler');
    const http = require('http');
    const opn = require('opn');

    const options = args[args.length - 1];

    // cmd: 'jr serve' or cmd ' jr serve <path> ' or cmd 'jr serve <path> -p <port>
    if (process.argv.length === 3 || args[0].constructor === String) {
        if (!lg.exist(args[0]) && args[0].constructor === String)
            lg.logs(`path (${args[0]}) not found`)
        if ((!/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(options.P)) && options.P)
            lg.logs(`port (${options.P}) error!`)
        const server = http.createServer((request, response) => {
            // You pass two more arguments for config and middleware
            // More details here: https://github.com/zeit/serve-handler#options
            return handler(request, response, {
                public: `${args[0].constructor === String ? args[0] : ''}`
            });
        });
        server.listen(options.P ? options.P : 3000, () => {
            console.log(`Running at http://localhost:${options.P ? options.P : 3000}`);
            opn(`http://localhost:${options.P ? options.P : 3000}`);
        });
    }
}