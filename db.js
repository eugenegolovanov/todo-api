var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development'; //environment variable for heroku, NODE_ENV - heroku environment if it is set than it is production
var sequelize;

if (env === 'production') {
	//Setup postgress for heroku, for production
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgress'
	});
} else {
	//Setup for local
	var sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect':'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}





var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;