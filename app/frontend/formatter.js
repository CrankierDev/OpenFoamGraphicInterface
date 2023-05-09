/**
 * Updates copyright year and fills with it on footer
 */
function getFooter() {
	const currentYear = new Date().getFullYear();
	let footer = document.getElementById('footer');
	footer.innerHTML = `&copy; Copyright ${currentYear}, <a href="https://www.uca.es/" target="blank">Universidad de Cádiz</a>`;
}

/**
 * Looks for past simulations on DB and fills the initial page with this data tabulated 
 */
async function setLastSimulationsTable() {
    // Looks for past simulations on DB
    let info = await getAllSimulationsInfo();

    // Checks how many simulations there are
    // TODO: increase this 0 to 1 in order to not show 'default' simulation
    if( info[0].length === 0 ){
        return ;
    }
    
    // TODO: not to show table if there is only 'default' simulation on the DB.

    // Writes the table with the DB data from past simulations
    let table = document.getElementById('last-simulations-table');
    const tblBody = document.createElement("tbody");
    let tblHeader = document.createElement("tr");
    tblHeader.innerHTML = `
        <th>Nombre</th>
        <th>Fecha de creación</th>
        <th>Ruta de la simulación</th>
        <th>Último trabajo</th>`;

    tblBody.appendChild(tblHeader);
    
    for( row of info ) {
        const newRow = document.createElement("tr");
        newRow.innerHTML += `
            <td onclick="loadSimulationData('${row.id}')"
                class="clickable-td">
                ${row.name}
            </td>
            <td>${row.creationDate}</td>
            <td>${row.simulationRoute}</td>
            <td>${row.lastGenerationDate}</td>`;
        
        tblBody.appendChild(newRow);
    }
    
    table.appendChild(tblBody);

    // Sets visibility on to the table
    document.getElementById('table-title').style.display = 'block';
    table.style.display = 'table';
    
}

/**
 * Fills basic flux data from DB
 */
async function setFluxDefaultData(simulation) {
    // TODO: add flux data from zero_data table and fill form

    // Gets flux data from DB
    let constantData = await getConstantData(simulation);

    document.getElementById('flux-density').value = constantData.rho;
    document.getElementById('flux-viscosity').value = constantData.nu;
}

/**
 * Fills control dict and forces data from DB
 */
async function setControlDictDefaultData(simulation) {
    // Gets control dict data from DB
    let controlDictData = await getControlDictData(simulation);
    
    // Fill inputs with default data
    document.getElementById('simulation-begin').value = controlDictData.startFrom;
    document.getElementById('simulation-begin-time').value = controlDictData.startTime;
    document.getElementById('simulation-end').value = controlDictData.stopAt;
    document.getElementById('simulation-end-time').value = controlDictData.endTime;
    document.getElementById('simulation-deltat').value = controlDictData.deltaT;

    // Check boxes with default data
    document.getElementById('deltat-adjust').checked
        = controlDictData.adjustTimeStep === 1 ? true : false;
    document.getElementById('save-data').checked
        = controlDictData.writeData === 1 ? true : false;
    document.getElementById('run-time-modifiable').checked
        = controlDictData.runTimeModifiable === 1 ? true : false;

    // Gets forces data from DB
    let forcesData = await getForcesData(simulation);

    // If there is data we fill the form
    if( forcesData !== null && forcesData !== [] ){
        document.getElementById('forces-data').checked = true;
        document.getElementById('forcesCoeffs-data').checked 
            = forcesData.forceCoeffs === 1 ? true : false;

        // Calls the format function that prints values if forces or forcesCoeffs-data is checked
        if( fillFormsForcesFields() ){
            // Fill inputs with default data
            setCofR(forcesData.cofR);
            document.getElementById('rhoInf-data').value = forcesData.rhoInf;
            
            if(forcesData.forceCoeffs === 1){
                document.getElementById('magUInf-data').value = forcesData.magUInf;
                document.getElementById('lRef-data').value = forcesData.lRef;
                document.getElementById('aRef-data').value = forcesData.aRef;
                    
                setVectorDirection(forcesData.liftDir, 'lift');
                setVectorDirection(forcesData.dragDir, 'drag');
                setVectorDirection(forcesData.pitchAxis, 'pitch');
            }
        }
    }
}

/**
 * This method fills the vector directions data with vector parameter.
 * optionName parameter has to be given in order to select wich field 
 * is going to be filled with the data
 */
function setVectorDirection(vector, optionName) {
    // First we check if the vector is one of the axis
    if( vector === '(1 0 0)'){
        document.getElementById(`${optionName}-option`).value = 'X';

    } else if( vector === '(0 1 0)') {
        document.getElementById(`${optionName}-option`).value = 'Y';

    } else if( vector === '(0 0 1)') {
        document.getElementById(`${optionName}-option`).value = 'Z';

    } else {
        // If the vector is not anyone of the axis, we build an unitary 
        // array with the vector cartesian components and fill the form
        document.getElementById(`${optionName}-option`).value = 'unitVector';
        fillFormsvectorDirections(optionName, 'unitVector');

        let vectorSplit = parseVector(vector);
        document.getElementById(`${optionName}X-data`).value = vectorSplit[0];
        document.getElementById(`${optionName}Y-data`).value = vectorSplit[1];
        document.getElementById(`${optionName}Z-data`).value = vectorSplit[2];
    }
}

