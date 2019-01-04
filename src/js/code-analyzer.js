import * as esprima from 'esprima';
import * as flowchart from 'flowchart.js';

let estraverse = require('estraverse');
let escodegen = require('escodegen');
let graphString = '';
let blockCount = 1;
let ifEvalTrue = [];
let ifCounter =1;
let arrowString = '', whileCounter = 1;
let nameOfBlocks = [], indexer = 0, returnCounter =1;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc : true});
};

function mainAnalyzer(parsedCode){
    //body_manual(parsedCode.body[0].body.body,true); // first iteration
    firstIteration(parsedCode,true,false);
    console.log(ifEvalTrue);
    console.log(graphString);
    console.log(nameOfBlocks);
    remove_unnecessary_strings(graphString);
    console.log(graphString);
    secondIteration(parsedCode,false,false,false);
    console.log(arrowString);
    graphString = graphString.concat('\n').concat(arrowString);
    printCfgToScreen();
}

let numbers =0;

function takeNumber(){
    return '     <'+(++numbers)+'>\n';
}

function firstIteration(parsedCode,boolColor,isBlock){
    if(parsedCode == null)
        return;
    parsedCode = estraverse.replace(parsedCode, {
        enter: function (node,parent) {
            if ((node.type === 'VariableDeclaration' || node.type === 'ExpressionStatement')) {
                if (!isBlock) {
                    getColorString(boolColor);
                    graphString = graphString.concat('op' + blockCount + '=>operation: '+takeNumber());
                    nameOfBlocks.push('op'+blockCount);
                    blockCount++;
                    isBlock = true;
                }
                graphString = graphString.concat(escodegen.generate(node) + '\n');
            }
            if (node.type === 'IfStatement') {
                if(isBlock){
                    graphString = graphString.concat(getColorString(boolColor));
                    isBlock = false;
                }
                let exitCounter = ifCounter;
                graphString = graphString.concat('if' + (ifCounter++) + '=>condition: '+takeNumber() + escodegen.generate(node.test) + getColorString(boolColor)+'\n');
                nameOfBlocks.push('if' + (exitCounter));
                let a = boolColor && ifEvalTrue.includes(ifCounter-1);
                let b = boolColor && !ifEvalTrue.includes(ifCounter-1);
                let savedIfCounter = ifCounter;
                firstIteration(node.consequent, boolColor && ifEvalTrue.includes(ifCounter-1),false);
                firstIteration(node.alternate, boolColor && !ifEvalTrue.includes(savedIfCounter-1),false);
                if (parent !== null && parent.type === 'BlockStatement' && parent.body.length > 1) {
                    graphString = graphString.concat('ifExit' + (exitCounter) + '=>start: \n' + getColorString(boolColor));
                    nameOfBlocks.push('ifExit' + (exitCounter));
                }
                this.skip();
            }
            else if (node.type === 'WhileStatement') {
                if(isBlock){
                    graphString = graphString.concat(getColorString(boolColor));
                    isBlock = false;
                }
                graphString = graphString.concat('whileExit' + (whileCounter) + '=>operation: '+ takeNumber()+'NULL' + getColorString(boolColor)+'\n');
                nameOfBlocks.push('whileExit' + (whileCounter));
                nameOfBlocks.push('while' + (whileCounter));
                graphString = graphString.concat('while' + (whileCounter++) + '=>condition: ' + escodegen.generate(node.test) + getColorString(boolColor));
                firstIteration(node.body, boolColor,false);
                this.skip();
            }
            if (node.type === 'ReturnStatement') {
                if(isBlock){
                    graphString = graphString.concat(getColorString(boolColor));
                    isBlock = false;
                }
                graphString = graphString.concat('return' + (returnCounter) + '=>operation: '+takeNumber() + escodegen.generate(node) + getColorString(boolColor));
                nameOfBlocks.push('return' + (returnCounter++));
            }
        }
    });
    if(isBlock) {
        graphString = graphString.concat(getColorString(boolColor));
    }
}

