var fork = require("child_process").fork;
var _ = require("underscore");

var currentRunningProcesses = {};

module.exports = {
    "start": function (job) {
        var executor = this;
        currentRunningProcesses[job.id] = fork("./src/worker");

        currentRunningProcesses[job.id].on('message', function (m) {
            console.log("received: ", m);
            if (m.id && m.status === "done")
                executor.stop(m.id);
        });

        currentRunningProcesses[job.id].send(job);
    },
    "stop": function (id) {
        if (currentRunningProcesses[id]) {
            currentRunningProcesses[id].kill("SIGKILL");
            delete currentRunningProcesses[id];
            console.log("Job '" + id + "' stopped!");
        }
    },
    "list": function () {
        var list = "";
        _.each(currentRunningProcesses, function (process, jobId) {
            var job = require("./jobs").read(jobId);
            if (list !== "")
                list += "\n";
            list += "job '" + job.id + "' => " + job.status;
        });
        return list;
    }
}
