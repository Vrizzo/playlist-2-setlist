const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const playlistRoutes = require('./src/routes/playlist');
const PORT = process.env.PORT || 3000;

require('dotenv').config();

function expressInit() {
    const app = express();
    app.use(cors());
    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({secret: 'your_secret_key', resave: false, saveUninitialized: true}));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/', playlistRoutes);
    return app;
}

const app = expressInit();

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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;