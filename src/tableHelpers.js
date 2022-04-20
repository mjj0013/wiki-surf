var isEntity = /^([a-z\-\xC0-\xF6\xF8-\xFF\xB5\xAE\x99]+)((\s*)([a-z\-\xC0-\xF6\xF8-\xFF]))*$/i
var isNumber = /^([0-9,\.]+)$/gi
var isPlusMinusNumber = /^\xB1([0-9,\.]+)$/gi
var isPercent = /^([0-9,\.]+)(\s*)\%$/gi
var isPercentVar = /^([0-9,\.]+)(\s*)\%(\s*)([a-z]+)$/gi
var isDollarPrice = /^\$(\s*)([0-9,\.]+)$/gi
var isDollarRange = /^\$(\s*)([0-9,\.]+)(\s*)(\-)+(\s*)(\$*)(\s*)([0-9,\.]+)$/i

var isAngleDegree = /^([0-9,\.]+)(\s*)°((?!.*F|C|K)+)$/gi
var isTempDegree = /^([0-9,\.]+)(\s*)°(\s*)(F|C|K+)$/gi

// use hex column for values at https://www.meridianoutpost.com/resources/articles/ASCII-Extended-Code-reference-chart.php
var isYenPrice = /^\xA5(\s*)([0-9,\.]+)$/gi
var isEuroPrice = /^\x80(\s*)([0-9,\.]+)$/gi
var isPoundPrice = /^\xA3(\s*)([0-9,\.]+)$/gi
var phoneNumTest = /^(?:\d{3}|\(\d{3}\))([-\/\.])\d{3}\1\d{4}$/;

var isNumberMoreThan = /^\$(\s*)([0-9,\.]+)(\s*)(\+|\>)+(\s*)$/i
var isNumberLessThan = /^\$(\s*)([0-9,\.]+)(\s*)(\-|\<)+(\s*)$/i
var isNumberRangeDash = /^([0-9,\.]+)(\s*)(\-)+(\s*)([0-9,\.]+)$/
var isNumberRangeVar = /^([0-9,\.]+)(\s*)(\<|\>)+(\s*)([a-z]+)(\s*)(\<|\>)+(\s*)([0-9,\.]+)$/
var isNumberWithUnit = /^([0-9]+)(\s*)([a-z\xB5]+)(\.*)(\s*)$/i

var findColSpan = /(?<=colspan\=)\b\d+/gi;
var findRowSpan = /(?<=rowspan\=)\b\d+/gi;


