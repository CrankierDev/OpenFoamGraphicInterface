function start() {
    console.log('Starting express back end...');

    const express = require('express');
    const db = require("./database.js");
    const cors = require('cors');
    const bodyParser = require('body-parser')
    
    const app = express();
    const port = 9876;
    
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    
    app.listen(port, () => console.log(`Listening at the port: ${port}`));
    
    //Starts the db if it was non created before
    db.start();

    app.get('/', (req, res) => {
        res.send('Im working fine');
    });

    app.post('/foldersData', (req, res, next) => {
        console.log('Reading mesh info... ');
        const fs = require('fs');
        
        try {
            let data = fs.readFileSync(req.body.mesh + '/boundary', 'utf8');
            let partitionIndex = data.indexOf('(');
            let boundObjects = data.slice(partitionIndex).split('\n');
            
            let boundaries = [];
            
            for(let i = 0 ; i < boundObjects.length ; i++) {
                if( boundObjects[i].trim() == '{' ){
                    const typeIndex = boundObjects[i+1].indexOf('type');
                    let newBoundary = {
                        name: boundObjects[i-1].trim(),
                        type: boundObjects[i+1].slice(typeIndex + 4, boundObjects[i+1].length-1).trim()
                    }
                    boundaries.push(newBoundary);
                    i+=2;
                }
            }
            
            res.json({
                "message": 'Success processing',
                "data": boundaries
            });
        } catch(e) {
            console.log('Error:', e.stack)
        }
    });

    app.get('/getTurbulenceModelsInfo', async (req, res) => {
        console.log('Getting turbulence models info... ');
        res.json({
            "message": 'Success processing',
            "data": await db.getTurbulenceModelsInfo()
        });
    });

    app.post('/getTurbulenceModelVariables', async (req, res) => {
        console.log('Getting turbulence model variables info for: ', req.body.model);
        res.json({
            "message": 'Success processing',
            "data": await db.getTurbulenceModelVariables(req.body.model)
        });
    });

    app.post('/getSolutionData', async (req, res) => {
        console.log('Getting default data for simulation... ');

        let response = await db.getSolutionData(req.body.simulation_id);
        
        if(response != null) {
            response.solvers = parseSolvers( response.solvers.replaceAll('\n', '').split('{') );
            response.simple = buildJSON( response.simple.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
            response.pimple = buildJSON( response.pimple.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
            response.piso = buildJSON( response.piso.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
            response.residualControl = buildJSON( response.residualControl.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
            response.relaxationFactors = buildJSON( response.relaxationFactors.replaceAll('\n', '')
                                                .replaceAll('{', '')
                                                .replaceAll('}', '')
                                                .split(';') );
        }

        res.json({
            "message": 'Success processing',
            "data": response
        });
    });
}

function buildJSON(data) {
    let solution = {};

    // Here we build a JSON object to return later
    data.forEach( (row) => {
        let inputJSON = row.trim().split(' ');

        if (inputJSON[0] !== '') {
            solution[`${inputJSON[0]}`] = inputJSON.slice(-1)[0];
        }
    });

    return solution;
}

function parseSolvers(solversData) {
    let solvers = {};
    let solver;

    solversData.forEach( (row) => {
        if ( row === '' ) {
            // We dont want to process this row
            return;
        }

        row = row.split('}');

        if (row.length === 1 ) {
            solver = row[0].trim();

        } else {
            let solverBody = buildJSON( row[0].split(';') );

            // Sets a new parameter on the solvers JSON with the previous JSON
            solvers[`${solver}`] = solverBody;

            // Sets the solver param for the next iteration
            solver = row[1].trim();
        }
    });

    return solvers;
}

module.exports.start = start;