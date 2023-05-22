function start() {
    console.log('Starting express back end...');

    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser')
    
    const app = express();
    const port = 9876;
    
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    
    app.listen(port, () => console.log(`Listening at the port: ${port}`));
    
    //Starts the db if it was non created before
    db.start();

    app.get('/', (req, res) => {
        res.send('Im working fine');
    });

    app.post('/foldersData', (req, res, next) => {
        console.log('Reading mesh info... ');
        const fs = require('fs');
        
        try {
            let data = fs.readFileSync(req.body.mesh + '/boundary', 'utf8');
            let partitionIndex = data.indexOf('(');
            let boundObjects = data.slice(partitionIndex).split('\n');
            
            let boundaries = [];
            
            for(let i = 0 ; i < boundObjects.length ; i++) {
                if( boundObjects[i].trim() == '{' ){
                    const typeIndex = boundObjects[i+1].indexOf('type'); 
                    let newBoundary = {
                        name: boundObjects[i-1].trim(),
                        type: boundObjects[i+1].slice(typeIndex + 4, boundObjects[i+1].length-1).trim()
                    }
                    boundaries.push(newBoundary);
                    i+=2;
                }
            }
            
            res.json({
                "message": 'Success processing',
                "data": boundaries
            });
        } catch(e) {
            console.log('Error:', e.stack)
        }
    });

    app.get('/getTurbulenceModelsInfo', async (req, res) => {
        console.log('Getting turbulence models info... ');
        res.json({
            "message": 'Success processing',
            "data": await db.getTurbulenceModelsInfo()
        });
    });

    app.post('/getTurbulenceModelVariables', async (req, res) => {
        console.log('Getting turbulence model variables info for: ', req.body.model);
        res.json({
            "message": 'Success processing',
            "data": await db.getTurbulenceModelVariables(req.body.model)
        });
    });
    
    app.post('/getSimulationData', async (req, res) => {
        let simulationID = req.body.simulation_id;
        console.log('Getting simulation data for simulation: ', simulationID);

        let response = await getSimulationInfo(simulationID);
        response.boundaries = await getSimulationBoundariesData(simulationID);
        response.zeroData = await getZeroData(simulationID);
        response.controlDict = await getControlDictData(simulationID);
        response.constant = await getConstantData(simulationID);
        response.schemasData = await getSchemesData(simulationID);
        response.solutionsData = await getSolutionData(simulationID);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });
    
    app.post('/getSimulationInfo', async (req, res) => {
        let simulationID = req.body.simulation_id;
        console.log('Getting simulation info for simulation: ', simulationID);

        let response = await getSimulationInfo(simulationID);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });
    
    app.get('/getAllSimulationsInfo', async (req, res) => {
        console.log('Getting old simulations data');

        let response = await getAllSimulationsInfo();

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getConstantData', async (req, res) => {
        console.log('Getting constant data for simulation: ', req.body.simulation_id);

        let response = await getConstantData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getZeroData', async (req, res) => {
        console.log('Getting constant data for simulation: ', req.body.simulation_id);

        let response = await getZeroData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getControlDictData', async (req, res) => {
        console.log('Getting constant data for simulation: ', req.body.simulation_id);

        let response = await getControlDictData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getForcesData', async (req, res) => {
        console.log('Getting forces data for simulation: ', req.body.simulation_id);

        let response = await getForcesData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getSolutionData', async (req, res) => {
        console.log('Getting solution data for simulation: ', req.body.simulation_id);

        let response = await getSolutionData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getSchemasData', async (req, res) => {
        console.log('Getting schemes data for simulation: ', req.body.simulation_id);

        let response = await getSchemesData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getSimulationBoundariesData', async (req, res) => {
        console.log('Getting schemes data for simulation: ', req.body.simulation_id);

        let response = await getSimulationBoundariesData(req.body.simulation_id);

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });

    app.post('/getSimulationFiles', async (req, res) => {
        console.log('Creating simulation files at', req.body.simInfo.simFolderPath);

        createFiles(req.body.simInfo, req.body.data);

        res.json({
            "message": 'Success processing. All files have been saved on the specified route.'
        });
    });

}

