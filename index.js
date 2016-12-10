var dispatch = require('dispatch');
var http = require('http');
var fs = require('fs-extra');
var path = require('path');
var Chance = require('chance');
var chance = new Chance();

var config = require('./src/config');
var jobs = require('./src/jobs');

config.setup();

var server = http.createServer(
    dispatch({
        "/jobs": {
            "POST": function (req, res, next) {
                jobs.create(req, res);
            }
        },
        '/jobs/:id': {
            "GET": function (req, res, id) {
                jobs.list(req, res, id);
            }
        }
    })
);

server.listen(config.port, function () {
    console.log("Server listening on: http://localhost:%s", config.port);
});
