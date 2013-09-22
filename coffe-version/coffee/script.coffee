isNumber = (n) =>
    !isNaN(parseFloat(n)) && isFinite(n)

isString = (obj) =>
    Object.prototype.toString.call(obj) == '[object String]';

getCharArrayFromObject = (obj) =>
    JSON.stringify(obj).split('').slice(1, -1)


Token = {
    NAME : {vaue : 1, name : "NAME"},
    NUMBER : {vaue : 2, name : "NUMBER"},
    END : {vaue : 3, name : "END"},
    PRINT : {vaue : 4, name : "PRINT"},
    PLUS : {vaue : 5, name : "PLUS"},
    MINUS : {vaue : 6, name : "MINUS"},
    MUL : {vaue : 7, name : "MUL"},
    DIV : {vaue : 8, name : "DIV"},
    ASSIGN : {vaue : 9, name : "ASSIGN"},
    LP : {vaue : 10, name : "LP"},
    RP : {vaue : 11, name : "RP"},
    ZERO : {vaue : 12, name : "ZERO"}
}

class Calc
    constructor: () ->
        @currToken = Token.PRINT
        @charArray = []
        @index = 0
        @someValue = ""

    showError: (errorMessage) =>
        #throw new Error(errorMessage)

    getToken : () =>
      ch = ''
      try 
        # TODO: fix this!
        while @charArray[@index] == " "
            @index++
      catch e
        return @currToken = Token.END;

      if @index < @charArray.length
            ch = @charArray[@index]
            @index++
      else 
          return @currToken = Token.END

      switch ch
        when ';', '\n', '=' then return @currToken = Token.END;
        when '*' then return @currToken = Token.MUL;
        when '/' then return @currToken = Token.DIV;
        when '+' then return @currToken = Token.PLUS;
        when '-' then return @currToken = Token.MINUS;
        when '(' then return @currToken = Token.LP;
        when ')' then return @currToken = Token.RP;
        when '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'
            @someValue += ch
            try 
                while (isNumber(@charArray[@index]) || @charArray[@index] == '.') 
                    @someValue += @charArray[@index]
                    @index++
                return @currToken = Token.NUMBER;
            catch e
                return @currToken = Token.END;
        else
            if isString(ch) 
                @someValue += ch
                while isString(@charArray[@index])
                       @someValue += @charArray[@index]
                       @index++
                return @currToken = Token.NAME
            @showError('nepravilanaya leksema (' + ch + ')')
            return @currToken = Token.END


    prim : (get) => 
        if get
            @getToken()
        switch @currToken
            when Token.NUMBER
                nmb = parseFloat(@someValue)
                @someValue = ''
                @getToken()
                return nmb
            when Token.NAME then return ''
            when Token.MINUS then return -@prim(true)
            when Token.LP
                e = @expr(true)
                if @currToken != Token.RP
                    @showError('ozhidalaos )')
                @getToken()
                return e
            else
                @showError("ozhidalos' pervichnoe virazhenie. @currToken = " + @currToken);
                return 0.0

    term : (get) =>
        left = @prim(get)
        loop
            switch @currToken
                when Token.MUL
                    left =left * @prim(true)
                when Token.DIV
                    d = @prim(true)
                    if d != 0.0
                        left /= d
                    else 
                        @showError 'division by 0'
                    #//return 0;  
                else
                    return left

    expr : (get) =>
        left = @term(get)
        loop
         switch @currToken
            when Token.PLUS
                left += @term(true)
            when Token.MINUS
                left -= @term(true)
            else
               return left

    exec : (arg) =>
        if !arg?
            return

        @charArray = getCharArrayFromObject(arg)
        loop 
            @getToken()
            if @currToken == Token.END 
                 return ''
            else
                return @expr(false)

runCalc = (textToCalculate) =>
    calc = new Calc
    calc.exec textToCalculate

prepareString = (stringToCalc) =>
    return stringToCalc.replace(/\,/g,'.')

setup = (sourceSelector, resultSelector) =>
    source = prepareString(sourceSelector.val())
    result = runCalc(source)
    if result
        if result.toString().indexOf('.') != -1
            result = Number(result).toFixed(2)
        if typeof result isnt 'undefined' and result != 0
            resultSelector.text result
    true

$ =>
    sourceSelector = $('#source')
    resultSelector = $('#result')
    setInterval(() => 
        setup(sourceSelector, resultSelector)
        true
    100)
