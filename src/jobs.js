var path = require("path");
var _ = require("underscore");
var fs = require("fs-extra");
var config = require("./config");
var Chance = require("chance");
var chance = new Chance();
var execSync = require('child_process').execSync;

module.exports = {
    "create": function (req, res) {
        var bodyString = [];
        var jobManager = this;
        req.on('data', function (chunk) {
            bodyString.push(chunk);
        }).on('end', function () {
            bodyString = Buffer.concat(bodyString).toString();
            var body = JSON.parse(bodyString);
            var job = {};
            job.configuration = body;
            job.id = chance.hash();
            job.configuration.workingDirectory = path.join(config.jobsDirectory, "job-" + job.id);
            fs.ensureDirSync(job.configuration.workingDirectory);
            job.status = "queued";
            job.path = "/jobs/" + job.id;
            jobManager.write(job);

            jobManager.log(job.id, "info", "Job Queued");

            // send response
            res.write(JSON.stringify(jobManager.read(job.id), null, 2));
            res.end();

            jobManager.log(job.id, "info", "Starting Job");
            try {
                _.each(job.configuration.commands, function (command) {
                    jobManager.log(job.id, "info", "Executing Command: " + JSON.stringify(command));
                    var log = execSync(command.command);
                    jobManager.log(job.id, "info", log);
                });
            } catch (e) {
                jobManager.log(job.id, "error", e.message);
                jobManager.log(job.id, "info", "Job Failed");
                jobManager.updateStatus(job.id, "failed");
                return;
            }
            jobManager.log(job.id, "info", "Job Done");
            jobManager.updateStatus(job.id, "finished");
        });
    },
    "list": function (req, res, id) {
        res.write(JSON.stringify(this.read(id), null, 2));
        res.end();
    },
    "write": function (jobJson) {
        var filePath = path.join(config.jobsDirectory, "job-" + jobJson.id, "job.json");
        fs.writeFileSync(filePath, JSON.stringify(jobJson, null, 2));
    },
    "read": function (jobId) {
        if (!jobId)
            throw new Error("No jobId given while reading job.json!");
        var filePath = path.join(config.jobsDirectory, "job-" + jobId, "job.json");
        return JSON.parse(fs.readFileSync(filePath).toString());
    },
    "log": function (jobId, level, message) {
        var job = this.read(jobId);
        if (job.logs === undefined)
            job.logs = [];
        job.logs.push({
            timestamp: new Date(),
            level: level,
            message: message
        });
        this.write(job);
    },
    "updateStatus": function (jobId, newStatus) {
        var job = this.read(jobId);
        job.status = newStatus;
        this.write(job);
    }
}
