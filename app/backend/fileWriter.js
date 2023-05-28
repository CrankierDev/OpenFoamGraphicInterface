const db = require("./database.js");
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const { execSync } = require('node:child_process');

/**
 * Creates all files needed for the simulation
 */
async function createAllFiles(simInfo, data) {
	const simID = generateSimID(simInfo.simName);

	const nu = Number(data.constant.physicalProperties.nu);
	const turbulenceModel = data.constant.momentumTransport.turbulenceModel;
	global.turbulentVariables = internalFieldTurbulences( turbulenceModel, nu );

	const winRoute = parseWindowsRoutes(simInfo.simFolderPath) + '\\' + simID

	const simData = {
		name: simInfo.simName,
		route: parseLinuxRoutes(winRoute),
		solver: data.system.controlDict.application
	}

	const keys = Object.keys(data);

	for( let key of keys ) { // 0, constant, system
		const object = data[`${key}`];
		
		// Specify folder path
		const filePath = path.join(winRoute, key);
		const objectKeys = Object.keys(object);

		saveData(simID, key, object);

		for( let filename of objectKeys ) {
			let text = await db.getModelFile(key, key == '0' ? 'all' : filename);
			createFile (filePath, text, filename, object[`${filename}`]); 
		}
	}

	const script = await db.getModelFile('home', 'script');
	createFile (winRoute, script, 'script.sh', simData); 

	let polyMeshRoute = `${winRoute}\\constant\\polyMesh`;

	if (!fs.existsSync(polyMeshRoute)){
		fs.mkdirSync(polyMeshRoute, { recursive: true });
	}

	execSync(`copy ${parseWindowsRoutes(simInfo.mesh)} ${polyMeshRoute}`);

	db.saveSimulationInfo(simID, simData);

	simInfo.boundariesData.forEach( (boundary) => {
		db.saveSimulationBoundariesData(simID, boundary);
	});

	return simID;
}

/**
 * Generates a simulation ID with the name and a timestamp
 */
function generateSimID(simName){
	const normalizedSimName = simName.normalize("NFKD")
								.replaceAll(/[\u0300-\u036f]/g, "")
								.replaceAll(' ', '');

	return normalizedSimName.substr(0,10) + '-' + uuid.v1();
}

/**
 * Generates a simulation route for Linux's terminal processes
 */
function parseLinuxRoutes(winRoute){
	let splittedWinRoute = winRoute.split(':');

	if( splittedWinRoute.length > 1 ) {
		return `/mnt/${splittedWinRoute[0].toLowerCase()}${splittedWinRoute[1].replaceAll('\\','/')}`;
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
			winRoute += `${splittedLinRoute[i]}\\\\`;
		}
		
		return winRoute;
	} else {
		return linuxRoute;
	}
}

/**
 * Creates each file on the specified path with the given information
 */
function createFile (filePath, model, filename, data) {
	const dataKeys = Object.keys(data);

	dataKeys.forEach( (subKey) => {
		if( subKey === 'internalField' ) {
			if( filename === 'U' && data.aoa !== '0' ) {
				data.internalField = internalFieldAOA(data.internalField, data.aoa, data.liftDirection);
			
			} else if( data.internalField === 'calculate' ) {
				data.internalField = turbulentVariables[`${filename}`];
			} 
		}	
		
		model = model.replaceAll(`:${subKey}`, data[`${subKey}`]);
	});


	writeFile(filePath, filename, model);
}

/**
 * Builds internal field with
 */
function internalFieldAOA(value, aoa, liftDirection) {
	const rads = degToRadians(aoa);

	if( liftDirection == 'Y' ) return `(${value*Math.cos(rads)} ${value*Math.sin(rads)} 0)`;
	else if( liftDirection == 'Z' ) return `(${value*Math.cos(rads)} 0 ${value*Math.sin(rads)})`;
}

/**
 * Math function to transform deg to radians
 */
function degToRadians(aoa) {
	const rule = Math.PI / 180;
	return aoa*rule;
}

