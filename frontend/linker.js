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

