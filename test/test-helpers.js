import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Truncate all tables and restart identities for database
export function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                users,
                people,
                rmbrs RESTART IDENTITY CASCADE`
        )
        .then(() =>
            Promise.all([
                trx.raw(`ALTER SEQUENCE people_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE rmbrs_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('people_id_seq', 0)`),
                trx.raw(`SELECT setval('users_id_seq', 0)`),
                trx.raw(`SELECT setval('rmbrs_id_seq', 0)`)
            ])
        )
    );
}

// Create dummy user
export function makeUserArray() {
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
export function makePersonArray(user) {
    return [
        {
            id: 1,
            name: 'Test Person 1',
            category: 'Family',
            user_id: user[0].id,
            first_met: new Date(),
            last_contact: new Date(),
            date_created: new Date(),
            date_modified: new Date()
        },
        {
            id: 2,
            name: 'Test Person 2',
            category: 'Co-Worker',
            user_id: user[1].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            name: 'Test Person 3',
            category: 'Friend',
            user_id: user[2].id,
            first_met: new Date('2029-01-22T16:28:32.615Z'),
            last_contact: new Date('2029-01-22T16:28:32.615Z'),
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        }
    ];
}

// Create dummy rmbr
export function makeRmbrArray(users, people) {
    return [
        {
            id: 1,
            title: 'RmbrListItem 1 Title',
            description: 'RmbrListItem 1 Text',
            person_id: people[0].id,
            date_created: new Date(),
            user_id: users[0].id,
            date_modified: new Date()
        },
        {
            id: 2,
            title: 'RmbrListItem 2 Title',
            description: 'RmbrListItem 2 Text',
            person_id: people[0].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[0].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 3,
            title: 'RmbrListItem 3 Title',
            description: 'RmbrListItem 3 Text',
            person_id: people[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 4,
            title: 'RmbrListItem 4 Title',
            description: 'RmbrListItem 4 Text',
            person_id: people[1].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 5,
            title: 'RmbrListItem 5 Title',
            description: 'RmbrListItem 5 Text',
            person_id: people[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            id: 6,
            title: 'RmbrListItem 6 Title',
            description: 'RmbrListItem 6 Text',
            person_id: people[2].id,
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
            date_modified: new Date('2029-01-22T16:28:32.615Z')
        }
    ];
}

export function seedTables(db, user, person, rmbr) {

    return db.transaction(async trx => {

        if (user.length > 0) {
            const preppedUserArray = user.map(usr => ({
                ...usr,
                password: bcrypt.hashSync(usr.password, 1)
            }));
            await trx.into('users').insert(preppedUserArray);
            await trx.raw(
                `SELECT setval('users_id_seq', ?)`,
                [user[user.length - 1].id]
            );
        }

        if (person.length > 0) {
            await trx.into('people').insert(person);
            await trx.raw(
                `SELECT setval('people_id_seq', ?)`,
                [person[person.length - 1].id]
            );
        }

        if (rmbr.length > 0) {
            await trx.into('rmbrs').insert(rmbr);
            await trx.raw(
                `SELECT setval ('rmbrs_id_seq', ?)`,
                [rmbr[rmbr.length - 1].id]
            );
        }

    });

}

export function makeExpectedPerson(person) {
    return {
        id: person.id,
        name: person.name,
        category: person.category,
        user_id: person.user_id,
        first_met: person.first_met.toISOString(),
        last_contact: person.last_contact.toISOString(),
        date_created: person.date_created.toISOString(),
        date_modified: person.date_modified.toISOString(),
    }

}

export function makeExpectedRmbr(rmbr) {

    return {
        id: rmbr.id,
        title: rmbr.title,
        description: rmbr.description,
        person_id: rmbr.person_id,
        date_created: rmbr.date_created.toISOString(),
        user_id: rmbr.user_id,
        date_modified: rmbr.date_modified.toISOString(),
    }
};

export function makeMaliciousRmbr(person) {

    const maliciousRmbr = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        person_id: person.id,
        date_created: new Date().toISOString(),
        user_id: person.user_id,
        date_modified: new Date().toISOString()
    };
    const expectedRmbr = {
        ...makeExpectedRmbr([user], maliciousRmbr),
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };
    return {
        maliciousRmbr,
        expectedRmbr
    };
}

export function makeFixtures() {
    const testUserArray = makeUserArray();
    const testPersonArray = makePersonArray(testUserArray);
    const testRmbrArray = makeRmbrArray(testUserArray, testPersonArray);
    return {
        testUserArray: testUserArray,
        testPersonArray: testPersonArray,
        testRmbrArray: testRmbrArray
    };
}

export function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
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
