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

/**
 * Receive a string and give it the correct format to set 
 * the value of a selector 
 */
function formatSelector(value) {
    // console.log('formatting... ', value);
    if (value == null) return 'default';
    return value.replaceAll("-", "").replaceAll(" ", "").trim().toLowerCase();    
}

/**
 * Receive a string and give it the correct format to set 
 * the value of an input 
 */
function formatInput(value) {
    // console.log('formatting... ', value);
    if (value == null) return 0;
    return value;    
}