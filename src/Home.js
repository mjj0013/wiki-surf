// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React from 'react';
import {AppContext} from './AppContext.js';

import {Chart} from 'react-google-charts';
// import noUiSlider from 'nouislider';

import {WikiSubject, wikiTitleSearch} from './wikiSubject.js';

// https://www.statista.com/statistics/262966/number-of-internet-users-in-selected-countries/
// https://worldpopulationreview.com/countries
// also, https://www.cia.gov/the-world-factbook/field/internet-users/country-comparison/

//Internet users (2022)
//  US: 307.2 million internet users         ,       334805269 total     , 91.75%      36/km² population density
//  India: 658 million        internet users ,       1,406,631,776 total , 46.77%      428/km² population density
//  China: 1000 million internet users       ,       1,448,471,400 total , 69%,       149/km² population density
//  Japan 118.3 million     internet users   ,       125,584,838 total   , 94.2%      332/km² population density
//  Mexico: 96.87 million   internet users          131,562,772 total    , 73.63%           67/km² density
//  Russia: 129.8 million  internet users        145,912,025 total       , 88.95%      9/km² density
//  Germany: 78.02 million internet users         83,900,473 total,       , 92.99%      235/km² density
//  UK: 66.99 million      internet users       68,497,907 total,       , 97.79%      282/km²
//  Egypt: 75.66 million   internet users       106,156,692 total,      , 71.27%   106/km² density
//  France: 60.92 million  internet users        65,426,179 total       , 93%,         119/km²

import {regionCodes} from '../server/geoHelpers.js';
var searchTerms = [];


var mapData = [
    ["Country","Latitude"],
    ["Algeria", 36],
    ["Angola", -8]
];
var mapOptions = {
    region:"002",
    colorAxis:{colors:["#00853f", "green", "#e32325"]},
    backgroundColor:"#81d4fa",
    datalessRegionColor:"#f8bbd0",
    defaultColor:"#f5f5f5"
}


const regions = Object.keys(regionCodes)
const regionCodesReformatted = regions.map(i=>{return {name:i, code:regionCodes[i]}})
regionCodesReformatted.sort(function(a,b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
})


import {sendRequestToBackend} from './frontEndHelpers.js';
function getWikiData(queryName) {
    wikiTitleSearch(queryName)
    .then(result=> {
        console.log('result',result)
        return result;
        
    })
    .then(wikiTitle=> {
        console.log(wikiTitle)
        var wikiSubjObj = new WikiSubject({wikiTitle:wikiTitle, depth:1})
        console.log("obj", wikiSubjObj)
    })
}
            


function searchClicked() {
    var moduleSelect = document.getElementById("moduleSelectElement").value
    listTrends(moduleSelect);
}


function listTrends(moduleName) {
    // create form where the user inputs the search criteria (geo, time, phrase) for the trends. put that search criteria in the request body
    // other possible modules:    relatedQueries, relatedTopics, interestOverTime, interestByRegion
    
    var region = document.getElementById("regionElement").value

    var tempCriteria = {
        module:moduleName,     
        region:region? region : null,
    }

    if(moduleName=="dailyTrends") {
        var trendDate = document.getElementById("trendDateElement").value
        tempCriteria["trendDate"] = trendDate;
    }
    else if(moduleName=="interestOverTime") {
        var startDate = document.getElementById("startDateElement").value
        var endDate = document.getElementById("endDateElement").value
        var searchTerms = []
        var searchTermElements = document.getElementsByClassName('search-term');
        for(let e=0; e < searchTermElements.length; ++e) {
            
            if(!searchTerms.includes(searchTermElements[e].innerText)) searchTerms.push(searchTermElements[e].innerText)
        }
        
        tempCriteria["keyword"] = searchTerms;
        tempCriteria["startTime"] = startDate;
        tempCriteria["endTime"] = endDate;
    }
    var headers = {"Content-Type":"application/json", "Accept":"application/json"}
    var req = new Request('/server', {  method:"POST",  headers:headers,    body: JSON.stringify(tempCriteria)   })

    sendRequestToBackend(req).then(result=>{
        if(moduleName=="dailyTrends") displayResults(result.data.searches)
        else {console.log(result)}
    })
}

