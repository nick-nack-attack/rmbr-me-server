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
// rmbr router
const express_1 = require("express");
const jwt_auth_1 = require("../middleware/jwt-auth");
const path_1 = __importDefault(require("path"));
// services
const rmbr_service_1 = __importDefault(require("./rmbr-service"));
// set variables
const jsonBodyParser = express_1.json();
const rmbrRouter = express_1.Router();
rmbrRouter
    .route('/')
    .all(jwt_auth_1.requireAuth)
    .get((req, res, next) => {
    rmbr_service_1.default.getAllRmbrs(req.app.get('db'))
        .then(rbr => {
        res.json(rbr.map(rmbr_service_1.default.serializeRmbr));
    })
        .catch(next);
})
    .post(jsonBodyParser, (req, res, next) => {
    const { rmbr_title, rmbr_text, person_id, user_id } = req.body;
    const newRmbr = { rmbr_title, rmbr_text, person_id, user_id };
    for (const [key, value] of Object.entries(newRmbr))
        if (value === null)
            return res.status(400).json({
                error: `Missing ${key} in request`
            });
    rmbr_service_1.default.insertRmbr(req.app.get('db'), newRmbr)
        .then(rmbr => {
        res
            .status(201)
            .location(path_1.default.posix.join(req.originalUrl, `/${rmbr.id}`))
            .json(rmbr_service_1.default.serializeRmbr(rmbr));
    })
        .catch(next);
});
rmbrRouter
    .route('/:rmbr_id')
    .all(jwt_auth_1.requireAuth)
    .all(checkRmbrExists)
    .get((req, res) => {
    res.json(rmbr_service_1.default
        .serializeRmbr(res.rmbr));
})
    .delete((req, res, next) => {
    // need rmbr id to delete
    const { rmbr_id } = req.params;
    rmbr_service_1.default
        .deleteRmbr(req.app.get('db'), rmbr_id)
        .then(() => {
        res
            .status(204)
            .end();
    })
        .catch(next);
})
    .patch(jsonBodyParser, (req, res, next) => {
    const { rmbr_title, rmbr_text, person_id, user_id } = req.body;
    const rmbrToUpdate = { rmbr_title, rmbr_text, person_id, user_id };
    // if nothing is in request body, return error
    const numOfValues = Object.values(rmbrToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
        return res
            .status(400)
            .json({
            error: { message: `Request body content requires 'title', 'person id', and 'user id'` }
        });
    }
    ;
    rmbr_service_1.default.updateRmbr(req.app.get('db'), req.params.rmbr_id, rmbrToUpdate)
        .then(() => {
        rmbr_service_1.default.getAllRmbrs(req.app.get('db'))
            .then(rbr => {
            res
                .json(rbr.map(rmbr_service_1.default.serializeRmbr))
                .status(204)
                .end();
        })
            .catch(next);
    });
});
rmbrRouter
    .route('/user/:user_id')
    .all(jwt_auth_1.requireAuth)
    .get((req, res, next) => {
    rmbr_service_1.default.getByUserId(req.app.get('db'), req.params.user_id)
        .then(rbr => {
        res.json(rbr.map(rmbr_service_1.default.serializeRmbr));
    })
        .catch(next);
});
// check to see if rmbr exists
function checkRmbrExists(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rmbr = yield rmbr_service_1.default.getById(req.app.get('db'), req.params.rmbr_id);
            if (!rmbr)
                return res.status(404).json({
                    error: `Rmbr doesn't exist`
                });
            // if the rmbr exists, continue
            res.rmbr = rmbr;
            next();
        }
        catch (error) {
            next(error);
        }
    });
}
exports = rmbrRouter;
//# sourceMappingURL=rmbr-router.js.map