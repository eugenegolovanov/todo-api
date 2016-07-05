var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


var app = express();
var PORT = process.env.PORT || 3000; // process.env.PORT - heroku port
var todos = [ {
	description:'Watch tutorials',
	completed: true
},{
	description:'Walk the dog',
	completed: true
}, {
	description:'Make haircut',
	completed:false
}];
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

	var queryParams = req.query;//req.query give us string not boolean,
	var filteredTodos = todos;


	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	 	 filteredTodos = _.where(todos, {completed: false});//where finds all matching items not just the first 
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	     filteredTodos = _.where(todos, {completed: true});//where finds all matching items not just the first 
	}

	if (queryParams.hasOwnProperty('q') && filteredTodos.indexOf(queryParams.q)) {

		console.log('--------------------------------------------------------------------');
		console.log('Original filtered todos:');
		console.log(filteredTodos);
		console.log('--------------------------------------------------------------------');


		//Filter all todos and find if description containts queryParams.q
		var filteredTodos = _.filter(filteredTodos, function(todo){ 

			var origArrayOfWords = todo.description.split(" ");//Make description as array of words
			var arrayOfWords = [];

			//make lowercase string
			origArrayOfWords.forEach(function(word) {
			    arrayOfWords.push(word.toLowerCase());
			});

			return (arrayOfWords.indexOf(queryParams.q)) > -1;//if -1 queryParams.q doesn't exists  

		});
		



		console.log('--------------------------------------------------------------------');
		console.log('QUERY:');
		console.log(queryParams.q);

		console.log('FILTERED WITH QUERY:');
		console.log(filteredTodos);
		console.log('--------------------------------------------------------------------');


	}

	// console.log('--------------------------------------------------------------------');
	// console.log('filtered todos:');
	// console.log(filteredTodos);
	// console.log('--------------------------------------------------------------------');


	// debugger;


	res.json(filteredTodos);//response as json no need to stringify
});







//POST todo
app.post('/todos', function (req, res) {

	//req.body - Body requested
	//_.pick - filter body with 'description' and 'completed' properties
	var body = _.pick(req.body, 'description', 'completed');
	console.log('Body requested:');
	console.log(body);

	//Check body if properties are valid types
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).res();//400 - user provided bad data
	}
	idCounter++;

	//Trim spaces if body has some
	body.description = body.description.trim()

	body.id = idCounter;

	todos.push(body);

	res.json(body);
});


//GET todos by id   /todos/:id
app.get('/todos/:id', function (req, res) {

	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int

	//get requested todo object (refactored with underscore library)
	var matchedTodo = _.findWhere(todos, {id: requestedId});//findWhere finds matching items 

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
	// res.send('Requested id with value: ' + req.params.id);//req.params.id
});

//DELETE todos by id   /todos/:id
app.delete('/todos/:id' , function (req, res) {
	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int

	//get requested todo object (refactored with underscore library)
	var todoToDelete = _.findWhere(todos, {id: requestedId});

	console.log('---------------------OLD TODOS:--------------------------------');
	console.log(todos);
	console.log('----------------------NEW TODOS:-------------------------------');
	todos = _.without(todos, todoToDelete);
	console.log(todos);
	console.log('----------------------------------------------------------------');

	if (todoToDelete) {
		res.json(todoToDelete);
	} else {
		res.status(404).json({"error":"no todo with matced id"});
	}
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




app.listen(PORT, function () {
	console.log('Listening port: ' + PORT);
});