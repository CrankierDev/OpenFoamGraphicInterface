function fillFormsData(boundariesData, turbulenceModels) {
    if(boundariesData){
        for (boundary of boundariesData) {
            // First looks for the existence of the element to add
            if(!document.getElementById(`${boundary.name}-data`)){
                if( boundary.type === 'patch' ) {
                    document.getElementById('boundary-conditions').innerHTML += 
                        `<div id="${boundary.name}-data" class="walls-zero">
                            <h3 class="input-title">${capitalize(boundary.name)}</h3>
                            <div class="data-container">
                                <div class="input-data">
                                    <label for="${boundary.name}-type">Condición</label>
                                    <select id="${boundary.name}-type" >
                                        <option>Valor libre</option>
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
                            <h3 class="input-title">${capitalize(boundary.name)}</h3>
                            <div class="data-container">
                                <div class="input-data">
                                    <label for="${boundary.name}-type">Condición</label>
                                    <select id="${boundary.name}-type" >
                                        <option>Valor fijo</option>
                                        <option>Gradiente nulo</option>
                                        <option>No-deslizamiento</option>
                                        <option>Vacío</option>
                                    </select>
                                </div>
                                <br>
                                <div class="input-data">
                                    <label for="${boundary.name}-wall">Funciones de pared</label>
                                    <select id="${boundary.name}-wall" >
                                        <option>Sí</option>
                                        <option>No</option>
                                    </select>
                                </div>
                            </div>
                        </div>`;
                } else if( boundary.type === 'empty' ) {
                    // document.getElementById('boundary-conditions').innerHTML += 
                    //     `<div id="${boundary.name}-data" class="walls-zero">
                    //         <h3 class="input-title">${capitalize(boundary.name)}</h3>
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

    if (turbulenceModels) {
        let turbulenceOptions = document.getElementById('turbulence-model');
        turbulenceOptions.innerHTML = `
            <option value="default">Seleccione...</option>`;

        for (model of turbulenceModels){
            turbulenceOptions.innerHTML += `
                <option value="${model.model}">${model.model}</option>`;
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
    } 

    let extraInputs = document.getElementById("forces-extra-inputs");

    if(coeffs && extraInputs.innerHTML == ''){ 
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
                <label for="rhoInf-data" class="long-label">Velocidad de flujo sin perturbar</label>
                <input class="short-input" type="text" id="rhoInf-data"/>
            </div>
            <div class="input-data">
                <label for="rhoInf-data" class="long-label">Longitud de referencia</label>
                <input class="short-input" type="text" id="rhoInf-data"/>
            </div>
            <div class="input-data">
                <label for="rhoInf-data" class="long-label">Área de referencia</label>
                <input class="short-input" type="text" id="rhoInf-data"/>
            </div>
            `;
    } else if (!coeffs){
        extraInputs.innerHTML = '';
    }

    if (!forces && !coeffs) {
        inputsOn.innerHTML = '';
    }
}

function vectorDirections(vectorName, value) {
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

async function variablesSchemes(turbulenceModel) {
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

    let variablesInputs = document.getElementById("fvSchemes-variables-inputs");

    if (variablesInputs.innerHTML != '') variablesInputs.innerHTML = '';

    if (turbulenceModel !== 'default') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel);

        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
        console.log('variables', variables);
    } 

    if(variables.length > 0) {
        for ( let variable of variables ) {
            let schemes = variable.schemes != null ? variable.schemes.split(',') : null;
            if(schemes != null && schemes.length > 0) {
                let newHTML = `
                    <p class="input-label">Esquemas para ${variable.name.toLowerCase()}</p>
                    <div class="data-container">`;
                
                if ( variable.schemes.indexOf('grad') != -1 ) {
                    newHTML += `
                        <div class="input-data">
                            <label for="grad-schema">Esquema para los gradientes</label>
                            <select id="grad-schema"> <!-- onchange="startTime(value)" -->
                                <option value="default">Predeterminado</option>
                                <option value="Linear">Lineal</option>
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
                            <label for="divergency-schema">Esquema para las divergencias</label>
                            <select id="divergency-schema"> <!-- onchange="startTime(value)" -->
                                <option value="default">Predeterminado</option>
                                <option value="Linear">Lineal</option>
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
                            <label for="laplacian-schema">Esquema para los laplacianos</label>
                            <select id="laplacian-schema"> <!-- onchange="startTime(value)" -->
                                <option value="default">Predeterminado</option>
                                <option value="Linear">Lineal</option>
                                <option value="gaussLinear">Gauss Lineal</option>
                                <option value="gaussLinearCell">Gauss Lineal limitado a las celdas</option>
                                <option value="gaussLinearFace">Gauss Lineal limitado a las caras</option>
                            </select>
                        </div>
                        <br>`;
                }
                
                if ( variable.schemes.indexOf('interp') != -1 ) {
                    newHTML += `
                        <div class="input-data">
                            <label for="interpolation-schema">Esquema de interpolación</label>
                            <select id="interpolation-schema"> <!-- onchange="startTime(value)" -->
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
                            <label for="secondGrad-schema">Gradientes de segundo orden</label>
                            <select id="secondGrad-schema"> <!-- onchange="startTime(value)" -->
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
                            <label for="wall-schema">Distribución de pared</label>
                            <select id="wall-schema"> <!-- onchange="startTime(value)" -->
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
    }
}

async function solverVariables(solver){
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

    if (variablesInputs.innerHTML != '') variablesInputs.innerHTML = '';
    if (solverInputs.innerHTML != '') solverInputs.innerHTML = '';
    if (relaxationInputs.innerHTML != '') relaxationInputs.innerHTML = '';

    if (solver !== 'default') {
        let newVariables = await getTurbulenceModelVariables(turbulenceModel.value);

        if(newVariables != null && newVariables.length > 0){
            for(let newVariable of newVariables){
                variables.push(newVariable);
            }
        }
        console.log('variables', variables);
        
        if(variables.length > 0) {
            solverVariablesData(variablesInputs, variables);
            solverData(solver, solverInputs, variables);
            residualControl(solverInputs, variables);
            relaxationData(relaxationInputs, variables);
        }
    } 
}

function solverVariablesData(variablesInputs, variables) {
    let newHTML = '';
    for ( let variable of variables ) {
        if(variable.type != null) {
            newHTML = `
                <p class="input-label">Parámetros para el solver de ${variable.name.toLowerCase()}</p>
                <div class="data-container">`;
            
            if ( variable.type === 'symmetric' ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema"> <!-- onchange="startTime(value)" -->
                            <option value="default">Seleccione...</option>
                            <option value="PCG">PCG</option>
                            <option value="PBiCG">PBiCG</option>
                            <option value="PBiCGStab">PBiCGStab</option>
                            <option value="GAMG">GAMG</option>
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                        <select id="${variable.variable}-preconditioner-schema"> <!-- onchange="startTime(value)" -->
                            <option value="default">Seleccione...</option>
                            <option value="DIC">DIC</option>
                            <option value="symGaussSeidel">Gauss-Seidel</option>
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
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Tolerancia</label>
                        <input class="long-input" type="text" id="${variable.variable}-smoother-data"/>
                    </div>
                    <br>`;
            } else if ( variable.type === 'asymmetric' ) {
            newHTML += `
                <div class="input-data">
                    <label for="${variable.variable}-solver-schema">Solver</label>
                    <select id="${variable.variable}-solver-schema"> <!-- onchange="startTime(value)" -->
                    <option value="default">Seleccione...</option>
                        <option value="smoothSolver">smoothSolver</option>
                        <option value="PCG">PCG</option>
                        <option value="PBiCGStab">PBiCGStab</option>
                        <option value="GAMG">GAMG</option>
                    </select>
                </div>
                <br>
                <div class="input-data">
                    <label for="${variable.variable}-preconditioner-schema">Preconditioner</label>
                    <select id="${variable.variable}-preconditioner-schema"> <!-- onchange="startTime(value)" -->
                        <option value="default">Seleccione...</option>
                        <option value="DILU">DILU</option>
                        <option value="GaussSeidel">Gauss-Seidel</option>
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
                    <input class="long-input" type="text" id="${variable.variable}-tolerance-data"/>
                </div>
                <br>
                <div class="input-data">
                    <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                    <input class="long-input" type="text" id="${variable.variable}-relTol-data"/>
                </div>
                <br>
                <div class="input-data">
                    <label for="${variable.variable}-smoother-data">Tolerancia</label>
                    <input class="long-input" type="text" id="${variable.variable}-smoother-data"/>
                </div>
                <br>`;
            }
            
            newHTML += '</div>';
            variablesInputs.innerHTML += newHTML;
        }
    }
}

function solverData(solver, solverInputs, variables){
    let newHTML = '';
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

function residualControl(solverInputs, variables) {
    let newHTML = `
        <p class="input-label">Control residual</p>
        <div class="data-container">`;

    for( let variable of variables ){
        newHTML += `
            <div class="input-data">
                <label for="${variable.variable}-residual-control">${variable.name}</label>
                <input class="long-input" id="${variable.variable}-residual-control"/>
            </div>
            <br>`;
    }

    newHTML += '</div>';
    solverInputs.innerHTML += newHTML;
}

function relaxationData(relaxationInputs, variables) {
    let newHTML = `
        <p class="input-label">Factores de relajación</p>
        <div class="data-container">
            <div class="input-data">
                <label for="general-relaxation">General</label>
                <input class="long-input" id="general-relaxation"/>
            </div>
            <br>`;
    
    for ( let variable of variables ) {
        newHTML += `
            <div class="input-data">
                <label for="${variable.variable}-relaxation">${variable.name}</label>
                <input class="long-input" id="${variable.variable}-relaxation"/>
            </div>
            <br>`;    
    }

    newHTML += '</div>';
    relaxationInputs.innerHTML += newHTML;
}