/**
 * This method fills the center of rotation data with vector parameter 
 */
function setCofR(vector) {
    let vectorSplit = parseVector(vector);

    document.getElementById(`CofRX-data`).value = vectorSplit[0];
    document.getElementById(`CofRY-data`).value = vectorSplit[1];
    document.getElementById(`CofRZ-data`).value = vectorSplit[2];

}

/**
 * Fills forms with the basic inputs for every simulation and fills those inputs with default data.
 * Boundaries data is obtained by the given mesh. Turbulence model is selected by the 
 * user at the form
 */
async function fillFormsBasicFields(boundariesData, turbulenceModel) {
    await fillFormsBasicFieldsSim(boundariesData, turbulenceModel, 'default_sim');
}

/**
 * Fills forms with the basic inputs for every simulation and fills those inputs with data
 * from a given simulation.
 * Boundaries data is obtained by the given mesh. Turbulence model is selected by the 
 * user at the form
 */
async function fillFormsBasicFieldsSim(boundariesData, turbulenceModel, simulationID) {
    // Initialize the array with two variables that will ever be in a simulation
    let variables = [
        {
            name: 'presión',
            variable: 'p',
            type: 'asymmetric',
            schemes: 'grad',
            wallFunction: 0
        },
        {
            name: 'velocidad',
            variable: 'U',
            type: 'symmetric',
            schemes: "'grad','div'",
            wallFunction: 0
        }
    ];

    /* If a turbulence model has been selected by the user, it looks for the model on DB 
    and add to the array the variables this model needs to work properly */ 
    if (turbulenceModel !== 'default') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel);

        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
    } 

    // Use the variables array to format the form and add the necessary fields to the form
    fillFormsBoundariesFields(boundariesData, variables);
    fillFormsSchemesFields(variables, simulationID);

    await setFluxDefaultData(simulationID);
    await setControlDictDefaultData(simulationID)
}

/**
 * Fills schemes form with the necessary inputs for the variables list
 */
async function fillFormsSchemesFields(variables, simulationID) {
    // Checks if the fvSchemes is on the forms, it will not appear on simple simulation
    let variablesInputs = document.getElementById("fvSchemes-variables-inputs");
    if(variablesInputs == null) return;

    // Cleans HTML from the fields in order to avoid duplicated fields
    if (variablesInputs.innerHTML != '') variablesInputs.innerHTML = '';

    for ( let variable of variables ) {
        let schemes = variable.schemes != null ? variable.schemes.split(',') : null;
        if(schemes != null && schemes.length > 0) {
            let newHTML = `
                <div class="card-title">
                    <p class="input-label">Esquemas para ${variable.name.toLowerCase()}</p>
                </div>
                <div class="data-container">`;
            
            if ( variable.schemes.indexOf('grad') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <p class="schemes-title">Esquema para los gradientes</p>
                    </div>
                    <div class="schemes-data">
                        <div class="subinput-data">
                            <label for="${variable.variable}-grad-limiter">Límites</label>
                            <select id="${variable.variable}-grad-limiter"> 
                                <option value="default">Sin limitar</option>
                                <option value="cellLimited">Limitado en las celdas</option>
                                <option value="cellMDLimited">Limitado multidireccional en las celdas</option>
                                <option value="faceLimited">Limitado en las caras</option>
                                <option value="faceMDLimited">Limitado multidireccional en las caras</option>
                            </select>
                        </div>
                        <div class="subinput-data">
                            <label for="${variable.variable}-grad-schema">Esquema</label>
                            <select id="${variable.variable}-grad-schema"> 
                                <option value="Gauss">Gauss</option>
                                <option value="leastSquares">Mínimos cuadrados</option>
                            </select>
                        </div>
                        <div class="subinput-data">
                            <label for="${variable.variable}-grad-interpolation">Interpolación</label>
                            <select id="${variable.variable}-grad-interpolation"> 
                                <option value="linear">Lineal</option>
                                <option value="pointLinear">Lineal basado en los puntos</option>
                                <option value="leastSquares">Mínimos cuadrados</option>
                            </select>
                        </div>
                        <div class="subinput-data">
                            <label for="${variable.variable}-grad-coeff">Coeficiente</label>
                            <input id="${variable.variable}-grad-coeff"> 
                        </div>
                    </div>
                    `;
            }
                
            if ( variable.schemes.indexOf('div') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <p class="schemes-title">Esquema para las divergencias</p>
                    </div>
                    <div class="schemes-data">
                        <div class="subinput-data">
                            <label for="${variable.variable}-div-limiter">Delimitación</label>
                            <select id="${variable.variable}-div-limiter"> 
                                <option value="default">Sin delimitar</option>
                                <option value="bounded">Delimitado</option>
                            </select>
                        </div>
                        <div class="subinput-data">
                            <label for="${variable.variable}-div-interpolation">Interpolación</label>
                            <select id="${variable.variable}-div-interpolation"> 
                                <option value="linear">Lineal</option>
                                <option value="limitedLinear">Lineal limitado</option>
                                <option value="linearUpwind">Lineal aguas arriba</option>
                            </select>
                        </div>
                    </div>
                    `;
                        // <div class="subinput-data">
                        //     <label for="${variable.variable}-div-coeff">Coeficiente</label>
                        //     <input id="${variable.variable}-div-coeff"> 
                        // </div>
                    }
            
            if ( variable.schemes.indexOf('lap') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-laplacian-snGrad">Esquema para los laplacianos</label>
                        <select id="${variable.variable}-laplacian-snGrad">
                            <option value="default">Predeterminado</option>
                            <option value="corrected">Corregido</option>
                            <option value="orthogonal">Ortogonal</option>
                        </select>
                    </div>
                    `;
            }
            
            if ( variable.schemes.indexOf('interp') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-interpolation-schema">Esquema de interpolación</label>
                        <select id="${variable.variable}-interpolation-schema">
                            <option value="default">Predeterminado</option>
                            <option value="linear">Lineal</option>
                            <option value="pointLinear">Lineal en un punto</option>
                        </select>
                    </div>
                    `;
            }
            
            if ( variable.schemes.indexOf('secondGrad') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-snGrad-schema">Gradientes normales a la superficie</label>
                        <select id="${variable.variable}-snGrad-schema"> 
                            <option value="default">Predeterminado</option>
                            <option value="corrected">Corregido</option>
                            <option value="orthogonal">Ortogonal</option>
                        </select>
                    </div>
                    `;
            }
            
            if ( variable.schemes.indexOf('wall') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-wall-schema">Distribución de pared</label>
                        <select id="${variable.variable}-wall-schema">
                            <option value="default">Predeterminado</option>
                            <option value="meshWave">MeshWave</option>
                            <option value="cubic">Cubic</option>
                        </select>
                    </div>`;
            }
            
            newHTML += '</div>';

            variablesInputs.innerHTML += newHTML;
        }
    }

    // Once we have the fields, we'll fill them with simulation data
    await setSchemesDefaultData(simulationID, variables);
}


