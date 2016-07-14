var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db); //db - passing db into middleware.js

var app = express();
var PORT = process.env.PORT || 3000; // process.env.PORT - heroku port
var todos = [];
var idCounter = 0

//add bodyParser as middleware to app
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo api Root is working');
});


// //GET all todos  /todos 
// app.get('/todos', function (req, res) {
// 	res.json(todos);//response as json no need to stringify
// });


//GET all todos or filtered  /todos?completed=false&q=haircut
app.get('/todos', middleware.requireAuthentication, function (req, res) {

	// var queryParams = req.query;//req.query give us string not boolean,
	// var filteredTodos = todos;

	// //Work With q Query    /todos?completed=false
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	//  	 filteredTodos = _.where(todos, {completed: false});//where finds all matching items not just the first 
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	//      filteredTodos = _.where(todos, {completed: true});//where finds all matching items not just the first 
	// }


	// //Work With 'q' Query    /todos?q=something
	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {

		// console.log('--------------------------------------------------------------------');
		// console.log('Original filtered todos:');
		// console.log(filteredTodos);
		// console.log('--------------------------------------------------------------------');


	// 	//Filter all todos and find if description containts queryParams.q
	// 	var filteredTodos = _.filter(filteredTodos, function(todo){ 

	// 		// var arrayOfWords = todo.description.split(" ");//Make description as array of words
	// 		// return (arrayOfWords.indexOf(queryParams.q)) > -1;//if -1 queryParams.q doesn't exists  

	// 		//If 'todo.desctiption' contains  'queryParams.q'
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;//REFACTORING

	// 	});
		

		// console.log('--------------------------------------------------------------------');
		// console.log('QUERY:');
		// console.log(queryParams.q);

		// console.log('FILTERED WITH QUERY:');
		// console.log(filteredTodos);
		// console.log('--------------------------------------------------------------------');


	// }

	// res.json(filteredTodos);//response as json no need to stringify



////////////WITH DATABASE REFACTOR////////////////

	var query = req.query;//req.query give us string not boolean,
	var where = {};

	//Filter todos with just current user 
	where = {
		 userId: req.user.get('id') // we access req.user that we assign in middleware
	};


	//Work With q Query    /todos?completed=false
	if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	} else if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	}

	// if (query.hasOwnProperty('userId') {
	// }



	//Work With 'q' Query    /todos?q=something
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%',
		};
	}



	//FETCH FROM SQLITE
	db.todo.findAll({where: where}).then(function (sqTodos) {

		res.json(sqTodos);//response as json no need to stringify

	}, function (e) {
		res.status(500).send();//500 status - server error
	});




});







//POST todo
app.post('/todos', middleware.requireAuthentication, function (req, res) {

	// //req.body - Body requested
	// //_.pick - filter body with 'description' and 'completed' properties
	// var body = _.pick(req.body, 'description', 'completed');
	// console.log('Body requested:');
	// console.log(body);

	// //Check body if properties are valid types
	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).res();//400 - user provided bad data
	// }
	// idCounter++;

	// //Trim spaces if body has some
	// body.description = body.description.trim()

	// body.id = idCounter;

	// todos.push(body);

	// res.json(body);


////////////WITH DATABASE REFACTOR////////////////
	//req.body - Body requested
	//_.pick - filter body with 'description' and 'completed' properties
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function (todo) {

		req.user.addTodo(todo).then(function () {
			//Add todo to that user by adding users 'id' into 'userId' 
			return todo.reload();
		}).then(function (todo) {
			res.json(todo.toJSON());
		});

	}, function (e) {
		res.status(400).json(e);
	});

});




//GET todos by id   /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {

	// var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int

	// //get requested todo object (refactored with underscore library)
	// var matchedTodo = _.findWhere(todos, {id: requestedId});//findWhere finds matching items 

	// if (matchedTodo) {
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send();
	// }

////////////WITH DATABASE REFACTOR////////////////

	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int


	// {where {userId: req.user.id}};

		//FETCH FROM SQLITE
		db.todo.findOne({
			where: {
				id: requestedId,
		 		userId: req.user.get('id') // we access req.user that we assign in middleware
			}
		}).then(function (todo) {

			if (!!todo) {
				res.json(todo.toJSON());
			} else {
				res.status(404).send();
			}

		}, function (e) {
			res.status(500).send();//500 status - server error
		});

});





