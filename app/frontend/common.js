function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function selectFolder(id) {
    console.log("folder", id);
    const filePath = await window.fileAPI.selectFolder();
    console.log(filePath);
    let objectId = document.getElementById(id);
    objectId.value = filePath;
    console.log('objectId', objectId.value);
}