async function generateSimulationInfo() {
	let data = {};
	let boundariesData;

	if( window.simulationType === 'pastSimulation' ){
		boundariesData = await getSimulationBoundariesData(window.simulationID);
	} else {
		boundariesData = await pathsData();
	}

	data.constant = buildConstant();
	const turbulenceModel = data.constant.momentumTransport.turbulenceModel;

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

	data['0'] = await buildZero(boundariesData, variables);
	data.system = buildSystem(boundariesData, variables);

	console.log('data', data);
}

async function buildZero(boundariesData, variables) {
	let zero = {};

	for( let variable of variables ) {
		let newParameter = {
			class: variable.class,
			dimensions: variable.dimensions,
			internalField: '',
			boundaryField: buildBoundaryField(variable, boundariesData)
		}

		if(variable.variable ==='U') newParameter.aoa = document.getElementById('flux-aoa').value;
		if( variable.variable === 'p' || variable.variable === 'U' ) {
			newParameter.internalField = document.getElementById(`flux-${variable.variable}`).value;
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

			boundaryField += `
			${boundary.name} {
				type				${patchType};`;

			if ( patchType === 'freestreamPressure'
					|| patchType === 'freestreamVelocity'
					|| patchType === 'freestream') {

				boundaryField += `
				freestreamValue		$internalField;
			}
			`;

			} else {
				boundaryField += `
				value				$internalField;
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

function buildConstant() {
	const turbulenceModel = document.getElementById('turbulence-model').value;
	const forces = document.getElementById("forces-data").checked;
    const coeffs = document.getElementById("forcesCoeffs-data").checked;

	const constant = {
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

function buildSystem(boundariesData, variables) {
	let system = {
		controlDict: buildControlDict(),
		fvSchemes: buildFvSchemes(variables),
		fvSolution: buildFvSolution()
	}

	if( document.getElementById('forces-data').checked 
			|| document.getElementById('forcesCoeffs-data').checked) {
		system.forces = buildForces();
	}

	if( document.getElementById('forcesCoeffs-data').checked ) {
		let walls = boundariesData.filter( (boundary) => {
			if( boundary.type === 'wall' ) return boundary;
		});

		if( walls.length > 1) {
			let i = 0;
			for( let wall of walls ) {
				system[`forceCoeffs${i}`] = buildForceCoeffs(system.forces, wall.name);
			}

		} else {
			system.forceCoeffs = buildForceCoeffs(system.forces, walls[0].name);
		}
	}

	return system;
}

function buildControlDict() {
	const controlDict = {
		application: document.getElementById('solver').value,
		startFrom: document.getElementById('simulation-begin').value,
		startTime: document.getElementById('simulation-begin-time').value,
		stopAt: document.getElementById('simulation-end').value,
		endTime: document.getElementById('simulation-end-time').value,
		deltaT: document.getElementById('simulation-deltat').value,
		runTimeModifiable: document.getElementById('deltat-adjust').checked ? 'true' : 'false',
		adjustTimeStep: document.getElementById('run-time-modifiable').checked ? 'yes' : 'no',
		functions: buildFunctions()
	}

	return controlDict;
}

function buildFunctions() {
	let functions = `
	functions
	{`;

	if( document.getElementById('forces-data').checked ) {
		functions += `
		#include "forces"`;
	}

	if( document.getElementById('forcesCoeffs-data').checked ) {
		functions += `
		#include "forceCoeffs"`;
	}

	functions += `
	}`;

	return functions
}

function buildForces() {
	const forces = {
		cofR: buildVectorValue('CofR'),
		rhoInf: document.getElementById('flux-density').value
	}

	return forces;
}

function buildForceCoeffs(forces, wallName) {
	const forceCoeffs = {
		patches: wallName,
		cofR: forces.cofR,
		rhoInf: forces.rhoInf,
		liftDir: parseVectorValue('lift'),
		dragDir: parseVectorValue('drag'),
		pitchAxis: parseVectorValue('pitch'),
		magUInf: document.getElementById('flux-U').value,
		ARef: document.getElementById('aRef-data').value,
		lRef: document.getElementById('lRef-data').value
	}

	return forceCoeffs;
}

function parseVectorValue(vector) {
	const direction = document.getElementById(`${vector}-option`).value;
	const aoa = document.getElementById('flux-aoa').value;

	if( direction !== 'unitVector' ){
		if( vector === 'lift' ) return buildLiftVector(direction, aoa);
		else if( vector === 'drag' ) return buildDragVector(aoa);
		else if( vector === 'pitch' ) return buildPitchVector(direction);
		// TODO: limit options to the desired ones in form

	} else {
		return buildVectorValue(vector);
	}
}

function degToRadians(aoa) {
	const rule = Math.PI / 180;
	return aoa*rule;
}

function buildLiftVector(direction, aoa) {
	if( aoa != '' ) {
		const rads = degToRadians(aoa);

		if( direction == 'Y' ) return `(-${Math.sin(rads)} ${Math.cos(rads)} 0)`;
		else if( direction == 'Z' ) return `(-${Math.sin(rads)} 0 ${Math.cos(rads)})`;

	} else {
		if( direction == 'Y' ) return '(0 1 0)';
		else if( direction == 'Z' ) return '(0 0 1)';
	}
}

function buildDragVector(aoa) {
	if( aoa != '' ) {
		const liftDirection = document.getElementById(`lift-option`).value;
		const rads = degToRadians(aoa);

		if( liftDirection == 'Y' ) return `(${Math.cos(rads)} ${Math.sin(rads)} 0)`;
		else if( liftDirection == 'Z' ) return `(${Math.cos(rads)} 0 ${Math.sin(rads)})`;

	} else {
		return '(1 0 0)';
	}
}

function buildPitchVector(direction) {
	if( direction == 'Y' ) return '(0 1 0)';
	else if( direction == 'Z' ) return '(0 0 1)';
}

function buildVectorValue(vector) {
	const xValue = document.getElementById(`${vector}X-data`).value;
	const yValue = document.getElementById(`${vector}Y-data`).value;
	const zValue = document.getElementById(`${vector}Z-data`).value;

	return `(${xValue} ${yValue} ${zValue})`;
}

function buildFvSchemes(variables) {
	const fvSchemes = {
		ddtSchemes: buildDdtSchemes(),
		gradSchemes: buildGradSchemes(variables),
		divSchemes: buildDivSchemes(variables),		
		laplacianSchemes: buildLaplacianSchemes(),
		interpolationSchemes: buildInterpolationSchemes(),
		snGradSchemes: buildSnGradSchemes(),
		wallDist: buildWallDist()
	}

	return fvSchemes;
}

function buildDdtSchemes() {
	return `
	{
		default		${document.getElementById('temporal-schema').value};
	}`
}

function buildGradSchemes(variables) {
	let grads = `
	{
		default		${gradBuilder('default')};`;

	for( let variable of variables ) {
		if( variable.schemes != null && variable.schemes.indexOf('grad') != -1 &&
				!document.getElementById(`check-default-grad-${variable.variable}`).checked ){
					
			grads += `
		grad(${variable.variable})	${gradBuilder(variable.variable)})`;
		}
	}

	grads += `
	}`;

	return grads;
}

function gradBuilder(grad) {
	return  document.getElementById(`${grad}-grad-schema`).value + ' ' +
			 document.getElementById(`${grad}-grad-interpolation`).value;
}

function buildDivSchemes(variables) {
	let divs = `
	{
		default		${divBuilder('default')};`;

	for( let variable of variables ) {
		if( variable.schemes != null && variable.schemes.indexOf('div') != -1 &&
				!document.getElementById(`check-default-div-${variable.variable}`).checked ){
					
			divs += `
		div(phi,${variable.variable})	${divBuilder(variable.variable)})`;
		}
	}

	divs += `
	}`;

	return divs;
}


function divBuilder(div) {
	let defaultDiv;

	if( document.getElementById(`${div}-div-limiter`).value !== 'default' ){
		defaultDiv = document.getElementById(`${div}-div-limiter`).value +
					' Gauss ' +
					document.getElementById(`${div}-div-interpolation`).value;

	} else {
		defaultDiv = 'Gauss ' +
					document.getElementById(`${div}-div-interpolation`).value;
	}

	if( document.getElementById(`${div}-div-interpolation`).value == 'linearUpwind') {
		defaultDiv += ` grad(${div})`;
	}

	return defaultDiv;
}


function buildLaplacianSchemes() {
	return `
	{
		default		${document.getElementById('default-laplacian').value};
	}`;
}

function buildInterpolationSchemes() {
	return `
	{
		default		${document.getElementById('default-interpolation-schema').value};
	}`;
}

function buildSnGradSchemes() {
	return `
	{
		default		${document.getElementById('default-snGrad-schema').value};
	}`;
}

function buildWallDist() {
	return `
	{
		default		${document.getElementById('default-wall-schema').value};
	}`;
}

function buildFvSolution() {
	
}