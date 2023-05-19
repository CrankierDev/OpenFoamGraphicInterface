const db = require("./database.js");
const fs = require('fs');
const path = require('path');

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

/**
 * Creates all files needed for the simulation
 */
async function createAllFiles(simFolderPath, data) {
	const keys = Object.keys(data);

	for( let key of keys ) {
		const object = data[`${key}`];
		
		// Specify folder path
		const filePath = path.join(simFolderPath, key);
		
		const objectKeys = Object.keys(object);

		for( let filename of objectKeys ) {
			let text = await db.getModelFile(key, key == '0' ? 'all' : filename);

			createFile (filePath, text, filename, object[`${filename}`]);
		}
	}
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

module.exports = {
	createAllFiles: createAllFiles
}