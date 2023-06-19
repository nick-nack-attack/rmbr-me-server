import * as xss from 'xss';
import { db } from '../database/connect';

const RmbrService = {
  getAllRmbrs: () => {
    return db
      .from('rmbrs')
      .select('*')
  },
  getById: (id: number|string) => {
    return db
      .from('rmbrs')
      .select('*')
      .where('id', id)
      .first()
  },
  getByUserId: (uid: number) => {
    return db
      .from('rmbrs')
      .select('*')
      .where('user_id', uid)
  },
  insertRmbr: (newRmbr: object) => {
    return db
      .insert(newRmbr)
      .into('rmbrs')
      .returning('*')
      .then(([rmbr]: any) => rmbr)
      .then((rmbr: any) =>
        RmbrService.getById(rmbr.id)
      )
  },
  deleteRmbr: (id) => {
    return db
      .from('rmbrs')
      .where('id', id)
      .delete()
  },
  updateRmbr: (id, newRmbrFields) => {
    return db
      .from('rmbrs')
      .where('id', id)
      .update(newRmbrFields)
  },
  serializeRmbr: (rmbr) => {
    return {
      id: rmbr.id,
      personId: rmbr.person_id,
      userId: rmbr.user_id,
      title: xss.filterXSS(rmbr.title),
      description: xss.filterXSS(rmbr.description),
      category: rmbr.category,
      date_created: rmbr.date_created,
      date_modified: rmbr.date_modified
    }
  }
};

export default RmbrService;
