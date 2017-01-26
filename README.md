# inkdlab-shortfall

## Development Environment

### General instructions:

1. cd into ‘client’ folder
2. install dependencies using 'npm install’
3. cd into ’server’ folder
4. install dependencies using ’npm install’
5. import mock data into mongodb on the command line (not in mongo shell)
6. ‘mongoimport --jsonArray --db shortfall --collection gameData < /Users/………[your path]……/mock-gameData.json’
7. ‘mongoimport --jsonArray --db shortfall --collection users < /Users/………[your path]……/mock-users.json’
8. ‘mongoimport --jsonArray --db shortfall --collection companies < /Users/………[your path]……/mock-companies.json’
9. start ‘mongod’
10. works on ‘localhost:8080/'

### Sass instructions:

The 7-1 pattern is used to organize the stylesheets
https://sass-guidelin.es/#the-7-1-pattern

They are located in 'client/sass'