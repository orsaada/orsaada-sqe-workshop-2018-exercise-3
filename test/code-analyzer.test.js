import assert from 'assert';
import {
    parseCode,
    mainAnalyzer,
    getGraphString,
    setValues, getArrowString,symbolic_sub,evaluateCode
} from '../src/js/code-analyzer';

describe('func_a', () => {
    it('is par function correctly', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_a_proj3));
        let graphString = getGraphString();
        let arrowString = getArrowString();
        assert.equal(
            graphString,
            func_a_proj3_blocks
        );
        assert.equal(
            arrowString,
            func_a_arrows
        );
    });
});

describe('func_b', () => {
    it('graph', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_b_proj3));
        let graphString = getGraphString();
        assert.equal(
            graphString, func_b_graph
        );
    });
});

describe('func_b', () => {
    it('arrows', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_b_proj3));
        let arrowString = getArrowString();
        assert.equal(
            arrowString, func_b_arrows
        );
    });
});

describe('func_c', () => {
    it('arrows', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_c_proj3));
        let arrowString = getArrowString();
        assert.equal(
            func_c_arrows, arrowString
        );
    });
    it('graph', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_c_proj3));
        let graphString = getGraphString();
        assert.equal(
            func_c_graph, graphString
        );
    });
});

describe('func_d', () => {
    it('arrows', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_d_proj3));
        let arrowString = getArrowString();
        assert.equal(
            func_d_arrows, arrowString
        );
    });
    it('graph', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_d_proj3));
        let graphString = getGraphString();
        assert.equal(
            func_d_graph, graphString
        );
    });
});

describe('func_e', () => {
    it('arrows', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_e_proj3));
        let arrowString = getArrowString();
        assert.equal(
            func_e_arrows, arrowString
        );
    });
    it('graph', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_e_proj3));
        let graphString = getGraphString();
        assert.equal(
            func_e_graph, graphString
        );
    });
});

describe('func_f', () => {
    it('arrows', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_f_proj3));
        let arrowString = getArrowString();
        assert.equal(
            func_f_arrows, arrowString
        );
    });
    it('graph', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        mainAnalyzer(parseCode(func_f_proj3));
        let graphString = getGraphString();
        assert.equal(
            func_f_graph, graphString
        );
    });
});

let func_a_proj3 = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';

let func_a_proj3_blocks = 'op1=>operation:      <1>\n' +
    'a = x + 1\n' +
    'b = a + y\n' +
    'c = 0\n' +
    '|T\n' +
    'if1=>condition:      <2>\n' +
    'b < z|T\n' +
    '\n' +
    'op2=>operation:      <3>\n' +
    'c = c + 5\n' +
    '|F\n' +
    'if2=>condition:      <4>\n' +
    'b < z * 2|T\n' +
    '\n' +
    'op3=>operation:      <5>\n' +
    'c = c + x + 5\n' +
    '|F\n' +
    'op4=>operation:      <6>\n' +
    'c = c + z + 5\n' +
    '|T\n' +
    'ifExit1=>start: \n' +
    '|T\n' +
    'return1=>operation:      <7>\n' +
    'return c|T\n';

let func_a_arrows = 'op1->if1\n' +
    'if1(yes)->op2\n' +
    'op2->ifExit1\n' +
    'if1(no)->if2\n' +
    'if2(yes)->op3\n' +
    'op3->ifExit1\n' +
    'if2(no)->op4\n' +
    'op4->ifExit1\n' +
    'op4->ifExit1\n' +
    'op4->ifExit1\n' +
    'ifExit1->return1\n';

let func_b_proj3 = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = 2;\n' +
    '        if(c>3){\n' +
    '           c=8;\n' +
    '        }\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';

