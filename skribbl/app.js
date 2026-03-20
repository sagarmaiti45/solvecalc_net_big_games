const express = require('express');

const app = express();

const ALLOWED_ORIGINS = [
    'https://solvecalc.net',
    'https://www.solvecalc.net',
    'https://play.mobaxo.online',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
];

// Health check endpoint (bypasses origin check)
app.get('/health', (req, res) => res.send('ok'));

// Block all requests not coming from allowed origins
app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';

    const allowed = ALLOWED_ORIGINS.some(o =>
        origin === o || referer.startsWith(o)
    );

    if (!allowed) {
        return res.status(403).send('Forbidden');
    }

    // Set frame-ancestors so only solvecalc.net and localhost can iframe this
    res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://solvecalc.net https://www.solvecalc.net http://localhost:* http://127.0.0.1:*"
    );
    res.setHeader('X-Frame-Options', 'ALLOW-FROM https://solvecalc.net');

    next();
});

app.use(express.static(`${__dirname}/public`));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const roomID = req.query.id;
    res.render('index', { roomID });
});

module.exports = app;
