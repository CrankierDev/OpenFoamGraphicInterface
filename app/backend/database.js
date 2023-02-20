const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './db.sqlite';

// Prepared statements
const TURBULENCE_MODELS_INSERT = `INSERT INTO turbulence_models (model, variables) VALUES (?,?)`;
const BOUNDARIES_VARIABLES_INSERT = `INSERT INTO boundaries_variables (name, variable, type,
                                        schemes, wallFunction) VALUES (?,?,?,?,?)`;
const SIMULATIONS_INFO_INSERT = `INSERT INTO simulations_info (id, creationDate, name, meshRoute,
                                    lastGenerationDate, executable) VALUES (?,?,?,?,?,?)`;
const ZERO_DATA_INSERT = `INSERT INTO zero_data (id, variable, value, AOAValue, boundaries) VALUES (?,?,?,?,?)`;
const SIMULATION_BOUNDARIES_INSERT = `INSERT INTO simulation_boundaries (id, name, type) VALUES (?,?,?)`;
const CONSTANT_DATA_INSERT = `INSERT INTO constant_data (id, transportModel, turbulenceModel,
                                printCoeffs, rho, nu) VALUES (?,?,?,?,?,?)`;
const CONTROL_DICT_DATA_INSERT = `INSERT INTO control_dict_data (id, application, startFrom, startTime,
                            stopAt, endTime, deltaT, runTimeModifiable, adjustTimeStep, writeData)
                            VALUES (?,?,?,?,?,?,?,?,?,?)`;
const SCHEMES_DATA_INSERT = `INSERT INTO schemes_data (id, ddtSchemes, gradSchemes, divSchemes,
                                laplacianSchemes, interpolationSchemes, snGradSchemes, wallDist)
                                VALUES (?,?,?,?,?,?,?,?)`;
