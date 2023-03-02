function loadContent(id) {
	const sectionID = `${id}-section`;
	
	if( document.getElementById(sectionID).style.display === 'block' ){
		return;
	}
	
	const htmlRoute = `./frontend/static/pages/${id}.html`;

	$(`#${sectionID}`).load(htmlRoute);
	showContent(sectionID)
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
	}, 300);
}

function showStart() {
	showContent('start-section');
}