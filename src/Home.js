// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React, { useEffect ,useState} from 'react';
import {AppContext} from './AppContext.js';

const userAgents = require("user-agents");
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
    ["Country","Year"],
    ["Algeria", 6],
    ["Angola", 6],
    ["United States", 7],
    ["France", 678],
    ["Germany",987],
    ["Portugal",2546],
    ["Spain", 56],
    ["Russia", 33]
];
var countryData = [
    ["Country","Year"],
    ["Algeria", 6],
    ["Angola", 6],
    ["United States", 7],
    ["France", 678],
    ["Germany",987],
    ["Portugal",2546],
    ["Spain", 56],
    ["Russia", 33]
];


// console.log('google.visualization,',google.visualization)
// var mapData = google.visualization.arrayToDataTable([
//     ["Country","Year"],
//     ["Algeria", new Date(1933, 6, 13)],
//     ["Angola", new Date(1965, 6, 13)],
//     ["United States", new Date(1978, 6, 13)],
//     ["France", new Date(1948, 6, 13)],
//     ["Germany", new Date(1910, 6, 13)],
//     ["Portugal",new Date(1923, 6, 13)],
//     ["Spain", new Date(1988, 6, 13)],
//     ["Russia", new Date(1978, 6, 13)]
// ]);
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
const defaultCountryIdx = regionCodesReformatted.findIndex(x=> {return x.name=="United States"})


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
    
    else if(moduleName=="interestOverTime" || moduleName=="interestByRegion") {
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
        else if(moduleName=="realTimeTrends") {
            console.log("result",result)
        }
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
        // getWikiData(results[i].title.query)
    
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
    if(e.key=="Enter" || e.key=="Tab") addKeywordPressed();
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
    else if(moduleName=="realTimeTrends") {
        document.getElementById('dateRangeSection').style.display = 'none';
        document.getElementById('trendDateSection').style.display = 'none';
        document.getElementById('keywordEntrySection').style.display = 'block'   
    }
    else if(moduleName=="interestByRegion") {
        document.getElementById('dateRangeSection').style.display = 'block';
        document.getElementById('trendDateSection').style.display = 'none';
        document.getElementById('keywordEntrySection').style.display = 'block'   
    }
}







export var Home = () => {   
    // setInterval(()=>{
    //     mapData[3][1] += 1;
    //     console.log(document.getElementById("worldMap"))
    // }, 300);
    

    // useEffect(()=> {
    //     const getData = async ()=> {
    //         setStats()
    //     }
    // })


    const [countryOptions, setCountryOptions] = useState({region:"US" });       //, displayMode:"regions",resolution:"countries"
    
    const [data,setData] = useState(mapData);
    // useEffect(()=> {
    //     setInterval(()=>{
    //         data[3][1] += 25;
    //         setData([...data])
    //     },50)
    // },[]);


    function regionChanged() {
        var selected = document.getElementById("regionElement")
        console.log('selected.value',selected.value)
        if(selected.value=="US") setCountryOptions({...countryOptions,region:selected.value})           // resolution:"provinces", 
        else setCountryOptions({...countryOptions,  region:selected.value})         //resolution:"countries",

    }
    function searchTabChanged(e) {
        if(e.target.id=="globalSearchTab") {
            document.getElementById("regionSection").style.display = "none";
        }
        if(e.target.id=="byCountrySearchTab") {
            document.getElementById("regionSection").style.display = "block";
        }
    }
    return (
        <div>

            <ul className="nav nav-tabs" role="tablist">
                <li>
                    <button className="nav-link active" id="globalSearchTab" onClick={(e)=>searchTabChanged(e)} data-bs-toggle="tab" data-bs-target="#globalSearch" type="button" role="tab" aria-controls="globalSearch" aria-selected="true">Global</button>
                </li>
                <li> 
                    <button className="nav-link" id="byCountrySearchTab" onClick={(e)=>searchTabChanged(e)} data-bs-toggle="tab" data-bs-target="#byCountrySearch" type="button" role="tab" aria-controls="byCountrySearch" aria-selected="false">By Country</button>
                </li>
            </ul>
            <div className="tab-content" id="tabContent">
                <div className="tab-pane fade show active" id="globalSearch" >

                    <Chart id="worldMap" className="map" chartType="GeoChart" data={data}  chartPackages={["corechart","controls"]}/>

                </div>
                <div className="tab-pane fade" id="byCountrySearch">

                    <Chart id="countryMap" className="map" chartType="GeoChart" data={countryData} options={countryOptions}  chartPackages={["corechart","controls"]}/>

                    
                    
                </div>
                <label htmlFor="moduleSelectElement">Module:</label>
                    <select id="moduleSelectElement" onChange={moduleChanged}>
                        <option value="dailyTrends">Daily Trends</option>
                        <option value="realTimeTrends">Real Time Trends</option>
                        <option value="interestOverTime">Interest Over Time</option>
                        <option value="interestByRegion">Interest By Region</option>
                        
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
                    <div id="regionSection" style={{display:'none'}}>
                        <label htmlFor="regionElement">Region:</label>
                        <select id="regionElement" onChange={regionChanged} >
                            {
                                regionCodesReformatted.map((obj,idx)=>{return (<option key={idx} value={obj.code} selected={obj.name=="United States"? true:false}>{obj.name}</option>)})
                            }
                        </select>
                    </div>

                    <div id="categorySection" style={{display:'none'}}>
                        <label htmlFor='categoryElement'>Categories:</label>
                        <select id="categoryElement" onChange={categoryChanged}>
                            
                        </select>
                    </div>
                   

                    <button className="btn btn-primary" type="button" onClick={searchClicked} data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling">Search</button>
                
                    <div id="offcanvasScrolling" className="offcanvas offcanvas-start" data-bs-backdrop="false" tabIndex="-1"  aria-labelledby="offcanvasScrollingLabel">
                        {/* data-bs-scroll="true" */}
                        <div className="offcanvas-header">
                            <h5 className="offcanvas-title" id="offcanvasScrollingLabel">Colored with scrolling</h5>
                            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body">
                            <div className="card" style={{"width":"18rem"}}>
                                <div className="card-header">Results</div>
                                <ul id="resultItemList" className="list-group list-group-flush"></ul>
                            </div>
                            
                        </div>
                    </div>

                    
            </div>
        </div>
        
    )
}