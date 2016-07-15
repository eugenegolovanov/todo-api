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



//GET all todos or filtered  /todos?completed=false&q=haircut
app.get('/todos', middleware.requireAuthentication, function (req, res) {




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


