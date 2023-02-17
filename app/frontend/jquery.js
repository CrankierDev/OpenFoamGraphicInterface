function loadStart() {
	document.getElementById('content-section').style.display = 'none';
	document.getElementById('start-section').style.display = 'block';
}

function loadAdvancedSimulation() {
	document.getElementById('start-section').style.display = 'none';
	$('#content-section').load("./frontend/static/pages/advancedSimulation.html");
	document.getElementById('content-section').style.display = 'block';
}

function loadSimpleSimulation() {
	document.getElementById('start-section').style.display = 'none';
	$('#content-section').load("./frontend/static/pages/simpleSimulation.html");
	document.getElementById('content-section').style.display = 'block';
}

function loadPostProcess() {
	document.getElementById('start-section').style.display = 'none';
	$('#content-section').load("./frontend/static/pages/postprocess.html");
	document.getElementById('content-section').style.display = 'block';
}