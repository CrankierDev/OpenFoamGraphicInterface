const lineReader = require('line-reader');
const { plot } = require('nodeplotlib');

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
	plotter: plotter
}