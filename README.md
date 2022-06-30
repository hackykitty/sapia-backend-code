# Sapia Backend Code(Test)

This repo is to demonstrate to build a simple express(typescript) based server for logging with JWT authtoken, Unit Test with [Jest](https://jestjs.io/), Integration Test with [supertest](https://www.npmjs.com/package/supertest), MongoDB Unit Test with [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) and [dockerization](https://www.docker.com/).

## Features
- Express(Typescript)
- JWT authentication
- Unit Test/Integration Test
- SwaggerUI
- Dockerization

## Installation & Development
This project requires [Node.js](https://nodejs.org) v14+ and [Docker](https://www.docker.com) to run
Install the dependencies and devDependencies and start the server.
```sh
cd sapia-backend-code
yarn install
sudo ./scripts/run_dev_dbs.sh -r #run mongodb docker image
yarn dev
open http://localhost:3000/swagger
```

For production environments...

```sh
cd sapia-backend-code
yarn install --production
sudo ./scripts/run_dev_dbs.sh -r #run mongodb docker image
yarn build
yarn start
open http://localhost:3000/swagger
```


## Docker

Sapia Backend Code is very easy to install and deploy in a Docker container.

By default, the Docker will expose port 8080, so change this within theDockerfile if necessary. 
When ready, simply use the Dockerfile tobuild the image.

```sh
cd sapia-backend-code
docker build -t <youruser>/sapia-backend-code:${package.json.version} .
```

This will create the sapia-backend-code image and pull in the necessary dependencies.
Be sure to swap out `${package.json.version}` with the actual version of sapia-backend-code.

Once done, run the Docker image and map the port to whatever you wish onyour host. 
In this example, we simply map port 3000 of the host to port 3000 of the Docker 
(or whatever port was exposed in the Dockerfile):

```sh
sudo docker run --rm -p 3000:3000 --name sapia-backend-code -e MONGO_URL=mongodb://localhost/exmp sapia-backend-code:${package.json.version}
```

> Note: `MONGO_URL=mongodb://localhost/exmp` is required for MongoDB service.

Verify the deployment by navigating to your server address in your preferred browser.

```sh
http://localhost:3000/swagger
```

### Docker Cluster 

You can push the sapia-backend-code docker image to your Docker hub repository (private or public) to run it on any node where docker is installed. It is downloaded automatically when you try to run it for the first time.
A public [sapia-backend-code](https://hub.docker.com/r/yhaibo1116/sapia-backend-code) repository is created already.

To run Docker Cluster on your machine, you just need to run the following command
```sh
sudo ./scripts/run.sh
```
Verify the deployment by navigating to your server address in your preferred browser.
```sh
http://sapia-backend-code.local/swagger
```
## License

MIT

**Good educational project**
