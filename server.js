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
			var queryParams = req.query;
			var filteredTodos = todos;
			if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
				filteredTodos = _.where(filteredTodos, {
					completed: true
				});
			} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
				filteredTodos = _.where(filteredTodos, {
					completed: false
				});
			}
			if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
				filteredTodos = _.filter(filteredTodos, function(todo) {
					return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
				});
			}
			res.json(filteredTodos);
		} else {
			console.log('no todo found');
			res.status(400).json('empty set');
		}
	} ).catch(function(e) {
		res.status(400).json(e);
		console.log('Finished');
		console.log(e);
	});
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
		res.status(404).json(e);
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
	db.todo.findById(todoid).then(function(todo) {
		if (todo) {
			todo.destroy();
			res.json(todo.toJSON());
			console.log(todo.toJSON());
		} else {
			res.status(404).json('no todo found');
			console.log('no todo found');
		}
	} ).catch(function(e) {
		res.status(400).json(e);
		console.log('Finished');
		console.log(e);
	});
});

app.put('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findById(todoid).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).json('no todo found');
			console.log('no todo found');
		}
	}).catch(function(e) {
		res.status(400).json(e);
		console.log('Finished');
		console.log(e);
	});

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on ' + PORT);
	});
});
