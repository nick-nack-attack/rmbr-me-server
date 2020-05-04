const xss = require('xss')

const RmbrsService = {

    getById(db, id) {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('id', id)
            .first()
    },

    insertRmbr(db, newRmbr) {
        return db
            .insert(newRmbr)
            .into('rmbrme_rmbrs')
            .returning('*')
            .then(([rmbr]) => rmbr)
            .then(rmbr =>
                RmbrsService.getById(db, rmbr.id)
            )
    },

    serializeRmbr(rmbr) {
        return {
            id: rmbr.id,
            rmbr_title: xss(rmbr.rmbr_title),
            category: rmbr.category,
            rmbr_xtra_text: xss(rmbr.rmbr_xtra_text),
            person_id: rmbr.person_id
        }
    }

}

module.exports = RmbrsService