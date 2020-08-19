import * as xss from "xss";
import type * as Knex from 'knex';
// import { db, id } from "../"

function foo(bar: object, baz: string) {
  // does whatever it wants!
}

const RmbrService = {
  getAllRmbrs: (db: Knex) => {
    return db
      .from('rmbrme_rmbrs')
      .select('*')
  },
  getById: (db: Knex, id: number|string) => {
    return db
      .from('rmbrme_rmbrs')
      .select('*')
      .where('id', id)
      .first()
  },
  getByUserId: (db: Knex, uid: number) => {
    return db
      .from('rmbrme_rmbrs')
      .select('*')
      .where('user_id', uid)
  },
  insertRmbr: (db: Knex, newRmbr: object) => {
    return db
      .insert(newRmbr)
      .into('rmbrme_rmbrs')
      .returning('*')
      .then(([rmbr]: any) => rmbr)
      .then((rmbr: any) =>
        RmbrService.getById(db, rmbr.id)
      )
  },
  deleteRmbr: (db, id) => {
    return db
      .from('rmbrme_rmbrs')
      .where('id', id)
      .delete()
  },
  updateRmbr: (db, id, newRmbrFields) => {
    return db
      .from('rmbrme_rmbrs')
      .where('id', id)
      .update(newRmbrFields)
  },
  serializeRmbr: (rmbr) => {
    return {
      id: rmbr.id,
      person_id: rmbr.person_id,
      user_id: rmbr.user_id,
      rmbr_title: xss.filterXSS(rmbr.rmbr_title),
      rmbr_text: xss.filterXSS(rmbr.rmbr_text),
      category: rmbr.category,
      date_created: rmbr.date_created,
      date_modified: rmbr.date_modified
    }
  }
};

export default RmbrService;