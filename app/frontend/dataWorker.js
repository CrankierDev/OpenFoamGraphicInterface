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

	if (turbulenceModel !== 'default') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel);

        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
    }

	data['0'] = await buildZero(boundariesData, variables, turbulenceModel);
	data.system = await buildSystem(boundariesData, variables);

	let simInfo = {
		simName: document.getElementById('simulation-name').value,
        simFolderPath: document.getElementById('workspace').value,
        mesh: document.getElementById('mesh').value,
		boundariesData: boundariesData
	}

	return await getSimulationFiles(simInfo, data);
}

async function buildZero(boundariesData, variables, turbulenceModel) {
	let zero = {};
	const lRef = document.getElementById('lRef-data').value;
	const intensity = document.getElementById('intensity-data').value;

	for( let variable of variables ) {
		let newParameter = {
			variable: variable.variable,
			class: variable.class,
			dimensions: variable.dimensions,
			internalField: 'calculate',
			lRef: lRef,
			intensity: intensity,
			boundaryField: buildBoundaryField(variable, boundariesData, turbulenceModel)
		}

		newParameter.aoa = variable.variable === 'U' ? document.getElementById('flux-aoa').value : null;
		
		if(variable.variable === 'U') {
			newParameter.liftDirection = document.getElementById(`lift-option`) ?
					document.getElementById(`lift-option`).value : 'Y';
		}

		if( variable.variable === 'p' || variable.variable === 'U' ) {
			newParameter.internalField = document.getElementById(`flux-${variable.variable}`).value;
		}

		zero[`${variable.variable}`] = newParameter;
	}

	return zero;
}

function patchValue(variable, boundary) {
	if( variable !== 'U' && variable !== 'p' ) return '$internalField';

    let check = document.getElementById(`${variable}-${boundary}-value-check`).checked;
	if(check) {
		return 'uniform ' + document.getElementById(`${variable}-${boundary}-value`).value;
	} 

	return '$internalField';
}

function buildBoundaryField(variable, boundariesData, turbulenceModel) {
	let boundaryField = `
{`;

	for( let boundary of boundariesData ) {
		if( boundary.type === 'empty' ) {
			boundaryField += `
	${boundary.name} 
	{
		type	empty;
	}
			`;

			continue;

		} else if( boundary.type === 'wall' ) {
			boundaryField += `
	${boundary.name} 
	{`;

			if( variable.wallFunction == 1 &&
					document.getElementById(`${boundary.name}-wall`).value == 1 ) {
				let wallFunction;

				if( variable.variable === 'omega' ) {
					wallFunction = 'omegaWallFunction';
					
				} else if( variable.variable === 'k' ) {
					wallFunction = 'kqRWallFunction';

				} else if( variable.variable === 'nut' ) {
					if( turbulenceModel === 'SpalartAllmaras' ) {
						wallFunction = 'nutUSpaldingWallFunction';
					} else {
						wallFunction = 'nutkWallFunction';
					}
				} else if( variable.variable === 'epsilon' ) {
					wallFunction = 'epsilonWallFunction';
				}

				boundaryField += `
		type	${wallFunction};
		value	$internalField;
	}
			`;

			} else {
				const patchType = document.getElementById(`${variable.variable}-data-${boundary.name}-type`).value;

				boundaryField += `
		type	${patchType};`;

				if( patchType === 'fixedValue' ) {
					if( variable.variable ==='U' ) {
						boundaryField += `
		value	$internalField;`;

					} else {
						boundaryField += `
		value	uniform 0;`;
					}
						
				}
				boundaryField += `
	}
		`;
			}
		} else if( boundary.type === 'patch' ) {
			const patchType = document.getElementById(`${variable.variable}-data-${boundary.name}-type`).value;
			const valuePatch = patchValue(variable.variable, boundary.name);

			boundaryField += `
	${boundary.name}
	{
		type				${patchType};`;

			if ( patchType === 'freestreamPressure'
					|| patchType === 'freestreamVelocity'
					|| patchType === 'freestream') {

				boundaryField += `
		freestreamValue		${valuePatch};
	}
			`;

			} else if( patchType !== 'zeroGradient' ) {
				boundaryField += `
		value				${valuePatch};
	}
			`;
			} else if( patchType === 'zeroGradient' ) {
				boundaryField += `
	}
			`;
			}
		}
	}

	boundaryField += `
}`;

	return boundaryField;
}