/**
 * Builds internal field with
 */
function internalFieldTurbulences(model, nu) {
	let variables = {};

	if( model === 'SpalartAllmaras' ) {
		variables.nuTilda = 5*nu;
		const fv1 = Math.pow(5, 3) / ( Math.pow(5, 3) + Math.pow(7.1, 3) );
		variables.nut = fv1 * 5 * nu;

	} else if( model === 'KOmegaSST' ) {

	} else if( model === 'KEpsilon' ) {

	}

	return variables;
}

/**
 * Write a given text into a file and creates directiory (recursively) if needed
 */
function writeFile(filePath, filename, text) {
	// Create directories if it does not exist
	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(filePath, { recursive: true });
	}

	// Specify file path
	const finalPath = path.join(filePath, filename);

	// Write text to file
	fs.writeFile(finalPath, text, (err) => {
	  if (err) throw err;
	  console.log('Data written to file', finalPath);
	});
}

/**
 * Saves given data into database
 */
function saveData(simID, key, object) {
	if( key == '0') {
		const objectKeys = Object.keys(object);

		for( let filename of objectKeys ) {
			const data = {
				variable: filename,
				value: object[`${filename}`].internalField,
				AOAValue: object[`${filename}`].aoa,
				boundaries: object[`${filename}`].boundaryField
			}

			db.saveZeroData(simID, data);
		}

	} else if( key == 'constant') {
		const data = {
			viscosityModel: object.physicalProperties.viscosityModel,
			rho: object.physicalProperties.rho,
			nu: object.physicalProperties.nu,
			turbulenceModel: object.momentumTransport.turbulenceModel,
			printCoeffs: object.momentumTransport.printCoeffs == 'on' ? true : false
		}

		db.saveConstantData(simID, data);

	} else if( key == 'system' ) {
		const objectKeys = Object.keys(object);

		for( let filename of objectKeys ) {
			let data = {}

			if( filename === 'forces' ) continue;

			const dataKeys = Object.keys(object[`${filename}`]);

			dataKeys.forEach( (subKey) => {
				if( subKey !== 'mainSolver' && subKey !== 'solverBody' ) {
					data[`${subKey}`] = object[`${filename}`][`${subKey}`];
				} else {
					solver = object[`${filename}`][`${subKey}`];

					if( solver === 'SIMPLE' ) {
						data['simple'] = object[`${filename}`]['solverBody'];
						data['pimple'] = null;
						data['piso'] = null;
					} else if( solver === 'PIMPLE' ) {
						data['pimple'] = object[`${filename}`]['solverBody'];
						data['simple'] = null;
						data['piso'] = null;
					} else if( solver === 'PISO' ) {
						data['piso'] = object[`${filename}`]['solverBody'];
						data['pimple'] = null;
						data['simple'] = null;
					}
				}
			});

			if( filename === 'controlDict' ) {
				data.adjustTimeStep = data.adjustTimeStep === 'yes' ?
										true : false;
				data.runTimeModifiable = data.runTimeModifiable === 'true' ?
										true : false;

				db.saveControlDictData(simID, data);

			} else if( filename === 'fvSchemes' ) {
				db.saveSchemesData(simID, data);

			} else if( filename === 'fvSolution' ) {
				db.saveSolutionsData(simID, data);

			} else if( filename === 'forceCoeffs' && data != {} ){
				data.forceCoeffs = true;
				db.saveForcesData(simID, data);
			}
		}
	}
	
	console.log('Data saved for ', key);
}

function deleteFiles(linuxRoute) {
	console.log('Deleting simulation files at', linuxRoute);

	const winRoute = parseWindowsRoutes(linuxRoute);
	console.log('Deleting simulation files at', winRoute);

	fs.rm(winRoute, { recursive: true }, (err) => {
		console.log(err);
	});
}

module.exports = {
	createAllFiles: createAllFiles,
	deleteFiles: deleteFiles
}