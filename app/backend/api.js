const { app, dialog } = require('electron');
const fs = require('fs');
const { spawnSync } = require('node:child_process');

const db = require("./database.js");
const fw = require("./fileWriter.js");
const common = require("./commonFunctions.js");
const resultsWorker = require("./resultsPlotter.js");

/**
 * Returns path from folders instead of files
 */
async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    
    if (canceled) {
        return null;
    } else {
        return filePaths[0] != null ? filePaths[0] : null;
    }
}

/**
 * Returns app version
 */
function getVersion() {
	return app.getVersion();
}

/**
 * Starts the db if it was non created before
 */
function startDB() {
    db.start();
}

function foldersData(mesh) {
    console.log('Reading mesh info... ');
    
    try {
        let data = fs.readFileSync(mesh + '/boundary', 'utf8');
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
        
        return boundaries;
    } catch(e) {
        console.log('Error:', e.stack)
    }
}

async function getTurbulenceModelsInfo() {
    console.log('Getting turbulence models info... ');
    return await db.getTurbulenceModelsInfo();
}

async function getTurbulenceModelVariables(model) {
    console.log('Getting turbulence model variables info for:', model);
    return await db.getTurbulenceModelVariables(model);
}

async function getSimulationData(simulationID) {
    console.log('Getting simulation data for simulation:', simulationID);

    let response = await db.getSimulationInfo(simulationID);
    response.boundaries = await getSimulationBoundariesDataAPI(simulationID);
    response.zeroData = await getZeroDataAPI(simulationID);
    response.controlDict = await getControlDictDataAPI(simulationID);
    response.constant = await getConstantDataAPI(simulationID);
    response.schemasData = await getSchemesDataAPI(simulationID);
    response.solutionsData = await getSolutionDataAPI(simulationID);

    return response;
}

async function getSimulationInfo(simulationID) {
    console.log('Getting simulation info for simulation:', simulationID);
    return await db.getSimulationInfo(simulationID);
}

async function getAllSimulationsInfo() {
    console.log('Getting old simulations data');
    let simulations = await db.getAllSimulationsInfo();
    
    simulations.map( (sim) => {
        sim.simRoute = common.parseWindowsRoutes(sim.simRoute);
    });

    return simulations;
}

async function getConstantData(simulationID) {
    console.log('Getting constant data for simulation:', simulationID);
    return await getConstantDataAPI(simulationID);
}

async function getZeroData(simulationID) {
    console.log('Getting constant data for simulation:', simulationID);
    return await getZeroDataAPI(simulationID);
}

async function getControlDictData(simulationID) {
    console.log('Getting constant data for simulation:', simulationID);
    return await getControlDictDataAPI(simulationID);
}

async function getForcesData(simulationID) {
    console.log('Getting forces data for simulation:', simulationID);
    return await getForcesDataAPI(simulationID);
}

async function getSolutionData(simulationID) {
    console.log('Getting solution data for simulation:', simulationID);
    return await getSolutionDataAPI(simulationID);
}

async function getSchemasData(simulationID) {
    console.log('Getting schemes data for simulation:', simulationID);
    return await getSchemesDataAPI(simulationID);
}

async function getSimulationBoundariesData(simulationID) {
    console.log('Getting schemes data for simulation:', simulationID);
    return await getSimulationBoundariesDataAPI(simulationID);
}

async function getSimulationFiles(body) {
    const bodyParsed = JSON.parse(body);
    console.log('Creating simulation files at', bodyParsed.simInfo.simFolderPath);
    return await fw.createAllFiles(bodyParsed.simInfo, bodyParsed.data);
}

async function deleteSimulation(simulationID) {
    const simInfo = await db.getSimulationInfo(simulationID);
    fw.deleteFiles(simInfo.simRoute);
    db.deleteSimulation(simulationID);
}

async function executeSimulation(simulationID) {
    const simInfo = await db.getSimulationInfo(simulationID);
    const combinedCommand = `${simInfo.simRoute}/script.sh`;
    
    const executionResp = await executeSimulationChild(combinedCommand);

    try {
        plotAll(simInfo.simRoute);
    } catch {
        console.error('Simulation has failed');
    }

    return executionResp;
}

async function checkMesh(meshRoute) {
    const combinedCommand = `${simInfo.simRoute}/script.sh`;
    
    const executionResp = await checkMeshChild(combinedCommand);

    return executionResp;
}

/* API INTERNAL FUNCTIONS */
async function executeSimulationChild(combinedCommand) {
    let child = spawnSync('wsl', [combinedCommand], {
        shell: true
    });
    
    const err = child.stderr.toString();
    const output = child.stdout.toString();

    console.log('output', output);
    console.log('err', err);

    if(child.status !== 0) {
        return {
            'status': child.status,
            "message":'Process has failed during execution',
            "error": err
        }
    } else if( err != null && err != '' ) {
        return {
            'status': 501,
            "message":'Process has failed during execution',
            "error": err
        }
    }

    return {
        'status': 200,
        "message":'Success processing',
        "output": output
    };
}

