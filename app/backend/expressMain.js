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
    
    //Starts the db if it non opened before
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
        console.log('Getting turbulence model variables info... ');
        res.json({
            "message": 'Success processing',
            "data": await db.getTurbulenceModelVariables(req.body.model)
        });
    });
}

module.exports.start = start;