
/**
	* Node.js Login Boilerplate
	* More Info : http://kitchen.braitsch.io/building-a-login-system-in-node-js-and-mongodb/
	* Copyright (c) 2013-2016 Stephen Braitsch
**/

var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var morgan       = require('morgan');
var app = express();

app.use(morgan('dev'));
app.locals.pretty = true;
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'ejs');
app.use(session({
    secret: 'quizzit',
    resave: true,
    saveUninitialized: false,
    cookie: { httpOnly: false },
    name: 'quizzit'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/app/public'));

require('./app/server/routes')(app);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
