// rmbr router
import {json, Router, Request, Response, NextFunction} from "express";
import requireAuth from "../middleware/jwt-auth";
import * as path from "path";

// services
import RmbrService from "./rmbr-service";

// set variables
const jsonBodyParser = json();
const rmbrRouter = Router();

interface IRmbr {
  id: number;
  title: string;
  description: string;
  personId: number;
  userId: number;
  created: string;
  modified: string;
}

rmbrRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    RmbrService.getAllRmbrs(
    )
      .then((rbrs) => {
        const formattedRmbrs = rbrs.map((r) => {
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
  })
  .post(jsonBodyParser, (req, res, next) => {
    const {title, description, person_id, user_id} = req.body;
    const newRmbr = {title, description, person_id, user_id};
    for (const [key, value] of Object.entries(newRmbr))
      if (value === null)
        return res.status(400).json({
          error: `Missing ${key} in request`
        });
    RmbrService.insertRmbr(
      newRmbr
    )
      .then((rmbr) => {
        const formattedRmbr = {
          ...rmbr,
          personId: rmbr.person_id,
          userId: rmbr.user_id,
          dateCreated: rmbr.date_created,
          dateModified: rmbr.date_modified,
        }

        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${rmbr.id}`))
          .json(RmbrService.serializeRmbr(formattedRmbr))
      })
      .catch(next)
  })

rmbrRouter
  .route('/:rmbr_id')
  .all(requireAuth)
  .all(checkRmbrExists)
  .get((req, res) => {
    res.json(RmbrService
      .serializeRmbr(res['rmbr']))
  })
  .delete((req, res, next) => {
    // need rmbr id to delete
    const {rmbr_id} = req.params;
    RmbrService
      .deleteRmbr(
        rmbr_id
      )
      .then(() => {
        res
          .status(204)
          .end()
      })
      .catch(next)
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const {title, description, person_id, user_id} = req.body;
    const rmbrToUpdate = {title, description, person_id, user_id};
    // if nothing is in request body, return error
    const numOfValues = Object.values(rmbrToUpdate).filter(Boolean).length
    if (numOfValues === 0) {
      return res
        .status(400)
        .json({
          error: {message: `Request body content requires 'title', 'person id', and 'user id'`}
        })
    }

    RmbrService.updateRmbr(
      req.params.rmbr_id,
      rmbrToUpdate
    )
      .then(() => {
        RmbrService.getById(req.params.rmbr_id)
          .then((rbr) => {
            const formattedRmbr = {
                ...rbr,
                personId: rbr.person_id,
                userId: rbr.user_id,
                dateCreated: rbr.date_created,
                dateModified: rbr.date_modified,
            }

            console.log(`found rbr: ${JSON.stringify(formattedRmbr)}`);

            return res.json(formattedRmbr);
          })
          .catch(next)
      })
  })

rmbrRouter
  .route('/user/:user_id')
  .all(requireAuth)
  .get((req, res, next) => {
    RmbrService.getByUserId(
      +req.params.user_id
    )
      .then((rbrs) => {
        const formattedRmbrs = rbrs.map((r) => {
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
  })

// check to see if rmbr exists
async function checkRmbrExists(req: Request, res: Response, next: NextFunction) {
  try {
    const rmbr = await RmbrService.getById(
      Number(req.params.rmbr_id)
    )
    if (!rmbr)
      return res.status(404)
        .json({
        error: `Rmbr doesn't exist`
      })
    // if the rmbr exists, continue
    res['rmbr'] = rmbr;
    next();

  } catch (error) {
    next(error)
  }
}

export default rmbrRouter;
