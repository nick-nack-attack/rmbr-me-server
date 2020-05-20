const xss = require('./node_modules/xss')

const PersonService = {

    getAllPeople(db) {
        return db
            .from('rmbrme_people AS ppl')
            .select(
            'ppl.id',
            'ppl.person_name',
            'ppl.type_of_person',
            'ppl.first_met',
            'ppl.last_contact',
            'ppl.date_created',
            'ppl.date_modified',
            db.raw(
                `count(DISTINCT rbr) AS number_of_rmbrs`
            ),
            db.raw(
                `json_strip_nulls(
                    json_build_object(
                        'id', usr.id,
                        'user_name', usr.user_name,
                        'date_created', usr.date_created
                    )
                ) AS "user"`
            ),
        )
        .leftJoin(
            'rmbrme_rmbrs AS rbr',
            'ppl.id',
            'rbr.person_id',
            )
        .leftJoin(
            'rmbrme_users AS usr',
            'ppl.user_id',
            'usr.id'
        )
        .groupBy('ppl.id', 'usr.id')

    },

    getbyId(db, id) {
        return PersonService.getAllPeople(db)
            .where('ppl.id', id)
            .first()
    },
    getPeoplebyUserId(db, user_id) {
        return PersonService.getAllPeople(db)
            .where('usr.id', user_id)
    },

    insertPerson(db, newPerson) {
        return db
          .insert(newPerson)
          .into('rmbrme_people')
          .returning('*')
          .then(([person]) => person);
      },
    // insertPerson(db, newPerson) {
    //         return db
    //             .insert(newPerson)
    //             .into('rmbrme_people')
    //             .returning('*')
    //             .then(([returnPerson]) => returnPerson)
    //             .then(person =>
    //                 PersonService.getbyId(db, person.id)
    //         )
    // },

    serializePerson(person) {

        // const { user } = person
    
        return {
          id: person.id,
          person_name: xss(person.person_name),
          type_of_person: xss(person.type_of_person),
          user_id: person.user_id,
          first_met: person.first_met,
          last_contact: person.last_contact,
          date_created: person.date_created,
          date_modified: person.date_modified,
        //   user: {
        //     id: user.id,
        //     user_name: user.user_name,
        //     date_created: new Date(user.date_created)
        //   },
        }  
    },

    serializePersonRmbr(rmbr) {

        return {
            id: rmbr.id,
            rmbr_title: xss(rmbr.rmbr_title),
            category: rmbr.category,
            rmbr_text: xss(rmbr.rmbr_text),
            person_id: rmbr.person_id
        }
    },

    getRmbrsForPerson(db, person_id) {
        return db
            .from('rmbrme_rmbrs')
            .select('*')
            .where('person_id',person_id)
    }
}

module.exports = PersonService