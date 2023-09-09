/**
 * Updates copyright year and fills with it on footer
 */
async function getVersion() {
	let version = document.getElementById('version');
	version.innerHTML = await window.variablesAPI.getVersion();
}

/**
 * Looks for past simulations on DB and fills the initial page with this data tabulated 
 */
async function setLastSimulationsTable() {
    setLastSimulationsTableVariable(true);
}

/**
 * Looks for past simulations on DB and fills the initial page with this data tabulated 
 */
async function setLastSimulationsTableVariable(dbStarted) {
    if(dbStarted != null && !dbStarted) await startDB();
    // Looks for past simulations on DB
    let info = await getAllSimulationsInfo();

    // Writes the table with the DB data from past simulations
    let table = document.getElementById('last-simulations-table');

    if( table != null && table.innerHTML !== '' ) table.innerHTML = '';

    // Checks how many simulations there are
    if( info.length === 0 || info.length === 1 ){
        document.getElementById('table-title').style.display = 'none';
        return ;
    }
    
    const tblBody = document.createElement("tbody");
    let tblHeader = document.createElement("tr");
    tblHeader.innerHTML = `
        <th>Nombre</th>
        <th>Fecha de creación</th>
        <th>Ruta de la simulación</th>
        <th>Gráficos</th>
        <th>Eliminar</th>`;

    tblBody.appendChild(tblHeader);
    
    for( row of info ) {
        if( row.id === 'default_sim' ) continue;

        const newRow = document.createElement("tr");
        newRow.innerHTML += `
            <td onclick="loadSimulationData('${row.id}')"
                    class="clickable-td">
                ${row.name}
            </td>
            <td>${row.creationDate}</td>
            <td>${row.simRoute.replaceAll('\\\\','\\')}</td>
            <td onclick="plotData('${row.id}')"
                    class="clickable-td">
                <img src="./frontend/static/images/graph_icon.svg"
                    class="icon graph-icon"
                    title="Abrir gráficas de la simulación">
            </td>
            <td onclick="deleteSimulation('${row.id}')"
                    class="clickable-td">
                <img src="./frontend/static/images/trash_icon.svg"
                    class="icon trash-icon"
                    title="Eliminar simulación">
            </td>`;
        
        tblBody.appendChild(newRow);
    }
    
    table.appendChild(tblBody);

    // Sets visibility on to the table
    document.getElementById('table-title').style.display = 'block';
    table.style.display = 'table';
}

/**
 * Enables/Disables specific values for pressure or velocity in boundaries
 */
function enableDisableSpecificValues(variable, boundary) {
    let check = document.getElementById(`${variable}-${boundary}-value-check`).checked;

    if(check) document.getElementById(`${variable}-${boundary}-value`).disabled = false;
    else document.getElementById(`${variable}-${boundary}-value`).disabled = true;    
}

/**
 * Fills basic flux data from DB
 */
