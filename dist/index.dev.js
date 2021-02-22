"use strict";

var express = require('express');

var app = express();

require('dotenv').config();

var morgan = require('morgan');

var bodyParser = require('body-parser');

var cors = require('cors');

var Persons = require('./models/person');

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express["static"]('build'));
app.use(morgan('tiny'));
app.get('/info', function (request, response) {
  response.send('<p>Phonebook has info for ' + generateId() + ' people</p><p>' + Date() + '</p>');
});
app.get('/api/persons', function (request, response) {
  Persons.find({}).then(function (persons) {
    response.json(persons.map(function (person) {
      return person.toJSON();
    }));
  });
});
app.post('/api/persons', function (request, response, next) {
  var personne = request.body;
  var person = new Persons({
    name: personne.name,
    number: personne.number
  });
  person.save().then(function (savedPerson) {
    return savedPerson.toJSON();
  }).then(function (savedAndFormattedPerson) {
    response.json(savedAndFormattedPerson);
  })["catch"](function (error) {
    return next(error);
  });
});
app.get('/api/persons/:id', function (request, response) {
  Persons.findById(request.params.id).then(function (person) {
    if (person) {
      response.json(person.toJSON());
    } else {
      response.status(404).end();
    }
  })["catch"](function (error) {
    return next(error);
  });
});
app["delete"]('/api/persons/:id', function (request, response, next) {
  Persons.findByIdAndRemove(request.params.id).then(function (result) {
    response.status(204).end();
  })["catch"](function (error) {
    return next(error);
  });
});

var unknownEndpoint = function unknownEndpoint(request, response) {
  response.status(404).send({
    error: 'unknown endpoint'
  });
};

app.use(unknownEndpoint);

var errorHandler = function errorHandler(error, request, response, next) {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({
      error: 'malformatted id'
    });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    });
  }

  next(error);
};

app.use(errorHandler);
var PORT = process.env.PORT;
app.listen(PORT, function () {
  console.log("Server running on port ".concat(PORT));
});