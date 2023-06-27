const fs = require('fs');

function getMessageStack(stack) {
	const event = new Date();
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	};

	return `${event.toLocaleDateString('es-ES', options)}: ${stack}`;
}

function appendToLog(completeStack) {
	fs.appendFileSync(`.\\logs\\appLog`,
		`${completeStack} \n`,
		(err) => {
			if (err) {
				console.log(err);
			}
		}
	);
}

function info(stack) {
	const completeStack = `[INFO] ${getMessageStack(stack)}`;
	console.log(completeStack);
	appendToLog(completeStack);
}

function error(stack) {
	const completeStack = `[ERROR] ${getMessageStack(stack)}`;
	console.error(completeStack);
	appendToLog(completeStack);
}

module.exports = {
	info: info,
	error: error
}