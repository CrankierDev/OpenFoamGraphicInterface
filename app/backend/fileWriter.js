const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const { execSync } = require('node:child_process');

const db = require("./database.js");
const common = require("./commonFunctions.js");
const logger = require("./logger.js");

/**
 * Creates all files needed for the simulation
 */
async function createAllFiles(simInfo, data) {
	const simID = generateSimID(simInfo.simName);

	// const nu = data.constant.physicalProperties.nu;
	const velocity = Number(data['0'].U.internalField);
	const lRef = Number(data['0'].U.lRef);
	const intensity = Number(data['0'].U.intensity);
	global.turbulentVariables = internalFieldTurbulences( velocity, lRef, intensity);

	const winRoute = common.parseWindowsRoutes(simInfo.simFolderPath) + simID

	const simData = {
		name: simInfo.simName,
		route: common.parseLinuxRoutes(winRoute),
		solver: data.system.controlDict.application,
		log: 'log'
	}

	const keys = Object.keys(data);

	for( let key of keys ) { // 0, constant, system
		const object = data[`${key}`];
		
		// Specify folder path
		const filePath = path.join(winRoute, key);
		const objectKeys = Object.keys(object);

		saveData(simID, key, object);

		for( let filename of objectKeys ) {
			let text = await db.getModelFile(key, key == '0' ? 'all' : filename.substring(0,6)+'%');
			createFile (filePath, text, filename, object[`${filename}`]); 
		}
	}

	const script = await db.getModelFile('home', 'script%');
	createFile (winRoute, script, 'script.sh', simData); 

	let polyMeshRoute = `${winRoute}\\constant\\polyMesh`;

	if (!fs.existsSync(polyMeshRoute)){
		fs.mkdirSync(polyMeshRoute, { recursive: true });
	}

	execSync(`copy ${common.parseWindowsRoutes(simInfo.mesh)} ${polyMeshRoute}`);

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
 * Creates each file on the specified path with the given information
 */
function createFile (filePath, model, filename, data) {
	const dataKeys = Object.keys(data);

	dataKeys.forEach( (subKey) => {
		if( subKey === 'internalField' ) {
			if( filename === 'U' ) {
				if( data.aoa !== '0' ) {
					data.internalField = internalFieldAOA(data.internalField, data.aoa, data.liftDirection);
				} else {
					data.internalField = `(${data.internalField} 0 0)`;
				}
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
function internalFieldTurbulences(velocity, lengthRef, intensity_percent) {
	let variables = {};
	const C_mu = 0.09;
	const INTENSITY = Number(intensity_percent)/100; 

	variables.k = (1.5) * Math.pow(velocity * INTENSITY , 2);
	variables.omega = Math.pow(variables.k , 0.5) / (Math.pow(C_mu, 0.25) * lengthRef);

	variables.nuTilda = variables.nut = variables.k / variables.omega;

	variables.epsilon = (C_mu * Math.pow(variables.k, 2)) / (variables.nut) ;

	console.table(variables);

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
	  logger.info('Escribiendo datos en el fichero: ' + finalPath)
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
				lRef: object[`${filename}`].lRef,
				intensity: object[`${filename}`].intensity,
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
					} else if( solver === 'PISO' ||  solver === 'ICO' ) {
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
	
	logger.info('Datos guardados para ' + key);
}

function deleteFiles(linuxRoute) {
	try {
		logger.info('Eliminando ficheros de simulación en ' + linuxRoute);
		const winRoute = common.parseWindowsRoutes(linuxRoute);
		
		fs.rmSync(winRoute, { recursive: true });
	} catch (err) {
		logger.error('Los ficheros no existen');
	}
}

async function temporalMeshFolder(meshRoute) {
	// Setting default data for checkMesh and temporal folder where try on
	const temporalFolder = '.\\temp';
	const logName = 'log-' + uuid.v1();
	
	const meshData = {
		route: './temp',
		solver: 'checkMesh',
		log: logName
	}
	
	const controlData = {
		application: 'simpleFoam',
		startFrom: 'startTime',
		startTime: '0',
		stopAt: 'endTime',
		endTime: '100',
		deltaT: '1',
		runTimeModifiable: 'true',
		functions: ' '
	}
	
	// Checking if folders already exists and creating them
	const temporalSystem = `${temporalFolder}\\system`;
	
	if (!fs.existsSync(temporalSystem)) {
		fs.mkdirSync(temporalSystem, { recursive: true });
	}
	
	const temporalPolymesh = `${temporalFolder}\\constant\\polyMesh`;
	
	if (!fs.existsSync(temporalPolymesh)) {
		fs.mkdirSync(temporalPolymesh, { recursive: true });
	}
	
	// Getting models from db replacing data and writing files
	const controlDict = await db.getModelFile('system', 'contro%');
	const scriptCheckMesh = await db.getModelFile('home', 'script%');
	
	createFile (temporalSystem, controlDict, 'controlDict', controlData);
	createFile (temporalFolder, scriptCheckMesh, 'checkMesh.sh', meshData);
	
	// Temporal copy of polyMesh folder
	execSync(`copy ${common.parseWindowsRoutes(meshRoute)} ${temporalPolymesh}`);

	return logName;
}

module.exports = {
	createAllFiles: createAllFiles,
	writeFile: writeFile,
	deleteFiles: deleteFiles,
	temporalMeshFolder: temporalMeshFolder
}