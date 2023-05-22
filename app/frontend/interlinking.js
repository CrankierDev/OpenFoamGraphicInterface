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
        if (direction){
            changeSection('basics', 'zero', 'advanced');

            let boundariesData = await pathsData();
            fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
            fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');
            
            document.getElementById(`back-button`).style.display = "block";
            // TODO: enable menu nav options and next-button
        }
    } else if( activeId == 'constants-nav-advanced' ) {
        if (direction){
            changeSection('constants', 'zero', 'advanced');
            document.getElementById('back-button').style.display = "block";
        }
    } else if( activeId == 'zero-nav-advanced' ) {
        if (direction){
            changeSection('zero', 'fvSolution', 'advanced');
        } else {
            try {
                firstPage('advanced');

            } catch(err) {
                changeSection('zero', 'constants', 'advanced');
                document.getElementById('back-button').style.display = "none";
            }            
        }
    } else if( activeId == 'fvSolution-nav-advanced' ) {
        if (direction){
            changeSection('fvSolution', 'fvSchemes', 'advanced');

        } else {
            changeSection('fvSolution', 'zero', 'advanced');
        }
    } else if( activeId == 'fvSchemes-nav-advanced' ) {
        if (direction){
            changeSection('fvSchemes', 'controlDict', 'advanced');

        } else {
            changeSection('fvSchemes', 'fvSolution', 'advanced');
        }
    } else if( activeId == 'controlDict-nav-advanced' ) {
        if (direction){
            changeSection('controlDict', 'generator', 'advanced');
            document.getElementById('next-button').style.display = "none";

        } else {
            changeSection('controlDict', 'fvSchemes', 'advanced');
        }
    } else if( activeId == 'generator-nav-advanced' ) {
        if (direction){
            try {
                document.getElementById('generator-inputs-advanced').style.display = "none";
                firstPage('advanced');
            } catch(err) {
                changeSection('zero', 'constants', 'advanced');
            } 
        } else {
            changeSection('generator', 'controlDict', 'advanced');
            document.getElementById('next-button').style.display = "block";

        }
    } 
    // else {
    //     secondPage('advanced');
    //     let boundariesData = await pathsData();
    //     fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
    //     document.getElementById('zero-nav-advanced').classList.add('active-nav');
    //     document.getElementById('zero-inputs-advanced').style.display = 'block';
    // }
}

async function paginationSimple(direction) {
    let activeId = null;    
    activeId = document.getElementsByClassName('active-nav')[0].id;
    document.getElementById(activeId).classList.remove('active-nav');
    
    if( activeId == 'basics-nav-simple' ) {
        if (direction){
            changeSection('basics', 'zero', 'simple');

            let boundariesData = await pathsData();
            fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
            
            document.getElementById(`back-button`).style.display = "block";
        }
    } else if( activeId == 'zero-nav-simple' ) {
        if (direction){
            changeSection('zero', 'controlDict', 'simple');
        } else {
            changeSection('zero', 'basics', 'simple');
            document.getElementById(`back-button`).style.display = "none";
        }
    } else if( activeId == 'controlDict-nav-simple' ) {
        if (direction){
            changeSection('controlDict', 'generator', 'simple');

            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('controlDict', 'zero', 'simple');
        }
    } else if( activeId == 'generator-nav-simple' ) {
        if (direction){
            generateFiles('simple');
            // firstPage('simple');
        } else {
            changeSection('generator', 'controlDict', 'simple');

            document.getElementById('next-button').style.display = "block";
        }
    }
}

function isSecondContentAvailable() {
    const name = document.getElementById('simulation-name').value ? true : false;
    const mesh = document.getElementById('mesh').value !== 'false' ? true : false;
    const workspace = document.getElementById('workspace').value !== 'false' ? true : false;

    let button = document.getElementById('next-button');

    if( name && mesh && workspace ) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
    
    // CLEAN
    // button.disabled = false;

    if( button.disabled == false ){
        setModels();
        document.getElementById('flux-conditions').style.display = 'block';
    }

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
    console.log('Buscamos la info de:', simulationID);

    loadContent('pastSimulation');
    await setSimulationInfo(simulationID);
    window.simulationID = simulationID;
    
    isSecondContentAvailable();
    await setModels();
    
    const boundariesData = await getSimulationBoundariesData(simulationID);
    const controlDictData = await getControlDictData(simulationID);
    const constantData = await getConstantData(simulationID);
    
    document.getElementById('solver').value = controlDictData.application;
    document.getElementById('turbulence-model').value = constantData.turbulenceModel;

    fillFormsBasicFields(boundariesData, constantData.turbulenceModel, simulationID);
    fillFormsSolverVariables(controlDictData.application, simulationID);
}

async function generateFiles() {
    generateSimulationInfo();
}