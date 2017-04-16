var express = require('express');
var path = require('path');
var session = require('express-session');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use("/page/css",  express.static('./public/css'));
app.use("/page/js", express.static( './public/js'));
app.use("/page/images",  express.static( './public/images'));
app.use("/page/lib",  express.static( './public/lib'));

app.use("/page/feel/css",  express.static('./public/css'));
app.use("/page/feel/js", express.static( './public/js'));
app.use("/page/feel/images",  express.static( './public/images'));
app.use("/page/feel/lib",  express.static( './public/lib'));

app.use(session({secret: "mengfanxu", resave: false, saveUninitialized: false}));

app.use('/', index);
app.use('/users', users);
app.use('/page',require("./routes/page"));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
