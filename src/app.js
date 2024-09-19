const http = require('http');
const express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const ejs = require('ejs');
const secrets = require('./config/session.config.js');
const app = express();

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile );

app.use(express.static('./static'));
app.disable('etag');
app.use(express.urlencoded({ extended: true }));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: secrets.sessionSecret,
    cookie: {
        expires: 6000000 //reduce
    }
}));

app.use(cookieParser(secrets.cookieSecret))

app.use('/', require('./routing/userRouting'));

app.use('/',require('./routing/productRouting'));

app.use('/',require('./routing/orderRouting'));

app.use((req,res) => {
    res.render('404', {url : req.url});
})

const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, console.log(`server started on port = ${PORT}`));