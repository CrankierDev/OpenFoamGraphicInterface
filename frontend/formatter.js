function fillFormsData() {
    const boundaries = [
        {
            name: 'inlet',
            type:'patch'
        },
        {
            name: 'outlet',
            type:'patch'
        },
        {
            name: 'upperWall',
            type:'wall'
        },
        {
            name: 'lowerWall',
            type:'wall'
        },
        {
            name: 'frontAndBack',
            type:'empty'
        }
    ]

    console.log(boundaries);

    for (boundary of boundaries) {
        // First looks for the existence of the element to add
        if(!document.getElementById(`${boundary.name}-data`)){
            if( boundary.type === 'patch' ) {
                document.getElementById('boundary-conditions').innerHTML += 
                    `<div id="${boundary.name}-data" class="walls-zero">
                        <p class="input-title">${capitalize(boundary.name)}</p>
                        <div class="data-container">
                            <div class="input-data">
                                <label for="inlet-type">Condición</label>
                                <select id="inlet-type" >
                                    <option>Valor fijo</option>
                                    <option>Gradiente nulo</option>
                                    <option>No-deslizamiento</option>
                                    <option>Vacío</option>
                                </select>
                            </div>
                        </div>
                    </div>`;
            } else if( boundary.type === 'wall' ) {
                document.getElementById('boundary-conditions').innerHTML += 
                    `<div id="${boundary.name}-data" class="walls-zero">
                        <p class="input-title">${capitalize(boundary.name)}</p>
                        <div class="data-container">
                            <div class="input-data">
                                <label for="inlet-type">Condición</label>
                                <select id="inlet-type" >
                                    <option>Valor fijo</option>
                                    <option>Gradiente nulo</option>
                                    <option>No-deslizamiento</option>
                                    <option>Vacío</option>
                                </select>
                            </div>
                            <br>
                            <div class="input-data">
                                <label for="inlet-type">Funciones de pared</label>
                                <select id="inlet-type" >
                                    <option>Valor fijo</option>
                                    <option>Gradiente nulo</option>
                                </select>
                            </div>
                        </div>
                    </div>`;
            } else if( boundary.type === 'empty' ) {
                // document.getElementById('boundary-conditions').innerHTML += 
                //     `<div id="${boundary.name}-data" class="walls-zero">
                //         <p class="input-title">${capitalize(boundary.name)}</p>
                //         <div class="data-container">
                //             <div class="input-data">
                //                 <label for="inlet-type">Tipo</label>
                //                 <select id="inlet-type" >
                //                     <option>Valor fijo</option>
                //                     <option>Gradiente nulo</option>
                //                     <option>No-deslizamiento</option>
                //                     <option>Vacío</option>
                //                 </select>
                //             </div>
                //         </div>
                //     </div>`;
            }
        }
    }
}

function startTime(value) {
    console.log('on change is working!', value);
}

function endTime(value) {
    console.log('on change is working!', value);
}

function forces() {
    const forces = document.getElementById("forces-data").checked;
    const coeffs = document.getElementById("forcesCoeffs-data").checked;
    const inputsOn = document.getElementById("forces-inputs");

    if ((forces || coeffs) && inputsOn.innerHTML == '') {
        inputsOn.innerHTML += 
            `<p class="input-title">Datos para el cálculo de fuerzas</p>
            <div class="data-container">
                <div class="input-data">
                    <label for="rhoInf-data">Densidad aguas arriba</label>
                    <input type="text" id="rhoInf-data"/>
                </div>
                <br>
                <p>Centro de rotación</p>
                <div class="input-data">
                    <div>
                        <label for="CofRX-data">Eje X</label>
                        <input type="text" id="CofRX-data"/>
                        <label for="CofRY-data">Eje Y</label>
                        <input type="text" id="CofRY-data"/>
                        <label for="CofRZ-data">Eje Z</label>
                        <input type="text" id="CofRZ-data"/>
                    </div>
                </div>
            </div>`;
    } 

    if (!forces && !coeffs) {
        inputsOn.innerHTML = '';
    }
}