import * as esprima from 'esprima';

let estraverse = require('estraverse');
let escodegen = require('escodegen');
let blockCount = 1,ifCounter =1, whileCounter = 1;
let ifEvalTrue = [];
let arrowString = '',graphString = '',allString = '';
let nameOfBlocks = [], indexer = 0, returnCounter =1;
let numbers = 0;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc : true});
};

function mainAnalyzer(parsedCode){
    arrowString = ''; graphString = '';indexer = 0; nameOfBlocks = [];
    returnCounter =1; ifCounter = 1; blockCount =1 ; numbers = 0; whileCounter =1;
    firstIteration(parsedCode,true,false); //graph string handler
    remove_unnecessary_strings(graphString);
    console.log(graphString);
    secondIteration(parsedCode,false,false,false); //arrow string handler
    console.log(arrowString);
    allString = graphString.concat('\n').concat(arrowString);
    //   printCfgToScreen(graphString);
}

function takeNumber(){
    return '     <'+(++numbers)+'>\n';
}

function firstIteration(parsedCode,boolColor,isBlock){
    if(parsedCode == null)
        return;
    estraverse.replace(parsedCode, {
        enter: function (node,parent) {
            isBlock = checkOperationAndReturn_firstIteration(node,boolColor,isBlock);
            if (node.type === 'IfStatement') {
                boolColor = if_firstIteration(node,isBlock,boolColor,parent);
                isBlock = false;
                this.skip();
            }
            if (node.type === 'WhileStatement') {
                while_firstIteration(node,isBlock,boolColor);
                isBlock = false;
                this.skip();
            }
        }
    });
    isBlock ? graphString = graphString.concat(getColorString(boolColor)) : nothin();
}

function checkOperationAndReturn_firstIteration(node,boolColor,isBlock){
    if ((node.type === 'VariableDeclaration' || node.type === 'ExpressionStatement')) {
        isBlock = operation_firstIteraion(node, isBlock,boolColor);
    }
    if (node.type === 'ReturnStatement') {
        return_firstIteration(node,isBlock,boolColor);
        isBlock = false;
    }
    return isBlock;
}

function return_firstIteration(node,isBlock,boolColor){
    if(isBlock){
        graphString = graphString.concat(getColorString(boolColor));
    }
    graphString = graphString.concat('return' + (returnCounter) + '=>operation: '+takeNumber() + escodegen.generate(node) + getColorString(boolColor));
    nameOfBlocks.push('return' + (returnCounter++));
}

function operation_firstIteraion(node, isBlock,boolColor){
    if (!isBlock) {
        getColorString(boolColor);
        graphString = graphString.concat('op' + blockCount + '=>operation: '+takeNumber());
        nameOfBlocks.push('op'+blockCount);
        blockCount++;
        isBlock = true;
    }
    graphString = graphString.concat(escodegen.generate(node) + '\n');
    return isBlock;
}

function if_firstIteration(node,isBlock,boolColor,parent){
    if(isBlock)
        graphString = graphString.concat(getColorString(boolColor));
    let exitCounter = ifCounter;
    graphString = graphString.concat('if' + (ifCounter++) + '=>condition: '+takeNumber() + escodegen.generate(node.test) + getColorString(boolColor)+'\n');
    nameOfBlocks.push('if' + (exitCounter));
    let savedIfCounter = ifCounter;
    let savedBoolColor = boolColor;
    firstIteration(node.consequent, boolColor && ifEvalTrue.includes(ifCounter-1),false);
    firstIteration(node.alternate, savedBoolColor && !ifEvalTrue.includes(savedIfCounter-1),false);
    if_firstIteration_CheckParent(exitCounter,parent,savedBoolColor);
    return savedBoolColor;
}

function if_firstIteration_CheckParent(exitCounter,parent,boolColor){
    if (parent !== null && parent.type === 'BlockStatement' && parent.body.length > 1) {
        graphString = graphString.concat('ifExit' + (exitCounter) + '=>start: \n' + getColorString(boolColor));
        nameOfBlocks.push('ifExit' + (exitCounter));
    }
}

function while_firstIteration(node,isBlock,boolColor){
    if(isBlock)
        graphString = graphString.concat(getColorString(boolColor));
    graphString = graphString.concat('whileExit' + (whileCounter) + '=>operation: '+ takeNumber()+'NULL' + getColorString(boolColor)+'\n');
    nameOfBlocks.push('whileExit' + (whileCounter));
    nameOfBlocks.push('while' + (whileCounter));
    graphString = graphString.concat('while' + (whileCounter++) + '=>condition: ' +takeNumber()+ escodegen.generate(node.test) + getColorString(boolColor));
    firstIteration(node.body, boolColor,false);
}

