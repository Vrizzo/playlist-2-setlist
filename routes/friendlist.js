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

// Custom function to get followed users
spotifyApi.getFollowedUsers = function(options, callback) {
    return this._addMethods({
        getFollowedUsers: function(options, callback) {
            return WebApiRequest.builder(this.getAccessToken())
                .withPath('/v1/me/following/contains')
                .withQueryParameters({
                    ids: artistIds.join(','),
                    type: 'artist'
                })
                .build()
                .execute(HttpManager.get, callback);
        }
    }).getFollowedUsers(options, callback);
};
router.get('/my-friends', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/spotify');
    }

    const accessToken = req.user.accessToken;
    spotifyApi.setAccessToken(accessToken);

    // Assuming you have a method to get friends, replace this with the actual API call
    spotifyApi.getFollowedUsers({ limit: 30 })
        .then(data => {
            const friends = data.body.artists.items;
            res.render('my-friends', { friends: friends });
        })
        .catch(err => {
            console.error('Error fetching friends:', err);
            res.status(500).send('Error fetching friends');
        });
});

module.exports = router;