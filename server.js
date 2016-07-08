var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
app.get('/todos', function (req, res) {

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

	// 	console.log('--------------------------------------------------------------------');
	// 	console.log('Original filtered todos:');
	// 	console.log(filteredTodos);
	// 	console.log('--------------------------------------------------------------------');


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


	//Work With q Query    /todos?completed=false
	if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	} else if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	}


	//Work With 'q' Query    /todos?q=something
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
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
app.post('/todos', function (req, res) {

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
		res.json(todo.toJSON())
	}, function (e) {
		res.status(400).json(e);
	});

});




//GET todos by id   /todos/:id
app.get('/todos/:id', function (req, res) {

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

		//FETCH FROM SQLITE
		db.todo.findById(requestedId).then(function (todo) {
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
app.delete('/todos/:id' , function (req, res) {
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
			id: requestedId
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
app.put('/todos/:id', function (req, res) {
	//req.body - Body requested
	//_.pick - filter body with 'description' and 'completed' properties
	var body = _.pick(req.body, 'description', 'completed');
	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int
	var matchedTodo = _.findWhere(todos, {id: requestedId});


	if (!matchedTodo) {
		res.status(404).send();
	} 

	var validAttributes = {};

	//completed attribute
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		//success, user provided attribute and it is boolean
		validAttributes.completed = body.completed;

	} else if (body.hasOwnProperty('completed')) {
		//error, user provided something inside 'completed' but it is not boolean
		res.status(400).send();
	}

	//description attribute
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		//success, user provided attribute and it is string
		validAttributes.description = body.description.trim();

	} else if (body.hasOwnProperty('description')) {
		//error, user provided something inside 'description' but it is not string
		res.status(400).send();
	}

	//IF WE HERE everything went successfully

	// matchedTodo.completed = validAttributes.completed;
	// matchedTodo.description = validAttributes.description;
	_.extend(matchedTodo, validAttributes);//underscore refactor, copy properties _.extend(destination, *sources)
	res.json(matchedTodo);

});



//Creating database before starting server
db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Listening port: ' + PORT);
	});
});


