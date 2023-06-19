export enum PersonCategory {
    FRIEND = 'Friend',
    FAMILY = 'Family',
    WORK = 'Work',
}

export interface IPerson {
    id: number,
    name: string;
    category: PersonCategory;
    user_id: number;
    first_met: Date;
    last_contact: Date;
    date_created: Date;
    date_modified: Date;
}
