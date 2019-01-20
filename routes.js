var fs = require('fs');
function initialize(app, socket, io) {
    socket.on('request-for-ride', function(eventData) {
    
        var requestTime = new Date(); //Time of the request
        var ObjectID = require('mongodb').ObjectID;
        var requestId = new ObjectID;
        var status = 'Waiting';
        var customerId = eventData;

        fs.readFile('data.json', 'utf8', function (err, data) {
            if(err) console.log(err);
            var json = JSON.parse(data);
            
            if(!json) 
                json = [];

            json.push({requestId, customerId, requestTime, status});
            json = JSON.stringify(json);
        
            fs.writeFile("data.json", json, 'utf8', function(err, data) {
                if(err) console.log(err);

                Array.from({length:5}, (_,i) => i+1).forEach(i => {
                    io.sockets.in(i).emit('request-for-ride', {requestId, customerId, requestTime, status});
                });
                io.sockets.in('dashboard').emit('request-for-ride', {requestId, customerId, requestTime, status});
            });
        })
        
    });

    socket.on('ride-accepted', function({requestId, driverId}) {
        fs.readFile('data.json', 'utf8', function (err, data) {
            if(err) console.log(err);
            var json = JSON.parse(data);
            var details = json.find(o => o.requestId == requestId);
            details.status = 'Ongoing';
            details.pickedUp = new Date();
            details.driverId = driverId;
            json = JSON.stringify(json);

            fs.writeFile("data.json", json, 'utf8', function(err, data) {
                if(err) console.log(err);

                Array.from({length:5}, (_,i) => i+1).forEach(i => {
                    io.sockets.in(i).emit('ride-accepted', details);
                })
                io.sockets.in('dashboard').emit('ride-accepted', json);
            });
        });
    });


    socket.on('ride-end', function({requestId, driverId}) {
        fs.readFile('data.json', 'utf8', function (err, data) {
            if(err) console.log(err);
            var json = JSON.parse(data);
            var details = json.find(o => o.requestId == requestId);
            details.status = 'Complete';
            details.completeTime = new Date();
            json = JSON.stringify(json);

            fs.writeFile("data.json", json, 'utf8', function(err, data) {
                if(err) console.log(err);

                Array.from({length:5}, (_,i) => i+1).forEach(i => {
                    io.sockets.in(i).emit('ride-accepted', details);
                })
                io.sockets.in('dashboard').emit('ride-accepted', json);
            });
        });
    })
}

exports.initialize = initialize;