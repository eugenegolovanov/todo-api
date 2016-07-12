var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	return user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING, //random value that added before encryption
		},
		password_hash: {
			type: DataTypes.STRING,
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);//setting password ass encrypted with bcrypt
				this.setDataValue('salt', salt);//setting salt as a salt for hash
				this.setDataValue('password_hash', hashedPassword);//setting salt as a salt for hash

			}
		} 

	}, {
		hooks: {  //Hooks: this is additional after of before validation
				beforeValidate: function (user, option) {

					if (typeof user.email === 'string') {
						user.email = user.email.toLowerCase();				
					}
				}
		},
		classMethods: {
			authenticate: function (body) {
				return new Promise(function (resolve, reject) {


						if (typeof body.email !== 'string' || typeof body.password !== 'string') {
							 return reject();
						} 

						user.findOne({
							 where: {
							 	email: body.email
							 }
							}).then(function(user) {

								if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
									//if user does not exists
									return reject();//401 - authentification possible but failed
								}

								return resolve(user);

							}, function (e) {
								return reject();
							});


				});
			},
			findByToken: function (token) {
				return new Promise (function (resolve, reject) {

						try {

							var tokenDecodedJWT = jwt.verify(token, 'qwerty098');// encoding encoded token
							var bytes = cryptojs.AES.decrypt(tokenDecodedJWT.token, 'abc123!@#!');
							var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));


							user.findById(tokenData.id).then(function (user) {
								if (user) {
									resolve(user);
								} else {
									reject();
								}
							}, function (e) {
								reject();
							});


						} catch (e) {
							reject();
						}
				});
			}

		},
		instanceMethods: { //Hide in requests 'password' 'salt' 'password_hash'  properties
		    toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');//returning filtered json

			},

			generateToken: function(type) {
				if(!_.isString(type)) {
					return undefined;
				}

				try {
					//stringData takes 'id' and 'type' and convert is to string for encryption
					var stringData = JSON.stringify({id: this.get('id'), type: type});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();

					var tokenEncodedJWT = jwt.sign({
						token: encryptedData
					}, 'qwerty098');//'qwerty098' - jwt password

					return tokenEncodedJWT;


				} catch (e) {
					console.log(e);
					return undefined;
				}

			}

		},
	});
	return user;
};