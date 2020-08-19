// tslint:disable-next-line:no-var-requires
import * as config from './config';

// middleware and configuration
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

// routers
import personRouter from "./person/person-router";
import rmbrRouter from "./rmbr/rmbr-router";
import authRouter from "./auth/auth-router";
import userRouter from "./user/user-router";
import { addDbMiddleware } from "./middleware/add-db";

// main express root
const app = express();
const morganOption = (config.NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// initialize middleware
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(addDbMiddleware);

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
const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

app.listen(config.PORT, () => {
  console.log(`Server listening at http://localhost:${config.PORT}`)
})
