var sshkeys = require('./index.js');

sshkeys.exec({
	api: 'https://gitlab.com/api/v3',
	token: 'e7zpqXbpAz6xkmnQgJpb'
}, function(data, keyPath, newCreate) {
	console.log(arguments);
});