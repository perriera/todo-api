var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function(req, res) {
	db.Todo.findAll().then(function(todos) {
		if (todos) {
			var rep = '';
			todos.forEach(function(todo) {
				rep += ' '+todo.toJSON();
				console.log(todo.toJSON());
			})
			res.json(rep);
			return 
		} else {
			console.log('no todo found');
			res.status(400).json('empty set');
		}
	} ).catch(function(e) {
		res.status(400).json(e);
		console.log('Finished');
		console.log(e);
	});
	// var queryParams = req.query;
	// var filteredTodos = todos;

	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 	});
	// }

	// res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	db.todo.findById(todoid).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
			console.log(todo.toJSON());
		} else {
			res.status(400).json('no todo found');
			console.log('no todo found');
		}
	} ).catch(function(e) {
		res.status(400).json(e);
		console.log('Finished');
		console.log(e);
	});
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoid
	// });
	// if (matchedTodo) {
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send();
	// }
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	//console.log('description: ' + body.description);
	//res.json(body);
	// body.id = todoNextId++;
	//todos.push(body);

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
		return db.Todo.findAll();
	}).then(function(todos) {
		if (todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			})
		} else {
			console.log('no todo found');
		}
	} ).catch(function(e) {
		res.status(400).json(e);
		console.log('Finished');
		console.log(e);
	});


});

app.delete('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoid
	});
	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	} else {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	}
});

app.put('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoid
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.staus(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.staus(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on ' + PORT);
	});
});
