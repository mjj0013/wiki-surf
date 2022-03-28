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
            // var xhr = new XMLHttpRequest()
            for(let l=0; l < this.sourceObj[k].links.length;++l) {
                //&pageids=${this.sourceObj[k].pageid}
                var title = this.sourceObj[k].links[l].title;
                title = title.replaceAll(" ", "%20")
                // &prop=sections
                var req = new Request(`http://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${title}&prop=parsetree&formatversion=2`,
                {
                    method:'GET',
                    mode:'cors'
                })
            
                fetch(req)
                .then(response => {
                   
                   return response.json()
                })
                .then(data => {
                    console.log("data",data);
                    //https://goessner.net/download/prj/jsonxml/
                    
                    var result = convert.xml2json(data.parse.parsetree, {compact: true, spaces: 4});
                    console.log("result",result)
                    // var dom = (new DOMParser()).parseFromString(, "text/xml")
                    // console.log("dom",dom)
                    
                })
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