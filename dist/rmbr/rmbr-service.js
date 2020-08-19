"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xss_1 = __importDefault(require("xss"));
// import { db, id } from "../"
const RmbrService = {
    getAllRmbrs: (db) => {
        return db
            .from('rmbrme_rmbrs')
            .select('*');
    },
    getById: (db, id) => {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('id', id)
            .first();
    },
    getByUserId: (db, uid) => {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('user_id', uid);
    },
    insertRmbr: (db, newRmbr) => {
        return db
            .insert(newRmbr)
            .into('rmbrme_rmbrs')
            .returning('*')
            .then(([rmbr]) => rmbr)
            .then((rmbr) => RmbrService.getById(db, rmbr.id));
    },
    deleteRmbr: (db, id) => {
        return db
            .from('rmbrme_rmbrs')
            .where('id', id)
            .delete();
    },
    updateRmbr: (db, id, newRmbrFields) => {
        return db
            .from('rmbrme_rmbrs')
            .where('id', id)
            .update(newRmbrFields);
    },
    serializeRmbr: (rmbr) => {
        return {
            id: rmbr.id,
            person_id: rmbr.person_id,
            user_id: rmbr.user_id,
            rmbr_title: xss_1.default(rmbr.rmbr_title),
            rmbr_text: xss_1.default(rmbr.rmbr_text),
            category: rmbr.category,
            date_created: rmbr.date_created,
            date_modified: rmbr.date_modified
        };
    }
};
exports.default = RmbrService;
//# sourceMappingURL=rmbr-service.js.map