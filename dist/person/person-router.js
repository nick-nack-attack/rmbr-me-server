var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// person router
var _a = require('express'), json = _a.json, Router = _a.Router;
var jsonParser = json();
var personRouter = Router();
var path = require('path');
var config = require('../config');
// service
var PersonService = require('./person-service');
var requireAuth = require('../middleware/jwt-auth').requireAuth;
// all endpoints require authentication
personRouter
    .route('/')
    .all(requireAuth)
    .get(function (req, res, next) {
    PersonService.getAllPersons(req.app.get('db'))
        .then(function (people) {
        // return people after serialization
        res.json(people.map(PersonService.serializePerson));
    })
        .catch(next);
})
    .post(jsonParser, function (req, res, next) {
    var _a = req.body, person_name = _a.person_name, type_of_person = _a.type_of_person, user_id = _a.user_id;
    var newPerson = { person_name: person_name, type_of_person: type_of_person, user_id: user_id };
    // if a value is missing, return error and field missing
    for (var _i = 0, _b = Object.entries(newPerson); _i < _b.length; _i++) {
        var _c = _b[_i], key = _c[0], value = _c[1];
        if (value === undefined || value == null)
            return res.status(400).json({
                error: "Missing '" + key + "' in request body"
            });
    }
    // else insert the new person
    PersonService.insertPerson(req.app.get('db'), newPerson)
        .then(function (person) {
        res
            .status(201)
            .location(path.posix.join(req.originalUrl, "/" + person.id)) // .location(`/api/person/${person.id}`)
            .json(person);
    })
        .catch(next);
});
// get all people that belong to a user
personRouter
    .route('/user/:user_id')
    .all(requireAuth)
    .get(function (req, res, next) {
    var user_id = req.params.user_id;
    PersonService.getPersonByUserId(req.app.get('db'), user_id)
        .then(function (person) {
        PersonService.serializePerson(res.json(person));
    })
        .catch(next);
});
// get all rmbrs for a specific person
personRouter
    .route('/:person_id/rmbr')
    .all(requireAuth)
    .all(checkPersonExists)
    .get(function (req, res, next) {
    PersonService.getRmbrByPersonId(req.app.get('db'), req.params.person_id)
        .then(function (rmbrs) {
        res.json(rmbrs.map(PersonService.serializeRmbr));
    })
        .catch(next);
});
// get, change, or delete person by id
personRouter
    .route('/:person_id')
    .all(requireAuth)
    .all(checkPersonExists)
    .get(function (req, res, next) {
    PersonService.getPersonById(req.app.get('db'), req.params.person_id)
        .then(function (person) {
        PersonService.serializePerson(res.json(person));
    })
        .catch(next);
})
    .delete(function (req, res, next) {
    var person_id = req.params.person_id;
    PersonService
        .deletePerson(req.app.get('db'), person_id)
        .then(function () {
        res
            .status(204)
            .end();
    })
        .catch(next);
})
    .patch(jsonParser, function (req, res, next) {
    // set variable with fields that need to be updated
    var _a = req.body, person_name = _a.person_name, user_id = _a.user_id, type_of_person = _a.type_of_person;
    var personToUpdate = { person_name: person_name, user_id: user_id, type_of_person: type_of_person };
    // if req body is missing a field, return error and field missing
    var numOfValues = Object.values(personToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
        return res
            .status(400)
            .json({
            error: { message: "Request body content requires 'title', 'person id', and 'user id'" }
        });
    }
    ;
    PersonService.updatePerson(req.app.get('db'), req.params.person_id, personToUpdate)
        .then(function (person) {
        res
            .json(person)
            .status(204)
            .end();
    })
        .catch(next);
});
// check if a person exists before CRUD 
function checkPersonExists(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var person, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, PersonService.getPersonById(req.app.get('db'), req.params.person_id)];
                case 1:
                    person = _a.sent();
                    if (!person)
                        return [2 /*return*/, res.status(404).json({
                                error: "Person doesn't exist"
                            })];
                    // if person exists, then move on
                    res.person = person;
                    next();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    next(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
;
function checkPermission(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (req.user.role != config.ADMIN_PERMISSION)
                    return [2 /*return*/, res.status(401).json({
                            error: "Unauthorized"
                        })];
                next();
            }
            catch (err) {
                console.log(err);
            }
            return [2 /*return*/];
        });
    });
}
module.exports = personRouter;