/**
 * Fills form with schemes data from DB
 */
async function setSchemesDefaultData(simulationID, variables) {
    // Gets schemes data from DB
    let schemesData = await getSchemasData(simulationID);

    // Fill inputs with default data
    // Here predeteminated schemes are set
    document.getElementById('temporal-schema').value = schemesData.ddtSchemes.default;
    setGradValues('default', schemesData.gradSchemes.default);
    
    if(schemesData.divSchemes.default !== 'none') {
        setDivValues('default', schemesData.divSchemes.default);
    }
    
    document.getElementById('default-laplacian').value =
            schemesData.laplacianSchemes.default.split(' ')[2];
    document.getElementById('default-interpolation-schema').value =
            schemesData.interpolationSchemes.default;
    document.getElementById('default-snGrad-schema').value =
            schemesData.snGradSchemes.default;
    document.getElementById('default-wall-schema').value =
            schemesData.wallDist.method;

    for ( let variableData of variables ) {
        // let schemes = variable.schemes != null ? variable.schemes.split(',') : null;
        if(variableData.schemes != null && variableData.schemes.length > 0) {       
            const variable = variableData.variable;

            if( variable == null ) {
                continue;
            }

            if ( variableData.schemes.indexOf('grad') != -1 ) {
                setGradValues(variable, schemesData.gradSchemes[`${variable}`]);
            }
            
            if ( variableData.schemes.indexOf('div') != -1 ) {
                setDivValues(variable, schemesData.divSchemes[`div(phi,${variable.trim()})`]);
            }
            
            // DUDA - QUITAR?
            // if ( variableData.schemes.indexOf('lap') != -1 ) {
            //     document.getElementById(`${variable}-laplacian-schema`).value = 
            //         schemesData.laplacianSchemes[`${variable}`] != null ? 
            //         schemesData.laplacianSchemes[`${variable}`] : 'default';
            // }
            
            // if ( variableData.schemes.indexOf('interp') != -1 ) {
            //     document.getElementById(`${variable}-interpolation-schema`).value = 
            //         schemesData.interpolationSchemes[`${variable}`] != null ? 
            //         schemesData.interpolationSchemes[`${variable}`] : 'default';
            // }
            
            // if ( variableData.schemes.indexOf('secondGrad') != -1 ) {
            //     document.getElementById(`${variable}-secondGrad-schema`).value = 
            //         schemesData.snGradSchemes[`${variable}`] != null ? 
            //         schemesData.snGradSchemes[`${variable}`] : 'default';
            // }            
        }
    }
}

/**
 * Fills gradient data of a variable with scheme data splitted by fields
 */
function setGradValues(variable, scheme) {
    if ( scheme == null ) return;

    let schemeSplit = scheme.split(' ');

    if (schemeSplit.length === 4) {
        document.getElementById(`${variable}-grad-limiter`).value = schemeSplit[0];
        document.getElementById(`${variable}-grad-schema`).value = schemeSplit[1];
        document.getElementById(`${variable}-grad-interpolation`).value = schemeSplit[2];
        document.getElementById(`${variable}-grad-coefficent`).value = schemeSplit[3];
    } else if (schemeSplit.length === 2) {
        document.getElementById(`${variable}-grad-schema`).value = schemeSplit[0];
        document.getElementById(`${variable}-grad-interpolation`).value = schemeSplit[1];
    } else if (schemeSplit.length === 1) {
        document.getElementById(`${variable}-grad-schema`).value = schemeSplit[0];
    }
}
// TODO: onchange method to deploy coefficent input?

