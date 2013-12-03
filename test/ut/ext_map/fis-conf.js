fis.config.merge({
	namespace: "extmap",
	modules: {
		postpackager: [require("../../../index.js")]
	},
	pack: {
		'/static/pkg_1.js': [
			'/widget/a.js',
			'/widget/b.js'
		],
		'/static/pkg_2.js': [
			'/widget/c.js'
		]
	},
    settings: {
        postpackager: [{
            create: [
                'data.json'
            ]
        }]
    }
});

fis.config.get('roadmap.path').unshift({
    reg: /webapp(.*)/i
});
