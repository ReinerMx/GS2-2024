from fastapi import FastAPI, HTTPException # type: ignore
from pydantic import BaseModel # type: ignore
from typing import List
import json
import csv
from pathlib import Path

app = FastAPI()

class Song(BaseModel):
    id: int
    title: str
    artist: str
    genre: str
    peak_position: int
    weeks_on_chart: int

# Path to the JSON file
json_file_path = './songs.json'

# Load existing data
try:
    with open(json_file_path, 'r') as file:
        data = json.load(file)
        songs = data["songs"]
except FileNotFoundError:
    songs = []

def write_json(data, path):
    with open(path, 'w') as file:
        json.dump(data, file, indent=4)


@app.get("/api/v1/songs", response_model=List[Song])
def read_songs():
    return songs

@app.get("/api/v1/songs/{song_id}", response_model=Song)
def read_song(song_id: int):
    song = next((song for song in songs if song['id'] == song_id), None)
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@app.post("/api/v1/songs", response_model=Song)
def create_song(song: Song):
    if any(s['id'] == song.id for s in songs):
        raise HTTPException(status_code=400, detail="Song with this ID already exists")
    song_dict = song.dict()
    songs.append(song_dict)
    write_json({"songs": songs}, json_file_path)
    return song_dict

@app.put("/api/v1/songs/{song_id}", response_model=Song)
def update_song(song_id: int, song: Song):
    index = next((i for i, s in enumerate(songs) if s['id'] == song_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Song not found")
    
    songs[index] = song.dict()
    write_json({"songs": songs}, json_file_path)
    return songs[index]

@app.delete("/api/v1/songs/{song_id}", response_model=Song)
def delete_song(song_id: int):
    index = next((i for i, s in enumerate(songs) if s['id'] == song_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Song not found")
    
    song = songs.pop(index)
    write_json({"songs": songs}, json_file_path)
    return song

if __name__ == '__main__':
    import uvicorn # type: ignore
    uvicorn.run(app, host="127.0.0.1", port=8000)


# TO run :

# uvicorn app:app --reload

# docs : http://127.0.0.1:8000/docs
# redoc: http://127.0.0.1:8000/redoc



# #CSV file path
# csv_file_path = Path("./songs.csv")

# # Load data from CSV file
# def load_songs():
#     songs = []
#     if csv_file_path.is_file():
#         with open(csv_file_path, mode="r") as file:
#             reader = csv.DictReader(file)
#             for row in reader:
#                 songs.append(row)
#     return songs

# songs = load_songs()

# # Load data from CSV file
# def load_songs():
#     songs = []
#     if csv_file_path.is_file():
#         with open(csv_file_path, mode="r") as file:
#             reader = csv.DictReader(file)
#             for row in reader:
#                 songs.append(row)
#     return songs

# # Save data to CSV file
# def save_songs(songs):
#     with open(csv_file_path, mode="w", newline="") as file:
#         fieldnames = ["id", "title", "artist", "genre", "peak_position", "weeks_on_chart"]
#         writer = csv.DictWriter(file, fieldnames=fieldnames)
#         writer.writeheader()
#         writer.writerows(songs)