/**
 * Fills divergency data of a variable with scheme data splitted by fields
 */
function setDivValues(variable, scheme) {
    if ( scheme == null ) return;

    let schemeSplit = scheme.split(' ');

    if (schemeSplit.length === 4) {
        document.getElementById(`${variable}-div-limiter`).value = schemeSplit[0];
        document.getElementById(`${variable}-div-interpolation`).value = schemeSplit[2];
        // document.getElementById(`${variable}-div-coeff`).value = schemeSplit[3];
    } else if (schemeSplit.length === 3) {
        document.getElementById(`${variable}-div-interpolation`).value = schemeSplit[1];
    }
}

/**
 * Fills the form with the necessary inputs to manage the conditions of the variables
 * on the variables list on each mesh boundary 
 */
function fillFormsBoundariesFields(boundariesData, variables) {
    if(boundariesData){
        const boundaryConditions = document.getElementById('boundary-conditions');
        boundaryConditions.innerHTML = 
            '<h2 class="input-label">Condiciones de contorno</h2>';

        for (boundary of boundariesData) {
            if(!document.getElementById(`${boundary.name}-data`)){
                // Checks the type of the boundary to apply the correct inputs    
                if( boundary.type === 'patch' ) {
                    let newText = `
                        <section id="${boundary.name}-data" class="walls-zero">
                            <div class="card-title">
                                <p class="input-label">${capitalize(boundary.name)} - Tipo ${boundary.type}</p>
                                <span class="material-symbols-rounded" onclick="showInfo('${boundary.name}-data-${boundary.type}-type')">info</span>
                            </div>
                            <section class="data-container">
                                <div id="${boundary.name}-data-${boundary.type}-type-info" class="info-div info-div-border" style="display: none;"></div>
                        `;   

                        for(let variable of variables){
                            newText += `
                                <div class="input-data">
                                    <label for="${variable.variable}-data-${boundary.name}-type">Condición para ${variable.name}</label>
                                    <select id="${variable.variable}-data-${boundary.name}-type" >
                                    `;

                            if (variable.variable === 'p') {
                                newText += `
                                        <option value='freestreamPressure'>Valor libre de presión</option>`;
                            } else if (variable.variable === 'U') {
                                newText += `
                                        <option value='freestreamVelocity'>Valor libre de velocidad</option>`;
                            } else {
                                newText += `
                                        <option value='freestream'>Valor libre</option>`;
                            }

                            newText += `
                                        <option value='fixedValue'>Valor fijo</option>
                                        <option value='empty'>Vacío</option>
                                    </select>
                                </div>`;
                        }
                        
                        newText += `</section>
                                </section>`;

                    boundaryConditions.innerHTML += newText;

                } else if( boundary.type === 'wall' ) {
                    let newText =`
                        <section id="${boundary.name}-data" class="walls-zero">
                            <div class="card-title">
                                <p class="input-label">${capitalize(boundary.name)} - Tipo ${boundary.type}</p>
                                <span class="material-symbols-rounded" onclick="showInfo('${boundary.name}-data-${boundary.type}-type')">info</span>
                            </div>
                            <section class="data-container">
                                <div id="${boundary.name}-data-${boundary.type}-type-info" class="info-div info-div-border" style="display: none;"></div>
                        `;
                            
                            for(let variable of variables){
                                newText += `
                                    <div class="input-data">
                                        <label for="${variable.variable}-data-${boundary.name}-type">Condición para ${variable.name}</label>
                                        <select id="${variable.variable}-data-${boundary.name}-type" >
                                            <option value='fixedValue'>Valor fijo</option>
                                            <option value='zeroGradient'>Gradiente nulo</option>
                                            <option value='noSlip'>No-deslizamiento</option>
                                            <option value='empty'>Vacío</option>
                                        </select>
                                    </div>
                                    `;

                                if(variable.wallFunction == 1){
                                    newText += `
                                        <div class="input-data">
                                            <label for="${boundary.name}-wall">Funciones de pared para ${variable.name}</label>
                                            <select id="${boundary.name}-wall" >
                                                <option value='1'>Sí</option>
                                                <option value='0'>No</option>
                                            </select>
                                        </div>
                                        `;
                                }
                            }
                            
                            newText += `</section>
                                    </section>`;
                    boundaryConditions.innerHTML += newText;
                }
            }
        }
        // FIX-ME: view boundaries and work with it
        document.getElementById('p-data-walls-type').value = 'zeroGradient';
        document.getElementById('U-data-walls-type').value = 'noSlip';
    }
}

/**
 * Makes appear/desappear 'simulation-begin-time' input for start time
 */
function startTime(value) {
    // TODO: finish the method
    console.log('on change is working!', value);
}

/**
 * Makes appear/desappear 'simulation-end-time' input for start time
 */
function endTime(value) {
    // TODO: finish the method
    console.log('on change is working!', value);
}

/**
 * Assures that if the user selects 'icoFoam' solver the turbulence model will ever be default/laminar
 */
function solverChanges(value) {
    let selector = document.getElementById('turbulence-model');

    if(value === 'ico') {
        selector.disabled = true;
        selector.value = 'default';

    } else {
        selector.disabled = false;
    }
}

