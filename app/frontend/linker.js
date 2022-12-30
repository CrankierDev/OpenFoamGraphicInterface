async function pathsData() {
    const workspace = document.getElementById('workspace').value;
    const mesh = document.getElementById('mesh').value;
    const name = document.getElementById('simulation-name').value;

    return await fetch('http://localhost:9876/foldersData', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: `{
            "workspace": "${workspace.replaceAll('\\','/')}",
            "mesh": "${mesh.replaceAll('\\','/')}",
            "name": "${name}"
        }`,
    }).then( response => response.json() )
    .then(data => {
        console.log(data.data);
        return data.data;
    });
}

function execute() {
    console.log('script endded')
}