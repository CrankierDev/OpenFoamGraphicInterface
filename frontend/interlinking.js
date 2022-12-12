function firstPage() {
    document.getElementById("firstContent").style.display = "block";
    document.getElementById("secondContent").style.display = "none";

    document.getElementById('zero-inputs').style.display = "block";

    document.getElementById('back-button').style.display = "none";
    document.getElementById('generator-button').style.display = "none";
    document.getElementById('next-button').style.display = "block";
    document.getElementById("next-button").classList.add('center-buttons');
    document.getElementById("next-button").classList.remove('right-button');
}

function secondPage() {
    document.getElementById("firstContent").style.display = "none";
    document.getElementById("secondContent").style.display = "block";

    document.getElementById("next-button").classList.remove('center-buttons');
    document.getElementById("next-button").classList.add('right-button');
    document.getElementById('back-button').style.display = "block";

    //Linker function
    fillFormsData();
}

function changeSection(actualContent, nextContent){
    document.getElementById(`${actualContent}-inputs`).style.display = "none";
    document.getElementById(`${nextContent}-ball`).classList.add('active-ball');
    document.getElementById(`${nextContent}-inputs`).style.display = "block";
}

function pagination(direction) {
    let activeId = null;
    
    try{
        activeId = document.getElementsByClassName('active-ball')[0].id;
        document.getElementById(activeId).classList.remove('active-ball');
    } catch {
        console.log('Where are at the first page');
    }

    if( activeId == 'zero-ball' ) {
        if (direction){
            changeSection('zero', 'constant');
        } else {
            firstPage();
        }
    } else if( activeId == 'constant-ball' ) {
        if (direction){
            changeSection('constant', 'controlDict');
        } else {
            changeSection('constant', 'zero');
        }
    } else if( activeId == 'controlDict-ball' ) {
        if (direction){
            changeSection('controlDict', 'fvSchemes');
        } else {
            changeSection('controlDict', 'constant');
        }
    } else if( activeId == 'fvSchemes-ball' ) {
        if (direction){
            changeSection('fvSchemes', 'fvSolution');
        } else {
            changeSection('fvSchemes', 'controlDict');
        }
    } else if( activeId == 'fvSolution-ball' ) {
        if (direction){
            changeSection('fvSolution', 'generator');

            document.getElementById('generator-button').style.display = "block";
            document.getElementById('generator2-button').style.display = "block";
            document.getElementById('generator3-button').style.display = "block";
            document.getElementById('next-button').style.display = "none";
        } else {
            changeSection('fvSolution', 'fvSchemes');
        }
    } else if( activeId == 'generator-ball' ) {
        if (direction){
            document.getElementById('generator-inputs').style.display = "none";
            firstPage();
        } else {
            changeSection('generator', 'fvSolution');

            document.getElementById('generator-button').style.display = "none";
            document.getElementById('next-button').style.display = "block";
        }
    } else {
        secondPage();
        document.getElementById('zero-ball').classList.add('active-ball');
    }
}