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
// rmbr router
var _a = require('express'), Router = _a.Router, json = _a.json;
var requireAuth = require('../middleware/jwt-auth').requireAuth;
var jsonBodyParser = json();
var path = require('path');
var rmbrRouter = Router();
// service
var RmbrService = require('./rmbr-service.js');
rmbrRouter
    .route('/')
    .all(requireAuth)
    .get(function (req, res, next) {
    RmbrService.getAllRmbrs(req.app.get('db'))
        .then(function (rbr) {
        res.json(rbr.map(RmbrService.serializeRmbr));
    })
        .catch(next);
})
    .post(jsonBodyParser, function (req, res, next) {
    var _a = req.body, rmbr_title = _a.rmbr_title, rmbr_text = _a.rmbr_text, person_id = _a.person_id, user_id = _a.user_id;
    var newRmbr = { rmbr_title: rmbr_title, rmbr_text: rmbr_text, person_id: person_id, user_id: user_id };
    for (var _i = 0, _b = Object.entries(newRmbr); _i < _b.length; _i++) {
        var _c = _b[_i], key = _c[0], value = _c[1];
        if (value === null)
            return res.status(400).json({
                error: "Missing " + key + " in request"
            });
    }
    RmbrService.insertRmbr(req.app.get('db'), newRmbr)
        .then(function (rmbr) {
        res
            .status(201)
            .location(path.posix.join(req.originalUrl, "/" + rmbr.id))
            .json(RmbrService.serializeRmbr(rmbr));
    })
        .catch(next);
});
rmbrRouter
    .route('/:rmbr_id')
    .all(requireAuth)
    .all(checkRmbrExists)
    .get(function (req, res) {
    res.json(RmbrService
        .serializeRmbr(res.rmbr));
})
    .delete(function (req, res, next) {
    // need rmbr id to delete
    var rmbr_id = req.params.rmbr_id;
    RmbrService
        .deleteRmbr(req.app.get('db'), rmbr_id)
        .then(function () {
        res
            .status(204)
            .end();
    })
        .catch(next);
})
    .patch(jsonBodyParser, function (req, res, next) {
    var _a = req.body, rmbr_title = _a.rmbr_title, rmbr_text = _a.rmbr_text, person_id = _a.person_id, user_id = _a.user_id;
    var rmbrToUpdate = { rmbr_title: rmbr_title, rmbr_text: rmbr_text, person_id: person_id, user_id: user_id };
    // if nothing is in request body, return error
    var numOfValues = Object.values(rmbrToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
        return res
            .status(400)
            .json({
            error: { message: "Request body content requires 'title', 'person id', and 'user id'" }
        });
    }
    ;
    RmbrService.updateRmbr(req.app.get('db'), req.params.rmbr_id, rmbrToUpdate)
        .then(function () {
        RmbrService.getAllRmbrs(req.app.get('db'))
            .then(function (rbr) {
            res
                .json(rbr.map(RmbrService.serializeRmbr))
                .status(204)
                .end();
        })
            .catch(next);
    });
});
rmbrRouter
    .route('/user/:user_id')
    .all(requireAuth)
    .get(function (req, res, next) {
    RmbrService.getByUserId(req.app.get('db'), req.params.user_id)
        .then(function (rbr) {
        res.json(rbr.map(RmbrService.serializeRmbr));
    })
        .catch(next);
});
// check to see if rmbr exists
function checkRmbrExists(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var rmbr, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, RmbrService.getById(req.app.get('db'), req.params.rmbr_id)];
                case 1:
                    rmbr = _a.sent();
                    if (!rmbr)
                        return [2 /*return*/, res.status(404).json({
                                error: "Rmbr doesn't exist"
                            })
                            // if the rmbr exists, continue
                        ];
                    // if the rmbr exists, continue
                    res.rmbr = rmbr;
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
module.exports = rmbrRouter;
