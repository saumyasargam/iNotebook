const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');

// Route 1: Get all the notes using GET "./api/notes/fetch-all-notes. Login required" 
router.get('/fetch-all-notes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 2: Add a note using POST "./api/notes/addnote. Login required" 
router.post('/addnote', fetchuser, [
    body('title', "Enter a valid title").isLength({min: 3}),
    body('description', "description must be at least 5 character long").isLength({min: 5}),
], async (req, res) => {
    const result = validationResult(req);
    // If there are errors return bad address and the errors
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    try {
        const {title, description, tag} = req.body;

        const note = new Notes({
            title, 
            description, 
            tag, 
            user: req.user.id,
        })

        const savedNote = await note.save();
        res.json(savedNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// Route 2: Update a note using PUT "./api/notes/updatenote. Login required" 
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const {title, description, tag} = req.body;

        // Create a newNote object
        const newNote = {};
        // Manually add the objects to the newNote
        if (title) {
            newNote.title = title;
        }
        if (description){
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        // Find the note to be updated and update it
        // const note = Notes.findByIdAndUpdate(req.params.id);     // But hacker might find a bug here and upadte someone's elses notes
        // Validate whether note is present
        let note = await Notes.findById(req.params.id);
        if (!note){
            return res.status(404).send("Note not found");
        }

        // Validate user using id
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Restricted access");
        }

        // Update note
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        res.json({note});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Route 4: delete a note using DELETE "./api/notes/deletenote. Login required" 
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted 
        // const note = Notes.findByIdAndUpdate(req.params.id);     // But hacker might find a bug here and upadte someone's elses notes
        // Validate whether note is present
        let note = await Notes.findById(req.params.id);
        if (!note){
            return res.status(404).send("Note not found");
        }

        // Validate user using id
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Restricted access");
        }

        // Update note
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"success": "Note has been deleted", note: note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;