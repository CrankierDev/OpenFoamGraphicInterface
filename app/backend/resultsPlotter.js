const lineReader = require('line-reader');
const { plot } = require('nodeplotlib');

async function readLog(simRoute) {
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

            } else if (line.indexOf('Cm') !== -1) {
				const value = Number(auxLine[9].replaceAll(',',''));
                data.coeffs.cm.push(value);
    
            } else if (line.indexOf('Cd') !== -1) {
				const value = Number(auxLine[9].replaceAll(',',''));
                data.coeffs.cd.push(value);
    
            } else if (line.indexOf('Cl') !== -1
					&& line.indexOf('Cl(f)') === -1
					&& line.indexOf('Cl(r)') === -1
					&& line.indexOf('ClockTime') === -1) {
				const value = Number(auxLine[9].replaceAll(',',''));
                data.coeffs.cl.push(value);
            }
    
            if(last) {
                resolve(data);
            }
        });
    });
}

function plotter(yAxisData, title) {
	let data = [];

	for( let axis of yAxisData ) {
		const dataLength = axis.data.length - 1;

		data.push({
			x: Array.from({length: dataLength}, (_, i) => i + 1),
			y: axis.data,
			type: 'scatter',
			name: axis.name
		});
	}

	let layout = {
		title: title
	}
	  
	plot(data, layout);
}

module.exports = { 
	readLog: readLog,
	plotter: plotter
}