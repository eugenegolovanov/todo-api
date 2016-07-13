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
});



var User = sequelize.define('user' ,{
	email: Sequelize.STRING
});



//Association
Todo.belongsTo(User);
User.hasMany(Todo);





sequelize.sync({
	// force:true
}).then(function () {
	console.log('Everything is synced');





	User.findById(1).then(function (user) {

		//***getTodos  it is from Sequelize. capitalize Model that you want to return
		user.getTodos({
			where: {
				completed: false
			}
		}).then(function (todos) {
			todos.forEach(function (todo) {
				console.log('-------------------------------------')
				console.log(todo.toJSON());
				console.log('-------------------------------------')

			})
		});

	})


 
	// User.create({
	// 	email: 'yujin@gmail.com'
	// }).then(function () {

	// 	return Todo.create({
	// 		description: 'To do something'
	// 	});

	// }).then(function (todo) {

	// 	User.findById(1).then(function (user) {
	// 		user.addTodo(todo);//Assigning todo to that user
	// 	});

	// });





});



// //SAVE TO DATABASE
// sequelize.sync({force:true}).then(function () {//{force:true} - delete previous tables and creates new ones
// 	console.log('Everything is synched');

// 	Todo.create({
// 		description: 'Watch tutorials'
// 	}).then(function (todo) {
// 		return Todo.create({
// 		description: 'Fill water bottle'
// 		});
// 	}).then(function (todo) {
// 		// return Todo.findById(2);   //FETCH FROM SQLITE
// 		return Todo.findAll({
// 			where: {

// 				completed: false,

// 				description: {
// 					$like:'%bottle%'    //contains bottle word in desctiption
// 				}   
// 			}
// 		});

// 	}).then(function (todos) {
// 		if (todos) {
// 			todos.forEach(function (todo) {
// 				console.log(todo.toJSON());
// 			});
// 		}else {
// 			console.log('Could not find todos');
// 		}
// 	}).catch(function (e) {
// 		console.log(e);
// 	});
// });



// //FETCH FROM DATABASE
//  Todo.findById(1).then(function (todo) {
//  		if (todo) {
// 			console.log(todo.toJSON());
// 		}else {
// 			console.log('Could not find todo by id');
// 		}
//  });   