function buildConstant() {
	const turbulenceModel = document.getElementById('turbulence-model').value;

	const constant = {
		physicalProperties: {
			viscosityModel: "constant",
			rho: document.getElementById('flux-density').value,
			nu: document.getElementById('flux-viscosity').value
		}, 
		momentumTransport: {
			turbulenceModel: turbulenceModel,
			turbulence:  turbulenceModel === 'default' ? 'off' : 'on',
			printCoeffs: 'on',
			viscosityModel: "Newtonian"
		}
	}

	return constant;
}

async function buildSystem(boundariesData, variables) {
	let solver = document.getElementById('solver').value;
	let walls = boundariesData.filter( (boundary) => {
		if( boundary.type === 'wall' ) return boundary;
	});

	let system = {
		controlDict: buildControlDict(solver, walls.length),
		fvSchemes: buildFvSchemes(variables),
		fvSolution: buildFvSolution(variables, solver) 
	}

	if( document.getElementById('forces-data').checked 
			|| document.getElementById('forcesCoeffs-data').checked ) {
		
		const genForcesCoeffs =	document.getElementById('forcesCoeffs-data').checked;

		if( walls.length > 1) {
			for( let i = 0; i < walls.length; i++ ) {
				system[`forces${i}`] = buildForces(walls[i].name);
				if(genForcesCoeffs) system[`forceCoeffs${i}`] = buildForceCoeffs(system[`forces${i}`]);
			}
		} else {
			system.forces = buildForces(walls[0].name);
			if(genForcesCoeffs) system.forceCoeffs = buildForceCoeffs(system.forces);
		}
	}

	return system;
}

function buildControlDict(solver, wallsLength) {
	const controlDict = {
		application: solver,
		startFrom: 'startTime',
		startTime: 0,
		stopAt: 'endTime',
		endTime: document.getElementById('simulation-end-time').value,
		deltaT: document.getElementById('simulation-deltat').value,
		runTimeModifiable: document.getElementById('deltat-adjust').checked ? 'true' : 'false',
		adjustTimeStep: document.getElementById('run-time-modifiable').checked ? 'yes' : 'no',
		functions: buildFunctions(wallsLength)
	}

	return controlDict;
}

function buildFunctions(wallsLength) {
	const forces = document.getElementById("forces-data").checked;
    const coeffs = document.getElementById("forcesCoeffs-data").checked;

	if( !forces && !coeffs ) return '';

	let functions = `
functions
{`;

	if( forces ) {
		if( wallsLength > 1) {
			for( let i = 0; i < wallsLength; i++ ) {
		functions += `
	#include "forces${i}"`;
			}
		} else {
		functions += `
	#include "forces"`;
		}
	}

	if( coeffs ) {
		if( wallsLength > 1) {
			for( let i = 0; i < wallsLength; i++ ) {
		functions += `
	#include "forceCoeffs${i}"`;
			}
		} else {
		functions += `
	#include "forceCoeffs"`;
		}
	}

	functions += `
}`;

	return functions
}

function buildForces(wallName) {
	const forces = {
		patches: wallName,
		cofR: buildVectorValue('CofR'),
		rhoInf: document.getElementById('flux-density').value
	}

	return forces;
}