const SOLUTIONS_DATA_INSERT = `INSERT INTO solutions_data (id, solvers, simple, pimple, piso,
                                residualControl, relaxationFactors) VALUES (?,?,?,?,?,?,?)`;

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
                db.run(TURBULENCE_MODELS_INSERT, ["kOmegaSST", "nut,k,omega"]);
                db.run(TURBULENCE_MODELS_INSERT, ["kEpsilon", "nut,k,epsilon"]);
                db.run(TURBULENCE_MODELS_INSERT, ["Spalart-Allmaras", "nut,nuTilda"]);
            }
        }
    );  

    db.run(`CREATE TABLE boundaries_variables (name text, variable text, type text, schemes text, wallFunction boolean)`,
        (err) => {
            if(err) {
                console.log('Table boundaries_variables already created.');
            } else {
                console.log('Table boundaries_variables just created.');
                db.run(BOUNDARIES_VARIABLES_INSERT, ['nut', 'nut', null, null, true]);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['nuTilda', 'nuTilda', 'symmetric', "'grad','div'", false]);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['k', 'k', 'symmetric', "'div'", true]);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['epsilon', 'epsilon', 'symmetric', "'div'", true]);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['omega', 'omega', 'symmetric', "'div'", true]);
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
                let currentDate = new Date();
                let day = currentDate.getDate();
                let month = currentDate.getMonth() + 1;
                let year = currentDate.getFullYear();
                month = month == 10 || month == 11 || month == 12 ? 
                        month : 
                        "0" + month;
                        
                currentDate = day + '/' + month + '/' + year;
                
                db.run(SIMULATIONS_INFO_INSERT, ['default_sim', currentDate, 'default_sim', null, currentDate, true]);
            }
        }
    );

    db.run(`CREATE TABLE zero_data (id text, variable text, value text, AOAValue text, boundaries text)`,
        (err) => {
            if(err) {
                console.log('Table zero_data already created.');
            } else {
                console.log('Table zero_data just created.');
                
                db.run(ZERO_DATA_INSERT, ['default_sim', 'p', '0', '0', `{
                    inlet
                    {
                        type            freestreamPressure;
                        freestreamValue $internalField;
                    }
                
                    outlet
                    {
                        type            freestreamPressure;
                        freestreamValue $internalField;
                    }
                
                    walls
                    {
                        type            zeroGradient;
                    }
                
                    frontAndBack
                    {
                        type            empty;
                    }
                }`]);
                db.run(ZERO_DATA_INSERT, ['default_sim', 'U', '26', '0', `{
                    inlet
                    {
                        type            freestreamVelocity;
                        freestreamValue $internalField;
                    }
                
                    outlet
                    {
                        type            freestreamVelocity;
                        freestreamValue $internalField;
                    }
                
                    walls
                    {
                        type            noSlip;
                    }
                
                    frontAndBack
                    {
                        type            empty;
                    }
                }`]);
                db.run(ZERO_DATA_INSERT, ['default_sim', 'nuTilda', '0.14', '0', `{
                    inlet
                    {
                        type            freestream;
                        freestreamValue $internalField;
                    }
                
                    outlet
                    {
                        type            freestream;
                        freestreamValue $internalField;
                    }
                
                    walls
                    {
                        type            fixedValue;
                        value           uniform 0;
                    }
                
                    frontAndBack
                    {
                        type            empty;
                    }
                }`]);
                db.run(ZERO_DATA_INSERT, ['default_sim', 'nut', '0.14', '0', `{
                    inlet
                    {
                        type            freestream;
                        freestreamValue $internalField;
                    }
                
                    outlet
                    {
                        type            freestream;
                        freestreamValue $internalField;
                    }
                
                    walls
                    {
                        type            fixedValue;
                        value           uniform 0;
                    }
                
                    frontAndBack
                    {
                        type            empty;
                    }
                }`]);
            }
        }
    );

    db.run(`CREATE TABLE simulation_boundaries (id text, name text, type text)`,
        (err) => {
            if(err) {
                console.log('Table simulation_boundaries already created.');
            } else {
                console.log('Table simulation_boundaries just created.');
                
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'inlet', 'patch']);
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'outlet', 'patch']);
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'walls', 'wall']);
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'frontAndBack', 'empty']);
            }
        }
    );

    db.run(`CREATE TABLE constant_data (id text, transportModel text, turbulenceModel text,
                printCoeffs boolean, rho text, nu text)`,
        (err) => {
            if(err) {
                console.log('Table constant_data already created.');
            } else {
                console.log('Table constant_data just created.');
                
                db.run(CONSTANT_DATA_INSERT, ['default_sim', 'Newtonian', 'SpalartAllmaras', true, '1', '1e-05']);
            }
        }
    );

    db.run(`CREATE TABLE control_dict_data (id text, application text, startFrom text,
                startTime text, stopAt text, endTime text, deltaT text,
                runTimeModifiable boolean, adjustTimeStep boolean, writeData boolean)`,
        (err) => {
            if(err) {
                console.log('Table control_dict_data already created.');
            } else {
                console.log('Table control_dict_data just created.');
                
                db.run(CONTROL_DICT_DATA_INSERT, ['default_sim', 'simpleFoam', 'startTime', '0',
                                'endTime', '500', '1', true, true, true]);
            }
        }
    );

    db.run(`CREATE TABLE schemes_data (id text, ddtSchemes text, gradSchemes text, divSchemes text,
                laplacianSchemes text, interpolationSchemes text, snGradSchemes text, wallDist text)`,
        (err) => {
            if(err) {
                console.log('Table schemes_data already created.');
            } else {
                console.log('Table schemes_data just created.');
                
                db.run(SCHEMES_DATA_INSERT, ['default_sim', `{
                    default         steadyState;
                }`, `{
                    default         Gauss linear;
                }`, `{
                    default         none;
                    div(phi,U)      bounded Gauss linearUpwind grad(U);
                    div(phi,nuTilda) bounded Gauss linearUpwind grad(nuTilda);
                    div((nuEff*dev2(T(grad(U))))) Gauss linear;
                }`, `{
                    default         Gauss linear corrected;
                }`, `{
                    default         linear;
                }`, `{
                    default         corrected;
                }`, `{
                    method meshWave;
                }`]);
            }
        }
    );

    db.run(`CREATE TABLE solutions_data (id text, solvers text, simple text,
                pimple text, piso text, residualControl text, relaxationFactors text)`,
        (err) => {
            if(err) {
                console.log('Table solutions_data already created.');
            } else {
                console.log('Table solutions_data just created.');
                
                db.run(SOLUTIONS_DATA_INSERT, ['default_sim', `{
                    p
                    {
                        solver          GAMG;
                        tolerance       1e-06;
                        relTol          0.1;
                        smoother        GaussSeidel;
                    }
                
                    U
                    {
                        solver          smoothSolver;
                        smoother        GaussSeidel;
                        nSweeps         2;
                        tolerance       1e-08;
                        relTol          0.1;
                    }
                
                    nuTilda
                    {
                        solver          smoothSolver;
                        smoother        GaussSeidel;
                        nSweeps         2;
                        tolerance       1e-08;
                        relTol          0.1;
                    }
                }`, `{
                    nNonOrthogonalCorrectors 0;
                
                }`, `{
                    nCorrectors             2;
                    nNonOrthogonalCorrectors 4;
                
                    maxCo                   1;
                    rDeltaTSmoothingCoeff   0.1;
                    maxDeltaT               1;

                }`, `{
                    nCorrectors             2;
                    nNonOrthogonalCorrectors 4;

                }`, `{
                        p               1e-5;
                        U               1e-5;
                        nuTilda         1e-5;
                }`, `{
                    fields
                    {
                        p               0.3;
                    }
                    equations
                    {
                        U               0.7;
                        nuTilda         0.7;
                    }
                }`]);
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

async function getSolutionData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM solutions_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getSchemesData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM schemes_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getSimulationInfo(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM simulations_info WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getZeroData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM zero_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getControlDictData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM control_dict_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getConstantData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM constant_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getSimulationBoundariesData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM simulation_boundaries WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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

async function getAllSimulationsInfo() {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM simulations_info`,
            (err, rows) => {
                if (err) {
                    console.log('err', err.message);
                }

                if(rows != null){
                    resolve(rows);
                } else {
                    reject(err);
                }            
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
    getSolutionData: getSolutionData,
    getSchemesData: getSchemesData,
    getZeroData: getZeroData,
    getSimulationInfo: getSimulationInfo,
    getControlDictData: getControlDictData,
    getConstantData: getConstantData,
    getSimulationBoundariesData: getSimulationBoundariesData,
    getAllSimulationsInfo: getAllSimulationsInfo
};