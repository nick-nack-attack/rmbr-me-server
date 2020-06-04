# rmbrme - Note Taking App

## Description
This is for remembering stuff about people you care about. 
You create people and attached rmbrs (notes) to them. 
`Rmbr` is the branding name for a note about someone.

## Security
JWT authentication provides extra security for users.
The user will be logged out if idle for an amount of time.

##Table of Contents
1. [Setup](#Setup)
2. [Technology](#Technology)
3. [Endpoints](#Endpoints)
4. [Scripts](#Scripts)
5. [Deploying](#Deploying)
6. [Special Thanks](#Thanks)

## Setup
Complete the following steps to start a new project (NEW-PROJECT-NAME):
1. Clone this repository to your local machine `git clone https://github.com/nick-nack-attack/rmbr-me-server.git NEW-PROJECTS-NAME`
2. `cd` into the cloned repo.
3. Run `rm -rf` and `.git && git init` to start new git tracking.
4. Run `npm install` to install node dependencies.
5. I have provided an `.env` file to for development variables. Run `mv example.env .env`.

## Technology
- React (16.13.1)
- Node (13.12.0)
- Express (4.17.1)
- PostgreSQL (12.3)

## Endpoints

### Authentication
- POST `/api/login`
- POST `/api/refresh`

### Person
- GET `/api/person`
- POST `/api/person`
- GET `/api/person/:person_id`
- DELETE `/api/person/:person_id`
- PATCH `/api/person/:person_id`
- GET `/api/person/:person_id/rmbr`
- GET `/api/person/user/:user_id`

### Rmbr
- GET `/api/rmbr`
- POST `/api/rmbr`
- GET `/api/rmbr/:rmbr_id`
- DELETE `/api/rmbr/:rmbr_id`
- PATCH `/api/rmbr/:rmbr_id`
- GET `/api/rmbr/user/:user_id`

### User
- POST `/api/user`

## Scripts

`npm start` - starts the application.

`npm run dev` - starts nodemon. 

`npm test` - runs tests.

## Deploying

When your new project is ready for deployment, 
add a new Heroku application with `heroku create`. 
This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

## Thanks

I would like to recognize Jaime Gammel, Cali Stephans, Nicholas Hazel, Fernando Filho, and Tiago Fassoni for their guidance and support.
