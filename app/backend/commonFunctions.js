function buildJSON(data) {
    let solution = {};

    // Here we build a JSON object to be returned
    data.forEach( (row) => {
        let inputJSON = row.trim().split('  ');
        if(inputJSON.length <= 1) inputJSON = inputJSON[0].split('\t');

        if (inputJSON[0] !== '') {
            solution[`${inputJSON[0]}`] = inputJSON.slice(-1)[0] != null ?
                                            inputJSON.slice(-1)[0].trim() : null;
        }
    });

    return solution;
}

function buildMultipleJSON(solversData) {
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

module.exports = {
	buildMultipleJSON: buildMultipleJSON,
	buildJSON: buildJSON
}