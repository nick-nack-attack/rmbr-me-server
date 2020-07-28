// person router
const { json, Router } = require('express');
const jsonParser = json();
const personRouter = Router();
const path = require('path');

// service
const PersonService = require('./person-service');
const { requireAuth } = require('../middleware/jwt-auth')

// all endpoint require authentication
personRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        PersonService.getAllPersons(
            req.app.get('db')
        )
        .then(people => {
            // return people after serialization
            res.json(
                people.map(
                    PersonService.serializePerson
                )
            )
        })
        .catch(next)
    })
    .post( jsonParser, (req, res, next) => {

        const { person_name, type_of_person, user_id } = req.body;
        const newPerson = { person_name, type_of_person, user_id };

        // if a value is missing, return error and field missing
        for (const [key, value] of Object.entries(newPerson)) 
            if (value === undefined || value == null) 
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
        
        // else insert the new person
        PersonService.insertPerson(
            req.app.get('db'),
            newPerson
        )
            .then(person => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${person.id}`)) // .location(`/api/person/${person.id}`)
                    .json(person)
            })
            .catch(next)
    })

personRouter
    .route('/user/:user_id')
    .all(requireAuth)
    .get((req, res, next) => {

        const { user_id } = req.params;

        PersonService.getPersonByUserId(
            req.app.get('db'),
            user_id
        )
          .then((person) => {
            PersonService.serializePerson(
                res.json(person)
            )
          })
          .catch(next);
      });

personRouter
    .route('/:person_id/rmbr')
    .all(requireAuth)
    .all(checkPersonExists)
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
    .all(requireAuth)
    .all(checkPersonExists)
    .get((req, res, next) => {
        PersonService.getPersonById(
            req.app.get('db'),
            req.params.person_id
        )
        .then((person) => {
            PersonService.serializePerson(
                res.json(person)
            )
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
                    res
                        .status(204)
                        .end()
                })
                .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {

        // set variable with fields that need to be updated
        const { person_name, user_id, type_of_person } = req.body;
        const personToUpdate = { person_name, user_id, type_of_person };

        // if req body is missing a field, return error and field missing
        const numOfValues = Object.values(personToUpdate).filter(Boolean).length;
        if (numOfValues===0) {
            return res
                .status(400)
                .json({ 
                    error: {message: `Request body content requires 'title', 'person id', and 'user id'`}
                })
        };

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

// check if a person exists before CRUD 
async function checkPersonExists(req, res, next) {
    
    try {
        const person = await PersonService.getPersonById(
            req.app.get('db'),
            req.params.person_id
        )

    if (!person)
        return res.status(404).json({
            error:`Person doesn't exist`
        });

    // if person exists, then move on
    res.person = person;
    next();

    } catch (error) {
        next(error)
    }
}

module.exports = personRouter;