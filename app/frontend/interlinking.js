function changeSection(actualContent, nextContent, method) {
    document.getElementById(`${actualContent}-inputs-${method}`).style.display = "none";
    document.getElementById(`${nextContent}-nav-${method}`).classList.add('active-nav');
    document.getElementById(`${nextContent}-inputs-${method}`).style.display = "block";

    window.scrollTo(0, 0);
}

function pagination(direction, method) {
    if( method === 'advanced') {
        paginationAdvanced(direction);
    } else if( method === 'simple') {
        paginationSimple(direction);
    }
}

async function paginationAdvanced(direction) {
    let activeId = null;
    activeId = document.getElementsByClassName('active-nav')[0].id;
    document.getElementById(activeId).classList.remove('active-nav');
    
    if( activeId == 'basics-nav-advanced' ) {
        if(direction){
            changeSection('basics', 'zero', 'advanced');
            
            if( window.simulationType !== 'pastSimulation' ){
                let boundariesData = await pathsData();
                fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
                fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');
            } 
            
            document.getElementById(`back-button`).style.display = "block";
            showPages();
        }
    } else if( activeId == 'constants-nav-advanced' ) {
        if(direction){
            changeSection('constants', 'zero', 'advanced');
            document.getElementById('back-button').style.display = "block";
        }
    } else if( activeId == 'zero-nav-advanced' ) {
        if(direction){
            changeSection('zero', 'fvSolution', 'advanced');
        } else {
            changeSection('zero', 'constants', 'advanced');
            document.getElementById('back-button').style.display = "none";        
        }
    } else if( activeId == 'fvSolution-nav-advanced' ) {
        if(direction){
            changeSection('fvSolution', 'fvSchemes', 'advanced');

        } else {
            changeSection('fvSolution', 'zero', 'advanced');
        }
    } else if( activeId == 'fvSchemes-nav-advanced' ) {
        if(direction){
            changeSection('fvSchemes', 'controlDict', 'advanced');

        } else {
            changeSection('fvSchemes', 'fvSolution', 'advanced');
        }
    } else if( activeId == 'controlDict-nav-advanced' ) {
        if(direction){
            changeSection('controlDict', 'generator', 'advanced');
            document.getElementById('next-button').style.display = "none";

        } else {
            changeSection('controlDict', 'fvSchemes', 'advanced');
        }
    } else if( activeId == 'generator-nav-advanced' ) {
        if(!direction) {
            changeSection('generator', 'controlDict', 'advanced');
            document.getElementById('next-button').style.display = "block";
        }
    }
}

async function paginationSimple(direction) {
    let activeId = null;    
    activeId = document.getElementsByClassName('active-nav')[0].id;
    document.getElementById(activeId).classList.remove('active-nav');
    
    if( activeId == 'basics-nav-simple' ) {
        if(direction){
            changeSection('basics', 'zero', 'simple');

            let boundariesData = await pathsData();
            fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
            fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');
            
            document.getElementById(`back-button`).style.display = "block";
            showPages();
        }
    } else if( activeId == 'zero-nav-simple' ) {
        if(direction){
            changeSection('zero', 'controlDict', 'simple');
        } else {
            changeSection('zero', 'basics', 'simple');
            document.getElementById(`back-button`).style.display = "none";
        }
    } else if( activeId == 'controlDict-nav-simple' ) {
        if(direction){
            changeSection('controlDict', 'generator', 'simple');
            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('controlDict', 'zero', 'simple');
        }
    } else if( activeId == 'generator-nav-simple' ) {
        if(!direction) {
            changeSection('generator', 'controlDict', 'simple');
            document.getElementById('next-button').style.display = "block";
        }
    }
}

