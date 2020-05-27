const express = require('../../node_modules/express');
const PersonService = require('./person-service')
const { requireAuth } = require('../middleware/jwt-auth')

const jsonParser = express.json()
const personRouter = express.Router()

personRouter
    .route('/')
    // .all(requireAuth)
    .get((req, res, next) => {
        PersonService.getAllPersons(req.app.get('db'))
            .then(people => {
                res.json(people.map(PersonService.serializePerson))
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
        PersonService.insertPerson(
            req.app.get('db'),
            newPerson
        )
            .then(person => {
                res
                .status(201)
                .location(`/api/person/${person.id}`)
                .json(person)
            })
            .catch(next)
    })

personRouter
    .route('/user/:user_id')
    // .all(requireAuth)
    // .all(checkPersonExists)
    .get((req, res, next) => {
        const { user_id } = req.params;
        PersonService.getPersonByUserId(req.app.get('db'), user_id)
          .then((person) => {
            res.json(person);
          })
          .catch(next);
      });

personRouter
    .route('/:person_id/rmbr')
    // .all(requireAuth)
    // .all(checkPersonExists)
    .get((req, res, next) => {
        PersonService.getRmbrByPersonId(
            req.app.get('db'),
            req.params.person_id
        )
        .then(rmbrs => {
            res.json(rmbrs.map(PersonService.serializeRmbr))
        })
        .catch(next)
    });

personRouter
    .route('/:person_id')
    .get((req, res, next) => {
        const { person_id } = req.params;
        PersonService.getPersonById(
            req.app.get('db'),
            person_id
        )
        .then((person) => {
            res.json(person)
        })
        .catch(next)
    })
    .delete((req, res, next) => {
        const { person_id } = req.params;
        PersonService
            .deletePerson(
                req.app.get('db'),
                person_id
            )
            .then(() => {
                res.status(204)
                    .end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { person_name, user_id, type_of_person } = req.body;
        const personToUpdate = { person_name, user_id, type_of_person };
        const numOfValues = Object.values(personToUpdate).filter(Boolean).length;
        if (numOfValues===0) {return res.status(400).json({error: {message: `Request body content requires 'title', 'person id', and 'user id'`}})};
        PersonService.updatePerson(
            req.app.get('db'),
            req.params.person_id,
            personToUpdate
        )
            .then(person => {
                res
                    .json(person)
                    .status(204)
                    .end()
            })
            .catch(next)
    });

// Wait for promises, yo.
// async function checkPersonExists(req, res, next) {
//     try {
//         const person = await PersonService.getPeoplebyuser_id(
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

module.exports = personRouter