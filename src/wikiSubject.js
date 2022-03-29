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


function reformatURL(url) {
    url = url.replaceAll(/(\s)/gi, "%20")
    url = url.replaceAll(/\"/gi, "%22")
    url = url.replaceAll(/\'/gi, "%27")
    url = url.replaceAll(/\,/gi, "%2C")
    url = url.replaceAll(/\</gi, "%3B")
    url = url.replaceAll(/\>/gi, "%3E")
    url = url.replaceAll(/\?/gi, "%3F")
    url = url.replaceAll(/\[/gi, "%5B")
    url = url.replaceAll(/\]/gi, "%5D")
    url = url.replaceAll(/\{/gi, "%7B")
    url = url.replaceAll(/\|/gi, "%7C")
    url = url.replaceAll(/\}/gi, "%7D")

    return url;
}

export class WikiSubject extends React.Component {
    constructor(props) {
        super(props);

        // this.data = props.isGenerated?
        this.initRandomSubject = this.initRandomSubject.bind(this);
        this.extractSubjectData = this.extractSubjectData.bind(this);
      
        this.onFetchComplete = this.onFetchComplete.bind(this);
        this.branchLinksInSection = this.branchLinksInSection.bind(this);

        this.data = [];

        this.sourceObj = null;
        this.initRandomSubject();
     
    }


    async onFetchComplete(data) {
        var results = []
    
        var keys = Object.keys(data.query.pages)
        
        for(let k=0; k < keys.length; ++k) {
            results.push(data.query.pages[parseInt(keys[k])])
        }
        this.sourceObj = results 

    }
    
    

    async initRandomSubject() {

        // add &grnlimit=2 to specify the number of randomly generated pages
        var url = `https://www.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&origin=*&callback=?&prop=iwlinks`                    
        
        //for testing purposes
        // var url = `https://www.wikipedia.org/w/api.php?action=query&titles=Assets%20under%20management&grnnamespace=0&format=json&origin=*&callback=?&prop=links&pllimit=max&plnamespace=0`
    
        await getJSONP(url, this.onFetchComplete);


        setTimeout(()=>{
            console.log(this.sourceObj);

            this.extractSubjectData();
        }, 500);
      
        // `http://en.wikipedia.org/?curid=${}`
       
    }
    branchLinksInSection(section) {
        
    }

    extractSubjectData() {
        for(let k=0; k < this.sourceObj.length; ++k) {
            var title = this.sourceObj[k].title;
            var urlFormattedTitle = reformatURL(title);
            // var urlFormattedTitle = []

            // for(let c=0; c < title.length; ++c) {
            //     if(title[c].charCodeAt(0) >=32 && title[c].charCodeAt(0)<=44) {
            //         urlFormattedTitle.push(`%${title[c].charCodeAt(0).toString(16)}`)
            //     }
            //     else urlFormattedTitle.push(title[c]);
                
            // }
            // urlFormattedTitle = urlFormattedTitle.join('');
            var req = new Request(`http://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${urlFormattedTitle}&prop=parsetree&formatversion=2`,
            // var req = new Request(`http://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=Assets%20under%20management&prop=parsetree&formatversion=2`,
            {method:'GET',mode:'cors'})        
            fetch(req)
            .then(response => {return response.json()})
            .then(data => {
                
                var result = convert.xml2json(data.parse.parsetree, {compact: false, spaces: 4});       //  https://goessner.net/download/prj/jsonxml/

                var contentLevel = JSON.parse(result)["elements"][0]["elements"]
    
                //the 1st text-type element is the introduction
                //if element has name "h", it's the header for the section following it

                var introCompleted = false;
                var introInProgress = false;
               
                var currentSectionObj = this.data;

                 // \n* means it's a bullet point
                
                for(let e=0; e < contentLevel.length; ++e) {
                    // console.log("contentLevel[e]",contentLevel[e])

                   
                    if(contentLevel[e].type=="text") {
                        var matchLinkRE = /\[\[(.*?)\]\]/gi
                        var matchNewLine = /\n(?!\*)/gi     //for unnecessary newline characters; ones that are not used with bullet points.
                        contentLevel[e].text = contentLevel[e].text.replaceAll(matchNewLine, '')
                        if(!introCompleted && !introInProgress) {
                            var introElement = {sectionName:"INTRO", text:contentLevel[e].text, idx:[null], sectionLevel:1, sectionOrder:1, childSections:[], links: []}
                            var foundLinks = contentLevel[e].text.match(matchLinkRE);

                            introElement.links = foundLinks != null? introElement.links.concat(foundLinks) : introElement.links;
                            
                            
                            introInProgress = true;
                            this.data.push(introElement)
                            currentSectionObj = this.data[this.data.length-1]
                        }
                        
                        else {
                            
                            if(currentSectionObj.childSections.length > 0) {
                                var parentObj = currentSectionObj.childSections[currentSectionObj.childSections.length-1]
                                parentObj.text += contentLevel[e].text
                                var foundLinks = contentLevel[e].text.match(matchLinkRE);
                                parentObj.links =  foundLinks!=null? parentObj.links.concat(foundLinks) :  parentObj.links
                            }
                            
                            else {
                                currentSectionObj.text += contentLevel[e].text
                                var foundLinks = contentLevel[e].text.match(matchLinkRE);
                                currentSectionObj.links = foundLinks!=null? currentSectionObj.links.concat(foundLinks) : currentSectionObj.links;
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
                        
                        var idx = null
                        var previousSectionIdx = this.data.length-1;
                        var previousSection = this.data[previousSectionIdx]
                        if(headerLevel!=2) {        //this header is not a top level section
                            if(previousSection.sectionLevel < headerLevel) {        //this header is a child section of the previous section
                                idx = previousSection.idx.concat(previousSection.childSections.length)
                            
                                // currentSectionObj = currentSectionObj[idx[0]]
                                // for(let l=1; l < idx.length-1; ++l) {
                                //     currentSectionObj = currentSectionObj.childSections[idx[l]]
                                // }
                                var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, childSections:[], links:[]}
                                if(currentSectionObj==this.data) this.data.push(element)
                                else currentSectionObj.childSections.push(element)

                            }
                            else if(previousSection.sectionLevel > headerLevel) {   //the previous section was a child section
                                var diff = previousSection.sectionLevel - headerLevel;
                                idx = previousSection.idx.slice(0,previousSection.idx.length-diff)
                                idx[idx.length-1] = idx[idx.length-1]+1

                               
                                // currentSectionObj = currentSectionObj[idx[0]]
                                // for(let l=1; l < idx.length-1; ++l) {
                                //     currentSectionObj = currentSectionObj.childSections[idx[l]]
                                // }
                                var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, childSections:[], links:[]}
                                currentSectionObj.childSections.push(element)

                            }
                            else {   //the previous section and this section are siblings, and are children of the same parent
                                idx = previousSection.idx;
                                idx[idx.length-1] = idx[idx.length-1]+1;
                                
                                // currentSectionObj = currentSectionObj[idx[0]]
                                // for(let l=1; l < idx.length-1; ++l) {
                                //     currentSectionObj = currentSectionObj.childSections[idx[l]]
                                // }
                                var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, childSections:[], links:[]}
                                currentSectionObj.childSections.push(element)
                                
                            }
                            
                        }
                        
                        else {      //this header is a top level section
                            idx = [this.data.length]
                            var element = {sectionName:headerName, text:'', idx:idx, sectionLevel:headerLevel, sectionOrder:headerOrder, childSections:[], links:[]}
                            this.data.push(element)
                            currentSectionObj = this.data[this.data.length-1]
                        }
                    }
                }
                console.log("this.data", this.data)
            })

            
        }
        
    }

    

    render() {
        
        return (
            <div>
           
            </div>


        )
    }

}