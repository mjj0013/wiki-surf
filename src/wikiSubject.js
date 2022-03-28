import React from 'react';
import "regenerator-runtime/runtime";
var convert = require('xml-js');
//https://en.wikipedia.org/wiki/Special:Random/api.php?&origin=*
// See also links: id="mw-content-text" --> class="mw-parser-output" --> <ul>



//"https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=Belgium&limit=5"



const getJSONP = async (url, success) =>{
    var ud = '_' + +new Date
    var script = document.createElement('script')
    script.async = true;
    var head = document.getElementsByTagName('head')[0] || document.documentElement;

    window[ud] = function(data) {
        head.removeChild(script);
        success && success(data);
    };
    
    script.src = url.replace('callback=?', 'callback=' + ud);
    head.appendChild(script);
}

export class WikiSubject extends React.Component {
    constructor(props) {
        super(props);

        // this.data = props.isGenerated?
        this.getNewSubject = this.getNewSubject.bind(this);
        this.branchSubject = this.branchSubject.bind(this);
      
        this.sourceObj = null;
    
        this.onFetchComplete = this.onFetchComplete.bind(this);
        
        this.getNewSubject();
        this.check = this.check.bind(this)
        this.navigateJson = this.navigateJson.bind(this);
        this.getSubjectSections = this.getSubjectSections.bind(this);
        this.getText = this.getText.bind(this);


        this.allTexts = {}
        this.sectionNames = [];



    }
    async check() {console.log(this.sourceObj)};

    async onFetchComplete(data) {
        var results = []
    
        var keys = Object.keys(data.query.pages)
        
        for(let k=0; k < keys.length; ++k) {
            results.push(data.query.pages[parseInt(keys[k])])
        }
        this.sourceObj = results 
    }
    
    

    async getNewSubject() {
        
        // var tempScript = document.createElement("script");
        // tempScript.type = "text/javascript"
        // tempScript.id = "tempScript"

        var url = `https://www.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&origin=*&callback=?&prop=links`
        
        await getJSONP(url, this.onFetchComplete);
        await this.check();
      
        

        
        // add &grnlimit=2 to specify the number of randomly generated pages

        setTimeout(()=>{
            console.log(this.sourceObj);
            this.branchSubject();
        }, 500);
      
        // `http://en.wikipedia.org/?curid=${}`
       
    }

    branchSubject() {
       
        //&format=json
     
        for(let k=0; k < this.sourceObj.length; ++k) {
            // for(let l=0; l < this.sourceObj[k].links.length;++l) {
                // var title = this.sourceObj[k].links[l].title;
                var title = this.sourceObj[k].title;
                var urlFormattedTitle = []

                for(let c=0; c < title.length; ++c) {
                    if(title[c].charCodeAt(0) >=32 && title[c].charCodeAt(0)<=44) {
                        urlFormattedTitle.push(`%${title[c].charCodeAt(0).toString(16)}`)
                    }
                    else urlFormattedTitle.push(title[c]);
                    
                }
                urlFormattedTitle = urlFormattedTitle.join('');
                
                // &prop=sections
                var req = new Request(`http://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${urlFormattedTitle}&prop=parsetree&formatversion=2`,
                {
                    method:'GET',
                    mode:'cors'
                })
            
                fetch(req)
                .then(response => {
                   
                   return response.json()
                })
                .then(data => {
                   
                    //https://goessner.net/download/prj/jsonxml/
                    
                    var result = convert.xml2json(data.parse.parsetree, {compact: false, spaces: 4});
                    

                   
                    
                    var contentLevel = JSON.parse(result)["elements"][0]["elements"]
                    // console.log(startLvl)


                    //the 1st text-type element is the introduction
                    //if element has name "h", it's the header for the section following it

                    var currentSectionName="INTRO"
                    this.sectionNames.push("INTRO")
                    this.allTexts["INTRO"] = [];
                    var introEncountered = false;

                    for(let e=0; e < contentLevel.length; ++e) {
                        console.log("contentLevel[e]",contentLevel[e])
                        if(contentLevel[e].type=="text") {
                            if(!introEncountered) {
                                this.allTexts["INTRO"].push(contentLevel[e].text)

                                introEncountered = true;
                            }
                        }
                        else if(contentLevel[e].name=="h") {
                            currentSectionName = contentLevel[e].elements[0].text
                            this.sectionNames.push(currentSectionName)
                            this.allTexts[currentSectionName] = [];
                        }
                    }


                    //these are used for compact=true
                    // this.navigateJson(result);
                    // this.getSubjectSections(result);
                    // this.getText(result);
                    // console.log(this.allTexts);

                    
                })
            // }
            
        }
        
    }
    getText(data) {
        var dataObj = JSON.parse(data);
        var textLvl = dataObj["root"]["_text"]


        
        for(let s=0; s < this.sectionNames.length; ++s) {
            this.allTexts[this.sectionNames[s]] = [];
        }
        
        var currentSectionIdx = 0;

        if(textLvl!=null) {
            console.log("textLvl", textLvl)
            if(Array.isArray(textLvl)) {        //is an array of objects
                
                for(let obj=0; obj < textLvl.length; ++obj) {
                    console.log('textLvl[obj]',textLvl[obj])
                    var text = textLvl[obj]._text;
                    text = text.replace("\n\n","")
                    if(text.substr(0,3) == "```") {
                        this.sectionNames = ["INTRO"].concat(this.sectionNames)
                        this.allTexts["INTRO"] = [text];
                    }
                    else if(text[0] =="\n"){
                        ++currentSectionIdx;
                        this.allTexts[this.sectionNames[currentSectionIdx]].push(text)
                    }
                    else if(text.substr(0,2)=="\n*") {  //a bullet in a list

                    }
                    else {
                        this.allTexts[this.sectionNames[currentSectionIdx]].push(text)
                    }
                   
                }
            }
            else {                                  //is an object
                
                // console.log(textLvl._text)
            }
        }
    }
    getSubjectSections(data) {
        var dataObj = JSON.parse(data);
        var hLvl = dataObj["root"]["h"]

        if(hLvl!=null) {
            if(Array.isArray(hLvl)) {        //is an array of objects
                for(let obj=0; obj < hLvl.length; ++obj) {
                    this.sectionNames.push(hLvl[obj]._text.replaceAll('=',''))
                   
                }
            }
            else {                                  //is an object
                this.sectionNames.push(hLvl._text.replaceAll('=',''))
                
            }
        }
    }
    navigateJson(data) {


        /*
        from the "root" level:
            "template" --> if title of item in this container begins with "Infobox", it may be a box of stats/ a table ?
            "h" --> names of the sections in the Wikipedia article
            "_text" --> ALL the text meant to be readable
                for elements in _text:
                    if the first one starts with \n\n, its intro
                    After that, if it starts with \n, its the beginning of the next section.

        */


        var dataObj = JSON.parse(data);
        // var rootLvl = dataObj["root"]
        
        var templateLvl = dataObj["root"]["template"]
        
        if(templateLvl!=null) {
            if(Array.isArray(templateLvl)) {        //is an array of objects
                for(let obj=0; obj < templateLvl.length; ++obj) {
                    var tempKeys = Object.keys(templateLvl[obj]);
                    for(let k=0; k < tempKeys.length; ++k) {
    
                    }
                }
            }
            else {                                  //is an object
                var tempKeys = Object.keys(templateLvl);
                for(let k=0; k < tempKeys.length; ++k) {
                    
                }
            }
        }
            
        
        
    }

    

    render() {
        
        return (
            <div>
           
            </div>


        )
    }

}