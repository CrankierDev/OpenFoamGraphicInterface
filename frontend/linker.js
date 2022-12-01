function execute(){
    // const {PythonShell} = require('python-shell');
    const path = require("path");

    const wsl = require('child_process')
        .spawn('python',[path.join(__dirname, '/backend/print.py')])
    
    wsl.stdout.on('data', (msg) => {
        console.log('Python response: ', msg.toString('utf8'));
    });

    wsl.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    wsl.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
        

    const python = require('child_process')
        .spawn('python',[path.join(__dirname, '/backend/main.py')])

    console.log('Executing Python script');

    python.stdout.on('data', (msg) => {
        console.log('Python response: ', msg.toString('utf8'));
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    

    // const options = {
    //     scriptPath : path.join(__dirname, '/backend/')
    //     // args : [input]
    // };

    //.replace('F:','/mnt/f')
    // console.log(options.scriptPath);

    // let shell = new PythonShell('main.py', options);

    // console.log(shell)
    // shell.on('message', function(msg) {
    //     console.log('Message', msg);
    //     if( msg === 'Ready'){
    //         document.getElementById("resultsReady").style.display = "block";
    //     }
    // });
    console.log('script endded')
}

function fillFormsData() {
    const boundaries = [
        {
            name: 'inlet',
            type:'patch'
        },
        {
            name: 'outlet',
            type:'patch'
        },
        {
            name: 'upperWall',
            type:'wall'
        },
        {
            name: 'lowerWall',
            type:'wall'
        },
        {
            name: 'frontAndBack',
            type:'empty'
        }
    ]

    console.log(boundaries);

    for (boundary of boundaries) {
        // First looks for the existence of the element to add
        if(!document.getElementById(`${boundary.name}-data`)){
            if( boundary.type === 'patch' ){
                document.getElementById('boundary-conditions').innerHTML += 
                    `<div id="${boundary.name}-data" class="walls-zero">
                        <p class="input-title">${capitalize(boundary.name)}</p>
                        <div class="data-container">
                            <div class="input-data">
                                <label id="inlet-type">Condición</label>
                                <select for="inlet-type" >
                                    <option>Valor fijo</option>
                                    <option>Gradiente nulo</option>
                                    <option>No-deslizamiento</option>
                                    <option>Vacío</option>
                                </select>
                            </div>
                        </div>
                    </div>`;
            } else if( boundary.type === 'wall' ){
                document.getElementById('boundary-conditions').innerHTML += 
                    `<div id="${boundary.name}-data" class="walls-zero">
                        <p class="input-title">${capitalize(boundary.name)}</p>
                        <div class="data-container">
                            <div class="input-data">
                                <label id="inlet-type">Condición</label>
                                <select for="inlet-type" >
                                    <option>Valor fijo</option>
                                    <option>Gradiente nulo</option>
                                    <option>No-deslizamiento</option>
                                    <option>Vacío</option>
                                </select>
                            </div>
                            <br>
                            <div class="input-data">
                                <label id="inlet-type">Funciones de pared</label>
                                <select for="inlet-type" >
                                    <option>Valor fijo</option>
                                    <option>Gradiente nulo</option>
                                </select>
                            </div>
                        </div>
                    </div>`;
            } else if( boundary.type === 'empty' ){
                // document.getElementById('boundary-conditions').innerHTML += 
                //     `<div id="${boundary.name}-data" class="walls-zero">
                //         <p class="input-title">${capitalize(boundary.name)}</p>
                //         <div class="data-container">
                //             <div class="input-data">
                //                 <label id="inlet-type">Tipo</label>
                //                 <select for="inlet-type" >
                //                     <option>Valor fijo</option>
                //                     <option>Gradiente nulo</option>
                //                     <option>No-deslizamiento</option>
                //                     <option>Vacío</option>
                //                 </select>
                //             </div>
                //         </div>
                //     </div>`;
            }
        }
    }
}
                    
