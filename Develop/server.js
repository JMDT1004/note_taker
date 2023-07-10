const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PORT = 3001;

const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());


app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        try {
            const notes = JSON.parse(data);
            res.json(notes);
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.post('/api/notes', (req, res) => {
    const note = req.body;
    const newNote = { id: uuidv4(), ...note };

    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        try {
            const notes = JSON.parse(data);
            notes.push(newNote);

            fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(notes), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to db.json:', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                res.json(newNote);
            });
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) throw err;

        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);

        fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(notes), (err) => {
            if (err) throw err;
            res.sendStatus(204); // Send a 204 No Content response
        });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.listen(PORT, () =>
    console.log(`Server started at ${PORT}`));
