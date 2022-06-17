
//requiring in the modules required
const express = require('express');
const path = require('path');
const fs = require('fs');
// used to create unique id's needed for deleting posts
const idGen = require('./routes/idGen.js');

// saving express to a variable and declaring port number for server
const app = express();
const PORT = process.env.PORT || 3001;

// using middleware for json files and making the public folder available for routes
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// on load up sends user to index.html by default
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
// sends user to notes.html
app.get('/notes', (req, res) => {
    console.log('GET /notes')
    res.sendFile(path.join(__dirname, 'public/notes.html'))});
// get request used for gathing updated data from the db.json file
app.get('/api/notes', (req, res) => {
    console.log(`${req.method} request received for notes`);
    res.sendFile(path.join(__dirname, './db/db.json'));   
})
// posts new note into database and assigns a unique id
app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request received for notes`);

    const { title, text } = req.body;
    // sets the object structure for the json file only if the note contains a title and text value
    if(title && text) {
        const newNote = {
            title,
            text,
            id: idGen(),
        };
    // this function reads the data from db.json and overwrites it with the user input added.
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedNote = JSON.parse(data);

            parsedNote.push(newNote);

            fs.writeFile('./db/db.json', JSON.stringify(parsedNote, null, 4), (writeErr) => writeErr ? console.error(writeErr) : console.info('Successfully updated notes!'))
        }
    });
    // this is used to verify the data was processed successfully
    const response = {
        status: 'success',
        body: newNote,
    };
    res.status(200).json(response);
} else {
    res.status.apply(500).json('Error in posting new note')
}

});
// this request is used to delete the note assosiated with the red trashcan button you press
app.delete('/api/notes/:id', (req, res) => {
    // sets the id of the clicked note to the variable noteId
    const noteId = req.params.id;
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        const noteDel = JSON.parse(data);
       
        if (err) {
            console.error(err);
            // this loop is used to find which note within db.json has the same id as the noteId variable
        } else { for (i =0 ; i < noteDel.length ; i++) {
            if (noteDel[i].id === noteId) {
                // this removes the selected note at the specified index using splice and then over writes the old db.json file with the next data.
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

