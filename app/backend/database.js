const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './db.sqlite';

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err;
    }else{
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE parameters (name text, value text)`,
            (err) => {
                if (err) {
                    console.log('Table already created.');
                }else{
                    console.log('Table just created.');
                    // var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                    // db.run(insert, ["admin","admin@example.com",md5("admin123456")])
                    // db.run(insert, ["user","user@example.com",md5("user123456")])
                }
            }
        );  
    }
});

module.exports = db