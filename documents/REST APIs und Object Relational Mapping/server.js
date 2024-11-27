import express from "express";
import { json } from "body-parser";
import { readFile } from "fs";

const app = express();
const PORT = 3000;

app.use(json());

let songs;

// Load data from a JSON file at startup
readFile("./songs.json", (err, data) => {
  if (err) throw err;
  songs = JSON.parse(data).songs;
});

// Get all songs
app.get("/api/v1/songs", (req, res) => {
  res.json(songs);
});

// Get a single song by ID
app.get("/api/v1/songs/:id", (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const song = songs.find((s) => s.id === songId);
  if (song) {
    res.json(song);
  } else {
    res.status(404).send("Song not found");
  }
});

// Create a new song
app.post("/api/v1/songs", (req, res) => {
  const newSong = req.body;
  if (!newSong.id || songs.some((s) => s.id === newSong.id)) {
    res.status(400).send("Song with this ID already exists");
  } else {
    songs.push(newSong);
    res.status(201).json(newSong);
  }
});

// Update a song
app.put("/api/v1/songs/:id", (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const songIndex = songs.findIndex((s) => s.id === songId);
  const updatedSong = req.body;

  if (songIndex > -1) {
    songs[songIndex] = updatedSong;
    res.json(updatedSong);
  } else {
    res.status(404).send("Song not found");
  }
});

// Delete a song
app.delete("/api/v1/songs/:id", (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const songIndex = songs.findIndex((s) => s.id === songId);

  if (songIndex > -1) {
    const deletedSong = songs.splice(songIndex, 1);
    res.json(deletedSong);
  } else {
    res.status(404).send("Song not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// node server.js
