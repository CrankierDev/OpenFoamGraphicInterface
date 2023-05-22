const db = require("./database.js");
const fs = require('fs');
const path = require('path');
const uuid = require('uuid')

/**
 * Creates all files needed for the simulation
 */
async function createAllFiles(simInfo, data) {
	const keys = Object.keys(data);

	const simID = generateSimID(simInfo.simName);

	const simData = {
		name: simInfo.simName,
		mesh: simInfo.mesh
	}

	db.saveSimulationInfo(simID, simData);

	simInfo.boundariesData.forEach( (boundary) => {
		db.saveSimulationBoundariesData(simID, boundary);
	});

	for( let key of keys ) { // 0, constant, system
		const object = data[`${key}`];
		
		// Specify folder path
		const filePath = path.join(simInfo.simFolderPath, key);
		const objectKeys = Object.keys(object);

		saveData(simID, key, object);

		for( let filename of objectKeys ) {
			let text = await db.getModelFile(key, key == '0' ? 'all' : filename);
			createFile (filePath, text, filename, object[`${filename}`]);
		}
	}
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
			transportModel: object.transportProperties.transportModel,
			rho: object.transportProperties.rho,
			nu: object.transportProperties.nu,
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

/**
 * Creates each file on the specified path with the given information
 */
function createFile (filePath, model, filename, data) {
	const dataKeys = Object.keys(data);

	dataKeys.forEach( (subKey) => {
		// TODO: manage internalField and AOA
		model = model.replaceAll(`:${subKey}`, data[`${subKey}`]);
	});

	writeFile(filePath, filename, model);
}

/**
 * Write a given text into a file and creates directiory (recursively) if needed
 */
function writeFile(filePath, filename, text) {
	// Create directories if it does not exist
	if (!fs.existsSync(filePath)){
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

module.exports = {
	createAllFiles: createAllFiles
}