/**
 * Checks if its necessary and fills the form with the inputs for forces and/or forceCoeffs
 */
function fillFormsForcesFields() {
    const forces = document.getElementById("forces-data").checked;
    const coeffs = document.getElementById("forcesCoeffs-data").checked;
    let inputsOn = document.getElementById("forces-inputs");

    if ((forces || coeffs) && inputsOn.innerHTML == '') {
        inputsOn.innerHTML += 
            `<h3 class="card-title">Datos para el cálculo de fuerzas</h3>
            <div class="data-container">
                <div class="input-data">
                    <p>Centro de rotación (m)</p>
                    <span class="material-symbols-rounded" onclick="showInfo('CofR')">info</span>
                </div>
                <div id="CofR-info" class="info-div info-div-border" style="display: none;"></div>
                <div class="axis-data">
                    <div>
                        <label for="CofRX-data" class="axis-label">Eje X</label>
                        <input class="axis-input" type="text" id="CofRX-data"/>
                    </div>
                    <div>
                        <label for="CofRY-data" class="axis-label">Eje Y</label>
                        <input class="axis-input" type="text" id="CofRY-data"/>
                    </div>
                    <div>
                        <label for="CofRZ-data" class="axis-label">Eje Z</label>
                        <input class="axis-input" type="text" id="CofRZ-data"/>
                    </div>
                </div>
                <div class="input-data">
                    <label for="rhoInf-data" class="long-label">Densidad aguas arriba</label>
                    <div>
                        <input class="short-input" type="text" id="rhoInf-data"/>
                        <span class="material-symbols-rounded" onclick="showInfo('rhoInf-data')">info</span>
                    </div>
                </div>
                <div id="rhoInf-data-info" class="info-div info-div-border" style="display: none;"></div>
                <div id="forces-extra-inputs"></div>
            </div>`;

    } else if (forces || coeffs) {
        inputsOn.style.display = 'block';
    }

    let extraInputs = document.getElementById("forces-extra-inputs");

    if (coeffs && extraInputs.innerHTML == '') { 
        extraInputs.innerHTML +=
            `<div class="input-data">
                <label for="lift-option" class="long-label">Direccion vector unitario de sustentación</label>
                <div>
                    <select id="lift-option" class="short-selector" onchange="fillFormsvectorDirections('lift', value)">
                        <option value="X">Eje X</option>
                        <option value="Y">Eje Y</option>
                        <option value="Z">Eje Z</option>
                        <option value="unitVector">Definir vector</option>
                    </select>
                    <span class="material-symbols-rounded" onclick="showInfo('lift-option')">info</span>
                </div>
            </div>
            <div id="lift-option-info" class="info-div info-div-border" style="display: none;"></div>
            <div id="lift-vector" class="axis-data"></div>
            <div class="input-data">
                <label for="drag-option" class="long-label">Direccion vector unitario de resistencia aerodinámica</label>
                <div>
                    <select id="drag-option" class="short-selector" onchange="fillFormsvectorDirections('drag', value)">
                        <option value="X">Eje X</option>
                        <option value="Y">Eje Y</option>
                        <option value="Z">Eje Z</option>
                        <option value="unitVector">Definir vector</option>
                    </select>
                    <span class="material-symbols-rounded" onclick="showInfo('drag-option')">info</span>
                </div>
            </div>
            <div id="drag-option-info" class="info-div info-div-border" style="display: none;"></div>
            <div id="drag-vector" class="axis-data"></div>
            <div class="input-data">
                <label for="pitch-option" class="long-label" for="pitch-option">Direccion vector unitario de eje de cabeceo</label>
                <div>
                    <select id="pitch-option" class="short-selector" onchange="fillFormsvectorDirections('pitch', value)">
                        <option value="X">Eje X</option>
                        <option value="Y">Eje Y</option>
                        <option value="Z">Eje Z</option>
                        <option value="unitVector">Definir vector</option>
                    </select>
                    <span class="material-symbols-rounded" onclick="showInfo('pitch-option')">info</span>
                </div>
            </div>
            <div id="pitch-option-info" class="info-div info-div-border" style="display: none;"></div>
            <div id="pitch-vector" class="axis-data"></div>
            <div class="input-data">
                <label for="magUInf-data" class="long-label">Velocidad de flujo sin perturbar</label>
                <div>
                    <input class="short-input" type="text" id="magUInf-data"/>
                    <span class="material-symbols-rounded" onclick="showInfo('magUInf-data')">info</span>
                </div>
            </div>
            <div id="magUInf-data-info" class="info-div info-div-border" style="display: none;"></div>
            <div class="input-data">
                <label for="lRef-data" class="long-label">Longitud de referencia</label>
                <div>
                    <input class="short-input" type="text" id="lRef-data"/>
                    <span class="material-symbols-rounded" onclick="showInfo('lRef-data')">info</span>
                </div>
            </div>
            <div id="lRef-data-info" class="info-div info-div-border" style="display: none;"></div>
            <div class="input-data">
                <label for="aRef-data" class="long-label">Área de referencia</label>
                <div>
                    <input class="short-input" type="text" id="aRef-data"/>
                    <span class="material-symbols-rounded" onclick="showInfo('aRef-data')">info</span>
                </div>
            </div>
            <div id="aRef-data-info" class="info-div info-div-border" style="display: none;"></div>
            `;

    } else if (coeffs && extraInputs.innerHTML !== '') {
        extraInputs.style.display = 'block';

    } else if (!coeffs) {
        extraInputs.style.display = 'none';
    }

    if (!forces && !coeffs) {
        inputsOn.style.display = 'none';
        return false;
    }

    return true;
}

