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

async function loadInfo(id){
    let text = id;
    text += `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ullamcorper velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Sit amet tellus cras adipiscing enim eu turpis egestas pretium. Nam at lectus urna duis convallis convallis tellus id. Sit amet consectetur adipiscing elit. Montes nascetur ridiculus mus mauris. Ultrices mi tempus imperdiet nulla malesuada. A pellentesque sit amet porttitor eget. Nulla posuere sollicitudin aliquam ultrices sagittis orci a. Bibendum arcu vitae elementum curabitur vitae. Turpis massa tincidunt dui ut ornare. Ullamcorper velit sed ullamcorper morbi tincidunt ornare massa. Aenean vel elit scelerisque mauris.

    Neque volutpat ac tincidunt vitae semper quis. Diam phasellus vestibulum lorem sed risus ultricies. Nam libero justo laoreet sit. Tristique senectus et netus et malesuada fames. Dictum fusce ut placerat orci nulla. Eu turpis egestas pretium aenean pharetra magna ac. Lobortis elementum nibh tellus molestie nunc non blandit. Accumsan tortor posuere ac ut consequat semper viverra nam. Nisl nisi scelerisque eu ultrices vitae auctor eu augue ut. Viverra nam libero justo laoreet. Velit egestas dui id ornare. Vel turpis nunc eget lorem dolor sed viverra ipsum. Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Eu facilisis sed odio morbi quis commodo odio aenean sed. Eu consequat ac felis donec et odio. Euismod elementum nisi quis eleifend quam adipiscing vitae proin sagittis. Et netus et malesuada fames ac.`
    
    return text !== '' ? text : null;
}