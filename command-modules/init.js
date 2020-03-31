module.exports = (program, args) => {
    program
        .action(function () {
            lgInit(arguments)
        })
}

function lgInit(args) {
    const fs = require('fs-extra');
    const path = require('path');
    const inquirer = require('inquirer');
    const ora = require('ora');
    const spinner = ora('Loading unicorns');
    const AdmZip = require('adm-zip');

    const gitapi = require('../util/git-api');

    lg.get(gitapi.templateRepo).then(res => {

        let analyzeRes = res.map(i => {
            return {
                name: i.name,
                id: i.id,
                downloadUrl: i.downloads_url,
                description: i.description
            }
        })

        const customOptions = [{
                type: 'list',
                message: 'Please select a template',
                name: 'templateName',
                choices: analyzeRes.map(i => i.name)
            },
            {
                type: 'input',
                message: 'Please input project name',
                name: 'name',
                validate(input = 'temp_project') {
                    var done = this.async();

                    lg.exist(path.resolve(process.cwd(), input)) && lg.logs(`the folder named ${input} is exist~`)

                    done(null, true)
                },
                default: `temp_project`
            },
            {
                type: 'input',
                message: 'Please input project version',
                name: 'version',
                default: `0.0.1`
            },
            {
                type: 'input',
                message: 'Please input author name',
                name: 'description',
                default: `Template project with lg-cli as the core`
            },
            {
                type: 'input',
                message: 'Please input author name',
                name: 'author',
                default: `longer`
            },
        ]

        inquirer
            .prompt(customOptions)
            .then(async answers => {
                const aimPath = path.resolve(process.cwd(), answers.templateName + '.zip')
                const aimWriter = fs.createWriteStream(aimPath)

                spinner.start()
                spinner.color = 'yellow';
                spinner.text = `A template called '${answers.templateName}' is downloading`

                await lg.download(gitapi.templateDownload(answers.templateName), aimWriter)
                spinner.stop();
                console.log('download finished')

                const zip = new AdmZip(aimPath)

                await zip.extractAllTo(process.cwd())

                fs.renameSync(path.resolve(process.cwd(), `${answers.templateName}-master`), path.resolve(process.cwd(), answers.name))
                fs.unlinkSync(aimPath)

                const writePath = path.resolve(process.cwd(), `${answers.name}/package.json`)
                let content = fs.readFileSync(writePath, 'utf8')
                const {
                    name,
                    version,
                    author,
                    description,
                } = answers
                content = Object.assign(JSON.parse(content), {
                    name,
                    version,
                    description,
                    author,
                });
                fs.writeFileSync(writePath, JSON.stringify(content))

                console.log(`You can now use a template called ${answers.name} 
                            \n 1. enter 'cd ${answers.name}' into the template
                            \n 2. enter 'npm install' access related dependencies
                            \n 3. use 'lg dev' to start it
                            \n For more operations, please see the lg documentation.`)

                process.exit(0)
            });
    }).catch(err => {
        console.log(err)
    })
}