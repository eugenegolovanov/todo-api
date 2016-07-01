var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000; // process.env.PORT - heroku port

app.get('/', function (req, res) {
	res.send('Todo api Root is working');
});


app.listen(PORT, function () {
	console.log('Listening port: ' + PORT);
});