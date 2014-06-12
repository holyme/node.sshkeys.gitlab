var Gitlab = require('./index.js');

var gitlab = Gitlab.create({
	api: 'https://gitlab.com/api/v3',
	private_token: 'e7zpqXbpAz6xkmnQgJpb'
});

// https://gitlab.com/help/api/projects#list-owned-projects
gitlab.projects.owned.read(function(data, res) {
	console.log(data, res.statusCode);
});

// https://gitlab.com/help/api/projects#create-project
gitlab.projects.create({
	name: "test" + new Date().getTime(),
	namespace_id: 40835,
	description: "for test api",
	"public": true
}, function(data, res) {
	console.log(data, res.statusCode);
});

// https://gitlab.com/help/api/commits#list-repository-commits
gitlab.commits.read({
	id: 58464
}, function(data, res) {
	console.log(data, res.statusCode);
});