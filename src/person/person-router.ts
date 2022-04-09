// person router
import {json, Router} from "express";
import * as path from "path";

// service
import PersonService from "./person-service";

import requireAuth from "../middleware/jwt-auth";
import { ADMIN_PERMISSION } from "../config";

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
    const {person_name, type_of_person, user_id} = req.body;
    const newPerson = {person_name, type_of_person, user_id};

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
    PersonService.getPersonByUserId(+user_id)
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
        res.json(rmbrs.map(PersonService.serializeRmbr))
      })
      .catch(next)
  });

// get, change, or delete person by id
personRouter
  .route('/:person_id')
  .all(requireAuth)
  .all(checkPersonExists)
  .get((req, res, next) => {
    PersonService.getPersonById(+req.params.person_id)
      .then((person) => {
        PersonService.serializePerson(
          res.json(person)
        )
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
    const {person_name, user_id, type_of_person} = req.body;
    const personToUpdate = {person_name, user_id, type_of_person};

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
