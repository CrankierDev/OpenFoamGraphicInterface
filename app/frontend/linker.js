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

async function getZeroData(simulationID) {
    return await fetch('http://localhost:9876/getZeroData', {
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

async function getSolutionData(simulationID) {
    return await fetch('http://localhost:9876/getSolutionData', {
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

async function getSchemasData(simulationID) {
    return await fetch('http://localhost:9876/getSchemasData', {
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

async function getSimulationInfo(simulationID) {
    return await fetch('http://localhost:9876/getSimulationInfo', {
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

async function getSimulationBoundariesData(simulationID) {
    return await fetch('http://localhost:9876/getSimulationBoundariesData', {
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

async function getSimulationFiles(simInfo, data) {
    const body = {
        simInfo: simInfo,
        data: data
    };
    
    return await fetch('http://localhost:9876/getSimulationFiles', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    })
    .then( response => response.json() )
    .then( data => {
        return data.data;
    });
}

async function loadInfo(id){
    let text = id;
    text += `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ullamcorper velit sed ullamcorper morbi tincidunt ornare massa eget egestas. Sit amet tellus cras adipiscing enim eu turpis egestas pretium. Nam at lectus urna duis convallis convallis tellus id. Sit amet consectetur adipiscing elit. Montes nascetur ridiculus mus mauris. Ultrices mi tempus imperdiet nulla malesuada. A pellentesque sit amet porttitor eget. Nulla posuere sollicitudin aliquam ultrices sagittis orci a. Bibendum arcu vitae elementum curabitur vitae. Turpis massa tincidunt dui ut ornare. Ullamcorper velit sed ullamcorper morbi tincidunt ornare massa. Aenean vel elit scelerisque mauris.

    Neque volutpat ac tincidunt vitae semper quis. Diam phasellus vestibulum lorem sed risus ultricies. Nam libero justo laoreet sit. Tristique senectus et netus et malesuada fames. Dictum fusce ut placerat orci nulla. Eu turpis egestas pretium aenean pharetra magna ac. Lobortis elementum nibh tellus molestie nunc non blandit. Accumsan tortor posuere ac ut consequat semper viverra nam. Nisl nisi scelerisque eu ultrices vitae auctor eu augue ut. Viverra nam libero justo laoreet. Velit egestas dui id ornare. Vel turpis nunc eget lorem dolor sed viverra ipsum. Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Eu facilisis sed odio morbi quis commodo odio aenean sed. Eu consequat ac felis donec et odio. Euismod elementum nisi quis eleifend quam adipiscing vitae proin sagittis. Et netus et malesuada fames ac.`
    
    return text !== '' ? text : null;
}