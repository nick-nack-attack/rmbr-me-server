import * as xss from 'xss';
import { db } from '../database/connect';

const RmbrService = {
  getAllRmbrs: () => {
    return db
      .from('rmbrme_rmbrs')
      .select('*')
  },
  getById: (id: number|string) => {
    return db
      .from('rmbrme_rmbrs')
      .select('*')
      .where('id', id)
      .first()
  },
  getByUserId: (uid: number) => {
    return db
      .from('rmbrme_rmbrs')
      .select('*')
      .where('user_id', uid)
  },
  insertRmbr: (newRmbr: object) => {
    return db
      .insert(newRmbr)
      .into('rmbrme_rmbrs')
      .returning('*')
      .then(([rmbr]: any) => rmbr)
      .then((rmbr: any) =>
        RmbrService.getById(rmbr.id)
      )
  },
  deleteRmbr: (id) => {
    return db
      .from('rmbrme_rmbrs')
      .where('id', id)
      .delete()
  },
  updateRmbr: (id, newRmbrFields) => {
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
