export type database = {
    (db: (arg0: string) => {
         (): any;
         new(): any;
         where: {
             (arg0: {
                 user_name: any;
             }): {
                 (): any;
                 new(): any;
                 first: { (): Promise<any>; new(): any; };
             }; new(): any; };
     },
     userName: string)
};

export type User = {
    id: number,
    user_name: any,
    password: any,
    date_created: string,
    role: number
}

