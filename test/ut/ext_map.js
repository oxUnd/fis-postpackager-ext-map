var project_root = __dirname + '/ext_map',
	fisp = require('fis-plus');
fisp.cli.run([
	'fisp release -cmpd output -r ' + project_root + ' --no-color',
	'fisp',
	'release',
	'-cmpd',
	'output',
	'-r',
	project_root,
	'--no-color'
]);
