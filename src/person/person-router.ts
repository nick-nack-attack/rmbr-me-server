// person router
import {json, Router} from "express";
import * as path from "path";

// service
import PersonService from "./person-service";

import requireAuth from "../middleware/jwt-auth";
import {ADMIN_PERMISSION} from "../config";
import {IPerson} from "./types";

const jsonParser = json();
const personRouter = Router();


// all endpoints require authentication
personRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        PersonService.getAllPersons()
            .then(people => {
                // return people after serialization
                res.json(people)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {name, category, userId} = req.body;
        const newPerson = {name, category, user_id: userId};

        // if a value is missing, return error and field missing
        for (const [key, value] of Object.entries(newPerson))
            if (value === undefined || value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });

        // else insert the new person
        PersonService.insertPerson(newPerson)
            .then(person => {
                res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${person.id}`)) // .location(`/api/person/${person.id}`)
                    .json(person)
            })
            .catch(next)
    })

// get all people that belong to a user
personRouter
    .route('/user/:user_id')
    .all(requireAuth)
    .get((req, res, next) => {
        const {user_id} = req.params;
        PersonService.getPeopleWithRmbrCountByUserId(+user_id)
            .then((person) => {
                PersonService.serializePerson(
                    res.json(person)
                )
            })
            .catch(next);
    });

// get all rmbrs for a specific person
personRouter
    .route('/:person_id/rmbr')
    .all(requireAuth)
    .all(checkPersonExists)
    .get((req, res, next) => {
        PersonService.getRmbrByPersonId(+req.params.person_id)
            .then(rmbrs => {
                const formattedRmbrs = rmbrs.map((r) => {
                    return {
                        ...r,
                        personId: r.person_id,
                        userId: r.user_id,
                        dateCreated: r.date_created,
                        dateModified: r.date_modified,
                    }
                })
                res.json(formattedRmbrs)
            })
            .catch(next)
    });

// get, change, or delete person by id
personRouter
    .route('/:person_id')
    .all(requireAuth)
    .all(checkPersonExists)
    .get(async (req, res, next) => {
        const person: IPerson = await PersonService.getPersonById(+req.params.person_id);

        // @ts-ignore
        if (person.user_id !== req.user.id) {
            return res
                .status(401)
                .json({ error: `Unauthorized request`, status: 401 });
        }

        PersonService.getPersonById(+req.params.person_id)
            .then((person) => {
                res.json({
                    ...person,
                    dateModified: person.date_modified,
                    dateCreated: person.date_created,
                })
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const {person_id} = req.params;

        PersonService
            .deletePerson(+person_id)
            .then(() => {
                res
                    .status(204)
                    .end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        // set variable with fields that need to be updated
        const {name, user_id, category} = req.body;
        const personToUpdate = {name, user_id, category};

        // if req body is missing a field, return error and field missing
        const numOfValues = Object.values(personToUpdate).filter(Boolean).length;
        if (numOfValues === 0) {
            return res
                .status(400)
                .json({
                    error: {message: `Request body content requires 'title', 'person id', and 'user id'`}
                })
        }

        PersonService.updatePerson(+req.params.person_id, personToUpdate)
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
        const person = await PersonService.getPersonById(req.params.person_id);

        if (!person)
            return res.status(404).json({
                error: `Person doesn't exist`
            });

        // if person exists, then move on
        res.person = person;

        next();
    } catch (error) {
        next(error)
    }
}

async function checkPermission(req, res, next) {
    try {
        if (req.user.role != ADMIN_PERMISSION)
            return res.status(401).json({
                error: `Unauthorized`
            });
        next();
    } catch (err) {
        console.log(err)
    }
}

export default personRouter;