async function createFiles(simFolderPath, data) {
    fw.createAllFiles(simFolderPath, data);
}

async function getAllSimulationsInfo() {
    return await db.getAllSimulationsInfo();
}

async function getSimulationInfo(simulationID) {
    return await db.getSimulationInfo(simulationID);
}

async function getZeroData(simulationID) {
    let response = []
    let data = await db.getZeroData(simulationID);

    if(data != null) {
        data.forEach( (row) => {
            let parsedRow = {
                variable: row.variable,
                value: row.value,
                AOAValue: row.AOAValue,
                boundaries: buildMultipleJSON( row.boundaries.replaceAll('\n', '').split('{') )
            }

            response.push(parsedRow);
        });
    }

    return response;
}

async function getSimulationBoundariesData(simulationID) {
    let data = await db.getSimulationBoundariesData(simulationID);

    if(data != null) {
        data.forEach( (row) => {
            delete row.id;
        });
    }

    return data;
}

async function getControlDictData(simulationID) {
    let response = await db.getControlDictData(simulationID);
    delete response.id;
    return response;
}

async function getConstantData(simulationID) {
    let response = await db.getConstantData(simulationID);
    delete response.id;
    return response;
}

async function getForcesData(simulationID) {
    let response = await db.getForcesData(simulationID);
    delete response.id;
    return response;
}

async function getSchemesData(simulationID) {
    let response = await db.getSchemesData(simulationID);
    let responseParsed = {};

    if(response != null){
        responseParsed.ddtSchemes = buildJSON( response.ddtSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.gradSchemes = buildJSON( response.gradSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.divSchemes = buildJSON( response.divSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.laplacianSchemes = buildJSON( response.laplacianSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.interpolationSchemes = buildJSON( response.interpolationSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.snGradSchemes = buildJSON( response.snGradSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.wallDist = buildJSON( response.wallDist.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
    }

    return responseParsed;
}

async function getSolutionData(simulationID) {
    let response = await db.getSolutionData(simulationID);
    let responseParsed = {};
        
    if(response != null) {
        responseParsed.solvers = buildMultipleJSON( response.solvers.replaceAll('\n', '').split('{') );
        responseParsed.simple = response.simple != null ?
                                        buildJSON( response.simple.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') ) :
                                        null;
        responseParsed.pimple = response.pimple != null ?
                                        buildJSON( response.pimple.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') ) :
                                        null;
        responseParsed.piso = response.piso != null ?
                                        buildJSON( response.piso.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') ) :
                                        null;
        responseParsed.residualControl = buildJSON( response.residualControl.replaceAll('\n', '')
                                            .replaceAll('{', '')
                                            .replaceAll('}', '')
                                            .split(';') );
        responseParsed.relaxationFactors = buildJSON( response.relaxationFactors.replaceAll('\n', '')
                                            .replace('fields','').replace('equations','')
                                            .replaceAll('{', '').replaceAll('}', '')
                                            .split(';') );
    }

    return responseParsed;
}

function buildJSON(data) {
    let solution = {};

    // Here we build a JSON object to be returned
    data.forEach( (row) => {
        let inputJSON = row.trim().split('  ');
        if(inputJSON.length <= 1) inputJSON = inputJSON[0].split('\t');

        if (inputJSON[0] !== '') {
            solution[`${inputJSON[0]}`] = inputJSON.slice(-1)[0] != null ? inputJSON.slice(-1)[0].trim() : null;
        }
    });

    return solution;
}

function buildMultipleJSON(solversData) {
    let solvers = {};
    let solver;

    solversData.forEach( (row) => {
        if ( row === '' ) {
            // We dont want to process this row
            return;
        }

        row = row.split('}');

        if (row.length === 1 ) {
            solver = row[0].trim();

        } else {
            let solverBody = buildJSON( row[0].split(';') );

            // Sets a new parameter on the solvers JSON with the previous JSON
            solvers[`${solver}`] = solverBody;

            // Sets the solver param for the next iteration
            solver = row[1].trim();
        }
    });

    return solvers;
}

const db = require("./database.js");
const fw = require("./fileWriter.js");

module.exports.start = start;