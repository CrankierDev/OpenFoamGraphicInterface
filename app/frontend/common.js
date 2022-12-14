function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function selectFolder(e) {
    console.log("folder", e);
    const filePath = await window.fileAPI.selectFolder();
    console.log(filePath);
}