const express = require('express')
const app = express()
require('dotenv').config()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const Persons = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(express.json())

app.use(express.static('build'))
app.use(morgan('tiny'))

app.get('/info', (request, response) =>{
    response.send(
        '<p>Phonebook has info for ' + generateId() + ' people</p><p>'+ Date() +'</p>')
})

app.get('/api/persons', (request, response) => {
    Persons.find({}).then(persons => {
      response.json(persons.map(person => person.toJSON()))
    })
  })

app.post('/api/persons', (request, response, next) => {
    const personne = request.body

    const person = new Persons({
        name: personne.name,
        number: personne.number
    })
    
    person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    }) 
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response) => {
    Persons.findById(request.params.id)
    .then(person => {
        if (person) {
          response.json(person.toJSON())
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) =>{
    Persons.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)
  
  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
  
  app.use(errorHandler)
  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})