function firstPage(method) {
    document.getElementById(`firstContent-${method}`).style.display = "block";
    document.getElementById(`secondContent-${method}`).style.display = "none";

    document.getElementById(`zero-inputs-${method}`).style.display = "block";

    document.getElementById(`back-button`).style.display = "none";
    document.getElementById(`firstContent-input-simple`).style.display = "none";
    document.getElementById(`next-button`).style.display = "block";
    document.getElementById(`next-button`).classList.add('center-buttons');
    document.getElementById(`next-button`).classList.remove('right-button');
}

async function secondPage(method) {
    document.getElementById(`firstContent-${method}`).style.display = "none";
    document.getElementById(`secondContent-${method}`).style.display = "block";

    document.getElementById(`next-button`).classList.remove('center-buttons');
    document.getElementById(`next-button`).classList.add('right-button');
    document.getElementById(`back-button`).style.display = "block";
}

function changeSection(actualContent, nextContent, method) {
    document.getElementById(`${actualContent}-inputs-${method}`).style.display = "none";
    document.getElementById(`${nextContent}-ball-${method}`).classList.add('active-ball');
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
    try{
        activeId = document.getElementsByClassName('active-ball')[0].id;
        document.getElementById(activeId).classList.remove('active-ball');
    } catch {
        console.log('Where are at the first page');
    }
    
    if( activeId == 'constants-ball-advanced' ) {
        if (direction){
            changeSection('constants', 'zero', 'advanced');
            document.getElementById('back-button').style.display = "block";
        }
    } else if( activeId == 'zero-ball-advanced' ) {
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
    } else if( activeId == 'fvSolution-ball-advanced' ) {
        if (direction){
            changeSection('fvSolution', 'fvSchemes', 'advanced');
        } else {
            changeSection('fvSolution', 'zero', 'advanced');
        }
    } else if( activeId == 'fvSchemes-ball-advanced' ) {
        if (direction){
            changeSection('fvSchemes', 'controlDict', 'advanced');
        } else {
            changeSection('fvSchemes', 'fvSolution', 'advanced');
        }
    } else if( activeId == 'controlDict-ball-advanced' ) {
        if (direction){
            changeSection('controlDict', 'generator', 'advanced');

            document.getElementById('firstContent-input-simple').style.display = "block";
            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('controlDict', 'fvSchemes', 'advanced');
        }
    } else if( activeId == 'generator-ball-advanced' ) {
        if (direction){
            try {
                document.getElementById('generator-inputs-advanced').style.display = "none";
                firstPage('advanced');
            } catch(err) {
                changeSection('zero', 'constants', 'advanced');
            } 
        } else {
            changeSection('generator', 'controlDict', 'advanced');

            document.getElementById('firstContent-input-simple').style.display = "none";
            document.getElementById('next-button').style.display = "block";
        }
    } else {
        secondPage('advanced');
        let boundariesData = await pathsData();
        fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
        fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');
        document.getElementById('zero-ball-advanced').classList.add('active-ball');
        document.getElementById('zero-inputs-advanced').style.display = 'block';
    }
}

async function paginationSimple(direction) {
    let activeId = null;
    try{
        activeId = document.getElementsByClassName('active-ball')[0].id;
        document.getElementById(activeId).classList.remove('active-ball');
    } catch {
        console.log('Where are at the first page');
    }
    
    if( activeId == 'zero-ball-simple' ) {
        if (direction){
            changeSection('zero', 'controlDict', 'simple');
        } else {
            firstPage('simple');
        }
    } else if( activeId == 'controlDict-ball-simple' ) {
        if (direction){
            changeSection('controlDict', 'generator', 'simple');

            document.getElementById('firstContent-input-simple').style.display = "block";
            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('controlDict', 'zero', 'simple');
        }
    } else if( activeId == 'generator-ball-simple' ) {
        if (direction){
            document.getElementById('generator-inputs-simple').style.display = "none";
            firstPage('simple');
        } else {
            changeSection('generator', 'controlDict', 'simple');

            document.getElementById('firstContent-input-simple').style.display = "none";
            document.getElementById('next-button').style.display = "block";
        }
    } else {
        secondPage('simple');
        let boundariesData = await pathsData();
        fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
        document.getElementById('zero-ball-simple').classList.add('active-ball');
        document.getElementById('zero-inputs-simple').style.display = 'block';
    }
}

function isSecondContentAvailable() {
    const name = document.getElementById('simulation-name').value ? true : false;
    const mesh = document.getElementById('mesh').value !== 'false' ? true : false;
    const workspace = document.getElementById('workspace').value !== 'false' ? true : false;

    const meshValue = document.getElementById('mesh').value ;
    const workspaceValue = document.getElementById('workspace').value;

    let button = document.getElementById('next-button');

    console.log('valors', meshValue, workspaceValue);

    if( name && mesh && workspace ) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
    
    // CLEAN
    button.disabled = false;

    if( button.disabled == false ){
        setModels();
        document.getElementById('flux-conditions').style.display = 'block';
    }

}

function clickPage(nextContent, method) {
    let activeId = null;
    activeId = document.getElementsByClassName('active-ball')[0].id;
    document.getElementById(activeId).classList.remove('active-ball');

    activeId = activeId.replaceAll(`-ball-${method}`,'');

    if(nextContent == 'firstContent'){
        firstPage(method);
    } else {
        changeSection(activeId, nextContent, method);
    }    

    if( nextContent == 'generator' ) {
        document.getElementById('next-button').style.display = "none";
        document.getElementById('back-button').style.display = "block";
        document.getElementById('firstContent-input-simple').style.display = "block";

    } else if( nextContent == 'constants' )  {
        document.getElementById('back-button').style.display = "none";
    } else {
        document.getElementById('firstContent-input-simple').style.display = "none";
        document.getElementById('back-button').style.display = "block";
        document.getElementById('next-button').style.display = "block";
    }
}

async function loadSimulationData(simulationID) {
    console.log('Buscamos la info de:', simulationID);

    loadContent('pastSimulation');

    await setModels();
    
    const boundariesData = await getSimulationBoundariesData(simulationID);
    const controlDictData = await getControlDictData(simulationID);
    const constantData = await getConstantData(simulationID);
    
    document.getElementById('solver').value = controlDictData.application;
    document.getElementById('turbulence-model').value = constantData.turbulenceModel;

    fillFormsBasicFields(boundariesData, constantData.turbulenceModel, simulationID);
    fillFormsSolverVariables(controlDictData.application, simulationID);
}