let func_b_graph = 'op1=>operation:      <1>\n' +
    'a = x + 1\n' +
    'b = a + y\n' +
    'c = 0\n' +
    '|T\n' +
    'if1=>condition:      <2>\n' +
    'b < z|T\n' +
    '\n' +
    'op2=>operation:      <3>\n' +
    'c = 2\n' +
    '|F\n' +
    'if2=>condition:      <4>\n' +
    'c > 3|F\n' +
    '\n' +
    'op3=>operation:      <5>\n' +
    'c = 8\n' +
    '|F\n' +
    'ifExit2=>start: \n' +
    '|F\n' +
    'if3=>condition:      <6>\n' +
    'b < z * 2|T\n' +
    '\n' +
    'op4=>operation:      <7>\n' +
    'c = c + x + 5\n' +
    '|F\n' +
    'op5=>operation:      <8>\n' +
    'c = c + z + 5\n' +
    '|T\n' +
    'ifExit1=>start: \n' +
    '|T\n' +
    'return1=>operation:      <9>\n' +
    'return c|T\n';
let func_b_arrows = 'op1->if1\nif1(yes)->op2\nop2->if2\nif2(yes)->op3\nop3->ifExit2\nif2(no)->ifExit2\n' +
    'op3->ifExit2\nif1(no)->ifExit2\nifExit2->if3\nif3(yes)->op4\nop4->ifExit1\nif3(no)->op5\nop5->ifExit1\n' +
    'op5->ifExit1\nop5->ifExit1\nifExit1->return1\n';

let func_c_proj3 = 'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n';

let func_c_graph = 'op1=>operation:      <1>\na = x + 1\nb = a + y\nc = 0\n|T\nwhileExit1=>operation:' +
    '      <2>\nNULL|T\n\nwhile1=>condition:      <3>\na < z|T\nop2=>operation:      <4>\nc = a + b\n' +
    'z = c * 2\na++\n|T\nreturn1=>operation:      <5>\nreturn z|T\n';
let func_c_arrows = 'op1->whileExit1\nwhileExit1->while1\nwhile1(yes)->op2\nop2->whileExit1\nwhile1(no)->return1\n';

let func_d_proj3 = 'function a(){\n' +
    '    let y =3;\n' +
    '    return y;\n' +
    '}';
let func_d_arrows = 'op1->return1\n';
let func_d_graph = 'op1=>operation:      <1>\n' +
    'y = 3\n' +
    '|T\n' +
    'return1=>operation:      <2>\n' +
    'return y|T\n';

let func_e_proj3 = 'function a(){\n' +
    '    let y =3;\n' +
    '    while(y>3){\n' +
    '         y=8;\n' +
    '    }\n' +
    '}';
let func_e_arrows = 'op1->whileExit1\nwhileExit1->while1\nwhile1(yes)->op2\nop2->end\nwhile1(no)->end\n';
let func_e_graph = 'op1=>operation:      <1>\ny = 3\n|T\nwhileExit1=>operation:    ' +
    '  <2>\nNULL|T\n\nwhile1=>condition:      <3>\ny > 3|T\nop2=>operation:     ' +
    ' <4>\ny = 8\n|T\nend=>start:     <5>\n|Tend=>start:     <6>\n|T';

let func_f_proj3 = 'function a(){\n' +
    '    while(y>3){\n' +
    '         y=8;\n' +
    '    }\n' +
    '}';
let func_f_arrows = 'whileExit1->while1\n' +
    'while1(yes)->op1\n' +
    'op1->end\n' +
    'while1(no)->end\n';
let func_f_graph = 'whileExit1=>operation:      <1>\nNULL|T\n\nwhile1=>condition:      <2>\ny > 3|T\nop1=>operation:      <3>\ny = 8\n|T\nend=>start:     <4>\n|Tend=>start:     <5>\n|T';

let escodegen = require('escodegen');

