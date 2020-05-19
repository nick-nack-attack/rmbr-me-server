const express = require('express')
const path = require('path')
const RmbrsService = require('./rmbrs-service.js')
const { requireAuth } = require('../middleware/jwt-auth')

const rmbrsRouter = express.Router()
const jsonParser = express.json()

rmbrsRouter
    .route('/')
    // .all(requireAuth)
    .get((req, res, next) => {
        RmbrsService.getAllRmbrs(req.app.get('db'))
            .then(rbr => {
                res.json(rbr.map(RmbrsService.serializeRmbr))
            })
            .catch(next)
    })
    .post( jsonParser, (req, res, next) => {
        const { rmbr_title, category, rmbr_text, person_id, user_id } = req.body
        const newRmbr = { rmbr_title, category, rmbr_text, person_id, user_id }

        for (const [key,value] of Object.entries(newRmbr))
            if (value === null) 
                return res.status(400).json({error: `Missing ${key} in request`})

        RmbrsService.insertRmbr(
            req.app.get('db'),
            newRmbr
        )
        .then(rmbr => {
            console.log('POST RMBRS FIRING!')
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${rmbr.id}`))
                .json(RmbrsService.serializeRmbr(rmbr))
        })
        .catch(next)
    })

rmbrsRouter
    .route('/:rmbr_id')
    // .all(requireAuth)
    .all(checkRmbrExists)
    .get((req, res) => {
        res.json(RmbrsService.serializeRmbr(res.rmbr))
    })
    .patch((req, res) => {
         res.json(RmbrsService.serializeRmbr(res.rmbr))
     })

async function checkRmbrExists(req, res, next) {
    try {
        const rmbr = await RmbrsService.getById(
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

    module.exports = rmbrsRouter