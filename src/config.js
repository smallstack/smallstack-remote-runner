var path = require("path");
var fs = require("fs-extra");

var baseDirectory = path.join(__dirname, "../");

module.exports = {
    "port": process.env.PORT || 8080,
    "baseDirectory": baseDirectory,
    "jobsDirectory": path.join(baseDirectory, "jobs"),
    "setup": function () {
        fs.ensureDirSync(this.jobsDirectory);
    }
}