describe('func_a', () => {
    it('func_a_assignment', () => {
        let parsedCode = parseCode(func_a_assignment);
        let result = parseCode(func_a_assignment_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
    it('func_a_if', () => {
        let parsedCode = parseCode(func_a_if);
        let result = parseCode(func_a_if_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_a', () => {
    it('func_a_return', () => {
        let parsedCode = parseCode(func_a_return);
        let result = parseCode(func_a_return_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
    it('func_a_complete', () => {
        let parsedCode = parseCode(func_a);
        let result = parseCode(func_a_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_b', () => {
    it('func_b', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        let parsedCode = parseCode(func_b);
        let result = parseCode(func_b_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_c', () => {
    it('func_c_undefined_local', () => {
        let parsedCode = parseCode(func_c_undefined_local);
        let result = parseCode(func_c_undefined_local_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
    it('func_c_assignment_to_parameter', () => {
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        let parsedCode = parseCode(func_c_assignment_to_parameter);
        let result = parseCode(func_c_assignment_to_parameter_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_d', () => {
    it('func_d_global', () => {
        let parsedCode = parseCode(func_d_global);
        let result = parseCode(func_d_global_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('eval', () => {
    it('eval red-red', () => {
        let parsedCode = parseCode(func_a);
        let parsedParams = parseCode('3,2,1');
        setValues(parsedParams.body[0].expression.expressions);
        parsedCode = symbolic_sub(parsedCode);
        let codeAfterSub = escodegen.generate(parsedCode);
        let linesColor= evaluateCode(parseCode(codeAfterSub),[]);
        assert.equal(linesColor[0].color, 'red');
        assert.equal(linesColor[0].line, 1);
        assert.equal(linesColor[1].color, 'red');
        assert.equal(linesColor[1].line, 3);
    });

});

describe('eval', () => {
    it('eval red-green', () => {
        let parsedCode = parseCode(func_a);
        let parsedParams = parseCode('1,2,3');
        setValues(parsedParams.body[0].expression.expressions);
        parsedCode = symbolic_sub(parsedCode);
        let codeAfterSub = escodegen.generate(parsedCode);
        let linesColor= evaluateCode(parseCode(codeAfterSub),[]);
        for(let i = 0;i<linesColor.length ;i++){
            if(linesColor[i].line === 1){
                assert.equal(linesColor[i].color, 'red');
            }
            if(linesColor[i].line === 3){
                assert.equal(linesColor[i].color, 'green');
            }
        }
    });
});

describe('func_e', () => {
    it('func_a_assignment', () => {
        let parsedCode = parseCode(func_e);
        let result = parseCode(func_e_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });

    it('func_a_assignment', () => {
        let parsedCode = parseCode(func_e_assign_to_param);
        let result = parseCode(func_e_assign_to_param_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_f', () => {
    it('func f assignmentt wice', () => {
        let parsedCode = parseCode(func_f);
        let result = parseCode(func_f_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });

    it('global assign', () => {
        let parsedCode = parseCode(f_global_assign);
        let result = parseCode(f_global_assign_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_g', () => {
    it('func g', () => {
        let parsedCode = parseCode(func_g);
        let result = parseCode(func_g_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

describe('func_i', () => {
    it('func i', () => {
        let parsedCode = parseCode(func_i);
        let result = parseCode(func_i);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });

});

describe('func_h', () => {
    it('func h assignment to array', () => {
        let parsedParams = parseCode('[1,2,3,4],5,2');
        setValues(parsedParams.body[0].expression.expressions);
        let parsedCode = parseCode(func_h);
        let result = parseCode(func_h_result);
        assert.equal(escodegen.generate(symbolic_sub(parsedCode)),
            escodegen.generate(result)
        );
    });
});

let func_a_assignment = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '}\n';

let func_a_assignment_result = 'function foo(x, y, z){\n' +
    '}\n';

let func_a_if = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    }\n' +
    '}\n';

let func_a_if_result = 'function foo(x, y, z) {\n' +
    'if (x + 1 + y < z) {\n' +
    '}\n' +
    '}';

let func_a_return = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '        return x + y + z + c;\n' +
    '    }\n' +
    '}\n';

let func_a_return_result = 'function foo(x, y, z) {\n' +
    'if (x + 1 + y < z) {\n' +
    'return x + y + z + (0 + 5);\n' +
    '}\n' +
    '}';

let func_a = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '        return x + y + z + c;\n' +
    '    }\n' +
    '}';

let func_a_result = 'function foo(x, y, z) {\n' +
    'if (x + 1 + y < z) {\n' +
    'return x + y + z + (0 + 5);\n' +
    '} else if (x + 1 + y < z * 2) {\n' +
    'return x + y + z + (0 + x + 5);\n' +
    '} else {\n' +
    'return x + y + z + (0 + z + 5);\n' +
    '}\n' +
    '}';

let func_b = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    while (a < z) {\n' +
    '        c = a + b;\n' +
    '        z = c * 2;\n' +
    '    }\n' +
    '    \n' +
    '    return z;\n' +
    '}\n';

let func_b_result = 'function foo(x, y, z) {\n' +
    'while (a < z) {\n' +
    'z = (x + 1 + (x + 1 + y)) * 2;\n' +
    '}\n' +
    'return z;\n' +
    '}';

let func_c_undefined_local = 'function foo(x, y, z){\n' +
    '    let a;\n' +
    '    a=5;\n' +
    '}\n';

let func_c_undefined_local_result = 'function foo(x, y, z) {\n' +
    '}';

let func_c_assignment_to_parameter = 'function foo(x, y, z){\n' +
    '    let a =5,b=7;\n' +
    '    x = x+a;\n' +
    '}\n';

let func_c_assignment_to_parameter_result = 'function foo(x, y, z) {\n' +
    'x = x + 5;\n' +
    '}';

let func_d_global = 'let u=5;\n' +
    'function foo(x, y, z){\n' +
    '    let a = u;\n' +
    '    x=a;\n' +
    '}\n';

let func_d_global_result = 'function foo(x, y, z) {\n' +
    'x = 5;\n' +
    '}';

let func_e = 'function foo(x, y, z){\n' +
    '    x = x+6;\n' +
    '    let a = x+ 1;\n' +
    '   if(a>7){\n' +
    '}\n' +
    '}\n';

let func_e_result = 'function foo(x, y, z) {\n' +
    'x = x + 6;\n' +
    'if (x + 1 > 7) {\n' +
    '}\n' +
    '}';

let func_e_assign_to_param = 'function foo(x, y, z){\n' +
    '    x = x+6;\n' +
    '    let a = x+ 1;\n' +
    '    x=0;\n' +
    '   if(a>7){\n' +
    '}\n' +
    '}\n';

let func_e_assign_to_param_result = 'function foo(x, y, z) {\n' +
    'x = x + 6;\n' +
    'x = 0;\n' +
    'if (x + 1 > 7) {\n' +
    '}\n' +
    '}';

let func_f = 'function foo(x, y, z){\n' +
    '    let t=5;\n' +
    '    t=t+7;\n' +
    '}\n';

let func_f_result = 'function foo(x, y, z) {\n' +
    '}';

let f_global_assign = 'let t=5;\n' +
    'function foo(x, y, z){\n' +
    '    t=t+7;\n' +
    '}\n';

let f_global_assign_result = 'function foo(x, y, z) {\n' +
    '}';

let func_g = 'function foo(x, y, z){\n' +
    '    let a = [1, 2, 3];\n' +
    'a[0] = x;\n' +
    'a[1] = x[0];\n' +
    'a[2] = x[2];\n' +
    'return a;\n' +
    '}\n';

let func_g_result = 'function foo(x, y, z) {\n' +
    'return [x, x[0], x[2]];\n' +
    '}';

let func_h = 'function foo(x,y,z){\n' +
    '       x[2]=8;\n' +
    '       y = x[2];\n' +
    '       let a = x[2];\n' +
    '       if(a>7){\n' +
    '          \n' +
    '       }\n' +
    '}';

let func_h_result = 'function foo(x, y, z) {\n' +
    'x[2] = 8;\n' +
    'y = x[2];\n' +
    'if (x[2] > 7) {\n' +
    '}\n' +
    '}';

let func_i = 'function foo(x, y, z) {\n' +
    'if (x > 7) {}\n' +
    'else{}' +
    '}';