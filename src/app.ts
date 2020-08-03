// tslint:disable-next-line:no-var-requires
require("dotenv").config();

// middleware and configuration
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import config from "./config";

// routers
import personRouter from "./person/person-router";
import rmbrRouter from "./rmbr/rmbr-router";
import authRouter from "./auth/auth-router";
import userRouter from "./user/user-router";

// main express root
const app = express();
const morganOption = (config.NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

// initialize middleware
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

// basic root to confirm server is running
app.get('/', (req, res) => {
  res.send("Server's buns are buttered");
});

// api endpoints
app.use("/api/person", personRouter);
app.use("/api/rmbr", rmbrRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// define error handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let response;
  if (config.NODE_ENV === 'production') {
    response = {
      error: {
        message: 'server error'
      }
    };
  } else {
    // tslint:disable-next-line:no-console
    console.error(err);
    response = {
      message: err.message, err
    };
  }
  res.status(500).json(response)
};

// use error handler
app.use(errorHandler);

export default app;
