var express = require('express');
var http = require("http");
var bodyParser = require('body-parser');
var socket = require('socket.io');
var fs = require('fs');
var moment = require('moment');
var app = express();
var routes = require('./routes');

var server = http.Server(app);
var portNumber = 8080; 

server.listen(process.env.PORT || portNumber);

var io = socket(server);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res) {
    res.render('pages/customer');
});


app.get('/customerapp.html', function(req, res) {
    res.render('pages/customer');
});

app.get('/driverapp.html', function(req, res) {
    res.render('pages/driver');
});

app.get('/dashboard.html',  function(req, res) {
    res.render('pages/dashboard');
});

app.get('/api/ridedata', function(req, res) {
    let currentTime = moment();
    fs.readFile('data.json', 'utf8', function (err, data) {
        if(err) return err;
        var rides = JSON.parse(data);
        rides = rides.filter(ride => currentTime.diff(moment(ride.requestTime), 'hours') < 1)
        return res.send(rides);
    });
});

app.get('api/ride/waiting', function(req, res) {
    let currentTime = moment();
    fs.readFile('data.json', 'utf8', function (err, data) {
        if(err) return err;
        var rides = JSON.parse(data);
        rides = rides.filter(ride => currentTime.diff(moment(ride.requestTime), 'hours') < 1 && ride.status === 'Waiting');
        return res.send(rides);
    });
});

app.get('/api/driverdata', function(req, res) {
    let driverId = req.query.driverId,
        currentTime = moment();

    fs.readFile('data.json', 'utf8', function (err, data) {
        if(err) return err;
        var rides = JSON.parse(data),
            driverRides = rides.filter(ride => currentTime.diff(moment(ride.requestTime), 'hours') < 1 && 
                (ride.status === 'Waiting' || ride.driverId === driverId));

        return res.send(driverRides);
    });
});

io.on('connection', function(socket) { //Listen on the 'connection' event for incoming sockets
    socket.on('join', function(data) { //Listen to any join event from connected users
        socket.join(data.customerId); //User joins a unique room/channel that's named after the userId 
        console.log("User joined room: " + data.customerId);
    });
    routes.initialize(app, socket, io); //Pass socket and io objects that we could use at different parts of our app
});

console.log('Running')