//DELETE todos by id   /todos/:id
app.delete('/todos/:id' , middleware.requireAuthentication, function (req, res) {
	// var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int

	// //get requested todo object (refactored with underscore library)
	// var todoToDelete = _.findWhere(todos, {id: requestedId});

	// console.log('---------------------OLD TODOS:--------------------------------');
	// console.log(todos);
	// console.log('----------------------NEW TODOS:-------------------------------');
	// todos = _.without(todos, todoToDelete);
	// console.log(todos);
	// console.log('----------------------------------------------------------------');

	// if (todoToDelete) {
	// 	res.json(todoToDelete);
	// } else {
	// 	res.status(404).json({"error":"no todo with matced id"});
	// }

////////////WITH DATABASE REFACTOR////////////////

	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int


	//DELETE From SQLite
	db.todo.destroy({
		where: {
			id: requestedId,
		 	userId: req.user.get('id') // we access req.user that we assign in middleware
		}
	}).then(function (rowSelected) {
		if (rowSelected === 0) {
			res.status(404).json({error: 'No todo with id'});
		} else {
			res.status(204).send();//204 request success but nothing to send
		}

	}, function () {
		res.status(500).send();
	});


});




//PUT todos by id /todos/:id,  (update todos)
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
	// //req.body - Body requested
	// //_.pick - filter body with 'description' and 'completed' properties
	// var body = _.pick(req.body, 'description', 'completed');
	// var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int
	// var matchedTodo = _.findWhere(todos, {id: requestedId});


	// if (!matchedTodo) {
	// 	res.status(404).send();
	// } 

	// var validAttributes = {};

	// //completed attribute
	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	//success, user provided attribute and it is boolean
	// 	validAttributes.completed = body.completed;

	// } else if (body.hasOwnProperty('completed')) {
	// 	//error, user provided something inside 'completed' but it is not boolean
	// 	res.status(400).send();
	// }

	// //description attribute
	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	//success, user provided attribute and it is string
	// 	validAttributes.description = body.description.trim();

	// } else if (body.hasOwnProperty('description')) {
	// 	//error, user provided something inside 'description' but it is not string
	// 	res.status(400).send();
	// }

	// //IF WE HERE everything went successfully

	// // matchedTodo.completed = validAttributes.completed;
	// // matchedTodo.description = validAttributes.description;
	// _.extend(matchedTodo, validAttributes);//underscore refactor, copy properties _.extend(destination, *sources)
	// res.json(matchedTodo);

	////////////WITH DATABASE REFACTOR////////////////

	//req.body - Body requested
	//_.pick - filter body with 'description' and 'completed' properties
	var body = _.pick(req.body, 'description', 'completed');
	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int
	var attributes = {};

	//completed attribute
	if (body.hasOwnProperty('completed')) {
		//success, user provided attribute and it is boolean
		attributes.completed = body.completed;
	} 

	//description attribute
	if (body.hasOwnProperty('description')) {
		//success, user provided attribute and it is string
		attributes.description = body.description.trim();
	} 

	db.todo.findOne({
		where: {
			id: requestedId,
		 	userId: req.user.get('id') // we access req.user that we assign in middleware
		}
	}).then(function (todo) {
		//findById
		if (todo) {

			return todo.update(attributes).then(function (todo) {
				//Update by Id
				res.json(todo.toJSON());
			}, function (e) {
				//Failed to Update by Id
				res.status(400).json(e);
			});

		} else {
			res.status(404).send();
		}
	}, function () {
			//failed findById
			res.status(500).send();
	});



});



////////////////////////////////////////////////////////
/////////////////////USER////////////////////////////////
////////////////////////////////////////////////////////



//POST users
app.post('/users', function (req, res) {

	//req.body - Body requested
	//_.pick - filter body with 'email' and 'password' properties
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON()) //toPublicJSON - method from user.js, works in instanceMethods
	}, function (e) {
		res.status(400).json(e);
	});


});



//POST users/login
app.post('/users/login', function (req, res) {

	//req.body - Body requested
	//_.pick - filter body with 'email' and 'password' properties
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	// //All functionality is in user.js file in  'authenticate' method
	// db.user.authenticate(body).then(function (user) {

	// 	var token = user.generateToken('authentication');

	// 	if (token) {
	// 		res.header('Auth', token).json(user.toPublicJSON());	
	// 	} else {
	// 		res.status(401).send();
	// 	}

	// }, function () {
	// 	res.status(401).send();
	// });




	//All functionality is in user.js file in  'authenticate' method
	db.user.authenticate(body).then(function (user) {

		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});

	}).then(function (tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function () {
		res.status(401).send();
	});


});





//DELETE users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {

	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function () {
		res.status(500).send();
	});

});






////////////////////////////////////////////////////////
/////////////////////DATABASE///////////////////////////
////////////////////////////////////////////////////////

//Creating database before starting server
db.sequelize.sync({force:true}).then(function () {
// db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Listening port: ' + PORT);
	});
});


