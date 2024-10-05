const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const SpotifyWebApi = require('spotify-web-api-node');
const SpotifyStrategy = require('passport-spotify').Strategy;
const PORT = process.env.PORT || 3000;

require('dotenv').config();

const app = express();
app.use(cors());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new SpotifyStrategy({
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        callbackURL: process.env.SPOTIFY_REDIRECT_URI
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
    console.info('accessToken:', accessToken);
        profile.accessToken = accessToken;
        return done(null, profile);
    }));

app.get('/auth/spotify',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private'],
        showDialog: true
    })
);

app.get('/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.render('home', { title: 'Play list 2 set List', profileInfo: req.user });
});

app.get('/profile', (req, res) => {
    const userProfile = req.user; // Assuming userProfile is stored in session
    if (!userProfile) {
        return res.status(404).send('Profile not found');
    }
    res.render('profile', {userProfile: userProfile});
});
app.get('/profile/json', (req, res) => {
    const userProfile = req.user; // Assuming userProfile is stored in session
    if (!userProfile) {
        return res.status(404).send('Profile not found');
    }
    res.json(userProfile);
});


// Initialize the Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

app.get('/my-playlist', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/spotify');
    }

    const accessToken = req.user.accessToken;
    console.info('accessToken:', accessToken);
    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getUserPlaylists()
        .then(data => {
            const playlists = data.body.items;
            res.render('my-playlist', { playlists: playlists });
        })
        .catch(err => {
            console.error('Error fetching playlists:', err);
            res.status(500).send('Error fetching playlists');
        });
});
const PDFDocument = require('pdfkit');

app.get('/export-pdf/:playlistId', (req, res) => {
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

            doc.fontSize(25).text(playlist.name, { align: 'center' });
            doc.moveDown();

            playlist.tracks.items.forEach((item, index) => {
                doc.fontSize(12).text(`${index + 1}. ${item.track.name}`);
            });

            doc.end();
        })
        .catch(err => {
            console.error('Error fetching playlist:', err);
            res.status(500).send('Error fetching playlist');
        });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;