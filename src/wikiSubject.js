const { isElementOfType } = require( 'react-dom/test-utils');
var convert = require('xml-js');

var {processTableData} = require('./tableHelpers.js')       //isNumber, isEntity,isPlusMinusNumber,isPercent,isPercentVar,isDollarPrice,isDollarRange,isAngleDegree,isTempDegree,isYenPrice,isEuroPrice,isPoundPrice,phoneNumTest,isNumberMoreThan,isNumberLessThan,isNumberRangeDash,isNumberRangeVar,isNumberWithUnit

// const {fetch} = require('node-fetch');
//"https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=Belgium&limit=5"

function findObjInArray(array, keyName, keyValue) {
    for(let item=0; item < array.length; ++item) {
        if(array[item][keyName] == keyValue) return array[item];
    }
    return -1;
}


function reformatURL(url) {
    url = url.replace(/(\s)/gi, "%20")
    url = url.replace(/\"/gi, "%22")
    url = url.replace("'", "%27")
    url = url.replace(/\,/gi, "%2C")
    url = url.replace(/\</gi, "%3B")
    url = url.replace(/\>/gi, "%3E")
    url = url.replace(/\?/gi, "%3F")
    url = url.replace(/\[/gi, "%5B")
    url = url.replace(/\]/gi, "%5D")
    url = url.replace(/\{/gi, "%7B")
    url = url.replace(/\|/gi, "%7C")
    url = url.replace(/\}/gi, "%7D")
    return url;
}







function wikiTitleSearch(queryName) {
    return new Promise((resolve,reject)=>{
        var url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srsearch=${reformatURL(queryName)}&srprop=categorysnippet&format=json&origin=*`;
        var req = new Request(url,{method:'GET',mode:'cors'});
        fetch(req)
        .then(response => {    return response.json();})
        .then(result=>{
            var query = result.query
            if(query.search.length==0)  return reject("not found");
            return resolve(query.search[0].title);
        })
    })
}

class WikiSubject {      // extends React.Component
    constructor(props) {
        // super(props);
        /*  ORDER:
            initSubject()        :   subject is either generated randomly or is checked if exists
            extractSubjectData() :   data is extracted from page and stored in object
            branchSubjectData()  :   branches are created from links in subject, creating new WikiSubject; if specified, a specific section from subject is 'branched' to create new WikiSubject object
        */
        this.extractTables = props.extractTables? props.extractTables : true;
        this.saveTables = props.saveTables? props.saveTables : false;
        
        this.initSubject = this.initSubject.bind(this);
       
        this.extractSubjectData = this.extractSubjectData.bind(this);
        this.fetchSrc = this.fetchSrc.bind(this);

        this.branchSubjectData = this.branchSubjectData.bind(this);
        this.pagesInCategory = this.pagesInCategory.bind(this);
        this.build = this.build.bind(this);
        this.data = [];
        this.tableData = [];
        this.subjectNetwork = [];       // other WikiSubject objects that are linked to it.  should be formatted:       [   {sectionName:<...>, objs:[]} , ...    ]

        this.wikiTitle = props.wikiTitle? props.wikiTitle : null;
        this.depth = props.depth? props.depth : -1;             // the 'depth' that the WikiSubject is brought to initialization; default is -1, which means only bring it to initSubject()
        
        this.waitBuild = props.waitBuild? props.waitBuild : false;
       
        this.sourceObj = null;
        if(!this.waitBuild) {
            if(this.wikiTitle==null) this.initSubject(true);
            else this.initSubject();
        }
        
        
     
    }
    build() {

        return new Promise((resolve, reject)=> {
            if(this.wikiTitle==null) this.initSubject(true).then(r=>{resolve()})
            else this.initSubject().then(r=>{
                console.log("this.tableData", this.tableData)
                resolve()
            })
            
    
           
        })
       
    }

    pagesInCategory(category, cmlimit="max",getViews=false) {
        var url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=categorymembers&cmtitle=${category}&format=json&cmlimit=${50}&cmnamespace=0&prop=info`;
        var req = new Request(url,{method:'GET',mode:'cors'})
        
        fetch(req)
        .then(response => {    return response.json();})
        .then(data=>{
            console.log(data)
            if(getViews) {
                var titlesStr = ''
                var categorymembers = data.query.categorymembers
                for(let i =0; i < categorymembers.length; ++i) {
                    titlesStr += reformatURL(categorymembers[i].title)
                    if(i<categorymembers.length-1) titlesStr+="|"
                }
                var req = new Request(`https://en.wikipedia.org/w/api.php?origin=*&titles=${titlesStr}&action=query&format=json&prop=pageviews`,{method:'GET',mode:'cors'})
                
                fetch(req)
                .then(response => {    return response.json();})
                .then(data=>{console.log("views",data)})
            }
        })

        
    }

    fetchSrc(req) {
        return new Promise((resolve, reject)=> {
            fetch(req)
            .then(response => {  return response.json();    })
            .catch((error)=>{return reject(error);})
            .then(data=> {
                var results = []
                var keys = Object.keys(data.query.pages)
                for(let k=0; k < keys.length; ++k) {
                    results.push(data.query.pages[parseInt(keys[k])])
                }
                resolve(results);
            })
        })
    }
    // add &grnlimit=2 to specify the number of randomly generated pages
    // if(random) url = `https://www.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&origin=*&callback=?&prop=iwlinks`                    
    // else if(this.wikiTitle) url=`http://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&titles=${this.wikiTitle}&callback=?&prop=iwlinks`
    // else return "ERROR";
    initSubject(random=false) {
        return new Promise((resolve, reject)=> {
            var url='';
            if(random)              url=`https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&origin=*&prop=categories`                    
            else if(this.wikiTitle) url=`http://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&titles=${this.wikiTitle}&prop=categories`             //&prop=categories|categoryinfo`
            else return "ERROR";
            
            var req = new Request(url,{method:'GET',mode:'cors'})
            if(this.depth==2) {
                this.fetchSrc(req).then(result=> {
                    this.sourceObj =  result;
                    this.pagesInCategory(this.sourceObj[0].categories[this.sourceObj[0].categories.length-1].title,null,true)
                    this.extractSubjectData().then(result2=> {
                        this.branchSubjectData([this.data[0].sectionName], [1])
                        .then(r=> {resolve();})
                    })
                })
            }
            if(this.depth==1) {
                this.fetchSrc(req).then(result=> {
                   
                    this.sourceObj =  result;
                    this.extractSubjectData(this.extractTables)
                    .catch(message=>{
                        if(message.substr(0,4)=="#RE;") {
                            console.log("redirecting");
                            var parts = message.split(';');
                            var idx = parseInt(parts[1]);
                            var redirectUrl = parts[2];
                            this.sourceObj[idx].title = redirectUrl;
                            //a compromise..in the case that multiple page titles were returned in the response, this code forces every page to be processed again, even if only one had redirected
                            // the code is designed to only process one page title per WikiSubject Object
                            this.extractSubjectData(this.extractTables)    
                            .then(r=>{resolve();})
                        }
                    })
                    .then(r=>{
                        this.tableData = r;
                         
                        
                        resolve();
                    })
    
                })
            }
        })
        
    }
    
     extractSubjectData(extractTables=true) {
        return new Promise((resolve, reject)=> {
            for(let k=0; k < this.sourceObj.length; ++k) {
                var title = this.sourceObj[k].title;
                var urlFormattedTitle = reformatURL(title);
                var req = new Request(`http://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${urlFormattedTitle}&prop=parsetree&formatversion=2`,{method:'GET',mode:'cors'})        
                fetch(req)
                .then(response => {return response.json()})
                .then(data => {
                    var redirectCheck  = data.parse.parsetree
                    if(redirectCheck.substr(6,9)=="#REDIRECT")  {
                        var matchLinkRE = /\[\[(.*?)\]\]/gi
                        var redirectLink = redirectCheck.match(matchLinkRE);
                        redirectLink = redirectLink[0].substr(2)
                        redirectLink = redirectLink.substr(0,redirectLink.length-2)
                        reject(`#RE;${k};`+redirectLink)
                    }
                    else if(data.error) reject(`ERROR: page "${title}" doesn't exist`);
                    else {
                        var result = convert.xml2json(data.parse.parsetree, {compact: false, spaces: 4});       //  https://goessner.net/download/prj/jsonxml/
                        var contentLevel = JSON.parse(result)["elements"][0]["elements"]
                        console.log('contentLevel',contentLevel)
                        //the 1st text-type element is the introduction
                        //if element has name "h", it's the header for the section following it
        
                        var introCompleted = false, introInProgress = false;
                        var currentSectionObj = this.data;
        
                        // \n* means it's a bullet point
        
                        var matchTableRE = /\{\|(.*?)\|\}/gi        //for table syntax help:    https://en.wikipedia.org/wiki/Help:Table
                        var matchLinkRE = /\[\[(.*?)\]\]/gi
                        
                        var partialTableFound = false;
                        var matchTableHeaderRE =  /(\{\|)(.*)/gi
                        var matchTableFooterRE = /(.*)(\|\})/gi 
                                                
                        for(let e=0; e < contentLevel.length; ++e) {
                            if(contentLevel[e].type=="text") {
                                var matchNewLine = /\n(?!\*)/gi     //for unnecessary newline characters; ones that are not used with bullet points.
                                contentLevel[e].text = contentLevel[e].text.replaceAll(matchNewLine, '')

                                if(!introCompleted && !introInProgress) {
                                    var introElement = {sectionName:"INTRO", text:contentLevel[e].text, idx:[null], sectionLevel:1, sectionOrder:1, children:[], links: [], tables:[]}
                                    var foundLinks = contentLevel[e].text.match(matchLinkRE);
                                    var foundTables = contentLevel[e].text.match(matchTableRE);

                                    introInProgress = true;
                                    introElement.links = foundLinks != null? introElement.links.concat(foundLinks) : introElement.links;
                                    if(partialTableFound) {
                                        var footerFoundTables = contentLevel[e].text.match(matchTableFooterRE);
                                        if(footerFoundTables) {
                                            if(introElement.tables.length>0) introElement.tables[currentSectionObj.tables.length-1] += headerFoundTables[0];
                                            else introElement.tables=introElement.tables.concat(headerFoundTables);
                                            partialTableFound  = false
                                        }
                                        else currentSectionObj.tables[currentSectionObj.tables.length-1] += contentLevel[e].text
                                    }
                                    else if(foundTables) introElement.tables=introElement.tables.concat(foundTables);
                                    
                                    else {
                                        var headerFoundTables = contentLevel[e].text.match(matchTableHeaderRE);
                                        if(headerFoundTables) {
                                            if(introElement.tables.length>0) introElement.tables[currentSectionObj.tables.length-1] += headerFoundTables[0];
                                            else introElement.tables=introElement.tables.concat(headerFoundTables);
                                            partialTableFound  = true
                                        }
                                    }
                                    this.data.push(introElement)
                                    currentSectionObj = this.data[this.data.length-1]
                                }
                                
                                else {
                                    if(currentSectionObj.children.length > 0) {                 // currentSectionObj is a sub-section 
                                        var parentObj = currentSectionObj.children[currentSectionObj.children.length-1]
                                        parentObj.text += contentLevel[e].text
                                        var foundLinks = contentLevel[e].text.match(matchLinkRE);
                                        var foundTables =  parentObj.text.match(matchTableRE);
                                        parentObj.links =  foundLinks!=null? parentObj.links.concat(foundLinks) :  parentObj.links

                                        if(partialTableFound) {
                                            var footerFoundTables = contentLevel[e].text.match(matchTableFooterRE);
                                            if(footerFoundTables) {
                                                parentObj.tables[parentObj.tables.length-1] += footerFoundTables[0];
                                                
                                                partialTableFound  = false
                                            }
                                            else currentSectionObj.tables[currentSectionObj.tables.length-1] += contentLevel[e].text
                                        }
                                        else if(foundTables) parentObj.tables=parentObj.tables.concat(foundTables);
                                        else {
                                            var headerFoundTables = contentLevel[e].text.match(matchTableHeaderRE);
                                            if(headerFoundTables) {
                                                if(parentObj.tables.length>0) parentObj.tables[parentObj.tables.length-1] += headerFoundTables[0];
                                                else parentObj.tables=parentObj.tables.concat(headerFoundTables);
                                                partialTableFound  = true
                                            }
                                        }

                                        
                                    }
                                    
                                    else {
                                        currentSectionObj.text += contentLevel[e].text
                                        var foundLinks = contentLevel[e].text.match(matchLinkRE);
                                        var foundTables = contentLevel[e].text.match(matchTableRE);
                                        currentSectionObj.links = foundLinks!=null? currentSectionObj.links.concat(foundLinks) : currentSectionObj.links;
                                        
                                        if(partialTableFound) { 
                                            var footerFoundTables = contentLevel[e].text.match(matchTableFooterRE);
                                            if(footerFoundTables) {
                                                currentSectionObj.tables[currentSectionObj.tables.length-1] += footerFoundTables[0];
                                                partialTableFound  = false
                                            }
                                            else currentSectionObj.tables[currentSectionObj.tables.length-1] += contentLevel[e].text
                                        }
                                        else if(foundTables) currentSectionObj.tables=currentSectionObj.tables.concat(foundTables);
                                        else {
                                            var headerFoundTables = contentLevel[e].text.match(matchTableHeaderRE);
                                            if(headerFoundTables) {
                                                if(currentSectionObj.tables.length>0) currentSectionObj.tables[currentSectionObj.tables.length-1] += headerFoundTables[0];
                                                else currentSectionObj.tables=currentSectionObj.tables.concat(headerFoundTables);
                                                partialTableFound  = true
                                            }
                                        }
                                    }
                                }
                            }
                            else if(contentLevel[e].name=="h") {
                                introCompleted = true;
                                var headerLevel = parseInt(contentLevel[e].attributes.level);
                                var headerOrder = parseInt(contentLevel[e].attributes.i);
                                var headerName = contentLevel[e].elements[0].text;
                                headerName = headerName.replaceAll(/(=)/gi,'')
                                headerName = headerName.replaceAll(/^(\s)/gi,'')
                                headerName = headerName.replaceAll(/(\s)$/gi,'')
                                
                                var idx = null;
                                var previousSectionIdx = this.data.length-1;
                                var previousSection = this.data[previousSectionIdx]
                                if(headerLevel!=2) {        //this header is not a top level section
                                    if(previousSection.sectionLevel < headerLevel) {        //this header is a child section of the previous section
                                        idx = previousSection.idx.concat(previousSection.children.length)
                                
                                        var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, children:[], links:[], tables:[]}
                                        if(currentSectionObj==this.data) this.data.push(element)
                                        else currentSectionObj.children.push(element)
        
                                    }
                                    else if(previousSection.sectionLevel > headerLevel) {   //the previous section was a child section
                                        var diff = previousSection.sectionLevel - headerLevel;
                                        idx = previousSection.idx.slice(0,previousSection.idx.length-diff)
                                        idx[idx.length-1] = idx[idx.length-1]+1
                                        var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, children:[], links:[], tables:[]}
                                        currentSectionObj.children.push(element)
        
                                    }
                                    else {   //the previous section and this section are siblings, and are children of the same parent
                                        idx = previousSection.idx;
                                        idx[idx.length-1] = idx[idx.length-1]+1;
                                        var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, children:[], links:[], tables:[]}
                                        currentSectionObj.children.push(element)
                                    }
                                }
                                else {      //this header is a top level section
                                    idx = [this.data.length]
                                    var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, children:[], links:[], tables:[]}
                                    this.data.push(element)   
                                    currentSectionObj = this.data[this.data.length-1]
                                }
                            }
                        }
                        if(extractTables) {
                            processTableData(this.data).then(result=>{
                                
                                
                                for(let i =0 ; i < result.length; ++i) {
                                    result[i]["srcInfo"] = {type:"wikiTitle", value:this.wikiTitle}
                                }
                                resolve(result);
                            });
                        }
                        

                    }  
                   
                })
            }  
        })
    }

    
    branchSubjectData(targets, depths) {
        //targets   :   list of sections/links that will be branched into
            //each target possible formats:  "section-name", "section-name>sub-section-name", "section-name>:LINK:specific-link"
        //depths    :   list of depths corresponding to the targets, the depths are how far they are initialized to
        // i.e: targets.length should be equal to depths.length
        return new Promise((resolve, reject)=> {
            console.log("branching");
            for(let t=0; t < targets.length; ++t) {
                var skipTarget=false;
                var T = targets[t];
                var path = T.split(">")
                if(path.length==1) {
                    var currentObj = findObjInArray(this.data,"sectionName",path[0])
                    if(currentObj.links.length==0) {
                        console.log(`NOTE: section ${T} does not contain any links`);
                        continue;
                    }
                    this.subjectNetwork.push({sectionName:T, objs:[]})
                    for(let l=0; l < currentObj.links.length; ++l) {
                        var pageTitle = currentObj.links[l]
                        if(pageTitle.substr(0,2)=="[[") pageTitle=pageTitle.substr(2);
                        if(pageTitle.substr(pageTitle.length-2)=="]]") pageTitle=pageTitle.substr(0,pageTitle.length-2);
                        var newObj = new WikiSubject({wikiTitle:pageTitle, depth:depths[t]==undefined? -1 : depths[t]});
                        this.subjectNetwork[this.subjectNetwork.length -1].objs.push(newObj);
                    }
                }
                else {
                    var currentObj = this.data;
                    var isLink=false
                    var link = null
                    for(let i=0; i < path.length; ++i) {
                        if(path[i].includes(":LINK:")) {
                            link = path[i].replace(":LINK:","");
                            if(currentObj.links) {
                                if(currentObj.links.includes(link)) isLink = true;
                                else {
                                    console.log("ERROR: link not found", T);
                                    skipTarget = true;
                                    break;
                                }
                            }
                        }
                        else {
                            currentObj = findObjInArray(this.data,"sectionName",path[i])
                            if(currentObj==-1) {
                                console.log("ERROR: link not found", T);
                                skipTarget = true;
                                break;
                            }
                        }
                        
                    }
                    if(isLink) {
                        var pageTitle = link
                        if(pageTitle.substr(0,2)=="[[") pageTitle=pageTitle.substr(2);
                        if(pageTitle.substr(pageTitle.length-2)=="]]") pageTitle=pageTitle.substr(0,pageTitle.length-2);
                        var newObj = new WikiSubject({wikiTitle:pageTitle, depth:depths[t]==undefined? -1 : depths[t]});
                        this.subjectNetwork.push({sectionName:T, objs:[newObj]})
                    }
                    else {
                        if(currentObj.links.length==0) {
                            console.log(`NOTE: section ${T} does contain any links`);
                            continue;
                        }
                        this.subjectNetwork.push({sectionName:T, objs:[]})
                        for(let l=0; l < currentObj.links.length; ++l) {
                            var pageTitle = currentObj.links[l]
                            if(pageTitle.substr(0,2)=="[[") pageTitle=pageTitle.substr(2);
                            if(pageTitle.substr(pageTitle.length-2)=="]]") pageTitle=pageTitle.substr(0,pageTitle.length-2);
                            var newObj = new WikiSubject({wikiTitle:pageTitle, depth:depths[t]==undefined? -1 : depths[t]});
                            this.subjectNetwork[this.subjectNetwork.length -1].objs.push(newObj);
                        }
                    }
                }
                if(skipTarget) continue;
            }
            resolve()
        })
        
    }
}





module.exports ={

    WikiSubject:WikiSubject,
    reformatURL:reformatURL,
    wikiTitleSearch:wikiTitleSearch
}