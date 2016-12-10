# smallstack-remote-runner
Executes any kind of commands on a remote computing instance via REST.

## Why?
For many operations in our company we needed a solution that outsources heavy load tasks to an external computing instance, e.g. testing, bundling, deploying and provisioning of our own software and projects. Until now this was done by Continuous Integration Software like Jenkins. Unfortunately, synchronizing the configuration of many projects is an overhead that cannot be underestimated. With TravisCI we found a system that could be managed via a configuration file inside the repository, but still you need to configure and maintain plans, sync logs back into your system etc.pp.

So we are looking for a simple piece of software that:
- executes commands
- saves the logs
- does both over a REST API

Rundeck seemed to be a good catch, but the administration isn't trivial. Combining some ideas of Travis CI, Jenkins and Rundeck, removing all unnecessary overhead like the WebUI, authentication/authorization and voila, the result is a tiny node script that does excatly what we need.

## How-to install
Either run it via "npm run start" or deploy it as Docker Image. Be aware that there is no authentication, so if you plug a remote-runner into your existing environment, be sure its not accessible for others.

## How-to use?
### Start a job
Do a POST to /jobs with the following content as json:
```
{
  "commands": [
    {
      "command": "git clone https://github.com/smallstack/project-cuppy.git .",
      "workingDirectory": "."
    },
    {
      "command": "npm install"
    },
    {
      "command": "smallstack clean generate compile"
    },
    {
      "command": "smallstack deploy -apiKey=$API_KEY"
    }
  ]
}
```
and you'll get back a response with the created job ID: 
```
{
  "id": "e3jFJijeFHoeiuhIOUHFweio"
  "status": "queued",
  "configuration": { ... }
}
```

### Get a job result
Do a GET on /jobs/e3jFJijeFHoeiuhIOUHFweio and you will get back a response like
```
{
  "id": "e3jFJijeFHoeiuhIOUHFweio"
  "status": "running",
  "configuration": { ... },
  "logs": [
    {
      "level": "info",
      "timestamp": "...",
      "message": "Executing command (...)"
    }
  ]
}
```
