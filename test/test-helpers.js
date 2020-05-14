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

// Create dummy users
function makeUsersArray() {
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
};

// Create dummy people
function makePeopleArray(users) {
    return [
        {
            id: 1,
            person_name: 'Test Person 1',
            type_of_person: 'Family',
            user_id: users[0].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 2,
            person_name: 'Test Person 2',
            type_of_person: 'Co-Worker',
            user_id: users[1].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            person_name: 'Test Person 3',
            type_of_person: 'Friend',
            user_id: users[2].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        }
    ];
};

// Create dummy rmbrs
function makeRmbrsArray(users, people) {
    return [
        {
            id: 1,
            rmbr_title: 'Rmbr 1 Title',
            category: 'Past',
            rmbr_text: 'Rmbr 1 Text',
            person_id: people[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[0].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 2,
            rmbr_title: 'Rmbr 2 Title',
            category: 'Current',
            rmbr_text: 'Rmbr 2 Text',
            person_id: people[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[0].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            rmbr_title: 'Rmbr 3 Title',
            category: 'Past',
            rmbr_text: 'Rmbr 3 Text',
            person_id: people[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 4,
            rmbr_title: 'Rmbr 4 Title',
            category: 'Current',
            rmbr_text: 'Rmbr 4 Text',
            person_id: people[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 5,
            rmbr_title: 'Rmbr 5 Title',
            category: 'Past',
            rmbr_text: 'Rmbr 5 Text',
            person_id: people[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 6,
            rmbr_title: 'Rmbr 6 Title',
            category: 'Past',
            rmbr_text: 'Rmbr 6 Text',
            person_id: people[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        }
    ];
};

function seedTables(db, users, people, rmbrs) {
    return db.transaction(async trx => {

        if (users.length > 0) {
            const preppedUsers = users.map(usr => ({
                ...usr,
                password: bcrypt.hashSync(usr.password, 1)
            }));
            await trx.into('rmbrme_users').insert(preppedUsers);
            await trx.raw(
                `SELECT setval('rmbrme_users_id_seq', ?)`,
                [users[users.length - 1].id]
            );
        };

        if (people.length > 0) {
            await trx.into('rmbrme_people').insert(people);
            await trx.raw(
                `SELECT setval('rmbrme_people_id_seq', ?)`,
                [people[people.length - 1].id]
            );
        };

        if (rmbrs.length > 0) {
            await trx.into('rmbrme_rmbrs').insert(rmbrs);
            await trx.raw(
                `SELECT setval ('rmbrme_rmbrs_id_seq', ?)`,
                [rmbrs[rmbrs.length - 1].id]
            );
        };

    });
};

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

function makeExpectedPersonRmbr(rmbr) {

    return {
        id: rmbr.id,
        rmbr_title: rmbr.rmbr_title,
        category: rmbr.category,
        rmbr_text: rmbr.rmbr_text,
        person_id: rmbr.person_id,
        date_created: rmbr.date_created.toISOString(),
        user_id: rmbr.user_id,
        date_modified: rmbr.date_modified
    }
};

function makeMaliciousRmbr(person) {

    const maliciousRmbr = {
        id: 911,
        rmbr_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        category: 'Past',
        rmbr_text: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        person_id: person.id,
        date_created: new Date().toISOString(),
        user_id: person.user_id,
        date_modified: new Date().toISOString()
    }

    const expectedRmbr = {
        ...makeExpectedPersonRmbr([user], maliciousRmbr),
        rmbr_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        rmbr_text: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return { 
        maliciousRmbr, 
        expectedRmbr 
    }
};

function makeFixtures() {
    const testUsers = makeUsersArray();
    const testPeople = makePeopleArray(testUsers);
    const testRmbrs = makeRmbrsArray(testUsers, testPeople);
    console.log(testUsers)
    console.log(testPeople)
    console.log(testRmbrs)
    return { testUsers, testPeople, testRmbrs };
};

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
};

module.exports = {
    makeAuthHeader,
    makeFixtures,
    cleanTables,
    seedTables,
    makeUsersArray,
    makePeopleArray,
    makeRmbrsArray,
    makeExpectedPerson,
    makeExpectedPersonRmbr,
    makeMaliciousRmbr,
};