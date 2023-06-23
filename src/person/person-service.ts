import xss from 'xss';
import { db } from '../database/connect';

const PersonService = {
  getAllPersons: () => {
    return db
        .from('people')
        .select('*')
  },
  getPersonById: (id: number) => {
    return PersonService.getAllPersons()
        .where('id', id)
        .first()
  },
  getPeopleWithRmbrCountByUserId: (user_id: number) => {
    return PersonService.getAllPersons()
        .where('user_id', user_id)
        .select('people.*')
        .leftJoin(
            db.from('rmbrs')
                .select('person_id')
                .count('id as numOfRmbrs')
                .from('rmbrs')
                .groupBy('person_id')
                .as('rmbrs_count'),
            'people.id',
            'rmbrs_count.person_id'
        );
  },
  insertPerson: (newPerson: object) => {
    return db
        .insert(newPerson)
        .into('people')
        .returning('*')
        .then(([person]: any) => person)
        .then((person: any) =>
            PersonService.getPersonById(person.id)
        )
  },

  deletePerson: (id: number) => {
    return db
        .from('people')
        .where('id', id)
        .delete()
  },

  updatePerson: (id: number, fields: any) => {
    return db
        .from('people')
        .where('id', id)
        .update(fields)
        .then((res) =>
            PersonService.getPersonById(id)
        )
  },
  serializePerson: (person: any) => {
    return {
      id: person.id,
      name: xss(person.name),
      category: xss(person.category),
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
      title: xss(rmbr.title),
      category: rmbr.category,
      description: xss(rmbr.description),
      person_id: rmbr.person_id
    }
  },
  getRmbrByPersonId: (person_id: number) => {
    return db
        .from('rmbrs')
        .select('*')
        .where('person_id', person_id)
  }
};

export default PersonService;