/**
 * Checks if its necessary and fills the form with the inputs to define a vector
 * with cartesian components
 */
function fillFormsvectorDirections(vectorName, value) {
    let vector = document.getElementById(`${vectorName}-vector`);

    if (vector.innerHTML === '') {
        vector.innerHTML = `
            <div>
                <label for="${vectorName}X-data">Eje X</label>
                <input class="axis-input" type="text" id="${vectorName}X-data"/>
            </div>
            <div>
                <label for="${vectorName}Y-data">Eje Y</label>
                <input class="axis-input" type="text" id="${vectorName}Y-data"/>
            </div>
            <div>
                <label for="${vectorName}Z-data">Eje Z</label>
                <input class="axis-input" type="text" id="${vectorName}Z-data"/>
            </div>`;
    }

    if (value === 'unitVector') {
        vector.style.display = "inline-flex";
    } else {
        vector.style.display = "none";
        // vector.innerHTML = '';
    }
}

/**
 * Fills turbulence model selectior with the models found on DB
 * turbulenceModels is the list of models to work with
 */
async function setModels() {
    //linker function
    const turbulenceModels = await getTurbulenceModelsInfo();

    if (turbulenceModels) {
        const turbulenceOptions = document.getElementById('turbulence-model');
        
        turbulenceOptions.innerHTML = `
            <option value="default">Flujo laminar</option>`;

        for (model of turbulenceModels){
            turbulenceOptions.innerHTML += `
                <option value="${model.model}">${model.model}</option>`;
        }
    }
}

/**
 * Fills the form with the necessary inputs for OepnFOAM to solve the variables 
 */
async function fillFormsSolverVariables(solver, simulationID){
    // Initialize the array with two variables that will ever be in a simulation
    let variables = [
        {
            name: 'presión',
            variable: 'p',
            type: 'asymmetric',
            schemes: 'grad'
        },
        {
            name: 'velocidad',
            variable: 'U',
            type: 'symmetric',
            schemes: "'grad','div'"
        }
    ];

    let variablesInputs = document.getElementById("fvSolution-variables-inputs");
    let solverInputs = document.getElementById("fvSolution-solver-inputs");
    let relaxationInputs = document.getElementById("fvSolution-relaxationFactors-inputs");
    const turbulenceModel = document.getElementById("turbulence-model");
    
    // Cleans HTML from the fields in order to avoid duplicated fields
    if (variablesInputs != null && variablesInputs.innerHTML != '') variablesInputs.innerHTML = '';
    if (solverInputs != null && solverInputs.innerHTML != '') solverInputs.innerHTML = '';
    if (relaxationInputs != null && relaxationInputs.innerHTML != '') relaxationInputs.innerHTML = '';
        
    // Prevents that a solver has been selected by the user
    if (solver === 'default') return ;

    // Looks for the variables the turbulence model needs
    if(turbulenceModel.value !== 'default') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel.value);
        
        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
    }
    
    // Once we have the data, we fill the form
    fillFormsSolverVariablesSections(variablesInputs, variables);
    fillFormsSolverSection(solverInputs, solver);
    fillFormsResidualControlSection(solverInputs, variables);
    fillFormsRelaxationSection(relaxationInputs, variables);

    // When inputs are ready, we fill them with the data from simulation
    let solutionData = await getSolutionData(simulationID);

    // Fills the form with the DB data
    if (variablesInputs.innerHTML != ''){
        setSolverVariablesSection(variables, solutionData.solvers);
    }
    if (solverInputs.innerHTML != ''){
        setSolverSection(solver, solutionData[`${solver.replaceAll('Foam','')}`]);
        setResidualControlSection(variables, solutionData.residualControl);
    }
    if (relaxationInputs.innerHTML != '') {
        setRelaxationSection(variables, solutionData.relaxationFactors);
    }
}

/**
 * Fills the form with the solvers for each variable in the simulation
 */
function setSolverVariablesSection(variables, solversData) {
    for ( let variableData of variables) {
        if ( variableData.type == null ) continue ;

        const variable = variableData.variable;

        // Selectors
        document.getElementById(`${variable}-solver-schema`).value =
                formatSelector( solversData[`${variable}`].solver );
        document.getElementById(`${variable}-preconditioner-schema`).value =
                formatSelector( solversData[`${variable}`].preconditioner );
        document.getElementById(`${variable}-smoother-data`).value =
                formatSelector( solversData[`${variable}`].smoother );

        // Simple inputs
        document.getElementById(`${variable}-tolerance-data`).value =
                formatInput(solversData[`${variable}`].tolerance);
        document.getElementById(`${variable}-relTol-data`).value =
                formatInput(solversData[`${variable}`].relTol);
                
        if ( variableData.type == 'symmetric' ) {
            document.getElementById(`${variable}-sweeps-data`).value =
                    formatInput(solversData[`${variable}`].nSweeps);
        }
    }
}

