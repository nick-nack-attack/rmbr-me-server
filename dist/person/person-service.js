var xss = require('../../node_modules/xss');
var PersonService = {
    getAllPersons: function (db) {
        return db
            .from('rmbrme_people')
            .select('*');
    },
    getPersonById: function (db, id) {
        return PersonService.getAllPersons(db)
            .where('id', id)
            .first();
    },
    getPersonByUserId: function (db, user_id) {
        return PersonService.getAllPersons(db)
            .where('user_id', user_id);
    },
    insertPerson: function (db, newPerson) {
        return db
            .insert(newPerson)
            .into('rmbrme_people')
            .returning('*')
            .then(function (_a) {
            var person = _a[0];
            return person;
        })
            .then(function (person) {
            return PersonService.getPersonById(db, person.id);
        });
    },
    deletePerson: function (db, id) {
        return db
            .from('rmbrme_people')
            .where('id', id)
            .delete();
    },
    updatePerson: function (db, id, fields) {
        return db
            .from('rmbrme_people')
            .where('id', id)
            .update(fields)
            .then(function (res) {
            return PersonService.getPersonById(db, id);
        });
    },
    serializePerson: function (person) {
        return {
            id: person.id,
            person_name: xss(person.person_name),
            type_of_person: xss(person.type_of_person),
            user_id: person.user_id,
            first_met: person.first_met,
            last_contact: person.last_contact,
            date_created: person.date_created,
            date_modified: person.date_modified,
        };
    },
    serializeRmbr: function (rmbr) {
        return {
            id: rmbr.id,
            rmbr_title: xss(rmbr.rmbr_title),
            category: rmbr.category,
            rmbr_text: xss(rmbr.rmbr_text),
            person_id: rmbr.person_id
        };
    },
    getRmbrByPersonId: function (db, person_id) {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('person_id', person_id);
    }
};
module.exports = PersonService;
