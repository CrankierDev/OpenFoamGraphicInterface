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

/**
 * Generates a simulation route for Linux's terminal processes
 */
function parseLinuxRoutes(winRoute){
	let splittedWinRoute = winRoute.split(':');

	if( splittedWinRoute.length > 1 ) {
		return `/mnt/${splittedWinRoute[0].toLowerCase()}${splittedWinRoute[1].replaceAll('\\','/').replaceAll('//','/')}`;
	} else {
		return winRoute;
	}
}

/**
 * Generates a simulation route for Windows's terminal processes
*/
function parseWindowsRoutes(linuxRoute) {
	let linuxRouteCopy = linuxRoute.replaceAll('/mnt/', '');
	splittedLinRoute = linuxRouteCopy.split('/');

	if( splittedLinRoute.length > 1 ) {
		let winRoute = `${splittedLinRoute[0].toUpperCase()}:\\\\`;
	
		for( let i = 1; i < splittedLinRoute.length; i++ ) {
			if( splittedLinRoute[i] !== '' ) {
				winRoute += `${splittedLinRoute[i]}\\\\`;
			}
		}
		
		return winRoute;
	} else {
		return linuxRoute + '\\\\';
	}
}

module.exports = {
	buildMultipleJSON: buildMultipleJSON,
	buildJSON: buildJSON,
    parseLinuxRoutes: parseLinuxRoutes,
    parseWindowsRoutes: parseWindowsRoutes
}