function secondIteration(parsedCode,isBlock,isIfExit,isWhileExit){
    if(parsedCode == null) // probably problem
        return;
    parsedCode = estraverse.replace(parsedCode, {
        enter: function (node) {
            if(nameOfBlocks[indexer].includes('ifExit')){
                addArrow(nameOfBlocks[indexer],nameOfBlocks[++indexer]);
            }
            if (node.type === 'BlockStatement') {
                for (let i = 0; i < node.body.length; i++) {
                    if((node.body[i].type === 'VariableDeclaration' || node.body[i].type === 'ExpressionStatement') && !isBlock ){
                        if(!isBlock){
                            isBlock = true;
                            indexer++;
                        }
                    }
                    if(node.body[i].type === 'IfStatement'){
                        if(isBlock === true){
                            addArrow(nameOfBlocks[indexer-1],nameOfBlocks[indexer]);
                            isBlock = false;
                        }
                        let index1= indexer;
                        addArrow(nameOfBlocks[indexer]+'(yes)',nameOfBlocks[indexer+1]);

                        indexer++;
                        secondIteration(node.body[i].consequent,false,true,false);
                        addArrow(nameOfBlocks[index1]+'(no)',nameOfBlocks[indexer]);
                        secondIteration(node.body[i].alternate,false,true,false);
                        this.skip();
                    }
                    else if(node.body[i].type === 'WhileStatement'){
                        if(isBlock === true){
                            addArrow(nameOfBlocks[indexer-1],nameOfBlocks[indexer]);
                            isBlock = false;
                        }
                        let indexNull = indexer;
                        addArrow(nameOfBlocks[indexer],nameOfBlocks[++indexer]);
                        let whileIndex = indexer;
                        addArrow(nameOfBlocks[indexer]+'(yes)', nameOfBlocks[++indexer]);
                        secondIteration(node.body[i].body,false,false,true);
                        addArrow(nameOfBlocks[whileIndex]+'(no)',nameOfBlocks[indexer]);
                        isBlock = false;
                    }
                    else if(node.body[i].type === 'ReturnStatement'){
                        if(!arrowString.includes('return'))
                            addReturnArrow(indexer);
                        indexer++;
                    }
                }
                this.skip();
            }
            if(node.type === 'IfStatement'){
                secondIteration({type:'BlockStatement',body:[node]},false,isIfExit,isWhileExit);
                this.skip();
            }
            if(node.type === 'WhileStatement'){
                secondIteration({type:'BlockStatement',body:[node]},false,isIfExit,isWhileExit);
                this.skip();
            }
        }
    });
    if(isIfExit && !nameOfBlocks[indexer-1].includes('if')){
        addArrow(nameOfBlocks[indexer-1],findIfExit(indexer));
    }
    if(isWhileExit && !nameOfBlocks[indexer-1].includes('if')){
        addArrow(nameOfBlocks[indexer-1],findWhileExit(indexer));
    }
}

function remove_unnecessary_strings(){
    graphString = graphString.replace(/;/g,'');
    graphString = graphString.replace(/let /g,'');
}

function addArrow(from,to){
    arrowString = arrowString.concat(from+'->'+to +'\n');
}

function getColorString(boolColor){
    if(boolColor)
        return ('|T\n');
    return ('|F\n');
}

function copy_array(table){
    let newTable = [];
    for(let i=0;i<table.length;++i){
        newTable.push({name: table[i].name ,content: table[i].content});
    }
    return newTable;
}

let params = [], values = [],params_values = [];

function setValues(inputValues){
    values = inputValues;
}

function symbolic_sub(parsedCode){ //main symbolic subtitution (global and function)
    let func = null,table = [];
    estraverse.traverse(parsedCode, {
        enter: function (node) {
            if (node.type === 'FunctionDeclaration'){
                func = node;
                this.skip();
            }
            if(node.type === 'VariableDeclaration'){
                sub_variable_declaration_handle(node,table);
                this.remove();
            }
        }
    });
    intialize_parameters(func);
    return inside_function_sub(func ,table);
}

function intialize_parameters(func){
    params_values = [];
    params = func.params;
    for(let i = 0; i < params.length ;++i)
        params_values.push({name: params[i].name,content: values[i]});
}

function inside_function_sub(parsedCode,table){
    parsedCode = estraverse.replace(parsedCode, {
        enter: function (node) {
            if(sub_expression_handle(node,table))
                this.remove();
            if(node.type === 'VariableDeclaration'){
                sub_variable_declaration_handle(node,table);
                this.remove();
            }
            if(node.type === 'ReturnStatement'){
                sub_return_handle(node,table);
            }
            if(node.type === 'IfStatement')
                sub_if_handle(node,table);
        }
    });
    return parsedCode;
}

function sub_if_handle(tree,table){
    estraverse.replace(tree.test, {
        enter: function (node) {
            if(node.type ==='Identifier' && !isParam(node)){
                let found = contains(node,table);
                return table[found].content;
            }
        },
    });
    inside_function_sub(tree.consequent, copy_array(table));
    if(tree.alternate !== null)
        inside_function_sub(tree.alternate,copy_array(table));
}

function sub_expression_handle(node,table){
    return node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' &&
        assignment_handle(node.expression, table);
}

function sub_variable_declaration_handle(node,table){
    for(let i=0;i<node.declarations.length;i++)
        sub_variable_declrator_handle(node.declarations[i], table);
}

