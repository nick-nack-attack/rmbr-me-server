const xss = require('xss')

const PeopleService = {

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
        return PeopleService.getAllPeople(db)
            .where('ppl.id', id)
            .first()
    },

    insertPerson(db, newPerson) {
        return db
            .insert(newPerson)
            .into('rmbrme_people')
            .returning('*')
            .then(([person]) => person)
            .then(person =>
                PeopleService.getbyId(db, person.id)
            )
    },

    serializePerson(person) {

        const { user } = person
    
        return {
          id: person.id,
          person_name: xss(person.person_name),
          type_of_person: xss(person.type_of_person),
          user_id: person.user_id,
          first_met: person.first_met,
          last_contact: person.last_contact,
          date_created: person.date_created,
          date_modified: person.date_modified,
          user: {
            id: user.id,
            user_name: user.user_name,
            date_created: new Date(user.date_created)
          },
        }  
    },

    serializePersonRmbr(rmbr) {
        
        const { user } = rmbr

        return {
            id: rmbr.id,
            rmbr_title: xss(rmbr.rmbr_title),
            rmbr_text: xss(rmbr.rmbr_text),
            category: rmbr.category,
            person_id: rmbr.person_id,
            date_created: rmbr.date_created,
            user : {
                id: user.id,
                user_name: user.user_name,
                date_created: new Date(user.date_created)
            },
        }
    },

    getRmbrsForPerson(db, person_id) {
        return db
            .from('rmbrme_rmbrs AS rbr')
            .select(
                'rbr.id',
                'rbr.rmbr_title',
                'rbr.rmbr_text',
                'rbr.category',
                'rbr.date_created',
                'rbr.person_id',
                'rbr.date_modified',
                db.raw(
                    `json_strip_json(
                        (SELECT tmp FROM (
                            SELECT
                                usr.id,
                                usr.user_name,
                                usr.date_created
                        ) tmp)
                    )
                ) AS "user"`
            )
        )
        .where('rbr.person_id', person_id)
        .leftJoin(
            'rmbrme_users AS usr',
            'rbr.user_id',
            'usr.id'
        )
        .groupBy('rbr.id', 'usr.id')
    }
        
}

module.exports = PeopleService