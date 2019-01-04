import $ from 'jquery';
import {parseCode,mainAnalyzer,escodegen,symbolic_sub,evaluateCode,setValues} from './code-analyzer';

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