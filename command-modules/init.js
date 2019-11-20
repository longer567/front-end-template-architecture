module.exports = (program, args) => {
    program
        .action(function () {
            lgInit(arguments)
        })
}

function lgInit(args) {

    // read template repository
    lg.get('https://api.github.com/orgs/elegantTemplate/repos').then(res => {
        const inquirer = require('inquirer');

        let analyzeRes = res.map(i => {
            return {
                name: i.name,
                id: i.id
            }
        })
        inquirer
            .prompt([
                /* Pass your questions in here */
                {
                    type: 'list',
                    message: 'Please select a template',
                    name: 'templateName',
                    choices: analyzeRes.map(i => i.name)
                }
            ])
            .then(answers => {
                const git = require('nodegit');
                const ora = require('ora');
                const spinner = ora('Loading unicorns');

                if (lg.exist(`./${answers.templateName}`))
                    lg.logs(`${answers.templateName} already exists`)

                spinner.start()
                spinner.color = 'yellow';
                spinner.text = `A template called '${answers.templateName}' is downloading`;

                git.Clone(`https://github.com/elegantTemplate/${answers.templateName}.git`, `./${answers.templateName}`).then(repo => {
                    spinner.stop();
                    console.log('template download finish')
                    process.exit(0)
                })
            });
    }).catch(err => {
        console.log(err)
    })


}