async function setFluxDefaultData(simulation, boundariesData) {
    // Gets flux data from DB
    let zeroData = await getZeroData(simulation);

    for( let data of zeroData ) {
        document.getElementById(`flux-${data.variable}`).value = data.value;
        if(data.variable === 'U') {
            document.getElementById('flux-aoa').value = data.AOAValue;
            document.getElementById('lRef-data').value = data.lRef;
            document.getElementById('intensity-data').value = data.intensity;  
        }

        if(simulation !== 'default_sim') {
            for( let boundary in data.boundaries ) {
                if( data.boundaries[boundary].type === 'empty' ) continue;

                document.getElementById(`${data.variable}-data-${boundary}-type`).value
                    = data.boundaries[boundary].type;
            }

            if( data.variable === 'U' || data.variable === 'p') {
                let patchBoundaries = boundariesData.filter( (value) => {
                    return value.type ==='patch';
                });

                for( boundary of patchBoundaries ) {
                    // console.log(boundary, data.boundaries[boundary.name]);
                    
                    if( data.boundaries[boundary.name].value != null &&
                            data.boundaries[boundary.name].value !== '$internalField') {

                        document.getElementById(`${data.variable}-${boundary.name}-value`).value =
                            data.boundaries[boundary.name].value.replaceAll('uniform ', '');
                        document.getElementById(`${data.variable}-${boundary.name}-value-check`).checked = true;
                    
                        enableDisableSpecificValues(data.variable, boundary.name);
                    }
                }            
            }
        }
    }

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
    document.getElementById('simulation-end-time').value = controlDictData.endTime;
    document.getElementById('simulation-deltat').value = controlDictData.deltaT;

    // Check boxes with default data
    document.getElementById('deltat-adjust').checked
        = controlDictData.adjustTimeStep === 1 ? true : false;
    document.getElementById('run-time-modifiable').checked
        = controlDictData.runTimeModifiable === 1 ? true : false;

    // Gets forces data from DB
    let forcesData = await getForcesData(simulation);

    // If there is data we fill the form
    if( forcesData != null && forcesData.length !== 0 ){
        document.getElementById('forces-data').checked = true;
        document.getElementById('forcesCoeffs-data').checked 
            = forcesData.forceCoeffs === 1 ? true : false;

        // Calls the format function that prints values if forces or forcesCoeffs-data is checked
        if( fillFormsForcesFields() ){
            // Fill inputs with default data
            setCofR(forcesData.cofR);
            
            if(forcesData.forceCoeffs === 1){
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
    console.log(boundariesData, turbulenceModel, simulationID);
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

    await setFluxDefaultData(simulationID, boundariesData);
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
                        <div class="long-title">
                            <label>¿Gradientes por defecto?</label>
                            <input type="checkbox" checked
                                onclick="showNonDefaultSchemes('grad', '${variable.variable}', checked)"
                                id="check-default-grad-${variable.variable}"/>
                        </div>
                    </div>
                    <div class="schemes-data" style="display: none" id="nondefault-grad-${variable.variable}">
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
                        
                    </div>
                    `;
            }
                
            if ( variable.schemes.indexOf('div') != -1 ) {
                newHTML += `
                    <div class="input-data">
                        <p class="schemes-title">Esquema para las divergencias</p>
                        <div class="long-title">
                            <label>¿Divergencias por defecto?</label>
                            <input type="checkbox" checked
                                onclick="showNonDefaultSchemes('div', '${variable.variable}', checked)"
                                id="check-default-div-${variable.variable}"/>
                        </div>
                    </div>
                    <div class="schemes-data" style="display: none" id="nondefault-div-${variable.variable}">
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
                                <option value="limitedLinear 1">Lineal limitado</option>
                                <option value="linearUpwind">Lineal aguas arriba</option>
                            </select>
                        </div>
                    </div>
                    `;
                    }
            
            newHTML += '</div>';

            variablesInputs.innerHTML += newHTML;
        }
    }

    // Once we have the fields, we'll fill them with simulation data
    await setSchemesDefaultData(simulationID, variables);
}

/**
 * Method to hide non default schemes for variables
 */
function showNonDefaultSchemes(schema, variable, checked) {
    document.getElementById(`nondefault-${schema}-${variable}`).style.display =
            checked ? 'none' : 'inline-flex';
}


/**
 * Fills form with schemes data from DB
 */
async function setSchemesDefaultData(simulationID, variables) {
    // Gets schemes data from DB
    let schemesData = await getSchemasData(simulationID);

    // Fill inputs with default data
    // Here predeteminated schemes are set
    const temporalSchema = document.getElementById('temporal-schema');

    // Managing icoFoam needs
    if( document.getElementById('solver').value === 'icoFoam' ) {
        temporalSchema.value = 'Euler';
        temporalSchema.disabled = true;

    } else {
        temporalSchema.value = schemesData.ddtSchemes.default;
    }
    
    setGradValues('default', schemesData.gradSchemes.default);
    
    if(schemesData.divSchemes.default !== 'none') {
        setDivValues('default', schemesData.divSchemes.default);
    }
    
    document.getElementById('default-laplacian').value =
            schemesData.laplacianSchemes.default.split(' ')[2];
    // document.getElementById('default-interpolation-schema').value =
    //         schemesData.interpolationSchemes.default;
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

        console.log('jay');

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
                                <div id="${boundary.name}-data-${boundary.type}-type-info" class="info-div info-div-border" style="display: none;">
                                    <p>
                                        Los contornos tipo patch son aquellos por los que el flujo
                                        atraviesa la región.
                                    </p>
                                    <p>
                                        En los contornos tipo patch se definen las condiciones de las 
                                        variables fluidas en ese área. Dependiendo de la velocidad,
                                        se pueden encontrar las siguientes opciones:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Valor libre de presión:</strong> Aplicado a la presión,
                                            define que en el contorno el valor es libre.
                                        </li>
                                        <li>
                                            <strong>Valor libre de velocidad:</strong> Aplicado a la velocidad,
                                            define que en el contorno el valor es libre.
                                        </li>
                                        <li>
                                            <strong>Valor libre:</strong> Aplicado a cualquier variable,
                                            define que en el contorno el valor es libre.
                                        </li>
                                        <li>
                                            <strong>Valor fijo:</strong> Aplicado a cualquier variable,
                                            define que en el contorno el valor es fijo siempre.
                                        </li>
                                        <li>
                                            <strong>Calculado:</strong> Aplicado a cualquier variable,
                                            define que en el contorno el valor de la misma es calculado con
                                            el alrededor.
                                        </li>
                                    </ul>
                                </div>
                        `;   

                        for(let variable of variables){
                            newText += `
                                <div class="input-data">
                                    <label for="${variable.variable}-data-${boundary.name}-type">Condición para ${variable.name}</label>
                                    <select id="${variable.variable}-data-${boundary.name}-type" class="select-zero">
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
                                        <option value='zeroGradient'>Gradiente nulo</option>
                                        <option value='fixedValue'>Valor fijo</option>
                                        <option value='calculated'>Calculado</option>
                                    </select>
                                </div>`;
                            
                            if( variable.variable === 'U' || variable.variable === 'p' ){
                                newText += `
                                <div class="input-data">
                                    <div>
                                        <input type="checkbox" id="${variable.variable}-${boundary.name}-value-check"
                                            onclick="enableDisableSpecificValues('${variable.variable}', '${boundary.name}')"/>
                                        <label for="${variable.variable}-${boundary.name}-value">
                                            Especificar ${variable.name} en el contorno
                                        </label>
                                    </div>
                                    <div>
                                        <input class="long-input-info" disabled type="number"
                                            id="${variable.variable}-${boundary.name}-value"/>`;

                                if( variable.variable === 'U' ) {
                                    newText += `
                                        <span class="units">m/s</span>`;
                                } else if( variable.variable === 'p' ) {
                                    newText += `
                                        <span class="units">Pa</span>`;
                                }

                                newText += `
                                        <span class="material-symbols-rounded" onclick="showInfo('${variable.variable}-${boundary.name}-value')">info</span>
                                    </div>
                                </div>
                                <div id="${variable.variable}-${boundary.name}-value-info" class="info-div info-div-border" style="display: none;">
                                    <p>
                                        Si se selecciona la opción, puede definir el valor inicial
                                        de la variable en el contorno. De lo contrario, se usará el 
                                        valor por defecto definido anteriormente.
                                    </p>
                                    <p>
                                        Si el valor que se está especificando es vectorial (por ejemplo, 
                                        la velocidad), ha de escribirse el mismo en forma vectorial. Ejemplo
                                        "(10 0 0)".
                                    </p>
                                </div>`;
                            }
                        }
                        
                        newText += `
                            </section>
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
                                <div id="${boundary.name}-data-${boundary.type}-type-info" class="info-div info-div-border" style="display: none;">
                                    <p>
                                        Los contornos tipo wall son aquellos por los que el flujo no
                                        atraviesa la región.
                                    </p>
                                    <p>
                                        En los contornos tipo wall se definen las condiciones de las 
                                        variables fluidas en ese área. Dependiendo de la velocidad,
                                        se pueden encontrar las siguientes opciones:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Gradiente nulo:</strong> Se aplica que, para la
                                            variable, el gradiente sobre el contorno es 0.
                                        </li>
                                        <li>
                                            <strong>Valor fijo:</strong> Aplicado a cualquier variable,
                                            define que en el contorno el valor es fijo siempre.
                                        </li>
                                        <li>
                                            <strong>No-deslizamiento:</strong> Normalmente aplicado a la
                                            velocidad, aplica 
                                            la <a target="blank" href="https://ingenieriamecanicacol.blogspot.com/2022/12/condicion-de-no-deslizamiento.html">condición de No-deslizamiento</a> sobre 
                                            la superficie.
                                        </li>
                                    </ul>
                                </div>
                        `;
                            
                        for(let variable of variables){
                            newText += `
                                <div class="input-data">
                                    <label for="${variable.variable}-data-${boundary.name}-type">Condición para ${variable.name}</label>
                                    <select id="${variable.variable}-data-${boundary.name}-type" class="select-zero">
                                        <option value='fixedValue'>Valor fijo</option>
                                        <option value='zeroGradient'>Gradiente nulo</option>
                                        <option value='noSlip'>No-deslizamiento</option>
                                    </select>
                                </div>
                                `;

                            if( variable.variable === 'U' || variable.variable === 'p' ){
                                newText += `
                                <div class="input-data">
                                    <div>
                                        <input type="checkbox" id="${variable.variable}-${boundary.name}-value-check"
                                            onclick="enableDisableSpecificValues('${variable.variable}', '${boundary.name}')"/>
                                        <label for="${variable.variable}-${boundary.name}-value">
                                            Especificar ${variable.name} en el contorno
                                        </label>
                                    </div>
                                    <div>
                                        <input class="long-input-info" disabled
                                            id="${variable.variable}-${boundary.name}-value"/>`;

                                if( variable.variable === 'U' ) {
                                    newText += `
                                        <span class="units">m/s</span>`;
                                } else if( variable.variable === 'p' ) {
                                    newText += `
                                        <span class="units">Pa</span>`;
                                }

                                newText += `                    
                                        <span class="material-symbols-rounded" onclick="showInfo('${variable.variable}-${boundary.name}-value')">info</span>
                                    </div>
                                </div>
                                <div id="${variable.variable}-${boundary.name}-value-info" class="info-div info-div-border" style="display: none;">
                                    <p>
                                        Si se selecciona la opción, puede definir el valor inicial
                                        de la variable en el contorno. De lo contrario, se usará el 
                                        valor por defecto definido anteriormente.
                                    </p>
                                    <p>
                                        Si el valor que se está especificando es vectorial (por ejemplo, 
                                        la velocidad), ha de escribirse el mismo en forma vectorial. Ejemplo
                                        "(10 0 0)".
                                    </p>
                                </div>`;
                                }

                            if(variable.wallFunction == 1){
                                newText += `
                                    <div class="input-data">
                                        <label for="${boundary.name}-wall">Funciones de pared para ${variable.name}</label>
                                        <select id="${boundary.name}-wall" class="select-zero">
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

        for (boundary of boundariesData) {
            if( boundary.type === 'wall' ) {
                document.getElementById(`p-data-${boundary.name}-type`).value = 'zeroGradient';
                document.getElementById(`U-data-${boundary.name}-type`).value = 'noSlip';
            }
        }
    }
}

/**
 * Assures that if the user selects 'icoFoam' solver the turbulence model will ever be default/laminar
 */
function solverChanges(value) {
    const selector = document.getElementById('turbulence-model');
    const intensityfield = document.getElementById('intesity-block');

    if(value === 'icoFoam') {
        selector.disabled = true;
        selector.value = 'default';

    } else {
        selector.disabled = false;
        intensityfield.style.display = 'flex';
    }
    
    modelChanges(selector.value);

    let button = document.getElementById('next-button');

    if(button != null) {
        if(value !== 'default') {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
    }

}

/**
 * Assures that if the user selects 'default/laminar' turbulence model intensity will not be available
 */
async function modelChanges(value) {
    const intensityfield = document.getElementById('intesity-block');

    if(value === 'default') {
        intensityfield.style.display = 'none';

    } else {
        intensityfield.style.display = 'flex';
    }

    let boundariesData = await pathsData();
    
    if( window.simulationType !== 'pastSimulation' ){
        fillFormsBasicFields(boundariesData, document.getElementById("turbulence-model").value);
        fillFormsSolverVariables(document.getElementById('solver').value, 'default_sim');

    } else {
        console.log('holi', boundariesData);
        fillFormsBasicFieldsSim(boundariesData, document.getElementById("turbulence-model").value, window.simulationID);
        fillFormsSolverVariables(document.getElementById('solver').value, window.simulationID);
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
                    <p>Centro de rotación</p>
                    <span class="material-symbols-rounded" onclick="showInfo('CofR')">info</span>
                </div>
                <div id="CofR-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        El "centro de rotación" es el punto alrededor del cual un objeto o sistema rota
                        o gira. Es el punto en el que un objeto se considera fijo mientras experimenta
                        un movimiento de rotación. En el contexto de la física y la mecánica, el centro
                        de rotación es esencial para describir y analizar el movimiento circular o de
                        rotación de objetos. En muchos casos, el centro de rotación puede coincidir con
                        el centro geométrico del objeto, pero esto no siempre es así, especialmente en
                        objetos irregulares o sistemas más complejos.
                    </p>
                </div>
                <div class="axis-data">
                    <div>
                        <label for="CofRX-data" class="axis-label">Eje X</label>
                        <input class="axis-input" id="CofRX-data" type="number"/>
                    </div>
                    <div>
                        <label for="CofRY-data" class="axis-label">Eje Y</label>
                        <input class="axis-input" id="CofRY-data" type="number"/>
                    </div>
                    <div>
                        <label for="CofRZ-data" class="axis-label">Eje Z</label>
                        <input class="axis-input" id="CofRZ-data" type="number"/>
                    </div>
                </div>
                
                <div id="rhoInf-data-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        DDD
                    </p>
                </div>
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
            <div id="lift-option-info" class="info-div info-div-border" style="display: none;">
                <p>
                    Eje sobre el que se calcula la sustentación en el cuerpo. Si se selecciona la opción
                    de definir el vector, se introducirán las coordenadas manualmente.
                </p>
            </div>
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
            <div id="drag-option-info" class="info-div info-div-border" style="display: none;">
                <p>
                    Eje sobre el que se calcula la resistencia aerodinámica en el cuerpo. Si se selecciona
                    la opción de definir el vector, se introducirán las coordenadas manualmente.
                </p>
            </div>
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
            <div id="pitch-option-info" class="info-div info-div-border" style="display: none;">
                <p>
                    Eje sobre el que se calcula el momento aerodinámico en el cuerpo. Si se selecciona
                    la opción de definir el vector, se introducirán las coordenadas manualmente.
                </p>
            </div>
            <div id="pitch-vector" class="axis-data"></div>
            <div class="input-data">
                <label for="aRef-data" class="long-label">Área de referencia</label>
                <div>
                    <input class="short-input" id="aRef-data" type="number"/>
                    <span class="material-symbols-rounded" onclick="showInfo('aRef-data')">info</span>
                </div>
            </div>
            <div id="aRef-data-info" class="info-div info-div-border" style="display: none;">
                <p>
                    Área de referencia sobre la que se calculan las fuerzas.
                </p>
            </div>
            `;
            
        extraInputs.style.display = 'flex';

    } else if (coeffs && extraInputs.innerHTML !== '') {
        extraInputs.style.display = 'flex';

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
                <input class="axis-input" id="${vectorName}X-data" type="number"/>
            </div>
            <div>
                <label for="${vectorName}Y-data">Eje Y</label>
                <input class="axis-input" id="${vectorName}Y-data" type="number"/>
            </div>
            <div>
                <label for="${vectorName}Z-data">Eje Z</label>
                <input class="axis-input" id="${vectorName}Z-data" type="number"/>
            </div>`;
    }

    if (value === 'unitVector') {
        vector.style.display = "inline-flex";
    } else {
        vector.style.display = "none";
    }
}

/**
 * Fills turbulence model selectior with the models found on DB
 * turbulenceModels is the list of models to work with
 */
async function setSimulationInfo(simulationID) {
    //linker function
    const simInfo = await getSimulationInfo(simulationID);
    
    if(simInfo) {
        document.getElementById('simulation-name').value = simInfo.name;
        document.getElementById('workspace').value = parseWorkspace(simInfo.simRoute);
        document.getElementById('mesh').value = simInfo.simRoute + '/constant/polyMesh/';
    }
}

function parseWorkspace(route) {
    let routeSplit = route.split('/');
    return route.replaceAll(routeSplit.slice(-1), '');
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
        if( solver === 'icoFoam' ) {
            setSolverSection(solver, solutionData['piso']);
        } else {
            setSolverSection(solver, solutionData[`${solver.replaceAll('Foam','')}`]);
        }
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
        document.getElementById(`${variable}-sweeps-data`).value =
                formatInput(solversData[`${variable}`].nSweeps);
    }
}

/**
 * Fills the form with the necessary inputs for the selected solver
 */
function setSolverSection(solver, solverData) {
    document.getElementById('nNonOrthogonalCorrectors').value =
            formatInput(solverData.nNonOrthogonalCorrectors);

    if (solver === 'pisoFoam' || solver === 'pimpleFoam' || solver === 'icoFoam') {
        document.getElementById('nCorrectors').value = formatInput(solverData.nCorrectors);
    }

    if (solver === 'pimpleFoam') {
        document.getElementById('nOuterCorrectors').value = formatInput(solverData.nOuterCorrectors);
    }
    
    if (solver === 'pisoFoam' || solver === 'icoFoam') {
        document.getElementById('pRefCell').value = formatInput(solverData.pRefCell);
        document.getElementById('pRefValue').value = formatInput(solverData.pRefValue);
    }
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
    for ( let variableData of variables ) {
        const variable = variableData.variable;
        if( variable === 'nut' ) continue;
        
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
                <div class="data-container">
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema">
                            <option value="smoothSolver">smoothSolver</option>
                            <option value="GAMG">GAMG</option>
                            <option value="PCG">PCG</option>
                            <option value="PBiCG">PBiCG</option>
                            <option value="PBiCGStab">PBiCGStab</option>
                            <option value="DIC">DIC</option>
                            <option value="DILU">DILU</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                        <select id="${variable.variable}-preconditioner-schema">
                            <option value="default">Sin precondicionador</option>
                            <option value="GaussSeidel">Gauss-Seidel</option>
                            <option value="symGaussSeidel">Gauss-Seidel Simétrico</option>
                            <option value="DIC">DIC</option>
                            <option value="DILU">DILU</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Smoother</label>
                        <select id="${variable.variable}-smoother-data">
                            <option value="GaussSeidel">Gauss-Seidel</option>
                            <option value="symGaussSeidel">Gauss-Seidel Simétrico</option>
                            <option value="DIC">DIC</option>
                            <option value="DILU">DILU</option>
                            <option value="DICGaussSeidel">DICGaussSeidel</option>
                            <option value="DILUGaussSeidel">DILUGaussSeidel</option>
                        </select>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-sweeps-data">Número de barridos</label>
                        <input class="long-input" type="number" id="${variable.variable}-sweeps-data"/>
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input class="long-input" type="number" id="${variable.variable}-tolerance-data" />
                    </div>
                    
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input class="long-input" type="number" id="${variable.variable}-relTol-data"/>
                    </div>
                '</div>`;
            
            variablesInputs.innerHTML += newHTML;
        }
    }
}

/**
 * Fills form with inputs to define the solver OpenFOAM will use
 */
function fillFormsSolverSection(solverInputs, solver){
    let newHTML = '';

    if(solver === 'simpleFoam') {
        newHTML = `
            <div class="card-title">
                <p class="input-label">SIMPLE</p>
            </div>
            <div class="data-container">
                <div class="input-data">
                    <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                    <div>
                        <input class="long-input-info" id="nNonOrthogonalCorrectors" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nNonOrthogonalCorrectors')">info</span>
                    </div>
                </div>
                <div id="nNonOrthogonalCorrectors-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Especiﬁca las soluciones repetidas de la ecuación de presión, utilizadas para actualizar la
                        corrección explícita no ortogonal de la ecuación del término laplaciano; normalmente
                        se establece en 0 para el estado estacionario y en 1 para los casos transitorios.
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="consistent">Consistencia</label>
                    <div>
                        <select id="consistent" class="select-info">
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('consistent')">info</span>
                    </div>
                </div>
                <div id="consistent-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        OpenFOAM incluye dos variantes del algoritmo SIMPLE, SIMPLE estándar y su formulación consistente,
                        SIMPLEC. Por defecto se utiliza SIMPLE. Para usar SIMPLEC, debe indicar 'Sí' en el selector. La
                        formulación SIMPLEC para el método de acoplamiento presión-velocidad sólo necesita una pequeña
                        cantidad de subrelajación para la velocidad y otras ecuaciones de transporte. No es necesario
                        utilizar ninguna relajación en la presión. El resultado suele ser una solución más robusta y una
                        convergencia más rápida.
                    </p>
                    <p>
                        El usuario puede especificar el factor de relajación para un campo concreto.
                    </p>
                </div>
            </div>`;

    } else if(solver === 'pisoFoam' || solver === 'icoFoam') {
        newHTML = `
            <div class="card-title">
                <p class="input-label">PISO</p>
            </div>
            <div class="data-container">
                <div class="input-data">
                    <label for="nCorrectors">nCorrectors</label>
                    <div>
                        <input class="long-input-info" id="nCorrectors" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nCorrectors')">info</span>
                    </div>
                </div>
                <div id="nCorrectors-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Establece el número de veces que el algoritmo resuelve la ecuación de presión y el corrector de
                        momento en cada paso; normalmente se establece en 2 o 3.
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                    <div>
                        <input class="long-input-info" id="nNonOrthogonalCorrectors" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nNonOrthogonalCorrectors')">info</span>
                    </div>
                </div>
                <div id="nNonOrthogonalCorrectors-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Especiﬁca las soluciones repetidas de la ecuación de presión, utilizadas para actualizar la
                        corrección explícita no ortogonal de la ecuación del término laplaciano; normalmente
                        se establece en 0 para el estado estacionario y en 1 para los casos transitorios.
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="pRefCell">Celda de presión de referencia</label>
                    <div>
                        <input class="long-input-info" id="pRefCell" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('pRefCell')">info</span>
                    </div>
                </div>
                <div id="pRefCell-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Celda en la que se designa el valor de referencia de
                        presión. <a target="blank" href="https://www.cfd-online.com/Forums/openfoam-pre-processing/62259-fvsolution-prefcell-prefvalue.html">Más info</a>
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="pRefValue">Valor de la presión de referencia</label>
                    <div>
                        <input class="long-input-info" id="pRefValue" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('pRefValue')">info</span>
                    </div>
                </div>
                <div id="pRefValue-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Valor de la presión de referencia en la celda
                        indicada. <a target="blank" href="https://www.cfd-online.com/Forums/openfoam-pre-processing/62259-fvsolution-prefcell-prefvalue.html">Más info</a>
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="consistent">Consistencia</label>
                    <div>
                        <select id="consistent" class="select-info">
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('consistent')">info</span>
                    </div>
                </div>
                <div id="consistent-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        OpenFOAM incluye dos variantes del algoritmo SIMPLE, SIMPLE estándar y su formulación consistente,
                        SIMPLEC. Por defecto se utiliza SIMPLE. Para usar SIMPLEC, debe indicar 'Sí' en el selector. La
                        formulación SIMPLEC para el método de acoplamiento presión-velocidad sólo necesita una pequeña
                        cantidad de subrelajación para la velocidad y otras ecuaciones de transporte. No es necesario
                        utilizar ninguna relajación en la presión. El resultado suele ser una solución más robusta y una
                        convergencia más rápida.
                    </p>
                    <p>
                        El usuario puede especificar el factor de relajación para un campo concreto.
                    </p>
                </div>
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
                        <input class="long-input-info" id="nOuterCorrectors" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nOuterCorrectors')">info</span>
                    </div>
                </div>
                <div id="nOuterCorrectors-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Permite realizar un bucle sobre todo el sistema de ecuaciones en un paso de tiempo,
                        lo que representa el número total de veces que se resuelve el sistema; debe ser mayor o igual
                        a 1 y normalmente se establece en 1.
                    </p>
                </div>

                <div class="input-data">
                    <label for="nCorrectors">nCorrectors</label>
                    <div>
                        <input class="long-input-info" id="nCorrectors" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nCorrectors')">info</span>
                    </div>
                </div>
                <div id="nCorrectors-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Establece el número de veces que el algoritmo resuelve la ecuación de presión y el corrector de
                        momento en cada paso; normalmente se establece en 2 o 3.
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="nNonOrthogonalCorrectors">nNonOrthogonalCorrectors</label>
                    <div>
                        <input class="long-input-info" id="nNonOrthogonalCorrectors" type="number"/>
                        <span class="material-symbols-rounded" onclick="showInfo('nNonOrthogonalCorrectors')">info</span>
                    </div>
                </div>
                <div id="nNonOrthogonalCorrectors-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Especiﬁca las soluciones repetidas de la ecuación de presión, utilizadas para actualizar la
                        corrección explícita no ortogonal de la ecuación del término laplaciano; normalmente
                        se establece en 0 para el estado estacionario y en 1 para los casos transitorios.
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="correctPhi">Corrección del flujo</label>
                    <div>
                        <select id="correctPhi" class="select-info">
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('correctPhi')">info</span>
                    </div>
                </div>
                <div id="correctPhi-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        Aplica funciones de corrección de flujo para ayudar a la continuidad. 
                    </p>
                </div>
                
                <div class="input-data">
                    <label for="consistent">Consistencia</label>
                    <div>
                        <select id="consistent" class="select-info">
                            <option value="yes">Sí</option>
                            <option value="no">No</option>
                        </select>
                        <span class="material-symbols-rounded" onclick="showInfo('consistent')">info</span>
                    </div>
                </div>
                <div id="consistent-info" class="info-div info-div-border" style="display: none;">
                    <p>
                        OpenFOAM incluye dos variantes del algoritmo SIMPLE, SIMPLE estándar y su formulación consistente,
                        SIMPLEC. Por defecto se utiliza SIMPLE. Para usar SIMPLEC, debe indicar 'Sí' en el selector. La
                        formulación SIMPLEC para el método de acoplamiento presión-velocidad sólo necesita una pequeña
                        cantidad de subrelajación para la velocidad y otras ecuaciones de transporte. No es necesario
                        utilizar ninguna relajación en la presión. El resultado suele ser una solución más robusta y una
                        convergencia más rápida.
                    </p>
                    <p>
                        El usuario puede especificar el factor de relajación para un campo concreto.
                    </p>
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
        <div class="card-title">
            <p class="input-label">Control residual</p>
            <span class="material-symbols-rounded" onclick="showInfo('residual-control')">info</span>
        </div>
        <div class="data-container">
            <div id="residual-control-info" class="info-div info-div-border" style="display: none;">
                <p>
                    OpenFOAM evalua los residuales en cada iteración para valorar si la simulación ha
                    llegado a una situación que pueda considerarse "de convergencia". En esta sección,
                    puede definirse el valor a partir del cual puede considerarse que los valores de las
                    variables ha llegado a un nivel de convergencia aceptable para el usuario.
                </p>
            </div>
        `;

    for( let variable of variables ){
        newHTML += `
                <div class="input-data">
                    <label for="${variable.variable}-residual-control">${capitalize(variable.name)}</label>
                    <input class="long-input" id="${variable.variable}-residual-control" type="number"/>
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
            <div id="relaxation-factors-info" class="info-div info-div-border" style="display: none;">
                <p>
                    Los factores de relajacion controlan la infra-relajación una técnica usada para mejorar la
                    estabilidad de computación, particularmente resolviendo problemas de estado estacionario.
                    La mencionada técnica limita la cantidad que una variable cambia en cada iteración. Un factor
                    de relajación se define entre 0 y 1, donde un valor igual a 1 indica que no se hace ninguna relajación
                    y un valor de 0, implica que la simulación no cambiaría con cada iteración.
                </p>
                <p>
                    Para evitar problemas en las simulaciones, si es especifica un valor de 0, el programa obviará esa variable.
                </p>
            </div>
            `;
    
    for ( let variable of variables ) {
        if( variable.variable !== 'nut' ) {
            newHTML += `
            <div class="input-data">
                <label for="${variable.variable}-relaxation">${capitalize(variable.name)}</label>
                <input class="long-input" id="${variable.variable}-relaxation" type="number"/>
            </div>
            `;
        }    
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

    if( element.style.display === 'none' ) {
        element.style.display = 'block';
        return true;

    } else {
        element.style.display = 'none';
        return false;
    }
}