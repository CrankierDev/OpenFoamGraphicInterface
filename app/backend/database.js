const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './db.sqlite';

function open() {
    let db = new sqlite3.Database(DBSOURCE, (err) => {
        if(err) {
            // Cannot open database
            console.error(err.message);
            throw err;
        } 
        
        console.log('Connected to the database...');  
    });

    return db;
}

function close(db) {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connection closed...');
    });
}

function start() {
    let db = open();

    console.log('Checking starter tables...');

    db.run(`CREATE TABLE turbulence_models (model text, nut boolean,
                nuTilda boolean, k boolean, omega boolean, epsilon boolean)`,
        (err) => {
            if(err) {
                console.log('Table turbulence_models already created.');
            } else {
                console.log('Table turbulence_models just created.');
                const insert = 'INSERT INTO turbulence_models (model, nut, nuTilda, k, omega, epsilon) VALUES (?,?,?,?,?,?)';
                db.run(insert, ["kOmegaSST", true, false, true, true, false]);
                db.run(insert, ["kEpsilon", true, false, true, false, true]);
                db.run(insert, ["Spalart-Allmaras", true, true, false, false, false]);
            }
        }
    );  

    db.run(`CREATE TABLE simulations_info (id text, creationDate date, name text,
                meshRoute text, lastGenerationDate date, executable boolean)`,
        (err) => {
            if(err) {
                console.log('Table simulations_info already created.');
            } else {
                console.log('Table simulations_info just created.');
            }
        }
    );

    db.run(`CREATE TABLE zero_data (id text, velocityValue text, pressureValue text,
                AOAValue text, boundaries text)`,
        (err) => {
            if(err) {
                console.log('Table zero_data already created.');
            } else {
                console.log('Table zero_data just created.');
            }
        }
    );

    db.run(`CREATE TABLE constant_data (id text, transportModel text, turbulenceModel text,
                printCoeffs boolean, model text, variables text)`,
        (err) => {
            if(err) {
                console.log('Table constant_data already created.');
            } else {
                console.log('Table constant_data just created.');
            }
        }
    );

    // Add all control dict variables
    db.run(`CREATE TABLE control_dict_data (id text, creationDate date, name text,
                mesh_route text, lastGenerationDate date, executable boolean)`,
        (err) => {
            if(err) {
                console.log('Table control_dict_data already created.');
            } else {
                console.log('Table control_dict_data just created.');
            }
        }
    );

    // Add all schemas, a JSON/text for each one
    db.run(`CREATE TABLE schemes_data (id text, creationDate date, name text,
                mesh_route text, lastGenerationDate date, executable boolean)`,
        (err) => {
            if(err) {
                console.log('Table schemes_data already created.');
            } else {
                console.log('Table schemes_data just created.');
            }
        }
    );

    db.run(`CREATE TABLE solutions_data (id text, solvers text, simple text,
                piso text, relaxationFactors text, residuals text)`,
        (err) => {
            if(err) {
                console.log('Table solutions_data already created.');
            } else {
                console.log('Table solutions_data just created.');
            }
        }
    );
    
    close(db);
}

function getTurbulenceModelsInfo() {
    let db = open();

    let response = db.all(`SELECT * FROM turbulence_models`, (err, rows) => {
        if (err) {
            console.log(err.message);
        }

        console.log('rows', rows);

        return rows;
    });

    console.log('response', response);

    close(db);

    return response;
}

module.exports = {
    start: start,
    getTurbulenceModelsInfo: getTurbulenceModelsInfo,
};