async function plotData(simulationID) {
    const simInfo = await db.getSimulationInfo(simulationID);
    plotAll(simInfo.simRoute);
}

async function plotAll(simRoute) {
    const winSimRoute = common.parseWindowsRoutes(simRoute);
    const data = await resultsWorker.readLog(winSimRoute);

    if( data.residuals == null ) return;

    let residualData = [];
    
    for( let variableName in data.residuals ) {
        if( data.residuals[`${variableName}`] !== [] ) {
            
            residualData.push({
                name: variableName,
                data: data.residuals[`${variableName}`]
            });
        }
    };

    resultsWorker.plotter(residualData, 'Residuales');

    if( data.coeffs.cl.length === 0 &&
        data.coeffs.cd.length === 0 &&
        data.coeffs.cm.length === 0 ) return;

    let coeffsData = [];
    
    for( let variableName in data.coeffs ) {
        if( data.coeffs[`${variableName}`] !== [] ) {
            
            coeffsData.push({
                name: variableName,
                data: data.coeffs[`${variableName}`]
            });
        }
    };

    resultsWorker.plotter(coeffsData, 'Coeficientes');
}

async function getZeroDataAPI(simulationID) {
    let response = []
    let data = await db.getZeroData(simulationID);

    if(data != null) {
        data.forEach( (row) => {
            let parsedRow = {
                variable: row.variable,
                value: row.value,
                AOAValue: row.AOAValue,
                lRef: row.lRef,
                intensity: row.intensity,
                boundaries: common.buildMultipleJSON( row.boundaries.replaceAll('\n', '').split('{') )
            }

            response.push(parsedRow);
        });
    }

    return response;
}

async function getSimulationBoundariesDataAPI(simulationID) {
    let data = await db.getSimulationBoundariesData(simulationID);

    if(data != null) {
        data.forEach( (row) => {
            delete row.id;
        });
    }

    return data;
}

async function getControlDictDataAPI(simulationID) {
    let response = await db.getControlDictData(simulationID);
    if( response != null ) {
        delete response.id;
    }
    return response;
}

async function getConstantDataAPI(simulationID) {
    let response = await db.getConstantData(simulationID);
    if( response != null ) {
        delete response.id;
    }
    return response;
}

async function getForcesDataAPI(simulationID) {
    let response = await db.getForcesData(simulationID);
    if( response != null ) {
        delete response.id;
    }

    return response;
}

async function getSchemesDataAPI(simulationID) {
    let response = await db.getSchemesData(simulationID);
    let responseParsed = {};

    if(response != null){
        responseParsed.ddtSchemes = common.buildJSON( response.ddtSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.gradSchemes = common.buildJSON( response.gradSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.divSchemes = common.buildJSON( response.divSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.laplacianSchemes = common.buildJSON( response.laplacianSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.interpolationSchemes = common.buildJSON( response.interpolationSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.snGradSchemes = common.buildJSON( response.snGradSchemes.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        responseParsed.wallDist = common.buildJSON( response.wallDist.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
    }

    return responseParsed;
}

async function getSolutionDataAPI(simulationID) {
    let response = await db.getSolutionData(simulationID);
    let responseParsed = {};
        
    if(response != null) {
        responseParsed.solvers = common.buildMultipleJSON( response.solvers.replaceAll('\n', '').split('{') );
        responseParsed.simple = response.simple != null ?
                                        common.buildJSON( response.simple.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') ) : null;

        responseParsed.pimple = response.pimple != null ?
                                        common.buildJSON( response.pimple.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') ) : null;

        responseParsed.piso = response.piso != null ?
                                        common.buildJSON( response.piso.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') ) : null;

        responseParsed.residualControl = common.buildJSON( response.residualControl.replaceAll('\n', '')
                                                    .replaceAll('{', '')
                                                    .replaceAll('}', '')
                                                    .split(';') );

        responseParsed.relaxationFactors = common.buildJSON( response.relaxationFactors.replaceAll('\n', '')
                                                    .replace('fields','').replace('equations','')
                                                    .replaceAll('{', '').replaceAll('}', '')
                                                    .split(';') );
    }

    return responseParsed;
}

module.exports = {
	handleFileOpen: handleFileOpen,
	getVersion: getVersion,
    startDB: startDB,
    foldersData: foldersData,
    getTurbulenceModelsInfo: getTurbulenceModelsInfo,
    getTurbulenceModelVariables: getTurbulenceModelVariables,
    getSimulationData: getSimulationData,
    getSimulationInfo: getSimulationInfo,
    getAllSimulationsInfo: getAllSimulationsInfo,
    getConstantData: getConstantData,
    getZeroData: getZeroData,
    getControlDictData: getControlDictData,
    getForcesData: getForcesData,
    getSolutionData: getSolutionData,
    getSchemasData: getSchemasData,
    getSimulationBoundariesData: getSimulationBoundariesData,
    getSimulationFiles: getSimulationFiles,
    deleteSimulation: deleteSimulation,
    executeSimulation: executeSimulation,
    checkMesh: checkMesh,
    plotData: plotData
}