function sub_variable_declrator_handle(tree,table){
    tree.init = estraverse.replace(tree.init, {
        enter: function (node) {
            if (node !== null && node.type === 'Identifier'){
                let found = contains(node,table);
                if(!isParam(node) && found > -1) {
                    return table[found].content;
                }
            }
        },
    });
    table.push({name: tree.id.name, content: tree.init});
}

function contains(node, table){
    let name;
    if(node.type === 'MemberExpression'){
        name = node.object.name;
    }
    else{ //node.type === 'Identifier'
        name = node.name;
    }
    let found = -1;
    for(let i =0;i<table.length;++i){
        if(table[i].name === name) {
            return i;
        }
    }
    return found;
}

function isParam(node){
    let name;
    if(node.type === 'MemberExpression'){
        name = node.object.name;
    }
    else
        name = node.name;
    for(let i =0;i<params_values.length;++i){
        if(params_values[i].name === name)
            return true;
    }
    return false;
}

function assignment_handle(tree,table){
    tree.right = estraverse.replace(tree.right, {
        enter: function (node) {
            if (node.type === 'Identifier'){
                let found =contains(node,table);
                if(found > -1)
                    return table[found].content;
            }
        },
    });
    add_to_table(tree,table);
    return add_to_params(tree);
}

function add_to_table(tree,table){
    let index = contains(tree.left, table);
    if(index > -1){
        let found = contains(tree.left,table);
        if(table[found].content!== null && table[found].content.type === 'ArrayExpression'){
            let array = table[found].content;
            array.elements[tree.left.property.value] = tree.right;
        }
        else
            table[found].content = tree.right;
    }
    else{
        table.push({name: tree.left.name ,content: tree.right});
    }
}

function add_to_params(tree){
    if(isParam(tree.left)){
        let paramIndex = getParamIndex(tree.left);
        if(params_values[paramIndex].content!== null && params_values[paramIndex].content.type === 'ArrayExpression') {
            let array = params_values[paramIndex].content;
            array.elements[tree.left.property.value] = tree.right;
        }
        else
            params_values[paramIndex].content = tree.right;
        return false;
    }
    return true;
}

function sub_return_handle(tree,table){
    estraverse.replace(tree , {
        enter: function (node) {
            if(node.type ==='Identifier' && !isParam(node)){
                let found = contains(node,table);
                return table[found].content;
            }
        }
    });
}

function evaluateCode(parsedCode,linesColor){
    let ifCounter = 0;
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'Identifier'){
                let index = getParamIndex(node);
                if(index > -1)
                    return params_values[index].content;
            }
        }
    });
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'IfStatement'){
                let x = eval(escodegen.generate(node.test));
                ifCounter++;
                x ? ifEvalTrue.push(ifCounter) : nothin();
                x ? linesColor.push({line : node.test.loc.start.line -1,color: 'green'}) : linesColor.push({line : node.test.loc.start.line -1,color: 'red'});
            }
        }
    });
    return linesColor;
}

function nothin(){
}

function getParamIndex(node){
    let name;
    if(node.type === 'MemberExpression')
        name = node.object.name;
    else
        name = node.name;
    for(let i =0;i<params_values.length;++i){
        if(name === params_values[i].name)
            return i;
    }
    return -1;
}

export {parseCode,symbolic_sub, evaluateCode, params_values,mainAnalyzer,setValues,escodegen};

function printCfgToScreen(){
    let diagram = flowchart.parse(graphString);
    diagram.drawSVG('diagram', options);
}

const options = {
    'x': 0,
    'y': 0,
    'line-width': 3,
    'line-length': 50,
    'text-margin': 10,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': 'yes',
    'no-text': 'no',
    'arrow-end': 'block',
    'scale': 1,
    // style symbol types
    'symbols': {
        'start': {
            'font-color': 'red',
            'element-color': 'green',
            'fill': 'yellow'
        },
        'end':{
            'class': 'end-element'
        }
    },
    // even flowstate support ;-)
    'flowstate' : {
        //'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
        // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
        // 'future' : { 'fill' : '#FFFF99'},
        //  'request' : { 'fill' : 'blue'},
        'F' : { 'fill' : '#ffffff', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
        'T' : { 'fill' : '#70c48e', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
        // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
    }
};

function addReturnArrow(indexo){
    for(let i =indexo;i<nameOfBlocks.length;i++){
        if(nameOfBlocks[i].includes('return'))
            addArrow(nameOfBlocks[i-1],nameOfBlocks[i]);
    }
}
function findIfExit(indexo){
    for(let i =indexo;i<nameOfBlocks.length;i++){
        if(nameOfBlocks[i].includes('ifExit'))
            return nameOfBlocks[i];
    }
}

function findWhileExit(indexo){
    for(let i =indexo;i>=0;i--){
        if(nameOfBlocks[i].includes('whileExit'))
            return nameOfBlocks[i];
    }
}