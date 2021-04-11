export PROD=false
export APIURL="http://localhost:8080"
export RAPIURL="http://localhost:8081"
npm i
tsc
nodemon dist/index.js