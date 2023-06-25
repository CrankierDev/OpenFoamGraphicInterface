const lineReader = require('line-reader');

async function readCheckMesh(simRoute) {
    const file = `${simRoute}\\log`

    return new Promise( (resolve, reject) => {
        lineReader.eachLine(file, function(line, last) {
            if (line.indexOf('Mesh OK.') !== -1) {
				resolve(true);    
            }

            if(last) {
                resolve(false);
            }
        });
    });
}

async function readCoeffs(simRoute) {
    const file = `${simRoute}\\log`;
    let data = { 
        residuals: {
            Ux: [],
            Uy: [],
            Uz: [],
            p: [],
            nuTilda: [],
            omega: [],
            epsilon: []
        },
        coeffs: {
            cl: [],
            cd: [],
            cm: []
        }
    }

    return new Promise( (resolve, reject) => {
        lineReader.eachLine(file, function(line, last) {
			const auxLine = line.split(' ');

            if (line.indexOf('Solving for Ux') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.Ux.push(value);
    
            } else if (line.indexOf('Solving for Uy') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.Uy.push(value);
    
            } else if (line.indexOf('Solving for Uz') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.Uz.push(value);
    
            } else if (line.indexOf('Solving for p') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.p.push(value);
    
            } else if (line.indexOf('Solving for nuTilda') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.nuTilda.push(value);
    
            } else if (line.indexOf('Solving for omega') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.omega.push(value);
    
            } else if (line.indexOf('Solving for epsilon') !== -1) {
				const value = Number(auxLine[8].replaceAll(',',''));
                data.residuals.epsilon.push(value);

            } else if (line.indexOf('Cm ') !== -1) {
				const value = Number(auxLine[9].replaceAll(',',''));
                data.coeffs.cm.push(value);
    
            } else if (line.indexOf('Cd ') !== -1) {
				const value = Number(auxLine[9].replaceAll(',',''));
                data.coeffs.cd.push(value);
    
            } else if (line.indexOf('Cl ') !== -1) {
				const value = Number(auxLine[9].replaceAll(',',''));
                data.coeffs.cl.push(value);
            }
    
            if(last) {
                resolve(data);
            }
        });
    });
}

module.exports = {
    readCoeffs: readCoeffs,
    readCheckMesh: readCheckMesh
}