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
    let inputsOn = document.getElementById("forces-inputs");

    if ((forces || coeffs) && inputsOn.innerHTML == '') {
        inputsOn.innerHTML += 
            `<p class="input-title">Datos para el cálculo de fuerzas</p>
            <div class="data-container">
                <div class="input-data">
                    <label for="rhoInf-data">Densidad aguas arriba</label>
                    <input type="text" id="rhoInf-data"/>
                </div>
                <br>
                <p>Centro de rotación (m)</p>
                <div class="input-data">
                    <label for="CofRX-data">Eje X</label>
                    <input type="text" id="CofRX-data"/>
                    <label for="CofRY-data">Eje Y</label>
                    <input type="text" id="CofRY-data"/>
                    <label for="CofRZ-data">Eje Z</label>
                    <input type="text" id="CofRZ-data"/>
                </div>
                <div id="forces-extra-inputs"></div>
            </div>`;
    } 

    let extraInputs = document.getElementById("forces-extra-inputs");

    if(coeffs && extraInputs.innerHTML == ''){ 
        extraInputs.innerHTML +=
            `<label>Direccion vector unitario de sustentación</label>
            <select id="lift-option" onchange="vectorDirections('lift', value)">
                <option value="X">Eje X</option>
                <option value="Y">Eje Y</option>
                <option value="Z">Eje Z</option>
                <option value="unitVector">Definir vector</option>
            </select>
            <div id="lift-vector" class="input-data"></div>
            <br>
            <label>Direccion vector unitario de resistencia aerodinámica</label>
            <select id="drag-option" onchange="vectorDirections('drag', value)">
                <option value="X">Eje X</option>
                <option value="Y">Eje Y</option>
                <option value="Z">Eje Z</option>
                <option value="unitVector">Definir vector</option>
            </select>
            <div id="drag-vector" class="input-data"></div>
            <br>
            <label>Direccion vector unitario de eje de cabeceo</label>
            <select id="pitch-option" onchange="vectorDirections('pitch', value)">
                <option value="X">Eje X</option>
                <option value="Y">Eje Y</option>
                <option value="Z">Eje Z</option>
                <option value="unitVector">Definir vector</option>
            </select>
            <div id="pitch-vector" class="input-data"></div>
            <br>
            <div class="input-data">
                <label for="rhoInf-data">Velocidad de flujo sin perturbar</label>
                <input type="text" id="rhoInf-data"/>
            </div>
            <br>
            <div class="input-data">
                <label for="rhoInf-data">Longitud de referencia</label>
                <input type="text" id="rhoInf-data"/>
            </div>
            <br>
            <div class="input-data">
                <label for="rhoInf-data">Área de referencia</label>
                <input type="text" id="rhoInf-data"/>
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
        vector.innerHTML = `
            <label for="${vectorName}X-data">Eje X</label>
            <input type="text" id="${vectorName}X-data"/>
            <label for="${vectorName}Y-data">Eje Y</label>
            <input type="text" id="${vectorName}Y-data"/>
            <label for="${vectorName}Z-data">Eje Z</label>
            <input type="text" id="${vectorName}Z-data"/>`;
    } else {
        vector.innerHTML = '';
    }
}

function variablesSchemes(turbulenceModel) {
    // TODO: We have to look for turbulenceModel needs at python. 
    let variables = [];
    let variablesInputs = document.getElementById("fvSchemes-variables-inputs");

    if (variablesInputs.innerHTML != '') variablesInputs.innerHTML = '';

    if (turbulenceModel !== 'default') {
        variables = [
            {
                name: 'presión',
                variable: 'p',
                type: 'asymmetric',
                schemes: ['grad' ]
            },
            {
                name: 'velocidad',
                variable: 'U',
                type: 'symmetric',
                schemes: ['grad', 'div']
            },
            {
                name: 'nut',
                variable: 'nut',
                type: 'asymmetric',
                schemes: []
            },
            {
                name: 'nuTilda',
                variable: 'nuTilda',
                type: 'asymmetric',
                schemes: ['grad', 'div']
            }
        ]
    } 

    if(variables.length > 0) {
        for ( let variable of variables ) {
            if(variable.schemes.length > 0) {
                let newHTML = `
                    <p class="input-label">Esquemas para ${variable.name.toLowerCase()}</p>
                    <div class="data-container">`;
                
                if ( variable.schemes.indexOf('grad') != -1 ) {
                    newHTML += `
                        <div class="input-data">
                            <label for="grad-schema">Esquema para los gradientes</label>
                            <select id="grad-schema"> <!-- onchange="startTime(value)" -->
                                <option value="default">Seleccione...</option>
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
                                <option value="default">Seleccione...</option>
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
                                <option value="default">Seleccione...</option>
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
                                <option value="default">Seleccione...</option>
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
                                <option value="default">Seleccione...</option>
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
                                <option value="default">Seleccione...</option>
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

function solverVariables(solver){
    // TODO: We have to look for turbulenceModel needs at python. 
    let variables = [];
    let solverInputs = document.getElementById("fvSolution-variables-inputs");
    const variablesInputs = document.getElementById("turbulence-model");
    console.log('variablesInputs', variablesInputs);

    if (solverInputs.innerHTML != '') solverInputs.innerHTML = '';

    if (solver !== 'default') {
        variables = [
            {
                name: 'presión',
                variable: 'p',
                type: 'asymmetric',
                schemes: ['grad' ]
            },
            {
                name: 'velocidad',
                variable: 'U',
                type: 'symmetric',
                schemes: ['grad', 'div']
            },
            {
                name: 'nut',
                variable: 'nut',
                type: 'asymmetric',
                schemes: []
            },
            {
                name: 'nuTilda',
                variable: 'nuTilda',
                type: 'asymmetric',
                schemes: ['grad', 'div']
            }
        ]
    } 

    if(variables.length > 0) {
        for ( let variable of variables ) {
            let newHTML = `
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
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input type="text" id="${variable.variable}-tolerance-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input type="text" id="${variable.variable}-relTol-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Tolerancia</label>
                        <input type="text" id="${variable.variable}-smoother-data"/>
                    </div>
                    <br>`;
            } else if ( variable.type === 'asymmetric' ) {
                newHTML += `
                    <div class="input-data">
                        <label for="${variable.variable}-solver-schema">Solver</label>
                        <select id="${variable.variable}-solver-schema"> <!-- onchange="startTime(value)" -->
                            <option value="default">Seleccione...</option>
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
                        </select>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-sweeps-data">nSweeps</label>
                        <input type="text" id="${variable.variable}-sweeps-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-tolerance-data">Tolerancia</label>
                        <input type="text" id="${variable.variable}-tolerance-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-relTol-data">Tolerancia relativa</label>
                        <input type="text" id="${variable.variable}-relTol-data"/>
                    </div>
                    <br>
                    <div class="input-data">
                        <label for="${variable.variable}-smoother-data">Tolerancia</label>
                        <input type="text" id="${variable.variable}-smoother-data"/>
                    </div>
                    <br>`;
            }
                
            newHTML += '</div>';

            solverInputs.innerHTML += newHTML;
        }
    }
}