/**
 * Fills the form with the necessary inputs for the selected solver
 */
function setSolverSection(solver, solverData) {
    document.getElementById('nNonOrthogonalCorrectors').value =
            formatInput(solverData.nNonOrthogonalCorrectors);

    if (solver === 'pisoFoam' || solver === 'pimpleFoam') {
        document.getElementById('nCorrectors').value = formatInput(solverData.nCorrectors);
    }

    if (solver === 'pimpleFoam') {
        document.getElementById('nOuterCorrectors').value = formatInput(solverData.nOuterCorrectors);
    }

    // TODO: manage icoFoam
}

/**
 * Fills the form with residual control data 
 */
function setResidualControlSection(variables, residualData) {
    for ( let variableData of variables) {
        const variable = variableData.variable;

        document.getElementById(`${variable}-residual-control`).value =
                formatInput(residualData[`${variable}`]);
    }
}

/**
 * Fills the form with relaxation factors data  
 */
function setRelaxationSection(variables, relaxationData) {
    for ( let variableData of [...variables, { variable: 'fields'}, { variable: 'equations'}]) {
        const variable = variableData.variable;

        document.getElementById(`${variable}-relaxation`).value =
                formatInput(relaxationData[`${variable}`]);
    }
}

/**
 * Fills form with a section for each variable OpenFOAM will have to solve
 */
function fillFormsSolverVariablesSections(variablesInputs, variables) {
    let newHTML = '';
    for ( let variable of variables ) {
        if(variable.type != null) {
            newHTML = `
                <div class="card-title">
                    <p class="input-label">Parámetros para el solver de ${variable.name.toLowerCase()}</p>
                </div>
                <div class="data-container">`;
            
            // We distinguish betwwen symmetric and assymetric variables
            if ( variable.type === 'symmetric' ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema">
                            <option value="gaussseidel">Gauss-Seidel</option>
                            <option value="smoothsolver">smoothSolver</option>
                            <option value="dilu">DILU</option>
                            <option value="pcg">PCG</option>
                            <option value="pbicg">PBiCG</option>
                            <option value="pbicgstab">PBiCGStab</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                        <select id="${variable.variable}-preconditioner-schema">
                            <option value="default">Sin precondicionador</option>
                            <option value="symgaussseidel">Gauss-Seidel</option>
                            <option value="dilu">DILU</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Smoother</label>
                        <select id="${variable.variable}-smoother-data">
                            <option value="gaussseidel">Gauss-Seidel</option>
                            <option value="dilu">DILU</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-sweeps-data">nSweeps</label>
                        <input class="long-input" type="text" id="${variable.variable}-sweeps-data"/>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input class="long-input" type="text" id="${variable.variable}-tolerance-data" />
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input class="long-input" type="text" id="${variable.variable}-relTol-data"/>
                    </div>
                    `;
            } else if ( variable.type === 'asymmetric' ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema"> 
                            <option value="gamg">GAMG</option>
                            <option value="dic">DIC</option>
                            <option value="pcg">PCG</option>
                            <option value="pbicgstab">PBiCGStab</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                        <select id="${variable.variable}-preconditioner-schema"> 
                            <option value="default">Sin precondicionador</option>
                            <option value="gaussseidel">Gauss-Seidel</option>
                            <option value="gamg">GAMG</option>
                            <option value="dic">DIC</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Smoother</label>
                        <select id="${variable.variable}-smoother-data">
                            <option value="gaussseidel">Gauss-Seidel</option>
                            <option value="gamg">GAMG</option>
                            <option value="dic">DIC</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input class="long-input" type="text" id="${variable.variable}-tolerance-data"/>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input class="long-input" type="text" id="${variable.variable}-relTol-data"/>
                    </div>
                    `;
            }
            
            newHTML += '</div>';
            variablesInputs.innerHTML += newHTML;
        }
    }
}

/**
 * Fills form with inputs to define the solver OpenFOAM will use
 */
