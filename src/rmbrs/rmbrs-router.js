const express = require('express')
const path = require('path')
const RmbrsService = require('./rmbrs-service.js')

const rmbrsRouter = express.Router()
const jsonParser = express.json()

rmbrsRouter
    .route('/')
    .post( jsonParser, (req, res, next) => {
        const { rmbr_title, category, rmbr_xtra_text, person_id } = req.body
        const newRmbr = { rmbr_title, category, rmbr_xtra_text, person_id }

        for (const [key,value] of Object.entries(newRmbr))
            if (value == null)
                return res.status(400).json({error: `Missing ${key} in request`})

        RmbrsService.insertRmbr(
            req.app.get('db'),
            newRmbr
        )
        .then(rmbr => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${rmbr.id}`))
                .json(RmbrsService.serializeRmbr(rmbr))
        })
        .catch(next)
    })

    module.exports = rmbrsRouter