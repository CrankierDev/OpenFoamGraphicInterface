async function generateSimulationInfo() {
	let data = {};

	data.constant = buildConstant();
	data['0'] = await buildZero(data.constant.momentumTransport.turbulenceModel);

	console.log('data', data);
}

async function buildZero(turbulenceModel) {
	let variables = [];

	if (turbulenceModel !== 'none') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel);

        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
    }

	let zero = {
		p: {
			class: "volScalarField",
			dimensions: "[0 2 -2 0 0 0 0]",
			internalField: document.getElementById('flux-p').value,
			boundaryField: buildBoundaryField('p')
		},
		U: {
			class: "volVectorField",
			dimensions: "[0 1 -1 0 0 0 0]",
			internalField: document.getElementById('flux-U').value,
			boundaryField: buildBoundaryField('U')
		},
	};

	for( let variable of variables ) {
		const newParameter = {
			class: variable.class,
			dimensions: variable.dimensions,
			internalField: calculateValue(variable.name),
			boundaryField: buildBoundaryField(variable.name)
		}

		zero[`${variable.name}`] = newParameter;
	}

	return zero;
}

function buildBoundaryField(variable) {
	// let boundariesData = await pathsData();

	return variable + " boundaryField";
}

function calculateValue(variable) {
	return variable + " value";
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