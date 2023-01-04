function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function selectFolder(id) {
    console.log("folder", id);
    const filePath = await window.fileAPI.selectFolder();
    let objectId = document.getElementById(id);
    objectId.value = filePath != null ? filePath : false ;
    console.log('objectId', objectId.value);

    isSecondContentAvailable();
}