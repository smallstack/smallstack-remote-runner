var dispatch = require('dispatch');
var http = require('http');
var fs = require('fs-extra');
var path = require('path');
var Chance = require('chance');
var chance = new Chance();

var config = require('./src/config');
var jobs = require('./src/jobs');
var executor = require('./src/executor');

config.setup();

var server = http.createServer(
    dispatch({
        "/jobs": {
            "POST": function (req, res, next) {
                jobs.create(req, res);
            },
            "GET": function (req, res) {
                res.write(executor.list());
                res.end();
            }
        },
        "/jobs/:id": {
            "GET": function (req, res, id) {
                jobs.list(req, res, id);
            },
            "DELETE": function (req, res, id) {
                jobs.clean(id);
                res.write("Job with ID '" + id + "' removed!");
                res.end();
            }
        }
    })
);

server.listen(config.port, function () {
    console.log("Server listening on: http://localhost:%s", config.port);
});
