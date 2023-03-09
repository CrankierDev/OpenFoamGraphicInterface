function firstPage(method) {
    document.getElementById(`firstContent-${method}`).style.display = "block";
    document.getElementById(`secondContent-${method}`).style.display = "none";

    document.getElementById(`constant-inputs-${method}`).style.display = "block";

    document.getElementById(`back-button`).style.display = "none";
    document.getElementById(`generator-button`).style.display = "none";
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

    //linker function
    let turbulenceModels = await getTurbulenceModelsInfo();

    //formatter function
    setModels(turbulenceModels);
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
    
    if( activeId == 'constant-ball-advanced' ) {
        if (direction){
            if(document.getElementById('mesh').value) {
                let boundariesData = await pathsData();
                fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
            }

            fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');
            
            changeSection('constant', 'zero', 'advanced');
        } else {
            firstPage('advanced');
        }
    } else if( activeId == 'zero-ball-advanced' ) {
        if (direction){
            changeSection('zero', 'fvSolution', 'advanced');
        } else {
            changeSection('zero', 'constant', 'advanced');
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

            document.getElementById('generator-button').style.display = "block";
            document.getElementById('generator2-button').style.display = "block";
            document.getElementById('generator3-button').style.display = "block";
            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('controlDict', 'fvSchemes', 'advanced');
        }
    } else if( activeId == 'generator-ball-advanced' ) {
        if (direction){
            document.getElementById('generator-inputs-advanced').style.display = "none";
            firstPage('advanced');
        } else {
            changeSection('generator', 'controlDict', 'advanced');

            document.getElementById('generator-button').style.display = "none";
            document.getElementById('next-button').style.display = "block";
        }
    } else {
        secondPage('advanced');
        document.getElementById('constant-ball-advanced').classList.add('active-ball');
        document.getElementById('constant-inputs-advanced').style.display = 'block';
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
    
    if( activeId == 'constant-ball-simple' ) {
        if (direction){
            if(document.getElementById('mesh').value) {
                let boundariesData = await pathsData();
                fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
            }

            fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');
            
            changeSection('constant', 'zero', 'simple');
        } else {
            firstPage('simple');
        }
    } else if( activeId == 'zero-ball-simple' ) {
        if (direction){
            changeSection('zero', 'controlDict', 'simple');
        } else {
            changeSection('zero', 'constant', 'simple');
        }
    } else if( activeId == 'controlDict-ball-simple' ) {
        if (direction){
            changeSection('controlDict', 'generator', 'simple');

            document.getElementById('generator-button').style.display = "block";
            document.getElementById('generator2-button').style.display = "block";
            document.getElementById('generator3-button').style.display = "block";
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

            document.getElementById('generator-button').style.display = "none";
            document.getElementById('next-button').style.display = "block";
        }
    } else {
        secondPage('simple');
        document.getElementById('constant-ball-simple').classList.add('active-ball');
        document.getElementById('constant-inputs-simple').style.display = 'block';
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

    if(name && mesh && workspace) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
    
    // Clean
    button.disabled = false;
}