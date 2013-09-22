var isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var isString = function(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
};

var getCharArrayFromObject = function(obj) {
  return JSON.stringify(obj).split('').slice(1, -1);
};

var Token = {
  NAME: { vaue: 1, name: "NAME" },
  NUMBER: { vaue: 2, name: "NUMBER" },
  END: { vaue: 3, name: "END" },
  PRINT: { vaue: 4, name: "PRINT" },
  PLUS: { vaue: 5, name: "PLUS" },
  MINUS: { vaue: 6, name: "MINUS" },
  MUL: { vaue: 7, name: "MUL" },
  DIV: { vaue: 8, name: "DIV" },
  ASSIGN: { vaue: 9, name: "ASSIGN" },
  LP: { vaue: 10, name: "LP" },
  RP: { vaue: 11, name: "RP" },
  ZERO: { vaue: 12, name: "ZERO" }
};

var errorText = "";

var Calc = function () {
    this.currToken = Token.PRINT;
    this.charArray = [];
    this.index = 0;
    this.someValue = "";
  }

Calc.prototype.showError = function(errorMessage) {
  errorText = errorMessage;
};

Calc.prototype.getToken = function() {
  if(errorText != ""){
    return this.currToken = Token.END;
  }

  var ch = '';
  try {
    while (this.charArray[this.index] === " ") {
      this.index++;
    }
  } catch (error) {
    return this.currToken = Token.END;
  }

  if (this.index < this.charArray.length) {
    ch = this.charArray[this.index];
    this.index++;
  } else {
    return this.currToken = Token.END;
  }
  switch (ch) {
    case ';':
    case '\n':
    case '=':
      return this.currToken = Token.END;
    case '*':
      return this.currToken = Token.MUL;
    case '/':
      return this.currToken = Token.DIV;
    case '+':
      return this.currToken = Token.PLUS;
    case '-':
      return this.currToken = Token.MINUS;
    case '(':
      return this.currToken = Token.LP;
    case ')':
      return this.currToken = Token.RP;
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '.':
      this.someValue += ch;
      try {
        while (isNumber(this.charArray[this.index]) || this.charArray[this.index] === '.') {
          this.someValue += this.charArray[this.index];
          this.index++;
        }
        return this.currToken = Token.NUMBER;
      } catch (_error) {
        e = _error;
        return this.currToken = Token.END;
      }
      break;
/*add logic for trigonometric*/
    default:
      if (isString(ch)) {
        this.someValue += ch;
        while (isString(this.charArray[this.index])) {
          this.someValue += this.charArray[this.index];
          this.index++;
        }
        return this.currToken = Token.NAME;
      }

      this.showError('nepravilanaya leksema (' + ch + ')');
      return this.currToken = Token.END;
  }
};

Calc.prototype.prim = function(get) {
  if (get) {
    this.getToken();
  }
  switch (this.currToken) {
    case Token.NUMBER:
      var nmb = parseFloat(this.someValue);
      this.someValue = '';
      this.getToken();
      return nmb;
    case Token.NAME:
      return '';
    case Token.MINUS:
      return -this.prim(true);
    case Token.LP:
      var e = this.expr(true);
      if (this.currToken !== Token.RP) {
        this.showError('ozhidalas\' )');
      }

      this.getToken();
      return e;
    default:
      this.showError("Virazhenie nekorrektno!");
      return 0.0;
  }
};

Calc.prototype.term = function(get) {
  var left = this.prim(get);
  while (true) {
    switch (this.currToken) {
      case Token.MUL:
        left = left * this.prim(true);
        break;
      case Token.DIV:
        var d = this.prim(true);
        if (d !== 0.0) {
          left /= d;
        } else {
          this.showError('division by 0');
        }

        break;
      default:
        return left;
    }
  }
};

Calc.prototype.expr = function(get) {
  var left;

  left = this.term(get);
  while (true) {
    switch (this.currToken) {
      case Token.PLUS:
        left += this.term(true);
        break;
      case Token.MINUS:
        left -= this.term(true);
        break;
      default:
        return left;
    }
  }
};

Calc.prototype.exec = function(arg) {
  if (arg == null) {
    return;
  }
  this.charArray = getCharArrayFromObject(arg);
  while (true) {
    this.getToken();
    if (this.currToken === Token.END) {
      return '';
    } else {
      return this.expr(false);
    }
  }
};

var runCalc = function(textToCalculate) {
  var calc = new Calc;
  return calc.exec(textToCalculate);
};

var prepareString = function(stringToCalc) {
  return stringToCalc.replace(/\,/g, '.');
};

var setup = function(sourceText, resultElement) {
  errorText = "";
  var source = prepareString(sourceText);
  console.log("source text: " + source);
  var result = runCalc(source);
  console.log("result text: " + result);
  console.log("error text: " + errorText);

  if (errorText) {
    resultElement.innerHTML = errorText;
    return;
  };

  if (result.toString().indexOf('.') !== -1) {
    result = Number(result).toFixed(2);
  }

  if (typeof result !== 'undefined') {
    resultElement.innerHTML = result;
  }
};

var sourceElement = document.getElementById('source');
var buttonElement = document.getElementById('btn');
var resultElement = document.getElementById('result');
buttonElement.onclick = function() {
  var sourceText = sourceElement.value;
  setup(sourceText, resultElement);
};

sourceElement.onkeyup = function() {
  var sourceText = sourceElement.value;
  setup(sourceText, resultElement);
};