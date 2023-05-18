function loadContent(id) {
	const sectionID = `${id}-section`;

	window.simulationType = id;
	
	showContent(sectionID);
	
	if( document.getElementById(sectionID).style.display === 'block' ){
		return;
	}
	
	const htmlRoute = `./frontend/static/pages/${id}.html`;

	$(`#${sectionID}`).load(htmlRoute);
}

function showContent(id) {
	setTimeout(() => {
		const sections = document.getElementsByClassName('hideShow');

		for (let section of sections) {
			let element = document.getElementById(section.id);
			
			if( section.id !== id ){
				if( section.id !== 'start-section' ){
					element.innerHTML = '';
				}
				
				element.style.display = 'none';
			} else {
				element.style.display = 'block';
			}
		}
		
		if( id !== 'pastSimulation-section' ) {
			document.getElementsByClassName('active-option')[0].classList.remove('active-option');
			document.getElementById(`${id.replaceAll('-section', '')}-option-aside`).classList.add('active-option');
		}
	}, 300);
}

function showStart() {
	showContent('start-section');
}