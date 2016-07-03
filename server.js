var express = require('express');
var bodyParser = require('body-parser');


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

	var body = req.body//Body requested
	console.log('requested body description:' + body.description);

	idCounter++;

	var newTodo = {
		'id': idCounter,
		'description': body.description,
		'completed': body.completed
	}
	todos.push(newTodo);

	res.json(body);
});


//GET todos by id   /todos/:id
app.get('/todos/:id', function (req, res) {

	var requestedId = parseInt(req.params.id, 10); //parseInt converts string to Int
	var matchedTodo;
	// for (var i = 0; i < todos.length; i++) {
	// 	if (todos[i].id === requestedId) {
	// 		matchedTodo = todos[i];
	// 	}
	// }
	todos.forEach(function (todo) {
		if (todo.id === requestedId) {
			matchedTodo = todo;
		}
	});
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