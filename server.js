var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

/* Helper functions */

// Send 404

function send404(response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

// Serving file data

function sendFile(response, filePath, fileContents){
    response.writeHead(
        200,
        {'Content-Type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

// Check if file is cached to determine how it will be served

function serveStatic(response, cache, absPath){
    // Check if file is cached in memory
    if (cache[absPath]){
        sendFile(response, absPath, cache[absPath]); // Serve file from memory
    } else {
        fs.exists(absPath, function(exists){        // Check if file exists
            if(exists){
                fs.readFile(absPath, function(err, data){   // Read file from disk
                 if (err){
                    send404(response);
                 } else {
                     cache[absPath] = data;
                     sendFile(response, absPath, data);     // Serve file read from disk
                 }
                });
            }
            else {
                send404(response);      // Send HTTP 404 response
            }
        });
    }
}

/* Create the http server */

var server = http.createServer(function(request, response){
    var filePath = false;
    if (request.url === '/'){
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

/* Start the http server */

server.listen(3000, function(){
    console.log("Server listening on port 3000");
});

/* Socket.io server */

var chatServer = require('./lib/chat_server');
chatServer.listen(server);


