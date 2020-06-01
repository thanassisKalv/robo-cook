var express = require('express');
var app = express();
var path = require('path');

const port = 8080;
const IP = "localhost";

// viewed at http://localhost:8080
app.use(express.static('.'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//app.listen(8080, "195.251.117.235");
app.listen(port, IP, () => console.log(`\nRobo-Cook listening on ${IP}:${port}!`))