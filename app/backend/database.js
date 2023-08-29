const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './db.sqlite';

const logger = require("./logger.js");

// Prepared statements
const TURBULENCE_MODELS_INSERT = `INSERT INTO turbulence_models (model, variables) VALUES (?,?)`;
const OUTPUT_MODELS_INSERT = `INSERT INTO output_models (folder, filename, model) VALUES (?,?,?)`;
const BOUNDARIES_VARIABLES_INSERT = `INSERT INTO boundaries_variables (name, variable, type,
                                        schemes, wallFunction, dimensions, class) VALUES (?,?,?,?,?,?,?)`;
const SIMULATIONS_INFO_INSERT = `INSERT INTO simulations_info (id, creationDate, name, simRoute
                                    ) VALUES (?,?,?,?)`;
const ZERO_DATA_INSERT = `INSERT INTO zero_data (id, variable, value, AOAValue, lRef, intensity, boundaries) VALUES (?,?,?,?,?,?,?)`;
const SIMULATION_BOUNDARIES_INSERT = `INSERT INTO simulation_boundaries (id, name, type) VALUES (?,?,?)`;
const CONSTANT_DATA_INSERT = `INSERT INTO constant_data (id, viscosityModel, turbulenceModel,
                                printCoeffs, rho, nu) VALUES (?,?,?,?,?,?)`;
const CONTROL_DICT_DATA_INSERT = `INSERT INTO control_dict_data (id, application, startFrom, startTime,
                            stopAt, endTime, deltaT, runTimeModifiable, adjustTimeStep, writeData)
                            VALUES (?,?,?,?,?,?,?,?,?,?)`;
const SCHEMES_DATA_INSERT = `INSERT INTO schemes_data (id, ddtSchemes, gradSchemes, divSchemes,
                                laplacianSchemes, interpolationSchemes, snGradSchemes, wallDist)
                                VALUES (?,?,?,?,?,?,?,?)`;
const SOLUTIONS_DATA_INSERT = `INSERT INTO solutions_data (id, solvers, simple, pimple, piso,
                                residualControl, relaxationFactors) VALUES (?,?,?,?,?,?,?)`;
