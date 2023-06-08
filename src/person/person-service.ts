import xss from 'xss';
import { db } from '../database/connect';

const PersonService = {
  getAllPersons: () => {
    return db
        .from('rmbrme_people')
        .select('*')
  },
  getPersonById: (id: number) => {
    return PersonService.getAllPersons()
        .where('id', id)
        .first()
  },
  getPersonByUserId: (user_id: number) => {
    return PersonService.getAllPersons()
        .where('user_id', user_id)
  },
  insertPerson: (newPerson: object) => {
    return db
        .insert(newPerson)
        .into('rmbrme_people')
        .returning('*')
        .then(([person]: any) => person)
        .then((person: any) =>
            PersonService.getPersonById(person.id)
        )
  },

  deletePerson: (id: number) => {
    return db
        .from('rmbrme_people')
        .where('id', id)
        .delete()
  },

  updatePerson: (id: number, fields: any) => {
    return db
        .from('rmbrme_people')
        .where('id', id)
        .update(fields)
        .then((res) =>
            PersonService.getPersonById(id)
        )
  },
  serializePerson: (person: any) => {
    return {
      id: person.id,
      person_name: xss(person.person_name),
      type_of_person: xss(person.type_of_person),
      user_id: person.user_id,
      first_met: person.first_met,
      last_contact: person.last_contact,
      date_created: person.date_created,
      date_modified: person.date_modified,
    }
  },
  serializeRmbr: (rmbr: any) => {
    return {
      id: rmbr.id,
      rmbr_title: xss(rmbr.rmbr_title),
      category: rmbr.category,
      rmbr_text: xss(rmbr.rmbr_text),
      person_id: rmbr.person_id
    }
  },
  getRmbrByPersonId: (person_id: number) => {
    return db
        .from('rmbrme_rmbrs')
        .select('*')
        .where('person_id', person_id)
  }
};

export default PersonService;
