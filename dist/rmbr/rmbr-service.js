// rmbr service
var xss = require('xss');
var RmbrService = {
    getAllRmbrs: function (db) {
        return db
            .from('rmbrme_rmbrs')
            .select('*');
    },
    getById: function (db, id) {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('id', id)
            .first();
    },
    getByUserId: function (db, uid) {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('user_id', uid);
    },
    insertRmbr: function (db, newRmbr) {
        return db
            .insert(newRmbr)
            .into('rmbrme_rmbrs')
            .returning('*')
            .then(function (_a) {
            var rmbr = _a[0];
            return rmbr;
        })
            .then(function (rmbr) {
            return RmbrService.getById(db, rmbr.id);
        });
    },
    deleteRmbr: function (db, id) {
        return db
            .from('rmbrme_rmbrs')
            .where('id', id)
            .delete();
    },
    updateRmbr: function (db, id, newRmbrFields) {
        return db
            .from('rmbrme_rmbrs')
            .where('id', id)
            .update(newRmbrFields);
    },
    serializeRmbr: function (rmbr) {
        return {
            id: rmbr.id,
            person_id: rmbr.person_id,
            user_id: rmbr.user_id,
            rmbr_title: xss(rmbr.rmbr_title),
            rmbr_text: xss(rmbr.rmbr_text),
            date_created: rmbr.date_created,
            date_modified: rmbr.date_modified
        };
    }
};
module.exports = RmbrService;
