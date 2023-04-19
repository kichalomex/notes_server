require('dotenv').config()
const { request, response } = require('express')
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const app = express()
app.use(cors())
app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:', request.path);
    console.log('Body:', request.body);
    console.log('-------------------------------');
    next()
}

app.use(requestLogger)

app.get('/', (request, response) => {
    response.send('<h1>Welcome to Notes API</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send('Internal Server Error')
    })
})

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note)
        }
        else{
            response.status(404).end()
        }
    })
    .catch(error => {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/notes/:id', (request, response) => {
    Note.findByIdAndRemove(request.params.id).then(result => {
        if (result !== null) {
            response.status(204).send()
        }
        else{
            response.status(404).send()
        }
    })
    .catch(error => {
        console.log(error)
        response.status(404).send()
    })
})

app.post('/api/notes', (request, response) => {
    const body = request.body;
    console.log(body);
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = Note({
        content: body.content,
        important: body.important || false,
        date: new Date()
    })
    note.save().then(savedNote => {
        response.json(savedNote)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send('Internal Server Error')
    })
})

app.put('/api/notes/:id', (request, response) => {
    const body = request.body;
    const noteUpdate = {
        content: body.content,
        important: body.important,
    }
    
    Note.findByIdAndUpdate(request.params.id, noteUpdate, { new: true}).then(updatedNote => {
        if (updatedNote) {
            response.json(updatedNote)
        }
        else{
            response.status(404).send()
        }
    })
    .catch(error => {
        console.log(error)
        response.status(404).send()
    })
})

const unknownPath = (request,response) =>{
    response.status(404).json({
        error: 'unknown Path'
    })
}
app.use (unknownPath)
const PORT = process.env.PORT
//app.listen(PORT)
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})

