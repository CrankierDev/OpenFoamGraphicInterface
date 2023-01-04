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

app.get('/', (req, res) => {
    res.send('Im working fine');
});

app.post('/foldersData', (req, res, next) => {
    console.log('Request: ', req.body);

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

        console.log(boundaries);

        res.json({
            "message": 'Success processing',
            "data": boundaries
        });
    } catch(e) {
        console.log('Error:', e.stack)
    }
});