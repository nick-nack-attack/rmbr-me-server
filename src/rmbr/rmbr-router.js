const express = require('express')
const path = require('path')
const RmbrService = require('./rmbr-service.js')
const { requireAuth } = require('../middleware/jwt-auth')

const rmbrRouter = express.Router()
const jsonParser = express.json()

rmbrRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        RmbrService.getAllRmbrs(req.app.get('db'))
            .then(rbr => {
                res.json(rbr.map(RmbrService.serializeRmbr))
            })
            .catch(next)
    })
    .post( jsonParser, (req, res, next) => {
        const { rmbr_title, rmbr_text, person_id, user_id } = req.body
        const newRmbr = { rmbr_title, rmbr_text, person_id, user_id }

        for (const [key,value] of Object.entries(newRmbr))
            if (value === null) 
                return res.status(400).json({error: `Missing ${key} in request`})

        RmbrService.insertRmbr(
            req.app.get('db'),
            newRmbr
        )
        .then(rmbr => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${rmbr.id}`))
                .json(RmbrService.serializeRmbr(rmbr))
        })
        .catch(next)
    })

rmbrRouter
    .route('/:rmbr_id')
    .all(requireAuth)
    .all(checkRmbrExists)
    .get((req, res) => {
        res.json(RmbrService.serializeRmbr(res.rmbr))
    })
    .delete((req, res, next) => {
        const { rmbr_id } = req.params;
        RmbrService
            .deleteRmbr(
                req.app.get('db'),
                rmbr_id
            )
            .then(() => {
                res.status(204)
                .end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { rmbr_title, rmbr_text, person_id, user_id } = req.body;
        const rmbrToUpdate = { rmbr_title, rmbr_text, person_id, user_id };
        const numOfValues = Object.values(rmbrToUpdate).filter(Boolean).length
        if (numOfValues===0) {return res.status(400).json({error: {message: `Request body content requires 'title', 'person id', and 'user id'`}})}
         RmbrService.updateRmbr(
             req.app.get('db'),
             req.params.rmbr_id,
             rmbrToUpdate
         )
             .then(() => {
                 RmbrService.getAllRmbrs(req.app.get('db'))
                     .then(rbr => {
                         res
                             .json(rbr.map(RmbrService.serializeRmbr))
                             .status(204)
                             .end()
                     })
                     .catch(next)
             })
     })

rmbrRouter
    .route('/user/:user_id')
    .all(requireAuth)
    .get((req, res, next) => {
        RmbrService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
        .then(rbr => {
            res.json(rbr.map(RmbrService.serializeRmbr))
        })
        .catch(next)
    })

async function checkRmbrExists(req, res, next) {
    try {
        const rmbr = await RmbrService.getById(
            req.app.get('db'),
            req.params.rmbr_id
        )
    if(!rmbr)
        return res.status(404).json({
            error: `Rmbr doesn't exist`
        })
    res.rmbr = rmbr
    next()
    }
    catch(error) {
        next(error)
    }
}

    module.exports = rmbrRouter