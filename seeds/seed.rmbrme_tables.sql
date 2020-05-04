BEGIN;

TRUNCATE
    rmbrme_users,
    rmbrme_people,
    rmbrme_rmbrs
    RESTART IDENTITY CASCADE;

INSERT INTO rmbrme_users (user_name, password, date_created)
    VALUES 
        ('jack@gmail.com','$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne', '2020-01-01'),
        ('jill@ymail.com','$2a$12$VQ5HgWm34QQK2rJyLc0lmu59cy2jcZiV6U1.bE8rBBnC9VxDf/YQO', '2020-02-13');

INSERT INTO rmbrme_people (person_name, type_of_person, user_id)
    VALUES
        ('Darth Vader', 'Family', 1),
        ('Indiana', 'Friend', 1),
        ('Rick', 'Co-Worker', 1),
        ('James', 'Family', 2),
        ('Natalia', 'Friend', 2),
        ('Joanna', 'Co-Worker', 2);

INSERT INTO rmbrme_rmbrs (rmbr_title, category, rmbr_text, person_id, user_id)
	VALUES
		('Hold grudge against the rebels', 'Past', 'null', 1, 1),
		('Die with my face mask off', 'Current', 'I hope my son will not be there', 1, 1),
   		('Punch a nazi in the face', 'Past', 'deserved it', 2, 1),
    	('Find Harrison Ford to play me', 'Current', null, 2, 1),
    	('Speak poorly about the couch of Charlie Murphy', 'Past', null, 3, 1),
    	('Be myself', 'Current', '... I am Rick James.', 3, 1),
    	('Drink heavily', 'Past', 'Somehow about to keep it together', 4, 2),
    	('Stop the evil guy such-and-such', 'Current', 'Whatever the current iteration is', 4, 2),
    	('Guess the password Boris set', 'Past', 'apparently it was not "knockers"', 5, 2),
    	('Be used as an object by the men in the movie', 'Current', null, 5, 2),
    	('Yell "confirmed" in a loud whisper voice', 'Past', null, 6, 2),
    	('Apologize for Perfect Dark Zero', 'Current', '... unti the end of time.', 6, 2);

    COMMIT;