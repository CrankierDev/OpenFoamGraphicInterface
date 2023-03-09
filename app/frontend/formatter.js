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
    
    // TODO: not show table if there is only 'default' simulation on the DB.

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
                <p class="input-label">Esquemas para ${variable.name.toLowerCase()}</p>
                <div class="data-container">`;
            
            if ( variable.schemes.indexOf('grad') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-grad-schema">Esquema para los gradientes</label>
                        <select id="${variable.variable}-grad-schema">
                            <option value="default">Predeterminado</option>
                            <option value="linear">Lineal</option>
                            <option value="gaussLinear">Gauss Lineal</option>
                            <option value="gaussLinearCell">Gauss Lineal limitado a las celdas</option>
                            <option value="gaussLinearFace">Gauss Lineal limitado a las caras</option>
                        </select>
                    </div>
                    <br>`;
            }
                
            if ( variable.schemes.indexOf('div') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-divergency-schema">Esquema para las divergencias</label>
                        <select id="${variable.variable}-divergency-schema">
                            <option value="default">Predeterminado</option>
                            <option value="linear">Lineal</option>
                            <option value="gaussLinear">Gauss Lineal</option>
                            <option value="gaussLinearBounded">Gauss Lineal limitado</option>
                            <option value="gaussLinearUpwind">Gauss Lineal aguas arriba</option>
                        </select>
                    </div>
                    <br>`;
            }
            
            if ( variable.schemes.indexOf('lap') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-laplacian-schema">Esquema para los laplacianos</label>
                        <select id="${variable.variable}-laplacian-schema">
                            <option value="default">Predeterminado</option>
                            <option value="corrected">Corregido</option>
                            <option value="orthogonal">Ortogonal</option>
                        </select>
                    </div>
                    <br>`;
            }
            
            if ( variable.schemes.indexOf('interp') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-interpolation-schema">Esquema de interpolación</label>
                        <select id="${variable.variable}-interpolation-schema">
                            <option value="default">Predeterminado</option>
                            <option value="linear">Lineal</option>
                            <option value="gaussLinear">Gauss Lineal</option>
                        </select>
                    </div>
                    <br>`;
            }
            
            if ( variable.schemes.indexOf('secondGrad') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-secondGrad-schema">Gradientes de segundo orden</label>
                        <select id="${variable.variable}-secondGrad-schema"> 
                            <option value="default">Predeterminado</option>
                            <option value="corrected">Corregido</option>
                            <option value="orthogonal">Ortogonal</option>
                        </select>
                    </div>
                    <br>`;
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
    document.getElementById('grad-schema').value = schemesData.gradSchemes.default;
    document.getElementById('divergency-schema').value = schemesData.divSchemes.default;
    document.getElementById('laplacian-schema').value = schemesData.laplacianSchemes.default;
    document.getElementById('interpolation-schema').value = schemesData.interpolationSchemes.default;
    document.getElementById('secondGrad-schema').value = schemesData.snGradSchemes.default;
    document.getElementById('wall-schema').value = schemesData.wallDist.method;

    for ( let variable of variables ) {
        // let schemes = variable.schemes != null ? variable.schemes.split(',') : null;
        if(variable.schemes != null && variable.schemes.length > 0) {            
            if ( variable.schemes.indexOf('grad') != -1 ) {
                document.getElementById(`${variable.variable}-grad-schema`).value = 
                    schemesData.gradSchemes[`${variable.variable}`] != null ? 
                    schemesData.gradSchemes[`${variable.variable}`] : 'default';
            }
                
            if ( variable.schemes.indexOf('div') != -1 ) {
                document.getElementById(`${variable.variable}-divergency-schema`).value = 
                    schemesData.divSchemes[`${variable.variable}`] != null ? 
                    schemesData.divSchemes[`${variable.variable}`] : 'default';
            }
            
            if ( variable.schemes.indexOf('lap') != -1 ) {
                document.getElementById(`${variable.variable}-laplacian-schema`).value = 
                    schemesData.laplacianSchemes[`${variable.variable}`] != null ? 
                    schemesData.laplacianSchemes[`${variable.variable}`] : 'default';
            }
            
            if ( variable.schemes.indexOf('interp') != -1 ) {
                document.getElementById(`${variable.variable}-interpolation-schema`).value = 
                    schemesData.interpolationSchemes[`${variable.variable}`] != null ? 
                    schemesData.interpolationSchemes[`${variable.variable}`] : 'default';
            }
            
            if ( variable.schemes.indexOf('secondGrad') != -1 ) {
                document.getElementById(`${variable.variable}-secondGrad-schema`).value = 
                    schemesData.snGradSchemes[`${variable.variable}`] != null ? 
                    schemesData.snGradSchemes[`${variable.variable}`] : 'default';
            }            
        }
    }
}

