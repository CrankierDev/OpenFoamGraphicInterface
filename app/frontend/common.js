/**
 * Receive a string and returns it capitalized 
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Calls an API to select a folder location instead of a file.
 * Id parameter is given in order to store the folder data.
 */
async function selectFolder(id) {
    console.log("folder", id);
    const filePath = await window.fileAPI.selectFolder();
    let objectId = document.getElementById(id);
    objectId.value = filePath != null ? filePath : false ;
    console.log('objectId', objectId.value);

    isSecondContentAvailable();
}

/**
 * Receive a vector in OpenFOAM format and returns an array from it 
 */
function parseVector(vector) {
    vector = vector.replaceAll("(", "").replaceAll(")", "");    
    return vector.split(" ");
}