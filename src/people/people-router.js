const express = require('express')
const PeopleService = require('./people-service')
const { requireAuth } = require('../middleware/jwt-auth')

const jsonParser = express.json()
const peopleRouter = express.Router()

peopleRouter
    .route('/')
    // .all(requireAuth)
    .get((req, res, next) => {
        PeopleService.getAllPeople(req.app.get('db'))
            .then(people => {
                res.json(people.map(PeopleService.serializePerson))
            })
            .catch(next)
    })
    .post( jsonParser, (req, res, next) => {
        const { person_name, type_of_person, user_id } = req.body
        const newPerson = { person_name, type_of_person, user_id }
        for (const field of ['person_name', 'type_of_person','user_id'])
                if (!req.body[field])
                  return res.status(400).json({
                    error: `Missing '${field}' in request body`
                  })
        PeopleService.insertPerson(
            req.app.get('db'),
            newPerson
        )
            .then(person => {
                res
                .status(201)
                .location(`/api/people/${person.id}`)
                    // .location(path.posix.join(req.originalUrl, `/${person.id}`))
                    .json(PeopleService.serializePerson(person))
            })
            .catch(next)
    })

peopleRouter
    .route('/users/:user_id')
    // .all(requireAuth)
    // .all(checkPersonExists)
    .get((req, res, next) => {
        const { user_id } = req.params;
        PeopleService.getPeoplebyUserId(req.app.get('db'), user_id)
          .then((person) => {
            res.json(person);
          })
          .catch(next);
      });

peopleRouter
    .route('/:person_id/rmbrs')
    // .all(requireAuth)
    // .all(checkPersonExists)
    .get((req, res, next) => {
        PeopleService.getRmbrsForPerson(
            req.app.get('db'),
            req.params.person_id
        )
        .then(rmbrs => {
            res.json(rmbrs.map(PeopleService.serializePersonRmbr))
        })
        .catch(next)
    });

peopleRouter
    .route('/:person_id')
    .get((req, res, next) => {
        const { person_id } = req.params;
        PeopleService.getbyId(
            req.app.get('db'),
            person_id
        )
        .then((person) => {
            res.json(person)
        })
        .catch(next)
    })

// Wait for promises, yo.
// async function checkPersonExists(req, res, next) {
//     try {
//         const person = await PeopleService.getPeoplebyUserId(
//             req.app.get('db'),
//             req.params.user_id
//         )

//     if(!person)
//         return res.status(404).json({
//             error:`User id doesn't exist`
//         })

//     res.person = person
//     next()
//     }
//     catch(error) { 
//         next(error) 
//     }
// }

module.exports = peopleRouter