/**
 * Fills the form with the necessary inputs to manage the conditions of the variables
 * on the variables list on each mesh boundary 
 */
function fillFormsBoundariesFields(boundariesData, variables) {
    if(boundariesData){
        document.getElementById('boundary-conditions').innerHTML = 
            '<h2 class="input-label">Condiciones de contorno</h2>';

        for (boundary of boundariesData) {
            if(!document.getElementById(`${boundary.name}-data`)){
                // Checks the type of the boundary to apply the correct inputs    
                if( boundary.type === 'patch' ) {
                    let newText = `
                        <div id="${boundary.name}-data" class="walls-zero">
                            <h3 class="input-title">${capitalize(boundary.name)}</h3>
                            <div class="data-container">`;
                            
                        for(let variable of variables){
                            newText += `
                                <div class="input-data">
                                    <label for="${variable.variable}-data-${boundary.name}-type">Condición para ${variable.name}</label>
                                    <select id="${variable.variable}-data-${boundary.name}-type" >
                                        <option>Valor libre</option>
                                        <option>Valor fijo</option>
                                        <option>Gradiente nulo</option>
                                        <option>No-deslizamiento</option>
                                        <option>Vacío</option>
                                    </select>
                                </div>
                                <br>`;
                        }
                        
                        newText += `</div>
                                </div>`;
                        document.getElementById('boundary-conditions').innerHTML += newText;

                } else if( boundary.type === 'wall' ) {
                    let newText =`
                        <div id="${boundary.name}-data" class="walls-zero">
                            <h3 class="input-title">${capitalize(boundary.name)}</h3>
                            <div class="data-container">`;
                            
                            for(let variable of variables){
                                newText += `
                                    <div class="input-data">
                                        <label for="${variable.variable}-data-${boundary.name}-type">Condición para ${variable.name}</label>
                                        <select id="${variable.variable}-data-${boundary.name}-type" >
                                            <option>Valor fijo</option>
                                            <option>Gradiente nulo</option>
                                            <option>No-deslizamiento</option>
                                            <option>Vacío</option>
                                        </select>
                                    </div>
                                    <br>`;

                                if(variable.wallFunction == 1){
                                    newText += `
                                        <div class="input-data">
                                            <label for="${boundary.name}-wall">Funciones de pared para ${variable.name}</label>
                                            <select id="${boundary.name}-wall" >
                                            <option>Sí</option>
                                            <option>No</option>
                                            </select>
                                        </div>
                                        <br>`;
                                }
                            }
                            
                            newText += `</div>
                                    </div>`;
                    document.getElementById('boundary-conditions').innerHTML += newText;
                }
            }
        }
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

    if(value === 'icoFoam') {
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
            `<h3 class="input-title">Datos para el cálculo de fuerzas</h3>
            <div class="data-container">
                <div class="input-data">
                    <p>Centro de rotación (m)</p>
                </div>
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
                    <input class="short-input" type="text" id="rhoInf-data"/>
                </div>
                <div id="forces-extra-inputs"></div>
            </div>`;

    } else if (forces || coeffs) {
        inputsOn.style.display = 'block';
    }

    let extraInputs = document.getElementById("forces-extra-inputs");

    if (coeffs && extraInputs.innerHTML == ''){ 
        extraInputs.innerHTML +=
            `<div class="input-data">
                <label class="long-label">Direccion vector unitario de sustentación</label>
                <select id="lift-option" class="short-selector" onchange="vectorDirections('lift', value)">
                    <option value="X">Eje X</option>
                    <option value="Y">Eje Y</option>
                    <option value="Z">Eje Z</option>
                    <option value="unitVector">Definir vector</option>
                </select>
            </div>
            <div id="lift-vector" class="axis-data"></div>
            <div class="input-data">
                <label class="long-label">Direccion vector unitario de resistencia aerodinámica</label>
                <select id="drag-option" class="short-selector" onchange="vectorDirections('drag', value)">
                    <option value="X">Eje X</option>
                    <option value="Y">Eje Y</option>
                    <option value="Z">Eje Z</option>
                    <option value="unitVector">Definir vector</option>
                </select>
            </div>
            <div id="drag-vector" class="axis-data"></div>
            <div class="input-data">
                <label class="long-label">Direccion vector unitario de eje de cabeceo</label>
                <select id="pitch-option" class="short-selector" onchange="vectorDirections('pitch', value)">
                    <option value="X">Eje X</option>
                    <option value="Y">Eje Y</option>
                    <option value="Z">Eje Z</option>
                    <option value="unitVector">Definir vector</option>
                </select>
            </div>
            <div id="pitch-vector" class="axis-data"></div>
            <div class="input-data">
                <label for="magUInf-data" class="long-label">Velocidad de flujo sin perturbar</label>
                <input class="short-input" type="text" id="magUInf-data"/>
            </div>
            <div class="input-data">
                <label for="lRef-data" class="long-label">Longitud de referencia</label>
                <input class="short-input" type="text" id="lRef-data"/>
            </div>
            <div class="input-data">
                <label for="aRef-data" class="long-label">Área de referencia</label>
                <input class="short-input" type="text" id="aRef-data"/>
            </div>
            `;

    } else if (coeffs && extraInputs.innerHTML !== '') {
        extraInputs.style.display = 'block';

    } else if (!coeffs){
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

    if (value === 'unitVector') {
        vector.style.display = "inline-flex";
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
    } else {
        vector.style.display = "none";
        vector.innerHTML = '';
    }
}

/**
 * Fills turbulence model selectior with the models found on DB
 * turbulenceModels is the list of models to work with
 */
async function setModels(turbulenceModels) {
    if (turbulenceModels) {
        let turbulenceOptions = document.getElementById('turbulence-model');
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
    
    // Once we have the data, we fill the form
    if (variablesInputs != null) fillFormsSolverVariablesSections(variablesInputs, variables);
    if (solverInputs != null) {
        fillFormsSolverSection(solver, solverInputs);
        fillFormsResidualControlSection(solverInputs, variables);
    }
    if (relaxationInputs != null) fillFormsRelaxationSection(relaxationInputs, variables);

    // Looks for the simulation data to fill the inputs
    let solutionData = await getSolutionData(simulationID);
    console.log('solutionData', solutionData);

    // TODO: Fill the form with the DB data

    // Looks for the variables the turbulence model needs
    if(turbulenceModel.value !== 'default') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel.value);
        
        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
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
                <p class="input-label">Parámetros para el solver de ${variable.name.toLowerCase()}</p>
                <div class="data-container">`;
            
            // We distinguish betwwen symmetric and assymetric variables
            if ( variable.type === 'symmetric' ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema">
                            <option value="GaussSeidel">Gauss-Seidel</option>
                            <option value="smoothSolver">smoothSolver</option>
                            <option value="DILU">DILU</option>
                            <option value="PCG">PCG</option>
                            <option value="PBiCG">PBiCG</option>
                            <option value="PBiCGStab">PBiCGStab</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                        <select id="${variable.variable}-preconditioner-schema">
                            <option value="default">Sin precondicionador</option>
                            <option value="symGaussSeidel">Gauss-Seidel</option>
                            <option value="DILU">DILU</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Smoother</label>
                        <select id="${variable.variable}-smoother-data">
                            <option value="GaussSeidel">Gauss-Seidel</option>
                            <option value="DIC">DILU</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-sweeps-data">nSweeps</label>
                        <input class="long-input" type="text" id="${variable.variable}-sweeps-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input class="long-input" type="text" id="${variable.variable}-tolerance-data" />
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input class="long-input" type="text" id="${variable.variable}-relTol-data"/>
                    </div>
                    <br>`;
            } else if ( variable.type === 'asymmetric' ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema"> 
                            <option value="GAMG">GAMG</option>
                            <option value="DIC">DIC</option>
                            <option value="PCG">PCG</option>
                            <option value="PBiCGStab">PBiCGStab</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                        <select id="${variable.variable}-preconditioner-schema"> 
                            <option value="default">Sin precondicionador</option>
                            <option value="GaussSeidel">Gauss-Seidel</option>
                            <option value="GAMG">GAMG</option>
                            <option value="DIC">DIC</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Smoother</label>
                        <select id="${variable.variable}-smoother-data">
                            <option value="GaussSeidel">Gauss-Seidel</option>
                            <option value="GAMG">GAMG</option>
                            <option value="DIC">DIC</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input class="long-input" type="text" id="${variable.variable}-tolerance-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input class="long-input" type="text" id="${variable.variable}-relTol-data"/>
                    </div>
                    <br>`;
            }
            
            newHTML += '</div>';
            variablesInputs.innerHTML += newHTML;
        }
    }
}

/**
 * Fills form with inputs to define the solver OpenFOAM will use
 */
function fillFormsSolverSection(solver, solverInputs){
    let newHTML = '';
    // TODO: create fields for the other solvers (pimple, piso, ...)
    if(solver === 'simpleFoam') {
        newHTML = `
            <p class="input-label">SIMPLE</p>
            <div class="data-container">
            <div class="input-data">
                <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                <input class="long-input" id="nNonOrthogonalCorrectors"/>
            </div>
            <br>
            <div class="input-data">
                <label for="consistent">Consistencia</label>
                <select id="consistent">
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                </select>
            </div>
            </div>`;
    }
    
    solverInputs.innerHTML += newHTML;
}

/**
 * Fills form with inputs to define the residual control OpenFOAM will use
 */
function fillFormsResidualControlSection(solverInputs, variables) {
    let newHTML = `
        <p class="input-label">Control residual</p>
        <div class="data-container">`;

    for( let variable of variables ){
        newHTML += `
            <div class="input-data">
                <label for="${variable.variable}-residual-control">${capitalize(variable.name)}</label>
                <input class="long-input" id="${variable.variable}-residual-control"/>
            </div>
            <br>`;
    }

    newHTML += '</div>';
    solverInputs.innerHTML += newHTML;
}

/**
 * Fills form with inputs to define the relaxation parameters OpenFOAM will use
 */
function fillFormsRelaxationSection(relaxationInputs, variables) {
    let newHTML = `
        <p class="input-label">Factores de relajación</p>
        <div class="data-container">
            <div class="input-data">
                <label for="general-relaxation">General</label>
                <input class="long-input" id="general-relaxation" value="0.95"/>
            </div>
            <br>`;
    
    for ( let variable of variables ) {
        newHTML += `
            <div class="input-data">
                <label for="${variable.variable}-relaxation">${capitalize(variable.name)}</label>
                <input class="long-input" id="${variable.variable}-relaxation"/>
            </div>
            <br>`;    
    }

    newHTML += '</div>';
    relaxationInputs.innerHTML += newHTML;
}