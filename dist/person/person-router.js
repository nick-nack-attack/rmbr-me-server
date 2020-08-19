"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// person router
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
// service
const person_service_1 = __importDefault(require("./person-service"));
const jwt_auth_1 = require("../middleware/jwt-auth");
const jsonParser = express_1.json();
const personRouter = express_1.Router();
const config = require('../config');
// all endpoints require authentication
personRouter
    .route('/')
    .all(jwt_auth_1.requireAuth)
    .get((req, res, next) => {
    person_service_1.default.getAllPersons(req.app.get('db'))
        .then(people => {
        // return people after serialization
        res.json(people.map(person_service_1.default.serializePerson));
    })
        .catch(next);
})
    .post(jsonParser, (req, res, next) => {
    const { person_name, type_of_person, user_id } = req.body;
    const newPerson = { person_name, type_of_person, user_id };
    // if a value is missing, return error and field missing
    for (const [key, value] of Object.entries(newPerson))
        if (value === undefined || value == null)
            return res.status(400).json({
                error: `Missing '${key}' in request body`
            });
    // else insert the new person
    person_service_1.default.insertPerson(req.app.get('db'), newPerson)
        .then(person => {
        res
            .status(201)
            .location(path_1.default.posix.join(req.originalUrl, `/${person.id}`)) // .location(`/api/person/${person.id}`)
            .json(person);
    })
        .catch(next);
});
// get all people that belong to a user
personRouter
    .route('/user/:user_id')
    .all(jwt_auth_1.requireAuth)
    .get((req, res, next) => {
    const { user_id } = req.params;
    person_service_1.default.getPersonByUserId(req.app.get('db'), user_id)
        .then((person) => {
        person_service_1.default.serializePerson(res.json(person));
    })
        .catch(next);
});
// get all rmbrs for a specific person
personRouter
    .route('/:person_id/rmbr')
    .all(jwt_auth_1.requireAuth)
    .all(checkPersonExists)
    .get((req, res, next) => {
    person_service_1.default.getRmbrByPersonId(req.app.get('db'), req.params.person_id)
        .then(rmbrs => {
        res.json(rmbrs.map(person_service_1.default.serializeRmbr));
    })
        .catch(next);
});
// get, change, or delete person by id
personRouter
    .route('/:person_id')
    .all(jwt_auth_1.requireAuth)
    .all(checkPersonExists)
    .get((req, res, next) => {
    person_service_1.default.getPersonById(req.app.get('db'), req.params.person_id)
        .then((person) => {
        person_service_1.default.serializePerson(res.json(person));
    })
        .catch(next);
})
    .delete((req, res, next) => {
    const { person_id } = req.params;
    person_service_1.default
        .deletePerson(req.app.get('db'), person_id)
        .then(() => {
        res
            .status(204)
            .end();
    })
        .catch(next);
})
    .patch(jsonParser, (req, res, next) => {
    // set variable with fields that need to be updated
    const { person_name, user_id, type_of_person } = req.body;
    const personToUpdate = { person_name, user_id, type_of_person };
    // if req body is missing a field, return error and field missing
    const numOfValues = Object.values(personToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
        return res
            .status(400)
            .json({
            error: { message: `Request body content requires 'title', 'person id', and 'user id'` }
        });
    }
    ;
    person_service_1.default.updatePerson(req.app.get('db'), req.params.person_id, personToUpdate)
        .then(person => {
        res
            .json(person)
            .status(204)
            .end();
    })
        .catch(next);
});
// check if a person exists before CRUD 
function checkPersonExists(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const person = yield person_service_1.default.getPersonById(req.app.get('db'), req.params.person_id);
            if (!person)
                return res.status(404).json({
                    error: `Person doesn't exist`
                });
            // if person exists, then move on
            res.person = person;
            next();
        }
        catch (error) {
            next(error);
        }
    });
}
;
function checkPermission(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.user.role != config.ADMIN_PERMISSION)
                return res.status(401).json({
                    error: `Unauthorized`
                });
            next();
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = personRouter;
//# sourceMappingURL=person-router.js.map