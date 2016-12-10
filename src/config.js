var path = require("path");
var fs = require("fs-extra");

module.exports = {
    "port": process.env.PORT || 8080,
    "jobsDirectory": path.join(__dirname, "../jobs"),
    "setup": function () {
        fs.ensureDirSync(this.jobsDirectory);
    }
}
