package main

import (
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Song struct {
	ID           int    `json:"id"`
	Title        string `json:"title"`
	Artist       string `json:"artist"`
	Genre        string `json:"genre"`
	PeakPosition int    `json:"peak_position"`
	WeeksOnChart int    `json:"weeks_on_chart"`
}

type SongsData struct {
	Songs []Song `json:"songs"`
}

var songs []Song
var jsonFilePath = "./songs.json"

// Load songs from the JSON file at startup
func loadSongs() error {
	file, err := os.Open(jsonFilePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			songs = []Song{}
			return nil
		}
		return err
	}
	defer file.Close()

	data, err := io.ReadAll(file) // Replaced ioutil.ReadAll with io.ReadAll
	if err != nil {
		return err
	}

	var songsData SongsData
	if err := json.Unmarshal(data, &songsData); err != nil {
		return err
	}

	songs = songsData.Songs
	return nil
}

// Write songs data to JSON file
func writeSongs() error {
	data, err := json.MarshalIndent(map[string][]Song{"songs": songs}, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(jsonFilePath, data, fs.FileMode(0644))
}

func main() {
	r := gin.Default()

	// GET /api/v1/songs - Retrieve all songs
	r.GET("/api/v1/songs", func(c *gin.Context) {
		c.JSON(http.StatusOK, songs)
	})

	// GET /api/v1/songs/:id - Retrieve a song by ID
	r.GET("/api/v1/songs/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		for _, song := range songs {
			if song.ID == id {
				c.JSON(http.StatusOK, song)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
	})

	// POST /api/v1/songs - Create a new song
	r.POST("/api/v1/songs", func(c *gin.Context) {
		var newSong Song
		if err := c.ShouldBindJSON(&newSong); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid song data"})
			return
		}

		// Check if song ID already exists
		for _, s := range songs {
			if s.ID == newSong.ID {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Song with this ID already exists"})
				return
			}
		}

		songs = append(songs, newSong)
		if err := writeSongs(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save song"})
			return
		}

		c.JSON(http.StatusCreated, newSong)
	})

	// PUT /api/v1/songs/:id - Update an existing song
	r.PUT("/api/v1/songs/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		var updatedSong Song
		if err := c.ShouldBindJSON(&updatedSong); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid song data"})
			return
		}

		// Find song and update it
		for i, song := range songs {
			if song.ID == id {
				songs[i] = updatedSong
				if err := writeSongs(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save song"})
					return
				}
				c.JSON(http.StatusOK, updatedSong)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
	})

	// DELETE /api/v1/songs/:id - Delete a song by ID
	r.DELETE("/api/v1/songs/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))

		for i, song := range songs {
			if song.ID == id {
				song := songs[i]
				songs = append(songs[:i], songs[i+1:]...)
				if err := writeSongs(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete song"})
					return
				}
				c.JSON(http.StatusOK, song)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
	})

	// Load existing songs from the JSON file before starting the server
	if err := loadSongs(); err != nil {
		panic("Failed to load songs: " + err.Error())
	}

	r.Run(":8000")
}

//  go run server.go
