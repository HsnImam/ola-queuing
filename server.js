var express = require('express');
var http = require("http");
var bodyParser = require('body-parser');
var socket = require('socket.io');
var app = express();
var routes = require('./routes');

var server = http.Server(app);
var portNumber = 8080; 

server.listen(portNumber);

var io = socket(server);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))


// app.get('/', function(req, res) {
//     res.render('pages/index');
// });

app.get('/driverapp.html', function(req, res) {
    res.render('pages/driver');
});


app.get('/customerapp.html', function(req, res) {
    res.render('pages/customer');
});

app.post('/rideRequest', function(req,res){
    console.log(req.body.customerId);
});

io.on('connection', function(socket) { //Listen on the 'connection' event for incoming sockets
    socket.on('join', function(data) { //Listen to any join event from connected users
        socket.join(data.customerId); //User joins a unique room/channel that's named after the userId 
        console.log("User joined room: " + data.customerId);
    });
    routes.initialize(app, socket, io); //Pass socket and io objects that we could use at different parts of our app
});

console.log('Running')