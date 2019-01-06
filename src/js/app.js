import $ from 'jquery';
import {getAllString,parseCode,mainAnalyzer,escodegen,symbolic_sub,evaluateCode,setValues} from './code-analyzer';
import * as flowchart from 'flowchart.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let parameters = $('#parameters').val();
        let arrayParams = params_handle(parameters);
        setValues(arrayParams);
        parsedCode = symbolic_sub(parsedCode);
        let codeAfterSub = escodegen.generate(parsedCode);
        evaluateCode(parseCode(codeAfterSub),[]);
        mainAnalyzer(parseCode(codeToParse));
        let allString = getAllString();
        printCfgToScreen(allString);
    });
});

function params_handle(parameters){
    let parsedParams = parseCode(parameters);
    let arrayParams = parsedParams.body;
    if(arrayParams.length >0)
        arrayParams = arrayParams[0].expression;
    if(arrayParams.hasOwnProperty('expressions'))
        arrayParams = arrayParams.expressions;
    return arrayParams;
}

function printCfgToScreen(allString){
    let diagram = flowchart.parse(allString);
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
    'flowstate' : {
        'F' : { 'fill' : '#ffffff', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
        'T' : { 'fill' : '#70c48e', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
    }
};

export {printCfgToScreen};