var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


var app = express();
var PORT = process.env.PORT || 3000; // process.env.PORT - heroku port
var todos = [];
var idCounter = 0

//add bodyParser as middleware to app
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo api Root is working');
});


//GET all todos  /todos
app.get('/todos', function (req, res) {
	res.json(todos);//response as json no need to stringify
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
	var matchedTodo = _.findWhere(todos, {id: requestedId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
	// res.send('Requested id with value: ' + req.params.id);//req.params.id
});





app.listen(PORT, function () {
	console.log('Listening port: ' + PORT);
});