function fillFormsSolverSection(solverInputs, solver){
    let newHTML = '';
    // TODO: check fields for pimple, piso and simple
    if(solver === 'simpleFoam') {
        newHTML = `
            <div class="card-title">
                <p class="input-label">SIMPLE</p>
            </div>
            <div class="data-container">
                <div class="input-data">
                    <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                    <div>
                        <input class="long-input" id="nNonOrthogonalCorrectors"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nNonOrthogonalCorrectors')">info</span>
                    </div>
                </div>
                <div id="nNonOrthogonalCorrectors-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="consistent">Consistencia</label>
                    <div>
                        <select id="consistent">
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('consistent')">info</span>
                    </div>
                </div>
                <div id="consistent-info" class="info-div info-div-border" style="display: none;"></div>
            </div>`;
    } else if(solver === 'pisoFoam') {
        newHTML = `
            <div class="card-title">
                <p class="input-label">PISO</p>
            </div>
            <div class="data-container">
                <div class="input-data">
                    <label for="nCorrectors">nCorrectors</label>
                    <div>
                        <input class="long-input" id="nCorrectors"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nCorrectors')">info</span>
                    </div>
                </div>
                <div id="nCorrectors-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                    <div>
                        <input class="long-input" id="nNonOrthogonalCorrectors"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nNonOrthogonalCorrectors')">info</span>
                    </div>
                </div>
                <div id="nNonOrthogonalCorrectors-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="pRefCell">Presión de referencia en las celdas</label>
                    <div>
                        <input class="long-input" id="pRefCell"/>
                        <span class="material-symbols-rounded" onclick="showInfo('pRefCell')">info</span>
                    </div>
                </div>
                <div id="pRefCell-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="pRefValue">Valor de la presión de referencia</label>
                    <div>
                        <input class="long-input" id="pRefValue"/>
                        <span class="material-symbols-rounded" onclick="showInfo('pRefValue')">info</span>
                    </div>
                </div>
                <div id="pRefValue-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="consistent">Consistencia</label>
                    <div>
                        <select id="consistent">
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('consistent')">info</span>
                    </div>
                </div>
                <div id="consistent-info" class="info-div info-div-border" style="display: none;"></div>
            </div>`;
    } else if(solver === 'pimpleFoam') {
        newHTML = `
            <div class="card-title">
                <p class="input-label">PIMPLE</p>
            </div>
            <div class="data-container">
                <div class="input-data">
                    <label for="nOuterCorrectors">nOuterCorrectors</label>
                    <div>
                        <input class="long-input" id="nOuterCorrectors"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nOuterCorrectors')">info</span>
                    </div>
                </div>
                <div id="nOuterCorrectors-info" class="info-div info-div-border" style="display: none;"></div>

                <div class="input-data">
                    <label for="nCorrectors">nCorrectors</label>
                    <div>
                        <input class="long-input" id="nCorrectors"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nCorrectors')">info</span>
                    </div>
                </div>
                <div id="nCorrectors-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                    <div>
                        <input class="long-input" id="nNonOrthogonalCorrectors"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nNonOrthogonalCorrectors')">info</span>
                    </div>
                </div>
                <div id="nNonOrthogonalCorrectors-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="correctPhi">Corrección del flujo</label>
                    <div>
                        <select id="correctPhi">
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('correctPhi')">info</span>
                    </div>
                </div>
                <div id="correctPhi-info" class="info-div info-div-border" style="display: none;"></div>
                
                <div class="input-data">
                    <label for="consistent">Consistencia</label>
                    <div>
                        <select id="consistent">
                            <option value="1">Sí</option>
                            <option value="0">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('consistent')">info</span>
                    </div>
                </div>
                <div id="consistent-info" class="info-div info-div-border" style="display: none;"></div>
            </div>`;
    } 
    
    // TODO: manage icoFoam

    solverInputs.innerHTML += newHTML;
}

/**
 * Fills form with inputs to define the residual control OpenFOAM will use
 */
function fillFormsResidualControlSection(solverInputs, variables) {
    let newHTML = `
        <div class="card-title">
            <p class="input-label">Control residual</p>
            <span class="material-symbols-rounded" onclick="showInfo('residual-control')">info</span>
        </div>
        <div class="data-container">
            <div id="residual-control-info" class="info-div info-div-border" style="display: none;"></div>
        `;

    for( let variable of variables ){
        newHTML += `
                <div class="input-data">
                    <label for="${variable.variable}-residual-control">${capitalize(variable.name)}</label>
                    <input class="long-input" id="${variable.variable}-residual-control"/>
                </div>
            `;
    }

    newHTML += '</div>';
    solverInputs.innerHTML += newHTML;
}

/**
 * Fills form with inputs to define the relaxation parameters OpenFOAM will use
 */
function fillFormsRelaxationSection(relaxationInputs, variables) {
    let newHTML = `
        <div class="card-title">
            <p class="input-label">Factores de relajación</p>
            <span class="material-symbols-rounded" onclick="showInfo('relaxation-factors')">info</span>
        </div> 
        
        <div class="data-container">
            <div id="relaxation-factors-info" class="info-div info-div-border" style="display: none;"></div>
            <div class="input-data">
                <label for="fields-relaxation">Campos</label>
                <input class="long-input" id="fields-relaxation"/>
            </div>
            
            <div class="input-data">
                <label for="equations-relaxation">Ecuaciones</label>
                <input class="long-input" id="equations-relaxation"/>
            </div>
            `;
    
    for ( let variable of variables ) {
        newHTML += `
            <div class="input-data">
                <label for="${variable.variable}-relaxation">${capitalize(variable.name)}</label>
                <input class="long-input" id="${variable.variable}-relaxation"/>
            </div>
            `;    
    }

    newHTML += '</div>';
    relaxationInputs.innerHTML += newHTML;
}

/**
 * Fills in and displays solvers info
 */
async function showSolverInfo() {
    const element = document.getElementById('container-solvers-info');

    if( await showInfo('solvers') ){
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }  
}

/**
 * Fills in and displays info requested by the user
 */
async function showInfo(id) {
    const infoID = `${id}-info`;
    const element = document.getElementById(infoID);

    const text = await loadInfo(id);

    if( element.innerHTML == '' && text != null) {
        let info = '';
        
        for( paragraph of text.split('\n')) {
            if(paragraph == '') continue;

            info += `<p>${paragraph}</p>`;    
        }
        
        element.innerHTML = info;
        element.style.display = 'block';
        return true;

    } else {
        element.innerHTML = '';
        element.style.display = 'none';
        return false;
    }
}