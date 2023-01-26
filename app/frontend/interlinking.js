function firstPage() {
    document.getElementById("firstContent").style.display = "block";
    document.getElementById("secondContent").style.display = "none";

    document.getElementById('constant-inputs').style.display = "block";

    document.getElementById('back-button').style.display = "none";
    document.getElementById('generator-button').style.display = "none";
    document.getElementById('next-button').style.display = "block";
    document.getElementById("next-button").classList.add('center-buttons');
    document.getElementById("next-button").classList.remove('right-button');
}

async function secondPage() {
    document.getElementById("firstContent").style.display = "none";
    document.getElementById("secondContent").style.display = "block";

    document.getElementById("next-button").classList.remove('center-buttons');
    document.getElementById("next-button").classList.add('right-button');
    document.getElementById('back-button').style.display = "block";

    //linker function
    let turbulenceModels = await getTurbulenceModelsInfo();

    //formatter function
    setModels(turbulenceModels);
}

function changeSection(actualContent, nextContent) {
    document.getElementById(`${actualContent}-inputs`).style.display = "none";
    document.getElementById(`${nextContent}-ball`).classList.add('active-ball');
    document.getElementById(`${nextContent}-inputs`).style.display = "block";

    window.scrollTo(0, 0);
}

async function pagination(direction) {
    let activeId = null;
    try{
        activeId = document.getElementsByClassName('active-ball')[0].id;
        document.getElementById(activeId).classList.remove('active-ball');
    } catch {
        console.log('Where are at the first page');
    }
    
    if( activeId == 'constant-ball' ) {
        if (direction){
            if(document.getElementById('mesh').value) {
                let boundariesData = await pathsData();
                fillFormsData(boundariesData, document.getElementById("turbulence-model").value);
            }

            solverVariables(document.getElementById('solver').value);
            
            changeSection('constant', 'zero');
        } else {
            firstPage();
        }
    } else if( activeId == 'zero-ball' ) {
        if (direction){
            changeSection('zero', 'fvSolution');
        } else {
            changeSection('zero', 'constant');
        }
    } else if( activeId == 'fvSolution-ball' ) {
        if (direction){
            changeSection('fvSolution', 'fvSchemes');
        } else {
            changeSection('fvSolution', 'zero');
        }
    } else if( activeId == 'fvSchemes-ball' ) {
        if (direction){
            changeSection('fvSchemes', 'controlDict');
        } else {
            changeSection('fvSchemes', 'fvSolution');
        }
    } else if( activeId == 'controlDict-ball' ) {
        if (direction){
            changeSection('controlDict', 'generator');

            document.getElementById('generator-button').style.display = "block";
            document.getElementById('generator2-button').style.display = "block";
            document.getElementById('generator3-button').style.display = "block";
            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('controlDict', 'fvSchemes');
        }
    } else if( activeId == 'generator-ball' ) {
        if (direction){
            document.getElementById('generator-inputs').style.display = "none";
            firstPage();
        } else {
            changeSection('generator', 'controlDict');

            document.getElementById('generator-button').style.display = "none";
            document.getElementById('next-button').style.display = "block";
        }
    } else {
        secondPage();
        document.getElementById('constant-ball').classList.add('active-ball');
        document.getElementById('constant-inputs').style.display = 'block';
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