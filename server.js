
//requiring in the modules required
const express = require('express');
const path = require('path');
const fs = require('fs');
let noteData = require('./db/db.json');
const util = require('util');

const idGen = require('./routes/idGen.js');

// saving express to a variable and declaring port number for server
const app = express();
const PORT = process.env.PORT || 3001;

// using middleware for json files and making the public folder available for routes
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.get('/notes', (req, res) => {
    console.log('GET /notes')
    res.sendFile(path.join(__dirname, 'public/notes.html'))});

app.get('/api/notes', (req, res) => {
    console.log(`${req.method} request received for notes`);
    res.sendFile(path.join(__dirname, './db/db.json'));   
})

app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request received for notes`);

    const { title, text } = req.body;

    if(title && text) {
        const newNote = {
            title,
            text,
            id: idGen(),
        };
    
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedNote = JSON.parse(data);

            parsedNote.push(newNote);

            fs.writeFile('./db/db.json', JSON.stringify(parsedNote, null, 4), (writeErr) => writeErr ? console.error(writeErr) : console.info('Successfully updated notes!'))
        }
    });
    const response = {
        status: 'success',
        body: newNote,
    };

    console.log(response);
    res.status(200).json(response);
} else {
    res.status.apply(500).json('Error in posting new note')
}

});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    console.log(req.params)
    console.log(noteId);
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        const noteDel = JSON.parse(data);
        console.log(noteDel)
        if (err) {
            console.error(err);
        } else { for (i =0 ; i < noteDel.length ; i++) {
            if (noteDel[i].id === noteId) {
                noteDel.splice(i, 1);
                fs.writeFile('./db/db.json', JSON.stringify(noteDel, null, 4), (writeErr) => writeErr ? console.error(writeErr) : console.log(`Successfully deleted note ${noteId}`))
            } else {
                console.log(`ID:${noteId} not found` )
            }
        }} 
    })
    res.end();
})

// sets up a listener for the specified port
app.listen(PORT, () => 
    console.log(`server is listening at port:${PORT}`));

