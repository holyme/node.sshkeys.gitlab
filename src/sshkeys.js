var nodePath = require('path'),
	fs = require('fs'),
	nodeExec = require('child_process').exec,
	hostname = require('os').hostname().split('.').shift(),
	Gitlab = require('node.gitlab'),
	isWindows = (process.platform === 'win32'),
	userPath = process.env.USERPROFILE || process.envHOME;

var sshkeys = {
	exec: function(config, callback) {
		var _self = this,
			sshPath, filename, gitlab;
		if (typeof config === 'string') {
			config = {
				token: config
			};
		}
		if (!config.token) {
			throw new Error('Account token is required.');
		}
		config.filename = config.filename || 'id_rsa';

		this.config = config;
		callback = callback || function() {};

		sshPath = nodePath.join(userPath, '.ssh');
		if (!fs.existsSync(sshPath)) {
			fs.mkdir(sshPath);
		}
		filename = nodePath.join(sshPath, config.filename);

		gitlab = this._getGitlab(config);

		gitlab.user.read(function(data, res) {
			if (res.statusCode !== 200) {
				throw new Error('Account token is unable to authorized.');
			}

			_self._creteSSHKey({
				filename: filename,
				email: data.email
			}, function(key) {
				_self._uploadSSHkey(key, function(data, res) {
					if (res.status === 201) {
						callback(data, filename, true);
					} else {
						_self._listSSHkey(function(data) {
							data.forEach(function(item, i) {
								if (item.key === key) {
									callback(item, filename, true);
								}
							});
						});
					}
				});
			});
		});
	},
	_getGitlab: function(config) {
		config = config || this.config;
		return this._gitlab || (this._gitlab = Gitlab.create({
			api: config.api || 'http://gitlab.alibaba-inc.com/api/v3',
			private_token: config.token
		}));
	},
	_creteSSHKey: function(options, callback) {
		var _self = this,
			filename = options.filename,
			email = options.email,
			isExists = fs.existsSync(filename),
			readLocalSSHkey;

		callback = options.callback || callback || function() {};
		readLocalSSHkey = function(filename) {
			fs.readFile(filename + '.pub', function(err, data) {
				var key;
				if (err) {
					console.log(err);
					return;
				}
				key = data.toString().replace(/^\s*|\s*$/g, '');
				callback(key, filename, isExists);
			});
		};
		if (!isExists) {
			var cmd = nodeExec('ssh-keygen -t rsa -C ' + email + ' -f ' + filename + ' -P ""', {
				cwd: isWindows ? nodePath.join(__dirname, '../bin/') : __dirname
			});

			cmd.stderr.on('data', function(data) {
				console.log('stderr', data);
			});

			cmd.on('close', function(code) {
				readLocalSSHkey(filename);
			});

		} else {
			readLocalSSHkey(filename);
		}
	},
	_uploadSSHkey: function(key, callback) {
		var gitlab = this._getGitlab();
		gitlab.user.keys.create({
			title: hostname,
			key: key
		}, callback);
	},
	_listSSHkey: function(callback) {
		var gitlab = this._getGitlab();
		gitlab.user.keys.read(callback);
	}
};

module.exports = {
	exec: function() {
		sshkeys.exec.apply(sshkeys, arguments);
	}
};