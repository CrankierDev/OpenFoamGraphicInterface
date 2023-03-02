async function pathsData() {
    const workspace = document.getElementById('workspace').value;
    const mesh = document.getElementById('mesh').value;
    const name = document.getElementById('simulation-name').value;

    return await fetch('http://localhost:9876/foldersData', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
            "workspace": "${workspace.replaceAll('\\','/')}",
            "mesh": "${mesh.replaceAll('\\','/')}",
            "name": "${name}"
        }`,
    })
    .then( response => response.json() )
    .then( data => {
        console.log(data.data);
        return data.data;
    })
}

async function getAllSimulationsInfo() {
    return await fetch('http://localhost:9876/getAllSimulationsInfo', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

async function getConstantData(simulationID) {
    return await fetch('http://localhost:9876/getConstantData', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
            "simulation_id": "${simulationID}"
        }`,
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

async function getControlDictData(simulationID) {
    return await fetch('http://localhost:9876/getControlDictData', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
            "simulation_id": "${simulationID}"
        }`,
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

async function getForcesData(simulationID) {
    return await fetch('http://localhost:9876/getForcesData', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
            "simulation_id": "${simulationID}"
        }`,
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

async function getTurbulenceModelsInfo() {
    return await fetch('http://localhost:9876/getTurbulenceModelsInfo', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

async function getTurbulenceModelVariables(model) {
    return await fetch('http://localhost:9876/getTurbulenceModelVariables', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
            "model": "${model}"
        }`,
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

function loadSimulationData(SimulationID) {
    console.log('Buscamos la info de:', SimulationID);
}