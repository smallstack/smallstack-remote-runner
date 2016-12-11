var jobManager = require("./jobs");
var _ = require("underscore");
var execSync = require("child_process").execSync;
var path = require("path");

process.on("message", function(job) {
    // var job = JSON.parse(message);
    // if (!job || !job.id)
    //     throw new Error("recieved message, but it wasn't a job!");

    process.send({ status: "started", id: job.id });
    jobManager.log(job.id, "info", "Starting Job");
    try {
        _.each(job.configuration.commands, function(command) {
            jobManager.log(job.id, "info", "Executing Command: " + JSON.stringify(command));
            var log = execSync(command.command, {
                cwd: path.join(job.configuration.workingDirectory, command.cwd ? command.cwd : "")
            });
            if (log instanceof Buffer)
                log = log.toString();
            jobManager.log(job.id, "info", log);
        });
    } catch (e) {
        jobManager.log(job.id, "error", e.message);
        jobManager.log(job.id, "info", "Job Failed");
        jobManager.updateStatus(job.id, "failed");
        process.send({ status: "done", id: job.id });
        return;
    }
    jobManager.log(job.id, "info", "Job Done");
    jobManager.updateStatus(job.id, "finished");
    process.send({ status: "done", id: job.id });
});