function isSecondContentAvailable() {
    const nameOK = document.getElementById('simulation-name').value ? true : false;

    const meshRoute = document.getElementById('mesh').value;
    let meshOK = false;
    
    if( meshRoute != null && meshRoute !== '' && meshRoute !== 'false' ) {
        meshOK = true;
        document.getElementById('route-mesh').innerText = meshRoute;
        document.getElementById('info-mesh').style.display = 'inline-flex';
        document.getElementById('mesh').classList.add('folder-selected');

    } else {
        document.getElementById('route-mesh').value = '';
        document.getElementById('info-mesh').style.display = 'none';
        document.getElementById('mesh').classList.remove('folder-selected');

        const checkButton = document.getElementById('checkMesh');
        checkButton.style = '';
        checkButton.innerText = 'Comprobar la malla';
    }

    const workspaceRoute = document.getElementById('workspace').value;
    let workspaceOK = false;
    
    if( workspaceRoute != null && workspaceRoute !== '' && workspaceRoute !== 'false' ) {
        workspaceOK = true;
        document.getElementById('route-workspace').innerText = workspaceRoute;
        document.getElementById('info-workspace').style.display = 'inline-flex';
        document.getElementById('workspace').classList.add('folder-selected');

    } else {
        document.getElementById('route-workspace').value = '';
        document.getElementById('info-workspace').style.display = 'none';
        document.getElementById('workspace').classList.remove('folder-selected');
    }

    const turbulenceModel = document.getElementById('turbulence-model');
    const solver = document.getElementById('solver').value;

    if( nameOK && meshOK && workspaceOK 
            && solver === 'default' && turbulenceModel.innerHTML === '' ) {
        setModels();
        document.getElementById('flux-conditions').style.display = 'block';
    }
}

function showPages() {
    const hiddenPages = document.getElementsByClassName('nav-option-hidden');
    const initialLength = hiddenPages.length;

    for( let i = 0; i < initialLength; i++ ) {
        hiddenPages[0].classList.remove('nav-option-hidden');
    };
}

function clickPage(nextContent, method) {
    let activeId = null;
    activeId = document.getElementsByClassName('active-nav')[0].id;
    document.getElementById(activeId).classList.remove('active-nav');

    activeId = activeId.replaceAll(`-nav-${method}`,'');
    changeSection(activeId, nextContent, method);   

    if( nextContent == 'generator' ) {
        document.getElementById('next-button').style.display = "none";
        document.getElementById('back-button').style.display = "block";

    } else if( nextContent == 'constants' || nextContent == 'basics' )  {
        document.getElementById('back-button').style.display = "none";
        document.getElementById('next-button').style.display = "block";
    
    } else {
        document.getElementById('back-button').style.display = "block";
        document.getElementById('next-button').style.display = "block";
    }
}

async function loadSimulationData(simulationID) {
    loadContent('pastSimulation');

    setTimeout( async () => {
        window.simulationID = simulationID;
        await setSimulationInfo(simulationID);
        
        isSecondContentAvailable();
        await setModels();
    
        const boundariesData = await getSimulationBoundariesData(simulationID);
        const controlDictData = await getControlDictData(simulationID);
        const constantData = await getConstantData(simulationID);
        
        document.getElementById('solver').value = controlDictData.application;
        document.getElementById('turbulence-model').value = constantData.turbulenceModel;

        fillFormsBasicFieldsSim(boundariesData, constantData.turbulenceModel, simulationID);
        fillFormsSolverVariables(controlDictData.application, simulationID);
    }, 100 );
}

async function generateFiles() {
    window.generatedSimID = await generateSimulationInfo();
}

async function generateAndExecute() {
    let simID;
    let executionResponse = null;
    
    if( window.generatedSimID != null ) {
        simID = window.generatedSimID;
    } else {
        simID = await generateSimulationInfo();
    }

    document.getElementById('spinner').style.display = 'flex';
    document.getElementById('execution-info').style.display = 'none';
    
    setTimeout( async () => {
        executionResponse = await executeSimulation(simID);
    }, 1000);

    const statusInterval = setInterval( () => {
        if( executionResponse != null ) {
            document.getElementById('spinner').style.display = 'none';

            if( executionResponse.status != null ) {
                if( executionResponse.status === 200 ) {
                    document.getElementById('execution-info').innerHTML = `
                        <p>¡Simulacion ejecutada! Compruebe los resultados.</p>
                    `;
                } else if( executionResponse.status !== 200 ) {
                    document.getElementById('execution-info').innerHTML = `
                        <p>Ha habido problemas durante la simulación</p>
                        <p>Traza de error: ${executionResponse.error}</p>
                    `;
                }

                document.getElementById('execution-info').style.display = 'flex';
            }

            clearInterval(statusInterval);
        }
    }, 2000);
}