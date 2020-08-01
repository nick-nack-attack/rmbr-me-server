const xss = require('../../node_modules/xss');

const PersonService = {
    getAllPersons: (db) => {
        return db
            .from('rmbrme_people')
            .select('*')
    },
    getPersonById: (db, id) => {
        return PersonService.getAllPersons(db)
            .where('id', id)
            .first()
    },
    getPersonByUserId: (db, user_id) => {
        return PersonService.getAllPersons(db)
            .where('user_id', user_id)
    },
    insertPerson: (db, newPerson) => {
        return db
          .insert(newPerson)
          .into('rmbrme_people')
          .returning('*')
          .then(([person]) => person)
            .then(person =>
                PersonService.getPersonById(db, person.id)
            )
      },
    deletePerson: (db, id) => {
        return db
            .from('rmbrme_people')
            .where('id', id)
            .delete()
    },
    updatePerson: (db, id, fields) => {
        return db
            .from('rmbrme_people')
            .where('id', id)
            .update(fields)
            .then(res =>
                PersonService.getPersonById(db, id)
            )
    },
    serializePerson: (person) => {
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
    serializeRmbr: (rmbr) => {
        return {
            id: rmbr.id,
            rmbr_title: xss(rmbr.rmbr_title),
            category: rmbr.category,
            rmbr_text: xss(rmbr.rmbr_text),
            person_id: rmbr.person_id
        }
    },
    getRmbrByPersonId: (db, person_id) => {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('person_id',person_id)
    }
};

module.exports = PersonService;
