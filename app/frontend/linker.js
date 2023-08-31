/**
 * Calls checkMesh api
 */
async function checkMeshFormat() {
    const mesh = document.getElementById('mesh').value;
    const response = await window.functionsAPI.checkMesh(mesh);
    
    if( response ) {
        document.getElementById('checkMesh').style.backgroundColor = '#008500';
        document.getElementById('checkMesh').innerText = '!Mallado correcto!';
    } else { 
        document.getElementById('checkMesh').style.backgroundColor = '#e31d1d';
        document.getElementById('checkMesh').innerText = 'Revisa el mallado';
    }
}

async function pathsData() {
    const mesh = document.getElementById('mesh').value.replaceAll('\\','/');
    return await window.functionsAPI.foldersData(mesh);
}

async function startDB() {
    return await window.functionsAPI.startDB();
}

async function getAllSimulationsInfo() {
    return await window.functionsAPI.getAllSimulationsInfo();
}

async function getConstantData(simulationID) {
    return await window.functionsAPI.getConstantData(simulationID);
}

async function getZeroData(simulationID) {
    return await window.functionsAPI.getZeroData(simulationID);
}

async function getControlDictData(simulationID) {
    return await window.functionsAPI.getControlDictData(simulationID);
}

async function getForcesData(simulationID) {
    return await window.functionsAPI.getForcesData(simulationID);
}

async function getSolutionData(simulationID) {
    return await window.functionsAPI.getSolutionData(simulationID);
}

async function getSchemasData(simulationID) {
    return await window.functionsAPI.getSchemasData(simulationID);
}

async function getTurbulenceModelsInfo() {
    return await window.functionsAPI.getTurbulenceModelsInfo();
}

async function getTurbulenceModelVariables(model) {
    return await window.functionsAPI.getTurbulenceModelVariables(model);
}

async function getSimulationInfo(simulationID) {
    return await window.functionsAPI.getSimulationInfo(simulationID);
}

async function getSimulationBoundariesData(simulationID) {
    return await window.functionsAPI.getSimulationBoundariesData(simulationID);
}

async function getSimulationFiles(simInfo, data) {
    const body = {
        simInfo: simInfo,
        data: data
    };
    
    return await window.functionsAPI.getSimulationFiles(JSON.stringify(body));
}

async function executeSimulation(simulationID) {
    return await window.functionsAPI.executeSimulation(simulationID);
}

async function plotData(simulationID) {
    return window.functionsAPI.plotData(simulationID);
}

async function deleteSimulation(simulationID) {
    await window.functionsAPI.deleteSimulation(simulationID);
    setLastSimulationsTable();
}