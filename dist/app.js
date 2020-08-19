"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-var-requires
require("dotenv").config();
// middleware and configuration
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = __importDefault(require("./config"));
// routers
const person_router_1 = __importDefault(require("./person/person-router"));
const rmbr_router_1 = __importDefault(require("./rmbr/rmbr-router"));
const auth_router_1 = __importDefault(require("./auth/auth-router"));
const user_router_1 = __importDefault(require("./user/user-router"));
// main express root
const app = express_1.default();
const morganOption = (config_1.default.NODE_ENV === 'production')
    ? 'tiny'
    : 'common';
// initialize middleware
app.use(morgan_1.default(morganOption));
app.use(cors_1.default());
app.use(helmet_1.default());
// basic root to confirm server is running
app.get('/', (req, res) => {
    res.send("Server's buns are buttered");
});
// api endpoints
app.use("/api/person", person_router_1.default);
app.use("/api/rmbr", rmbr_router_1.default);
app.use("/api/auth", auth_router_1.default);
app.use("/api/user", user_router_1.default);
// define error handler
const errorHandler = (err, req, res, next) => {
    let response;
    if (config_1.default.NODE_ENV === 'production') {
        response = {
            error: {
                message: 'server error'
            }
        };
    }
    else {
        // tslint:disable-next-line:no-console
        console.error(err);
        response = {
            message: err.message, err
        };
    }
    res.status(500).json(response);
};
// use error handler
app.use(errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map