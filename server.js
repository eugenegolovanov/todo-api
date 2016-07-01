var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000; // process.env.PORT - heroku port
var todos = [{
	id:1,
	description: 'Do evening runing',
	completed: false
}, {
	id:2,
	description: 'Watch tutorials',
	completed: false
}, {
	id:3,
	description:'Eat my Syntha',
	completed: true
}];


app.get('/', function (req, res) {
	res.send('Todo api Root is working');
});


//GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);//response ase json no need to stringify
});



//GET /todos/:id
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