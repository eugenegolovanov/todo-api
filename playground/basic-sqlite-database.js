var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect':'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo' ,{
	description: {
		type: Sequelize.STRING,
		allowNull: false, //is not optional
		validate: {
			// notEmpty: true   //not allow empty strings
			len: [1, 250]   //length from 1 to 250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false, //is not optional
		defaultValue: false

	}
})



//SAVE TO DATABASE
sequelize.sync({force:true}).then(function () {//{force:true} - delete previous tables and creates new ones
	console.log('Everything is synched');

	Todo.create({
		description: 'Watch tutorials'
	}).then(function (todo) {
		return Todo.create({
		description: 'Fill water bottle'
		});
	}).then(function (todo) {
		// return Todo.findById(2);   //FETCH FROM SQLITE
		return Todo.findAll({
			where: {

				completed: false,

				description: {
					$like:'%bottle%'    //contains bottle word in desctiption
				}   
			}
		});

	}).then(function (todos) {
		if (todos) {
			todos.forEach(function (todo) {
				console.log(todo.toJSON());
			});
		}else {
			console.log('Could not find todos');
		}
	}).catch(function (e) {
		console.log(e);
	});
});



// //FETCH FROM DATABASE
//  Todo.findById(1).then(function (todo) {
//  		if (todo) {
// 			console.log(todo.toJSON());
// 		}else {
// 			console.log('Could not find todo by id');
// 		}
//  });   