function block_secondIteration(node,isBlock){
    for (let i = 0; i < node.body.length; i++) {
        isBlock = blockCheckOperationAndReturn_secondIteration(node, isBlock, i);
        if(node.body[i].type === 'IfStatement'){
            isBlock = block_if_secondIteration(node,isBlock,i);
        }
        else if(node.body[i].type === 'WhileStatement'){
            block_while_secondIteration(node,isBlock,i);
            isBlock = false;
        }
    }
}

function blockCheckOperationAndReturn_secondIteration(node, isBlock, i){
    if((node.body[i].type === 'VariableDeclaration' || node.body[i].type === 'ExpressionStatement') && !isBlock ){
        isBlock = true;
        indexer++;
    }
    else if(node.body[i].type === 'ReturnStatement')
        block_return_secondIteration();
    return isBlock;
}

function block_return_secondIteration(){
    if(!arrowString.includes('return'))
        addReturnArrow(indexer);
    indexer++;
}

function block_while_secondIteration(node,isBlock,i){
    if(isBlock === true)
        addArrow(nameOfBlocks[indexer-1],nameOfBlocks[indexer]);
    addArrow(nameOfBlocks[indexer],nameOfBlocks[++indexer]);
    let whileIndex = indexer;
    addArrow(nameOfBlocks[indexer]+'(yes)', nameOfBlocks[++indexer]);
    secondIteration(node.body[i].body,false,false,true);
    addArrow(nameOfBlocks[whileIndex]+'(no)',nameOfBlocks[indexer]);
}

function block_if_secondIteration(node,isBlock,i){
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
    return isBlock;
}

function secondIteration(parsedCode,isBlock,isIfExit,isWhileExit){
    if(parsedCode == null) // probably problem
        return;
    estraverse.replace(parsedCode, {
        enter: function (node) {
            checkIfExitArrow_secondIteration();
            if (node.type === 'BlockStatement') {
                block_secondIteration(node,isBlock);
                this.skip();
            }
            if(node.type === 'IfStatement' || node.type === 'WhileStatement' || node.type === 'ReturnStatement'){
                secondIteration({type:'BlockStatement',body:[node]},false,isIfExit,isWhileExit);
                this.skip();
            }
        }
    });
    addExitArrows(isIfExit,isWhileExit);
}

function checkIfExitArrow_secondIteration(){
    if(indexer !== nameOfBlocks.length && nameOfBlocks[indexer].includes('ifExit'))
        addArrow(nameOfBlocks[indexer],nameOfBlocks[++indexer]);
}

function addExitArrows(isIfExit,isWhileExit){
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
    if(indexer >= nameOfBlocks.length){
        graphString = graphString.concat('end=>start:'+takeNumber()+ '|T');
        arrowString = arrowString.concat(from+'->end\n');
        return;
    }
    arrowString = arrowString.concat(from+'->'+to +'\n');
}

function getColorString(boolColor){
    if(boolColor)
        return ('|T\n');
    return ('|F\n');
}

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
        if(typeof nameOfBlocks[i] !== 'undefined' && nameOfBlocks[i].includes('whileExit'))
            return nameOfBlocks[i];
    }
}

function getAllString(){
    return allString;
}
function getGraphString(){
    return graphString;
}

function getArrowString(){
    return arrowString;
}

export {parseCode,symbolic_sub, evaluateCode,
    params_values,mainAnalyzer,setValues,escodegen,
    getAllString,getGraphString,getArrowString};

/////////////////////////////////////////////////////////////////////////////////////////
///////////////////////              Project 2:            //////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


let params = [], values = [],params_values = [];

function copy_array(table){
    let newTable = [];
    for(let i=0;i<table.length;++i){
        newTable.push({name: table[i].name ,content: table[i].content});
    }
    return newTable;
}

function setValues(inputValues){
    graphString = '';
    arrowString = '';
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

function replaceIdentifier_eval(parsedCode){
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'Identifier'){
                let index = getParamIndex(node);
                if(index > -1)
                    return params_values[index].content;
            }
        }
    });
}

function countIf_eval(parsedCode,linesColor){
    let ifCounts = 0;
    estraverse.replace(parsedCode, {
        enter: function (node) {
            if(node.type === 'IfStatement'){
                let x = eval(escodegen.generate(node.test));
                ifCounts++;
                x ? ifEvalTrue.push(ifCounts) : nothin();
                x ? linesColor.push({line : node.test.loc.start.line -1,color: 'green'}) : linesColor.push({line : node.test.loc.start.line -1,color: 'red'});
            }
        }
    });
}

function evaluateCode(parsedCode,linesColor){
    replaceIdentifier_eval(parsedCode);
    countIf_eval(parsedCode,linesColor);
    return linesColor;
}

function nothin(){}

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