function processTableData(data) {
    var allSectionTables = []

    for(let s=0; s < data.length; ++s) {
        var section = data[s];
        var finalObj = {sectionName:section.sectionName, idx:section.idx, data:[]};
        
        if(section.tables.length > 0) {
            for(let t=0; t < section.tables.length; ++t) {
                var tableDataObj = {caption:null, mainHeaders:[], entities:[]}      
                // entities are headers inside the table contents ("HORIZONTAL HEADERS"), 
                // defined in 1st column, describes instance of table attributes 

                var tableStr = section.tables[t];
                tableStr = tableStr.replace(/align\=center/gi, "")
                tableStr = tableStr.replace(/data\-sort\-value\=(.*?)(?=\|)/gi, "")
                tableStr = tableStr.replace(/&nbsp;/gi, "");
                tableStr = tableStr.replace(/style\=\"(.*?)\"\|/ig, "")
                tableStr = tableStr.replace(/\|\}$/, "")        //removing table syntax at end of string


                //splitting the table into rows
                var tableRows = tableStr.split("|-");

                if(tableRows[0].includes("|+")) {
                    tableDataObj.caption = tableRows[0].split("|+")[1]
                }
                else tableDataObj.caption = "<no caption>";

                var tableMainHeaders = tableRows[1].includes("!")? tableRows[1].split(/\!+\!*\s*/) : [];
                tableMainHeaders = tableMainHeaders.filter((h)=> {return h.length > 0; })

                var headerStructure = {frontHeaders:[], structure:[]};      // front headers are headers that directly touch table body

                var tableBodyStartIdx = 1;            // row that table body starts
                var frontHeaders = [];
                for(let headRow=1; headRow < tableRows.length; ++headRow) {
                    tableBodyStartIdx = headRow
                    if(tableRows[headRow].includes("!")) {
                        frontHeaders = []
                        var headerCells = tableRows[headRow].split(/\!+\!*\s*/);
                        headerCells = headerCells.filter((c)=> {return c.length > 0; })
                        var currentCellIdx = 0
                        for(let c=0; c < headerCells.length; ++c) {
                            var headerCellText = headerCells[c]
                            
                            var colspan = headerCells[c].match(findColSpan);
                            var rowspan = headerCells[c].match(findRowSpan);
                            var cellRange = [currentCellIdx];
                            if(colspan) {
                                if(parseInt(colspan[0])>1) {
                                    headerCellText =  headerCells[c].split("|")[1]
                                    cellRange.push(cellRange[0] + parseInt(colspan[0]))
                                    currentCellIdx = cellRange[0] + parseInt(colspan[0])
                                }
                                else {
                                    ++currentCellIdx;
                                    headerCellText =  headerCells[c].split("|")[1]
                                } 
                            }
                            else ++currentCellIdx;
                            
                            var headerCellObj = {rowIdx:headRow, colRange:cellRange, cellText: headerCellText}
                            frontHeaders.push(headerCellObj)
                            headerStructure.structure.push(headerCellObj);
                        }
                        
                    }
                    else break;
                }
                headerStructure.frontHeaders = frontHeaders;
                //finding the data type of each main header column
                for(let h=0; h < tableMainHeaders.length; ++h) {
                    tableMainHeaders[h] = tableMainHeaders[h].replace(/(\s*)(scope\=\"col\"+)(\s*)(\|+)(\s*)/, "")
                    tableMainHeaders[h] = tableMainHeaders[h].replace(/(\s*)$/, "")
                    tableDataObj.mainHeaders.push(processCellData(tableMainHeaders[h]))
                }
                
                console.log("headerStructure", headerStructure)

                var currentEntity = null;


                //tableRows[0] is always reserved for class description
                //so, tableRows[1] will be where mainHeaders are, if they exist
               
                for(let r=tableBodyStartIdx; r < tableRows.length; ++r) {
                    tableRows[r] = tableRows[r][0]=='|'? tableRows[r].substr(1) : tableRows[r];
                    // console.log('body',tableRows[r])
                    // if(tableRows[r]=='') continue;
                    // if(tableRows[r][0].match(/^(\s*)\!/i)) {
                    //     //then this row denotes an instance of the table; just like object of a class
                    //     tableRows[r] = tableRows[r].replace(/\'\'\'/gi,"")      // replaces the ''' characters which is markup for bold text
                    // }
                    console.log('tableRows[r]',tableRows[r])
                    var colspan = tableRows[r].match(findColSpan);
                    console.log("colspan",colspan)
                    tableRows[r] = tableRows[r].replace(/id\=.*?(?=\|{1,2})/gi, "")             // remove 'id' column 
                    var cells = tableRows[r].split(/\|{1,2}/gi)                                 // splitting row into cells, at delimiters | , ||
                    cells = cells.filter((c)=> {return c.length > 0; })                         // removing cells that are empty
                    for(let c =0; c < cells.length; ++c) {
                        if(cells[c].includes("]]") && !cells[c].includes("[[")) {               // rejoining cells that were unneccesarily split
                            if(c>0) {
                                cells[c-1] +=' '+cells[c];
                                cells.splice(c,1)
                            }
                        }
                    }

                    var entryObj = []
                    var matchLinkRE = /\[\[(.*?)\]\]/gi
                    var repeatingSeqs = /(\b\w+\b)(?=.*\b\1\b)/gi;
                    for(let attr=0; attr < headerStructure.frontHeaders.length; ++attr) {
                        var label = headerStructure.frontHeaders[attr].cellText;
                        if(label.match(matchLinkRE)) {
                            label = label.substr(2,label.length-4);
                            if(label.includes("|")) label = label.split("|")[1]
                        }
                        
                        var value = cells[attr];
                        if(!value) continue;
                        if(value.match(matchLinkRE))  value=value.substr(2,value.length-4);
                        
                        // var repMatches = value.match(repeatingSeqs)
                        // if(repMatches) {
                        //     value = value.replace(RegExp("\\s*\\b(?:"+repMatches.slice(1).join("|")+")\\b","gi"), "");
                        // }
                        entryObj.push([label,value])
                    }
                    var entry = Object.fromEntries(new Map(entryObj))
                    tableDataObj.entities.push(entry)
                    // console.log("entry",entry)
                }
                finalObj.data.push(tableDataObj);
                


                
            }
            allSectionTables.push(finalObj);
        }
        
        if(section.children.length>0) {
            for(let c=0; c < section.children.length; ++c) {
                var child = section.children[c];
                if(child.tables.length > 0) {
                    for(let t=0; t <child.tables.length; ++t) {
                        var tableStr = child.tables[t];
                        var tableRows = tableStr.split("|-");
                        var tableCaption = tableRows[0].includes("|+")? tableRows[0].split("|+")[1] : "<no caption>"
                        var tableMainHeaders = tableRows[1].includes("!")? tableRows[1].split("!") : [];
                        tableMainHeaders = tableMainHeaders.filter((h)=> {return h.length > 0; })
                        for(let h=0; h < tableMainHeaders.length; ++h) {
                            tableMainHeaders[h] = tableMainHeaders[h].replace(/(\s*)scope\=\"col\"(\s*)\|/, "")
                        }
                    }
                }
            }
        }
    }
    
    return allSectionTables;
    
}
function processCellData(str) {         // this function processes the value in a table's cell and returns a usable object of it
    var finalObj = {value:-1, type:'str', ok:false, vars:[], parentheses:null}

    var matchParRE = /\((.*?)\)/gi
    finalObj.parentheses = str.match(matchParRE);
    str = str.replace(matchParRE,"");

    str = str.replace(/\xBC/i, ".25")
    str = str.replace(/\xBD/i, ".5")
    str = str.replace(/\xBE/i, ".75")

    if(str.match(isEntity)) {
        str = str.replace(",","")
        finalObj.value = str
        finalObj.type='entity'
        finalObj.ok = true;
    }

    else if(str.match(isNumber)) {
        str = str.replace(",","")
        finalObj.value = parseFloat(str);
        finalObj.type='number'
        finalObj.ok = true;
    }
    else if(str.match(isPlusMinusNumber)) {
        str = str.replace(",","")
        str = str.replace(/\xB1/,"");

        finalObj.value = parseFloat(str);
        finalObj.type='number'
        finalObj.ok = true;
    }
    else if(str.match(isNumberWithUnit)) {
        str = str.replace(",","")
        str = str.split(" ")
        finalObj.value = parseFloat(str[0]);
        finalObj.vars = {value:str[1], type:'unit'};
        finalObj.type='number-with-unit'
        finalObj.ok = true;
    }

    else if(str.match(isNumberMoreThan)) {
        str = str.replace(",","")
        str = str.replace(">","")
        finalObj.value = parseFloat(str);
        finalObj.type='number-morethan'
        finalObj.ok = true;
    }

    else if(str.match(isNumberMoreThan)) {
        str = str.replace(",","")
        str = str.replace(">","")
        finalObj.value = parseFloat(str);
        finalObj.type='number-morethan'
        finalObj.ok = true;
    }
    else if(str.match(isNumberLessThan)) {
        str = str.replace(",","")
        str = str.replace("<","")
        finalObj.value = parseFloat(str);
        finalObj.type='number-lessthan'
        finalObj.ok = true;
    }
    
    else if(str.match(isNumberRangeDash)) {
        str = str.replace(",","")
        str = str.split("-")
        finalObj.value = [parseFloat(str[0]), parseFloat(str[1]) ];
        finalObj.type='number-range'
        finalObj.ok = true;
    }
    else if(str.match(isAngleDegree)) {
        str = str.replace(",","")
        str = str.replace("°","")
        finalObj.value = parseFloat(str);
        finalObj.type='degrees'
        finalObj.ok = true;
        
    }
    else if(str.match(isTempDegree)) {
        finalObj.type=`temperature:${str.split("°")[1]}`
        str = str.replace(",","")
        str = str.replace("°","")
        finalObj.value = parseFloat(str);
        finalObj.ok = true;
    }
    else if(str.match(isNumberRangeVar)) {
        str = str.replace(",","")
        str = str.split(/(\>|\<)+/)
        finalObj.vars = {value:str[1], type:'var'};
        finalObj.value = [parseFloat(str[0]), parseFloat(str[2])];
        finalObj.type='number-range-var'
        finalObj.ok = true;
    }
    else if(str.match(isDollarRange)) {
        str = str.replace(",","")
        str = str.replace("$","")
        finalObj.value = [parseFloat(str[0]), parseFloat(str[2])];
        finalObj.type='dollar-range'
        finalObj.ok = true;
    }

    else if(str.match(isDollarPrice)) {
        str = str.replace(",","")
        str = str.replace("$","")
        finalObj.value = parseFloat(str);
        finalObj.type='dollars'
        finalObj.ok = true;
    }

    else if(str.match(isPercent)) {
        str = str.replace(",","")
        str = str.replace("%","")
        finalObj.value = parseFloat(str);
        finalObj.type='percent'
        finalObj.ok = true;
        
    }
    else if(str.match(isPercentVar)) {
        str = str.replace(",","")
        str = str.split("%")
        finalObj.vars = {value:str[1], type:'var'};
        finalObj.value = parseFloat(str[0]);
        finalObj.type='percent-var'
        finalObj.ok = true;
        
    }

    return finalObj;

}



module.exports ={
    processTableData:processTableData,
    isEntity:isEntity,
    isNumber:isNumber,
    isPlusMinusNumber:isPlusMinusNumber,
    isPercent:isPercent,
    isPercentVar:isPercentVar,
    isDollarPrice:isDollarPrice,
    isDollarRange:isDollarRange,
    isAngleDegree:isAngleDegree,
    isTempDegree:isTempDegree,


    isYenPrice:isYenPrice,
    isEuroPrice:isEuroPrice,
    isPoundPrice:isPoundPrice,
    phoneNumTest:phoneNumTest,
    isNumberMoreThan:isNumberMoreThan,
    isNumberLessThan:isNumberLessThan,
    isNumberRangeDash:isNumberRangeDash,
    isNumberRangeVar:isNumberRangeVar,
    isNumberWithUnit:isNumberWithUnit,

}