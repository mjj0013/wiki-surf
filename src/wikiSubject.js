import React from 'react';
// import "regenerator-runtime/runtime";


//https://en.wikipedia.org/wiki/Special:Random/api.php?&origin=*
// See also links: id="mw-content-text" --> class="mw-parser-output" --> <ul>



//"https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=Belgium&limit=5"


export class WikiSubject extends React.Component {
    constructor(props) {
        super(props);

        // this.data = props.isGenerated?
        this.getNewSubject = this.getNewSubject.bind(this);
        this.branchSubject = this.branchSubject.bind(this);

        
    }

    getNewSubject() {
        //http://en.wikipedia.org/w/api.php?origin=*&action=query&generator=random&prop=extracts&exchars=500&format=json&callback=onWikipedia
        // fetch("https://en.wikipedia.org/api.php?&origin=*/wiki/Special:Random/")
        fetch("http://en.wikipedia.org/w/api.php?origin=*&generator=random&action=query")
        .then(response => {
            return response;
        })
        .then(data=> {
            console.log("data",data);
        })
        return;
    }

    branchSubject() {

    }

    

    render() {
        
        return (
            <div>
                {this.getNewSubject()}
            </div>


        )
    }

}