const FORCES_DATA_INSERT = `INSERT INTO forces_data (id, patches, rho, rhoInf, cofR, forceCoeffs,
                                magUInf, lRef, aRef, liftDir, dragDir, pitchAxis)
                                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

function open() {
    logger.info('Abriendo BBDD');
    let db = new sqlite3.Database(DBSOURCE, (err) => {
        if(err) {
            // Cannot open database
            logger.error(err);
            throw err;
        }  
    });
    
    return db;
}

function close(db) {
    db.close((err) => {
        if (err) {
            logger.error(err);
        }
    });
}

async function start() {
    let db = open();

    db.run(`CREATE TABLE turbulence_models (model text, variables text)`,
        (err) => {
            logger.info('turbulence_models');
            if(err) {
                logger.info('turbulence_models2');
                logger.error('La tabla turbulence_models ya existe.');
            } else {
                logger.info('turbulence_models3');
                logger.info('La tabla turbulence_models ha sido creada.');
                db.run(TURBULENCE_MODELS_INSERT, ["kOmegaSST", "nut,k,omega"]);
                db.run(TURBULENCE_MODELS_INSERT, ["kEpsilon", "nut,k,epsilon"]);
                db.run(TURBULENCE_MODELS_INSERT, ["SpalartAllmaras", "nut,nuTilda"]);
            }
                    
            logger.info('turbulence_models4');
        }
    ); 

    db.run(`CREATE TABLE output_models (folder text, filename text, model text)`,
        (err) => {
            if(err) {
                logger.error('La tabla output_models ya existe.');
            } else {
                logger.info('La tabla output_models ha sido creada.');
                db.run(OUTPUT_MODELS_INSERT, ["0", "all", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

FoamFile
{
    version     2.0;
    format      ascii;
    class       :class;
    location    "0";
    object      :variable;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

dimensions      :dimensions;

internalField   uniform :internalField;

boundaryField   :boundaryField
                `]);

                db.run(OUTPUT_MODELS_INSERT, ["constant", "physicalProperties", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    location    "constant";
    object      physicalProperties;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

viscosityModel  :viscosityModel;

rho             [1 -3 0 0 0 0 0] :rho;

nu              [0 2 -1 0 0 0 0] :nu;
                `]);

                db.run(OUTPUT_MODELS_INSERT, ["constant", "momentumTransport", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    location    "constant";
    object      momentumTransport;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

simulationType RAS;

RAS
{
    model           :turbulenceModel;

    turbulence      :turbulence;

    printCoeffs     :printCoeffs;
    
    viscosityModel  :viscosityModel;
}
`]);

                db.run(OUTPUT_MODELS_INSERT, ["system", "controlDict", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    location    "system";
    object      controlDict;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

application     :application;

startFrom       :startFrom;

startTime       :startTime;

stopAt          :stopAt;

endTime         :endTime;

deltaT          :deltaT;

writeControl    timeStep;

writeInterval   50;

purgeWrite      0;

writeFormat     ascii;

writePrecision  6;

writeCompression off;

timeFormat      general;

timePrecision   6;

runTimeModifiable :runTimeModifiable;
                
:functions`]);

                db.run(OUTPUT_MODELS_INSERT, ["system", "fvSchemes", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    location    "system";
    object      fvSchemes;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
ddtSchemes      :ddtSchemes

gradSchemes     :gradSchemes

divSchemes      :divSchemes

laplacianSchemes        :laplacianSchemes

interpolationSchemes    :interpolationSchemes

snGradSchemes   :snGradSchemes

wallDist        :wallDist
                `]);

                db.run(OUTPUT_MODELS_INSERT, ["system", "fvSolution", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    location    "system";
    object      fvSolution;
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

solvers     :solvers

:mainSolver
:solverBody

relaxationFactors :relaxationFactors
                `]);

                db.run(OUTPUT_MODELS_INSERT, ["system", "forces", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

forces
{
    type            forces;
    functionObjectLibs ("libforces.so");
    patches         (:patches);
    writeControl    timeStep;
    rho             rhoInf;
    rhoInf          :rhoInf;
    CofR            :cofR;    
}
                `]);

                db.run(OUTPUT_MODELS_INSERT, ["system", "forceCoeffs", `// * * * * * * * * * FILE GENERATED BY OpenFOAMGUI * * * * * * * * * * * * * //
// * * * * * * * * * * * * UNIVERSIDAD DE CADIZ * * * * * * * * * * * * * * * //

forceCoeffs
{
    type            forceCoeffs;
    functionObjectLibs ("libforces.so");
    writeControl    timeStep;
    patches         (:patches);
    rho             rhoInf;
    rhoInf          :rhoInf;
    liftDir         :liftDir;
    dragDir         :dragDir;
    CofR            :cofR;
    pitchAxis       :pitchAxis;
    magUInf         :magUInf;
    lRef            :lRef;
    Aref            :ARef;
    
    writeFields		true;
    log 		    true;

}
                `]);

                db.run(OUTPUT_MODELS_INSERT, ["home", "script", `#!/usr/bin/env bash

source /opt/openfoam10/etc/bashrc

cd :route

:solver > :log
echo "Process finished!"`]);
            }
        }
    );

    db.run(`CREATE TABLE boundaries_variables (name text, variable text, type text, schemes text, wallFunction boolean, dimensions text, class text)`,
        (err) => {
            if(err) {
                logger.error('La tabla boundaries_variables ya existe.');
            } else {
                logger.info('La tabla boundaries_variables ha sido creada.');
                db.run(BOUNDARIES_VARIABLES_INSERT, ['nut', 'nut', null, null, true, '[0 2 -1 0 0 0 0]', 'volScalarField']);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['nuTilda', 'nuTilda', 'symmetric', "'grad','div'", false, '[0 2 -1 0 0 0 0]', 'volScalarField']);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['k', 'k', 'symmetric', "'div'", true, '[0 2 -2 0 0 0 0]', 'volScalarField']);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['epsilon', 'epsilon', 'symmetric', "'div'", true, '[0 2 -3 0 0 0 0]', 'volScalarField']);
                db.run(BOUNDARIES_VARIABLES_INSERT, ['omega', 'omega', 'symmetric', "'div'", true, '[0 0 -1 0 0 0 0]', 'volScalarField']);
            }
        }
    );

    db.run(`CREATE TABLE simulations_info (id text, creationDate date, name text, simRoute text)`,
        (err) => {
            if(err) {
                logger.error('La tabla simulations_info ya existe.');
            } else {
                logger.info('La tabla simulations_info ha sido creada.');
                let currentDate = new Date();

                let day = currentDate.getDate();
                day = day >= 10 ? 
                        day : "0" + String(day);
                        
                let month = currentDate.getMonth() + 1;
                month = month >= 10 ? 
                        month : "0" + String(month);
        
                let year = currentDate.getFullYear();

                let hour = currentDate.getHours();
                hour = hour >= 10 ? 
                        hour : "0" + String(hour);

                let minutes = currentDate.getMinutes();
                minutes = minutes >= 10 ? 
                        minutes : "0" + String(minutes);

                let seconds = currentDate.getSeconds();
                seconds = seconds >= 10 ? 
                        seconds : "0" + String(seconds);
                        
                currentDate = `${day}/${month}/${year} ${hour}:${minutes}:${seconds}`;
                
                db.run(SIMULATIONS_INFO_INSERT, ['default_sim', currentDate, 'Simulación por defecto', '/mnt/f/OpenFoam/airFoil2D/']);
            }
        }
    );

    db.run(`CREATE TABLE zero_data (id text, variable text, value text, 
                AOAValue text, lRef text, intensity text, boundaries text)`,
        (err) => {
            if(err) {
                logger.error('La tabla zero_data ya existe.');
            } else {
                logger.info('La tabla zero_data ha sido creada.');
                
                db.run(ZERO_DATA_INSERT, ['default_sim', 'p', '0', null, '1', '1', `{
                    inlet
                    {
                        type            freestreamPressure;
                        freestreamValue    $internalField;
                    }
                
                    outlet
                    {
                        type            freestreamPressure;
                        freestreamValue    $internalField;
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
                db.run(ZERO_DATA_INSERT, ['default_sim', 'U', '26', '0', '1', '1', `{
                    inlet
                    {
                        type            freestreamVelocity;
                        freestreamValue    $internalField;
                    }
                
                    outlet
                    {
                        type            freestreamVelocity;
                        freestreamValue    $internalField;
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
                db.run(ZERO_DATA_INSERT, ['default_sim', 'nuTilda', '0.14', null, '1', '1', `{
                    inlet
                    {
                        type            freestream;
                        freestreamValue    $internalField;
                    }
                
                    outlet
                    {
                        type            freestream;
                        freestreamValue    $internalField;
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
                db.run(ZERO_DATA_INSERT, ['default_sim', 'nut', '0.14', null, '1', '1', `{
                    inlet
                    {
                        type            freestream;
                        freestreamValue    $internalField;
                    }
                
                    outlet
                    {
                        type            freestream;
                        freestreamValue    $internalField;
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
                logger.error('La tabla simulation_boundaries ya existe.');
            } else {
                logger.info('La tabla simulation_boundaries ha sido creada.');
                
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'inlet', 'patch']);
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'outlet', 'patch']);
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'walls', 'wall']);
                db.run(SIMULATION_BOUNDARIES_INSERT, ['default_sim', 'frontAndBack', 'empty']);
            }
        }
    );

    db.run(`CREATE TABLE constant_data (id text, viscosityModel text, turbulenceModel text,
                printCoeffs boolean, rho text, nu text)`,
        (err) => {
            if(err) {
                logger.error('La tabla constant_data ya existe.');
            } else {
                logger.info('La tabla constant_data ha sido creada.');
                
                db.run(CONSTANT_DATA_INSERT, ['default_sim', 'constant', 'SpalartAllmaras', true, '1', '1e-05']);
            }
        }
    );

    db.run(`CREATE TABLE control_dict_data (id text, application text, startFrom text,
                startTime text, stopAt text, endTime text, deltaT text,
                runTimeModifiable boolean, adjustTimeStep boolean, writeData boolean)`,
        (err) => {
            if(err) {
                logger.error('La tabla control_dict_data ya existe.');
            } else {
                logger.info('La tabla control_dict_data ha sido creada.');
                
                db.run(CONTROL_DICT_DATA_INSERT, ['default_sim', 'simpleFoam', 'startTime', '0',
                                'endTime', '500', '1', true, true, true]);
            }
        }
    );

    db.run(`CREATE TABLE schemes_data (id text, ddtSchemes text, gradSchemes text, divSchemes text,
                laplacianSchemes text, interpolationSchemes text, snGradSchemes text, wallDist text)`,
        (err) => {
            if(err) {
                logger.error('La tabla schemes_data ya existe.');
            } else {
                logger.info('La tabla schemes_data ha sido creada.');
                
                db.run(SCHEMES_DATA_INSERT, ['default_sim', `
{
    default         steadyState;
}`, `
{
    default         Gauss linear;
}`, `
{
    default             none;
    div(phi,U)          bounded Gauss linearUpwind grad(U);
    div(phi,nuTilda)    bounded Gauss linearUpwind grad(nuTilda);
    div(phi,k)          bounded Gauss linearUpwind grad(k);
    div(phi,omega)      bounded Gauss linearUpwind grad(omega);
    div(phi,epsilon)    bounded Gauss linearUpwind grad(epsilon);
    div((nuEff*dev2(T(grad(U)))))    Gauss linear;
}`, `
{
    default         Gauss linear corrected;
}`, `
{
    default         linear;
}`, `
{
    default         corrected;
}`, `
{
    method    meshWave;
}`
                ]);
            }
        }
    );

    db.run(`CREATE TABLE solutions_data (id text, solvers text, simple text,
                pimple text, piso text, residualControl text, relaxationFactors text)`,
        (err) => {
            if(err) {
                logger.error('La tabla solutions_data ya existe.');
            } else {
                logger.info('La tabla solutions_data ha sido creada.');
                
                db.run(SOLUTIONS_DATA_INSERT, ['default_sim', `
{
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
        smoother        symGaussSeidel;
        nSweeps         2;
        tolerance       1e-08;
        relTol          0.1;
    }

    nuTilda
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        nSweeps         2;
        tolerance       1e-08;
        relTol          0.1;
    }

    k
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        nSweeps         2;
        tolerance       1e-08;
        relTol          0.1;
    }

    epsilon
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        nSweeps         2;
        tolerance       1e-08;
        relTol          0.1;
    }

    omega
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        nSweeps         2;
        tolerance       1e-08;
        relTol          0.1;
    }
}`, `
{
    nNonOrthogonalCorrectors    0;
}`, `
{
    nCorrectors             2;
    nNonOrthogonalCorrectors    4;

    maxCo                   1;
    rDeltaTSmoothingCoeff   0.1;
    maxDeltaT               1;

}`, `
{
    nCorrectors             2;
    nNonOrthogonalCorrectors    4;
}`, `
{
    p               1e-5;
    U               1e-5;
    nuTilda         1e-5;
    nut             1e-5;
    k               1e-5;
    omega           1e-5;
    epsilon         1e-5;
}`, `
{
    fields
    {
        p           0.3;
    }
    equations
    {
        U           0.7;
        nuTilda     0.7;
        nut         0.7;
        k           0.7;
        epsilon     0.7;
        omega       0.7;
    }
}`
                ]);
            }
        }
    );

    logger.info('BBDD abierta11');
    db.run(`CREATE TABLE forces_data (id text, patches text, rho text, rhoInf text, cofR text,
            forceCoeffs boolean, magUInf text, lRef text, aRef text,
            liftDir text, dragDir text, pitchAxis text)`,
        (err) => {
            if(err) {
                logger.error('La tabla forces_data ya existe.');
            } else {
                logger.info('La tabla forces_data ha sido creada.');
                
                db.run(FORCES_DATA_INSERT, ['default_sim', 'walls', 'rhoInf', '1.0', '(0.25 0 0)',
                        true, '2', '1.0', '0.1', '(0 1 0)', '(1 0 0)', '(0 0 1)']);
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
                logger.error(err.message);
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
        logger.error(err);
    });
}

async function getTurbulenceModelVariables(model) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT variables from turbulence_models
                where model = (?)`,
                model,
            (err, variables) => {
                if(err) {
                    logger.error(err.message);
                } 
                
                let variablesList = variables.variables.split(',');

                let query = `SELECT * FROM boundaries_variables where variable in (
                    ${variablesList.map( () => {return '?' } ).join(',')})`;
                
                db.all(query, variablesList, (err, rows) => {
                        if (err) {
                            logger.error(err.message);
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
        logger.error(err);
    });
}

async function getSolutionData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM solutions_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getSchemesData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM schemes_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getSimulationInfo(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM simulations_info WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getZeroData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM zero_data
                    WHERE id = (?) 
                        AND variable IN ('U','p')`,
                simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getControlDictData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM control_dict_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getConstantData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM constant_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getForcesData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT * FROM forces_data WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getSimulationBoundariesData(simulationID) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM simulation_boundaries WHERE id = (?)`, simulationID,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getAllSimulationsInfo() {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.all(`SELECT * FROM simulations_info ORDER BY creationDate DESC`,
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
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
        logger.error(err);
    });
}

async function getModelFile(folder, filename) {
    let db = open();

    return new Promise( (resolve, reject) => {
        db.get(`SELECT DISTINCT model FROM output_models WHERE folder = (?) and filename like (?)`, [folder, filename],
            (err, rows) => {
                if (err) {
                    logger.error(err.message);
                }

                if(rows != null){
                    resolve(rows.model);
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
        logger.error(err);
    });
}

async function saveZeroData(simID, data) {
    let db = open();

    try {
        db.run( ZERO_DATA_INSERT, [simID, data.variable, data.value,
                                    data.AOAValue, data.lRef, data.intensity, 
                                    data.boundaries
                            ]);  
        
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

async function saveConstantData(simID, data) {
    let db = open();

    try {
        db.run( CONSTANT_DATA_INSERT, [simID, data.viscosityModel, data.turbulenceModel,
                                data.printCoeffs, data.rho, data.nu
                            ]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

async function saveControlDictData(simID, data) {
    let db = open();

    try {
        db.run( CONTROL_DICT_DATA_INSERT, [simID, data.application, data.startFrom, data.startTime,
                                data.stopAt, data.endTime, data.deltaT, data.runTimeModifiable,
                                data.adjustTimeStep, true
                            ]);
                            
    } catch (err) {
        logger.error(err);
    };

    close(db);
}

async function saveForcesData(simID, data) {
    let db = open();

    try {
        db.run( FORCES_DATA_INSERT, [simID, data.patches, 'rhoInf', data.rhoInf, data.cofR,
                                data.forceCoeffs, data.magUInf, data.lRef, data.ARef, 
                                data.liftDir, data.dragDir, data.pitchAxis
                            ]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

async function saveSchemesData(simID, data) {
    let db = open();

    try {
        db.run( SCHEMES_DATA_INSERT, [simID, data.ddtSchemes, data.gradSchemes, data.divSchemes,
                                data.laplacianSchemes, data.interpolationSchemes, 
                                data.snGradSchemes, data.wallDist
                            ]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

async function saveSimulationInfo(simID, data) {
    let db = open();

    try {
        let currentDate = new Date();

        let day = currentDate.getDate();
        day = day >= 10 ? 
                day : "0" + String(day);

        let month = currentDate.getMonth() + 1;
        month = month >= 10 ? 
                month : "0" + String(month);

        let year = currentDate.getFullYear();

        let hour = currentDate.getHours();
        hour = hour >= 10 ? 
                hour : "0" + String(hour);

        let minutes = currentDate.getMinutes();
        minutes = minutes >= 10 ? 
                minutes : "0" + String(minutes);

        let seconds = currentDate.getSeconds();
        seconds = seconds >= 10 ? 
                seconds : "0" + String(seconds);
                
        currentDate = `${day}/${month}/${year} ${hour}:${minutes}:${seconds}`;

        db.run( SIMULATIONS_INFO_INSERT, [simID, currentDate, data.name, data.route]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

async function saveSolutionsData(simID, data) {
    let db = open();

    try {
        db.run( SOLUTIONS_DATA_INSERT, [simID, data.solvers,
                                    data.simple != null ?
                                        data.simple.replaceAll('residualControl		:residualControl', ''):
                                        null, 
                                    data.pimple != null ?
                                        data.pimple.replaceAll('residualControl		:residualControl', ''):
                                        null,
                                      data.piso != null ?
                                          data.piso.replaceAll('residualControl		:residualControl', ''):
                                          null,
                                    data.residualControl, data.relaxationFactors
                                ]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

async function saveSimulationBoundariesData(simID, data) {
    let db = open();

    try {
        db.run(SIMULATION_BOUNDARIES_INSERT, [simID, data.name, data.type]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
}

function deleteSimulation(simulationID) {
    let db = open();

    try {
        db.run( 'delete from constant_data where id = (?)', [simulationID]);
        db.run( 'delete from control_dict_data where id = (?)', [simulationID]);
        db.run( 'delete from forces_data where id = (?)', [simulationID]);
        db.run( 'delete from schemes_data where id = (?)', [simulationID]);
        db.run( 'delete from simulation_boundaries where id = (?)', [simulationID]);
        db.run( 'delete from simulations_info where id = (?)', [simulationID]);
        db.run( 'delete from solutions_data where id = (?)', [simulationID]);
        db.run( 'delete from zero_data where id = (?)', [simulationID]);
                            
    } catch (err) {
        logger.error(err);
    };
    
    close(db);
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
    getForcesData: getForcesData,
    getSimulationBoundariesData: getSimulationBoundariesData,
    getAllSimulationsInfo: getAllSimulationsInfo,
    getModelFile: getModelFile,
    saveZeroData: saveZeroData,
    saveConstantData: saveConstantData,
    saveControlDictData: saveControlDictData,
    saveForcesData: saveForcesData,
    saveSchemesData: saveSchemesData,
    saveSimulationInfo: saveSimulationInfo,
    saveSolutionsData: saveSolutionsData,
    saveSimulationBoundariesData: saveSimulationBoundariesData,
    deleteSimulation: deleteSimulation
};