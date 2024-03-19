const express = require('express');
const app=express();
require('dotenv').config();
const cors = require('cors');
const axios = require('axios');

const port = 3000;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

app.use(cors());
app.options('*',cors());
// Set up a route to proxy requests to the YouTube Data API's search endpoint
app.get('/videos', async (req, res) => {
    const maxResults = 30; // Maximum number of playlists per page
    let playlists = [];
  console.log("call");
    // Fetch the first page of playlists
    axios.get(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}&maxResults=${maxResults}`)
        .then(response => {
            playlists = playlists.concat(response.data.items);
            const nextPageToken = response.data.nextPageToken;
            // If there are more playlists, recursively fetch all pages
            if (nextPageToken) {
                fetchAllChannelPlaylists(nextPageToken, playlists);
            } else {
                // If there's only one page, send the playlists
                res.json(playlists);
            }
        })
        .catch(error => {
            console.error("Error fetching channel playlists:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

// Function to recursively fetch all pages of playlists
function fetchAllChannelPlaylists(pageToken, playlists) {
    axios.get(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}&maxResults=${maxResults}&pageToken=${pageToken}`)
        .then(response => {
            playlists = playlists.concat(response.data.items);
            const nextPageToken = response.data.nextPageToken;
            // If there are more playlists, recursively fetch the next page
            if (nextPageToken) {
                fetchAllChannelPlaylists(nextPageToken, playlists);
            } else {
                // If all playlists have been fetched, send the playlists as response
                res.json(playlists);
            }
        })
        .catch(error => {
            console.error("Error fetching channel playlists:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
}




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
