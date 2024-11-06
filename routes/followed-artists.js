const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const WebApiRequest = require("spotify-web-api-node/src/webapi-request");
const HttpManager = require("spotify-web-api-node/src/http-manager");

// Initialize the Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});


router.get('/followed-artists', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/spotify');
    }

    const accessToken = req.user.accessToken;
    spotifyApi.setAccessToken(accessToken);

    // Assuming you have a method to get friends, replace this with the actual API call
    spotifyApi.getFollowedArtists({ limit: 30 })
        .then(data => {
            const artists = data.body.artists.items;
            res.render('followed-artists', { artists: artists });
        })
        .catch(err => {
            console.error('Error fetching artists list:', err);
            res.status(500).send('Error artists list');
        });
});

module.exports = router;