function buildForceCoeffs(forces) {
	const forceCoeffs = {
		patches: forces.patches,
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
	if( aoa != ''  && aoa != '0' ) {
		const rads = degToRadians(aoa);

		if( direction == 'Y' ) return `(-${Math.sin(rads)} ${Math.cos(rads)} 0)`;
		else if( direction == 'Z' ) return `(-${Math.sin(rads)} 0 ${Math.cos(rads)})`;

	} else {
		if( direction == 'Y' ) return '(0 1 0)';
		else if( direction == 'Z' ) return '(0 0 1)';
	}
}

function buildDragVector(aoa) {
	if( aoa != ''  && aoa != '0' ) {
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
	const grad = document.getElementById(`${grad}-grad-schema`).value;

	if( grad ==='leastSquares' ) {
		return  grad;
	} else {
		return  grad + ' ' + document.getElementById(`${grad}-grad-interpolation`).value;
	}

}

function buildDivSchemes(variables) {
	let divs = `
{
	default		${divBuilder('default')};`;

	for( let variable of variables ) {
		if( variable.schemes != null && variable.schemes.indexOf('div') != -1 &&
				!document.getElementById(`check-default-div-${variable.variable}`).checked ){
					
			divs += `
	div(phi,${variable.variable})	${divBuilder(variable.variable)};`;
		}
	}
	
    // div((nuEff*dev2(T(grad(U)))))    Gauss linear;
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
	default		Gauss linear ${document.getElementById('default-laplacian').value};
}`;
}

function buildInterpolationSchemes() {
	return `
{
	default		linear;
}`;
}

function buildSnGradSchemes() {
	return `
{
	default		${document.getElementById('default-snGrad-schema').value};
}`;
}

function buildWallDist() { // FIX ? QUIZA NECESITAMOS SOLVER PARA MANEJAR ICOFOAM
	return `
{
	method		${document.getElementById('default-wall-schema').value};
}`;
}

function buildFvSolution(variables, solver) {
	let fvSolution = {
		relaxationFactors: buildRelaxation(variables),
		solvers: buildSolver(variables),
		mainSolver: solver.toUpperCase() !== 'ICOFOAM' ? 
						solver.toUpperCase().replaceAll('FOAM', '') : 
						'PISO',
		solverBody: buildMainSolver(solver),
		residualControl: buildResidualControl(variables)
	}

	return fvSolution;
}

function buildRelaxation(variables) {
	let relaxation = `
{`;

	if( Number(document.getElementById('p-relaxation').value) !== 0 ) {
		relaxation += `
	fields
	{
		p		${document.getElementById('p-relaxation').value};
	}`;
	}
	
	relaxation += `
	equations
	{`;

	for( let variable of variables ) {
		if( variable.variable !== 'p' && variable.variable !== 'nut' &&
				Number(document.getElementById(`${variable.variable}-relaxation`).value) !== 0 ) {
			relaxation += `
		${variable.variable}		${document.getElementById(`${variable.variable}-relaxation`).value};`;
		}
	}

	relaxation += `
	}
}`;

	return relaxation;
}

function buildSolver(variables) {
	let solvers = `
{`;

	for( let variable of variables ) {
		if( variable.type != null ) solvers += buildSolverVariable(variable);
	}

	solvers += `

    pFinal
    {
        $p;
        relTol		0;
    }
}`;

	return solvers;
}

function buildSolverVariable(variable) {
	let solver = `
	${variable.variable}
	{
		solver		${document.getElementById(`${variable.variable}-solver-schema`).value};
		tolerance	${document.getElementById(`${variable.variable}-tolerance-data`).value};
		relTol		${document.getElementById(`${variable.variable}-relTol-data`).value};
		smoother	${document.getElementById(`${variable.variable}-smoother-data`).value};
	`;

	if( variable.type === 'symmetric' &&
			Number(document.getElementById(`${variable.variable}-sweeps-data`).value) !== 0 ){
		solver += `	nSweeps		${document.getElementById(`${variable.variable}-sweeps-data`).value};
	`;
	}

	if( document.getElementById(`${variable.variable}-preconditioner-schema`).value !== 'default' ){
		solver += `	preconditioner		${document.getElementById(`${variable.variable}-preconditioner-schema`).value};
	`;
	}
	
	solver += `}
	`;

	return solver;
}

function buildMainSolver(solver) {
	let mainSolver = `
{
	nNonOrthogonalCorrectors	${document.getElementById('nNonOrthogonalCorrectors').value};`;

	if( solver === 'pisoFoam' || solver === 'pimpleFoam' || solver === 'icoFoam' ) {
		mainSolver += `
	nCorrectors			${document.getElementById('nCorrectors').value}; `;
	}

	if( solver === 'pisoFoam' || solver === 'icoFoam' ) {
		mainSolver += `
	pRefCell			${document.getElementById('pRefCell').value}; 
	pRefValue			${document.getElementById('pRefValue').value}; `;
	}
	
	if( solver === 'pimpleFoam' ) {
		mainSolver += `
	nOuterCorrectors	${document.getElementById('nOuterCorrectors').value};
	correctPhi			${document.getElementById('correctPhi').value}; `;
	}

	mainSolver += `
	consistent			${document.getElementById('consistent').value};
	maxCo				1;

	residualControl		:residualControl
}`;

	return mainSolver;
}

function buildResidualControl(variables) {
	let residuals = `
	{`;

	for( let variable of variables ) {
		if( variable.type != null && 
				document.getElementById(`${variable.variable}-residual-control`).value != 0 ) {
			residuals += `
		${variable.variable}		${document.getElementById(`${variable.variable}-residual-control`).value};`;
		}
	}

	residuals += `
	} `;

	return residuals;
}