async function displayResults(results) {
    var resultItemList = document.getElementById("resultItemList")
    while(resultItemList.firstChild) resultItemList.removeChild(resultItemList.firstChild);
    results.sort(function(a,b){
        return parseInt(b.formattedTraffic) - parseInt(a.formattedTraffic)
    })
    for(let i =0; i < results.length; ++i) {
        var li = document.createElement("li");
        li.className = "list-group-item"
        
        li.innerHTML =results[i].title.query + " | +" + results[i].formattedTraffic + " views";
        getWikiData(results[i].title.query)
        // translate(results[i].snippet,{to:'en'})
        // .then(result=>{console.log("snippet",result);})
        var img = document.createElement("img");
        img.src = results[i].image.imageUrl

        resultItemList.appendChild(li)
        li.appendChild(img)
        
    }

}

function addKeywordPressed() {
    var termList = document.getElementById("termList");
    var keywordInput = document.getElementById('keywordInput');
    if(keywordInput.value.length==0) return;

    var item = document.createElement('div');
    item.className = "search-term";
    var icon = document.createElement('i');
    icon.className="bi bi-x";
    icon.addEventListener("click", (e)=> {  termList.removeChild(item);  })
    var span = document.createElement("span");
    span.innerHTML = keywordInput.value;
    item.appendChild(span);
    item.appendChild(icon);
    termList.appendChild(item);
    keywordInput.value = '';
}

function keyPressedOnKeywordInput(e) {
    e.preventDefault();
    if(e.key == "Enter" || e.key=="Tab") {
        addKeywordPressed();
    }
}
function moduleChanged() {
    var moduleName = document.getElementById('moduleSelectElement').value;
    if(moduleName=="dailyTrends") {
        document.getElementById('dateRangeSection').style.display = 'none';
        document.getElementById('trendDateSection').style.display = 'block';
        document.getElementById('keywordEntrySection').style.display = 'none'

    }
    else if(moduleName=="interestOverTime") {
        document.getElementById('dateRangeSection').style.display = 'block';
        document.getElementById('trendDateSection').style.display = 'none';
        document.getElementById('keywordEntrySection').style.display = 'block'
        
    }
}
export var Home = () => {      
    // This is the map instance
    return (
        <div>
            <nav>
                <div className="nav nav-tabs" role="tablist">
                    <button className="nav-link active" id="globalSearchTab" data-bs-toggle="tab" data-bs-target="#globalSearch" type="button" role="tab" aria-controls="globalSearch" aria-selected="true">Global</button>
                    <button className="nav-link" id="byCountrySearchTab" data-bs-toggle="tab" data-bs-target="#byCountrySearch" type="button" role="tab" aria-controls="byCountrySearch" aria-selected="false">By Country</button>
                </div>
            </nav>
            <div className="tab-content" id="tabContent">
                {/* <div className="tab-pane fade show active" id="globalSearch" role="tabpanel" aria-labelledby='globalSearchTab'>
                    <Chart className="map" chartType="GeoChart" data={mapData}/>
                </div> */}
                <div className="tab-pane fade show active" id="byCountrySearch" role="tabpanel" aria-labelledby='byCountrySearchTab'>
                    <label htmlFor="moduleSelectElement">Module:</label>
                    <select id="moduleSelectElement" onChange={moduleChanged}>
                        <option value="dailyTrends">Daily Trends</option>
                        <option value="interestOverTime">Interest Over Time</option>
                    </select>
                    <div id="keywordEntrySection" >
                        <label htmlFor="keywordField">Keyword(s):</label>
                        <div id="keywordField" className="search-container">
                            <div id="termList" className="search-term-container">
                                <div>
                                    <input id='keywordInput' onKeyUp={(e)=> keyPressedOnKeywordInput(e)}/>
                                    <button id="addKeywordButton" onClick={addKeywordPressed} style={{display:'block'}}>
                                        <img src="plus.svg" width="25" height="25"></img>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    <div id="trendDateSection">
                        <label htmlFor="trendDateElement">Trend date:</label>
                        <input type="date" id="trendDateElement" min="2004-01-01"/>
                    </div>
                    
                    <div id="dateRangeSection" style={{display:'none'}}>
                        <label htmlFor="startDateElement">Start date:</label>
                        <input type="date" id="startDateElement" min="2004-01-01"/>

                        <label htmlFor="endDateElement">End date:</label>
                        <input type="date" id="endDateElement" />
                    </div>

                    <label htmlFor="regionElement">Region:</label>
                    <select id="regionElement">
                        {
                            regionCodesReformatted.map((obj,idx)=>{return (<option key={idx} value={obj.code}>{obj.name}</option>)})
                        }
                    </select>
                    
                    <button onClick={searchClicked} >Search</button>
                
                    

                    <div className="card" style={{"width":"18rem"}}>
                        <div className="card-header">Results</div>
                        <ul id="resultItemList" className="list-group list-group-flush"></ul>
                    </div>
                </div>
            </div>
        </div>
        
    )
}