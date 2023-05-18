async function generateSimulationInfo() {
	let data = {};

	data.constant = buildConstant();
	data['0'] = await buildZero(data.constant.momentumTransport.turbulenceModel);

	console.log('data', data);
}

async function buildZero(turbulenceModel) {
	let variables = [
        {
            name: 'presión',
            variable: 'p',
            type: 'asymmetric',
            schemes: 'grad',
            wallFunction: 0,
			class: "volScalarField",
			dimensions: "[0 2 -2 0 0 0 0]",
        },
        {
            name: 'velocidad',
            variable: 'U',
            type: 'symmetric',
            schemes: "'grad','div'",
            wallFunction: 0,
			class: "volVectorField",
			dimensions: "[0 1 -1 0 0 0 0]",
        }
    ];

	if (turbulenceModel !== 'none') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel);

        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
    }

	let boundariesData;

	if( window.simulationType === 'pastSimulation' ){
		boundariesData = await getSimulationBoundariesData(window.simulationID);
	} else {
		boundariesData = await pathsData();
	}

	let zero = {};

	for( let variable of variables ) {
		const newParameter = {
			class: variable.class,
			dimensions: variable.dimensions,
			internalField: calculateValue(variable.variable),
			boundaryField: buildBoundaryField(variable, boundariesData)
		}

		zero[`${variable.variable}`] = newParameter;
	}

	return zero;
}

function buildBoundaryField(variable, boundariesData) {
	let boundaryField = `
	{`;

	for( let boundary of boundariesData ) {
		if( boundary.type === 'empty' ) {
			boundaryField += `
			${boundary.name} {
				type	empty;
			}
			`;

			continue;

		} else if( boundary.type === 'wall' ) {
			boundaryField += `
			${boundary.name} {`;

			if( variable.wallFunction == 1 &&
					document.getElementById(`${boundary.name}-wall`).value == 1 ) {

				boundaryField += `
				type	:wallFunction;
				value	uniform 0;
			}
			`;

			} else {
				const patchType = document.getElementById(`${variable.variable}-data-${boundary.name}-type`).value;

				boundaryField += `
				type	${patchType};`;

				if( patchType === 'fixedValue' ) {
					boundaryField += `
				value	uniform 0;`;

				}
				boundaryField += `
			}
		`;
			}
		} else if( boundary.type === 'patch' ) {
			const patchType = document.getElementById(`${variable.variable}-data-${boundary.name}-type`).value;

			console.log('patch', patchType);
			
			boundaryField += `
			${boundary.name} {`;

			if ( patchType === 'freestreamPressure'
					|| patchType === 'freestreamVelocity'
					|| patchType === 'freestream') {

				boundaryField += `
				type				${patchType};
				freestreamValue		$internalField;
			}
			`;

			} else {
				boundaryField += `
				type				${patchType};
				value		$internalField;
			}
			`;
			}
		}
	}

	boundaryField += `
	}`;

	// console.log(boundaryField);

	return boundaryField;
}

function calculateValue(variable) {
	if( variable === 'p' || variable === 'U' ) {
		return document.getElementById(`flux-${variable}`).value;
	}

	return variable + ": value to calculate";
}

function buildConstant() {
	const turbulenceModel = document.getElementById('turbulence-model').value;
	const forces = document.getElementById("forces-data").checked;
    const coeffs = document.getElementById("forcesCoeffs-data").checked;

	let constant = {
		transportProperties: {
			transportModel: "Newtonian",
			rho: document.getElementById('flux-density').value,
			nu: document.getElementById('flux-viscosity').value
		}, 
		momentumTransport: {
			turbulenceModel: turbulenceModel == 'default' ? 'none' : turbulenceModel,
			turbulence:  turbulenceModel == 'default' ? 'off' : 'on',
			printCoeffs: forces || coeffs ? 'on' : 'off'
		}
	}

	return constant;

}