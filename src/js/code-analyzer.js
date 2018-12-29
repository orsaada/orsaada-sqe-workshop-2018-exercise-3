import * as esprima from 'esprima';
import * as flowchart from 'flowchart.js';

let estraverse = require('estraverse');
let escodegen = require('escodegen');
let graphString = '';
let blockCount = 1;
let arrows = [];
let blockNames = [];
let ifEvalTrue = [];

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc : true});
};

function mainAnalyzer(parsedCode){
    convertParsedToString(parsedCode,[],[],true);
    printCfgToScreen();
}

function convertParsedToString(parsedCode,connectTo,connectFrom,color){
    let isBlock = false;//,isIfTrue = false,isIfFalse = false, isWhile = false,isIf = false; // let blockCount = 1,whileNumber = 1,ifNumber = 1;
    parsedCode = estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'VariableDeclaration')
                isBlock = variableDeclarationStringConvert(node,isBlock,connectFrom,connectTo,color);
            if(node.type === 'ReturnStatement')
                isBlock = returnStringConvert(node,connectFrom,connectTo,color);
            if(node.type === 'IfStatement'){
                ifStringConvert(node,connectFrom,connectTo,color);
                isBlock = false;
                this.skip();
            }
            if(node.type === 'WhileStatement')
                isBlock = whileStringConvert(node,connectFrom,connectTo,color);
        }
    });
}

function variableDeclarationStringConvert(node,isBlock){
    if(!isBlock){
        let oldBlock = blockCount;
        blockCount++;
        let bool;
        arrows.push(oldBlock+bool+'->'+blockCount);
        arrows.push(oldBlock+'->'+blockCount);
        graphString = graphString.concat(blockCount+'=>operation:');
        isBlock = true;
    }
    graphString = graphString.concat(escodegen.generate(node)).concat('\n');
    return isBlock;
}

function returnStringConvert(node){
    //let name = 'op'+blockNumber;
    let oldBlock = blockCount;
    blockCount++;
    arrows.push(oldBlock|+'->'+blockCount);
    graphString = graphString.concat(blockCount + '=>operation:'+escodegen.generate(node));
    return false;
}

function whileStringConvert(node){
    //let name1 = 'op'+whileNumber;
    let oldBlock = blockCount;
    graphString = graphString.concat(oldBlock+'=>operation: NULL');
    blockCount++;
    // let name2 = 'cond'+blockCount;
    //whileNumber++;
    graphString = graphString.concat(oldBlock+'->'+blockCount);
    graphString = graphString.concat(blockCount+'=>condition:' + escodegen.generate(node.test)+'\n');
    blockCount++;
    return false;
}

let counterIfConverter = 0;

function ifStringConvert(node){
    counterIfConverter++;
    graphString = graphString.concat(blockCount+'=>condition:'+ escodegen.generate(node.test) + '\n');
    let colorTrue = false,colorFalse = false;
    ifEvalTrue.includes(counterIfConverter) ? colorTrue = true : colorFalse =true;
    convertParsedToString(node.consequent, [],blockCount, colorTrue);
    convertParsedToString(node.alternate, [],blockCount,colorFalse);
    blockCount++;
    return false;
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

export {parseCode,symbolic_sub, evaluateCode, params_values,convertParsedToString,mainAnalyzer,setValues};























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
        'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
        'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
        'future' : { 'fill' : '#FFFF99'},
        'request' : { 'fill' : 'blue'},
        'invalid': {'fill' : '#444444'},
        'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
        'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
    }
};
