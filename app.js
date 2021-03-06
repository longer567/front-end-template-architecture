const path = require('path');
const program = require('commander')

module.exports = require('./util/lg-utils')

// info in lg
lg.lgInfo = require(path.resolve(__dirname, 'package.json'))

// version and about in lg
lg.prin = () => {
	console.log(`${lg.lgInfo.name}`)
	console.log(`version : ${lg.lgInfo.version}`)
}

// helpness in lg
lg.help = () => {
	const helpText = `${lg.lgInfo.description}
					  \n 'lg init': pull customized template by lg-cli
					  \n 'lg dev': start development
					  \n 'lg build': generate online resources
					  \n 'lg serve': open a serve in local
					  \n See the documentation for more detailed operations.
					  `;
	console.log(helpText);
}

// lg x : main command analysis array
const commandArr = ['serve', 'init', 'dev', 'build'];

lg.run = (args) => {
	const l = args.length;
	if (l === 2 || l === 3 && ['-v', 'version'].includes(args[2]))
	{	
		lg.prin();
	}else if ( l === 3 && ['-h', 'help'].includes(args[2]) )
	{
		lg.help()
	}else if (commandArr.includes(args[2])){
		require(path.resolve(__dirname, `command-modules/${args[2]}`))(program.command(args[2]), args)
		program.parse(args)
	}
}


