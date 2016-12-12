import { Database } from "./database";
import { Promise } from 'es6-promise';

declare var window: any;

export class Couchbase {

    public constructor() { }

    public openDatabase(databaseName: string): Promise<Database> {
        return new Promise((resolve, reject) => {
            if(!window.cblite) {
                reject("Couchbase Lite is not installed!");
            } else {
                window.cblite.getURL((error, url) => {
                    let database = new Database(url, databaseName);
                    database.getDatabase().then((result) => {
                        resolve(database);
                    }, error => {
                        if(error.status == "404") {
                            database.createDatabase().then(result => {
                                resolve(database);
                            }, error => {
                                reject(error);
                            });
                        }
                    });
                });
            }
        });
    }

}
