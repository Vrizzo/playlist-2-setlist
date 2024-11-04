const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const PDFDocument = require('pdfkit');

// Initialize the Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

router.get('/my-playlist', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/spotify');
    }

    const accessToken = req.user.accessToken;
    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getUserPlaylists('dalamar5',{ limit: 30})
        .then(data => {
            const playlists = data.body.items;
            res.render('my-playlist', { playlists: playlists });
        })
        .catch(err => {
            console.error('Error fetching playlists:', err);
            res.status(500).send('Error fetching playlists');
        });
});

router.get('/export-pdf/:playlistId', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/spotify');
    }

    const accessToken = req.user.accessToken;
    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getPlaylist(req.params.playlistId)
        .then(data => {
            const playlist = data.body;
            const doc = new PDFDocument();
            let filename = encodeURIComponent(playlist.name) + '.pdf';
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);

            doc.fontSize(30).text(playlist.name, { align: 'center' });
            doc.moveDown();

            playlist.tracks.items.forEach((item, index) => {
                doc.fontSize(19).text(`${index + 1}. ${item.track.name}`);
            });

            doc.end();
        })
        .catch(err => {
            console.error('Error fetching playlist:', err);
            res.status(500).send('Error fetching playlist');
        });
});

module.exports = router;