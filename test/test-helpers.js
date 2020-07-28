const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Truncate all tables and restart identities for database
function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                rmbrme_users,
                rmbrme_people,
                rmbrme_rmbrs RESTART IDENTITY CASCADE`
        )
        .then(() =>
            Promise.all([
                trx.raw(`ALTER SEQUENCE rmbrme_people_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE rmbrme_users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE rmbrme_rmbrs_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('rmbrme_people_id_seq', 0)`),
                trx.raw(`SELECT setval('rmbrme_users_id_seq', 0)`),
                trx.raw(`SELECT setval('rmbrme_rmbrs_id_seq', 0)`)
            ])
        )
    );
};

// Create dummy user
function makeUserArray() {
    return [
        {
            id: 1,
            user_name: 'user_name_1@gmail.com',
            password: 'password'
        },
        {
            id: 2,
            user_name: 'user_name_2@gmail.com',
            password: 'password'
        },
        {
            id: 3,
            user_name: 'user_name_3@gmail.com',
            password: 'password'
        }
    ];
}

// Create dummy people
function makePersonArray(user) {
    return [
        {
            id: 1,
            person_name: 'Test Person 1',
            type_of_person: 'Family',
            user_id: user[0].id,
            first_met: new Date(),
            last_contact: new Date(),
            date_created: new Date(),
            date_modified: new Date()
        },
        {
            id: 2,
            person_name: 'Test Person 2',
            type_of_person: 'Co-Worker',
            user_id: user[1].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            person_name: 'Test Person 3',
            type_of_person: 'Friend',
            user_id: user[2].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        }
    ];
}

// Create dummy rmbr
function makeRmbrArray(users, people) {
    return [
        {
            id: 1,
            rmbr_title: 'RmbrListItem 1 Title',
            rmbr_text: 'RmbrListItem 1 Text',
            person_id: people[0].id,
            date_created: new Date(),
            user_id: users[0].id,
            date_modified: new Date()
        },
        {
            id: 2,
            rmbr_title: 'RmbrListItem 2 Title',
            rmbr_text: 'RmbrListItem 2 Text',
            person_id: people[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[0].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            rmbr_title: 'RmbrListItem 3 Title',
            rmbr_text: 'RmbrListItem 3 Text',
            person_id: people[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 4,
            rmbr_title: 'RmbrListItem 4 Title',
            rmbr_text: 'RmbrListItem 4 Text',
            person_id: people[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 5,
            rmbr_title: 'RmbrListItem 5 Title',
            rmbr_text: 'RmbrListItem 5 Text',
            person_id: people[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 6,
            rmbr_title: 'RmbrListItem 6 Title',
            rmbr_text: 'RmbrListItem 6 Text',
            person_id: people[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        }
    ];
}

function seedTables(db, user, person, rmbr) {

    return db.transaction(async trx => {

        if (user.length > 0) {
            const preppedUserArray = user.map(usr => ({
                ...usr,
                password: bcrypt.hashSync(usr.password, 1)
            }));
            await trx.into('rmbrme_users').insert(preppedUserArray);
            await trx.raw(
                `SELECT setval('rmbrme_users_id_seq', ?)`,
                [user[user.length - 1].id]
            );
        }

        if (person.length > 0) {
            await trx.into('rmbrme_people').insert(person);
            await trx.raw(
                `SELECT setval('rmbrme_people_id_seq', ?)`,
                [person[person.length - 1].id]
            );
        }

        if (rmbr.length > 0) {
            await trx.into('rmbrme_rmbrs').insert(rmbr);
            await trx.raw(
                `SELECT setval ('rmbrme_rmbrs_id_seq', ?)`,
                [rmbr[rmbr.length - 1].id]
            );
        }

    });

}

function makeExpectedPerson(person) {
    return {
        id: person.id,
        person_name: person.person_name,
        type_of_person: person.type_of_person,
        user_id: person.user_id,
        first_met: person.first_met.toISOString(),
        last_contact: person.last_contact.toISOString(),
        date_created: person.date_created.toISOString(),
        date_modified: person.date_modified.toISOString(),
    }

}

function makeExpectedRmbr(rmbr) {

    return {
        id: rmbr.id,
        rmbr_title: rmbr.rmbr_title,
        rmbr_text: rmbr.rmbr_text,
        person_id: rmbr.person_id,
        date_created: rmbr.date_created.toISOString(),
        user_id: rmbr.user_id,
        date_modified: rmbr.date_modified.toISOString(),
    }
};

function makeMaliciousRmbr(person) {

    const maliciousRmbr = {
        id: 911,
        rmbr_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        rmbr_text: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        person_id: person.id,
        date_created: new Date().toISOString(),
        user_id: person.user_id,
        date_modified: new Date().toISOString()
    };
    const expectedRmbr = {
        ...makeExpectedRmbr([user], maliciousRmbr),
        rmbr_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        rmbr_text: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };
    return { 
        maliciousRmbr, 
        expectedRmbr 
    };
}

function makeFixtures() {
    const testUserArray = makeUserArray();
    const testPersonArray = makePersonArray(testUserArray);
    const testRmbrArray = makeRmbrArray(testUserArray, testPersonArray);
    return {
        testUserArray: testUserArray,
        testPersonArray: testPersonArray,
        testRmbrArray: testRmbrArray
    };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign(
        { user_id: user.id },
        secret,
        {
            subject: user.user_name,
            algorithm: 'HS256'
        }
    );
    return `Bearer ${token}`;
}

module.exports = {
    makeAuthHeader,
    makeFixtures,
    cleanTables,
    seedTables,
    makeUserArray,
    makePersonArray,
    makeRmbrArray,
    makeExpectedPerson,
    makeExpectedRmbr,
    makeMaliciousRmbr,
};