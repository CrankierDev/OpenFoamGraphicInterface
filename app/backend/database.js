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

    db.run(`CREATE TABLE turbulence_models (model text, variables text)`,
        (err) => {
            if(err) {
                console.log('Table turbulence_models already created.');
            } else {
                console.log('Table turbulence_models just created.');
                const insert = `INSERT INTO turbulence_models (model, variables) VALUES (?,?)`;
                db.run(insert, ["kOmegaSST", "nut,k,omega"]);
                db.run(insert, ["kEpsilon", "nut,k,epsilon"]);
                db.run(insert, ["Spalart-Allmaras", "nut,nuTilda"]);
            }
        }
    );  

    db.run(`CREATE TABLE boundaries_variables (name text, variable text, type text, schemes text)`,
        (err) => {
            if(err) {
                console.log('Table boundaries_variables already created.');
            } else {
                console.log('Table boundaries_variables just created.');
                const insert = `INSERT INTO boundaries_variables (name, variable, type, schemes)
                                 VALUES (?,?,?,?)`;
                db.run(insert, ['presión', 'p', 'asymmetric', "'grad'"]);
                db.run(insert, ['velocidad', 'U', 'symmetric', "'grad','div'"]);
                db.run(insert, ['nut', 'nut', null, null]);
                db.run(insert, ['nuTilda', 'nuTilda', 'symmetric', "'grad','div'"]);
                db.run(insert, ['k', 'k', 'symmetric', "'div'"]);
                db.run(insert, ['epsilon', 'epsilon', 'symmetric', "'div'"]);
                db.run(insert, ['omega', 'omega', 'symmetric', "'div'"]);
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
    db.run(`CREATE TABLE control_dict_data (id text, application text, startFrom text,
                startTime text, stopAt text, endTime text, deltaT text,
                runTimeModifiable boolean, adjustTimeStep boolean)`,
        (err) => {
            if(err) {
                console.log('Table control_dict_data already created.');
            } else {
                console.log('Table control_dict_data just created.');
            }
        }
    );

    // Add all schemas, a JSON/text for each one
    db.run(`CREATE TABLE schemes_data (id text)`,
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

async function getTurbulenceModelsInfo() {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM turbulence_models`, (err, rows) => {
            if (err) {
                console.log(err.message);
            }
            
            if(rows.length){
                resolve(rows);
            } else {
                reject(err);
            }            
        });
    }).then( (response) => {
        close(db);
        return response;

    }).catch( (err) => {
        close(db);
        console.log(err);
    });
}

async function getTurbulenceModelVariables(model) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT variables from turbulence_models
                where model = (?)`,
            model,
            (err, variables) => {
                if (err) {
                    console.log(err.message);
                }
                
                let variablesList = variables.variables.split(',');

                let query = `SELECT * FROM boundaries_variables where variable in (
                    ${variablesList.map( () => {return '?' } ).join(',')})`;
                
                db.all(query, variablesList, (err, rows) => {
                        if (err) {
                            console.log(err.message);
                        }
                        
                        if(rows.length){
                            resolve(rows);
                        } else {
                            reject(err);
                        }            
                    }
                );
            }
        );  
    }).then( (response) => {
        close(db);
        return response;

    }).catch( (err) => {
        close(db);
        console.log(err);
    });
}

module.exports = {
    start: start,
    getTurbulenceModelsInfo: getTurbulenceModelsInfo,
    getTurbulenceModelVariables: getTurbulenceModelVariables,
};