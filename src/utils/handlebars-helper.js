'use strict'

/**
 * compare
 * Compares a variable with a value
 * Usage: {{#compare variable "operator" "value"}} ... {{else}} ... {{/compare}}
 * Example: {{#compare role "==" "sender"}} ... {{else}} ... {{/compare}}
 */
Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = '===';
    }

    operators = {
        '===': function (l, r) { return l === r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l === r; },
        'notContained': function (l, r) { return !operators['contained'](l,r);},
        'contained': function (l, r) {
            var result = false;
            if ( l && r && l.length > 0 && r.length > 0 ){
                var lVal;
                if (typeof(l) === 'string'){
                    lVal = l.split(',');
                } else {
                    lVal = l;
                }

                var rVal;
                if (typeof(r) === 'string'){
                    rVal = r.split(',');
                } else {
                    rVal = r;
                }

                for (var i=0; i<lVal.length && !result; i+1) {
                    for (var j=0; j<rVal.length && !result; j+1) {
                        result = lVal[i] === rVal[j];
                    }
                }
            }
            return result;
        }
    };

    if (!operators[operator]) {
        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

/**
 * util
 * Return value of util variables
 * Usage:   {{#util variable}}
 *          {{#util module.variable}}
 * Example: {{#util device}}
 *          {{#util questions.userType}}
 */
Handlebars.registerHelper('util', function(scope, key) {
    if (!scope) {throw new Error('Must specify scope');}
    if (!key) {throw new Error('Must specify key');}

    return MorfifyApp.Utils[scope][key];
});

/**
 * ifThenElseThat
 * Compares a variable with a value
 * Usage: {{#ifThenElseThat variable param1 param2 }}
 * Example: {{#ifThenElseThat size.lenght "classOk" "classNOOK"}}
 */
Handlebars.registerHelper('ifThenElseThat', function () {
    if (arguments.length < 2) {
        throw new Error('Handlerbars Helper "ifThenElseThat" needs at least 2 parameter');
    }

    if ( arguments[0] ) {
        return arguments[1];
    } else if (arguments.length > 2) {
        return arguments[2];
    }
    return '';
});

/**
 * debug
 * Show context and variable data
 * Usage: {{#debug [variable]}}
 * Example: {{#debug}}
 *          {{#debug variable}}
 */
Handlebars.registerHelper('debug', function(optionalValue) {
  console.log('Current Context');
  console.log('====================');
  console.log(this);

  if (optionalValue) {
    console.log('Value');
    console.log('====================');
    console.log(optionalValue);
  }
});
