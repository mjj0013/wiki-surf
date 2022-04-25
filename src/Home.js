// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React, { useEffect ,useState} from 'react';
import {AppContext} from './AppContext.js';
// import {chartEvents} from './chartEventHandlers.tsx'
const userAgents = require("user-agents");
import { ReactGoogleChartEvent, Chart } from 'react-google-charts';


import {WikiSubject, wikiTitleSearch, countryBaseData} from './wikiSubject.js';
import { SideBarWrapper } from './sideBarForm.js';
import {sendRequestToBackend} from './frontEndHelpers.js';


import {abridgedCategories, regionCodes, regionData, regionCodesReformatted} from '../server/geoHelpers.js';
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



var countryOptions = {region:"US" }




// console.log('google.visualization,',google.visualization)
// var regionData = google.visualization.arrayToDataTable([
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








function fetchVitalDB(fileName, createIfNotExist=false) {

    // "List_of_ISO_3166_country_codes"
    var headers = {"Content-Type":"application/json", "Accept":"application/json"}
    var req1 = new Request("./server/fetchData", {method:"POST", headers:headers, body: JSON.stringify({isVital:true, fileName:fileName, fileType:"json"})})
    sendRequestToBackend(req1)
    .then(result=>{
        console.log("result", result)
        if(result.message) {
            
            if(result.message == "does not exist") {
                if(createIfNotExist) {
                    var obj = new WikiSubject({extractTables:true, wikiTitle:fileName,depth:1, waitBuild:true});
                    obj.build()
                    .then(result=> {
                        var bodyStr = JSON.stringify({data:obj.tableData, isVital:true, fileType:"json", fileName:fileName});
                        var req = new Request('/server/savetables', {  method:"POST",  headers:headers,    body: bodyStr   })
                        sendRequestToBackend(req);
                    })
                }
            }
        }
    })


    
    
}





export var Home = () => {   
    var searchTerms = []

    // setInterval(()=>{
    //     regionData[3][1] += 1;
    //     console.log(document.getElementById("worldMap"))
    // }, 300);
    
    // var a = new WikiSubject({depth:1, wikiTitle:"Depopulation of the Great Plains"})

    // const [countryOptions, setCountryOptions] = useState({region:"US" });       //, displayMode:"regions",resolution:"countries"
    
    const [data,setRegionData] = useState(regionData);
    // useEffect(()=> {
    //     setInterval(()=>{
    //         data[3][1] += 25;
    //         setRegionData([...data])
    //     },50)
    // },[]);

    

    
    function searchTabChanged(e) {
        if(e.target.id=="globalSearchTab") {
            setCurrentTab("globalSearchTab");
    
        }
        if(e.target.id=="byCountrySearchTab") {
            setCurrentTab("byCountrySearchTab");
        }
    }
    
    
    

    

    function displayMapValues(moduleName, data) {
        if(moduleName=="interestByRegion") {
            var header= ["Region", ...searchTerms];
            // for(let t=0; t < searchTerms.length; ++t) {
            //     header.push(searchTerms[t])
            // }
            var includedCountries = Object.keys(regionCodes)
            var newregionData = [header]
            for(let reg=0; reg < data.georegionData.length; ++reg) {
                var regData = data.georegionData[reg];
                if(!includedCountries.includes(regData.geoName)) continue;
                
                var termData = [regData.geoName]
                for(let term=0; term < regData.value.length; ++term) {
                    if(regData.hasData[term]) termData.push(regData.value[term])
                    else termData.push(0)
                }
                newregionData.push(termData);
                // if(regData.hasData[0]) newregionData.push([data.georegionData[reg].geoName,data.georegionData[reg].value[0]])
            }
            setRegionData(newregionData)
        }
    }
    
    async function displayResults(moduleName, results) {
        var resultItemList = document.getElementById("resultItemList")
        while(resultItemList.firstChild) resultItemList.removeChild(resultItemList.firstChild);
        for(let i =0; i < results.length; ++i) {
            var li = document.createElement("li");
            var img = document.createElement("img");

            li.className = "list-group-item"   
            if(moduleName=="dailyTrends") {
                li.innerHTML =results[i].title.query + " | +" + results[i].formattedTraffic + " views";
                img.src = results[i].image.imageUrl
            }
            else if(moduleName=="realTimeTrends") {
                li.innerHTML = results[i].title;
                img.src = results[i].image.imgUrl
            }
            else if(moduleName=="interestByRegion") {}
            // getWikiData(results[i].title.query)
    
            resultItemList.appendChild(li)
            li.appendChild(img) 
        }
    }
    const mouseSelectRegion = [
        {
            eventName:"select",
            callback: ({chartWrapper}) => {
                const chart = chartWrapper.getChart();
                const selection = chart.getSelection();
                if(selection.length==1) {
                    const [selectedItem] = selection;
                    const dataTable = chartWrapper.getDataTable();
                    
                    var regionName = dataTable.getValue(selectedItem.row,0)
                    setCountryOptions({region:regionCodes[regionName]})
                    document.getElementById("regionElement").value = regionCodes[regionName]
                    document.getElementById("regionElement").name = regionName
                    if(!document.getElementById("byCountrySearch").classList.contains("active")) document.getElementById("byCountrySearchTab").click();
                }
            },

        },
    ]
    function processClientRequest(body) {
        // create form where the user inputs the search criteria (geo, time, phrase) for the trends. put that search criteria in the request body
        // other possible modules:    relatedQueries, relatedTopics, interestOverTime, interestByRegion
        
        var headers = {"Content-Type":"application/json", "Accept":"application/json"}
        var req = new Request('/server', {  method:"POST",  headers:headers,    body: JSON.stringify(body)   })
    
        sendRequestToBackend(req).then(result=>{
            if(result.ok) {
                setReadyResults(result);
                // if(result.moduleName=="dailyTrends") displayResults(result.data.searches)
                // else if(result.moduleName=="realTimeTrends") displayResults(result.data.searches)
                // else if(result.moduleName=="interestByRegion") displayMapValues(result.data);
            }
            
        })
    }
    // fetchVitalDB("List_of_ISO_3166_country_codes",true)
    fetchVitalDB("ISO_3166-2",true);
   
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [countryOptions, setCountryOptions] = useState({region:"US" });       //, displayMode:"regions",resolution:"countries"
    const [currentTab, setCurrentTab] = useState("globalSearchTab"); 
    const [searchClicked, setSearchClicked] = useState(false);
    const [readyResults, setReadyResults] = useState(null);
    const [inputData, setInputData] = useState(null);
    useEffect(()=> {
        if(searchClicked) {
            // if(inputData.module=="dailyTrends" || inputData.module=="realTimeTrends") {
            //     let offCanvas = new bootstrap.Offcanvas(document.getElementById("resultsOffcanvas"))
            //     offCanvas.show();
            // }
            processClientRequest(inputData)

        }
        
    });
    return (

            <SideBarWrapper setInputData={setInputData} inputData={inputData} readyResults={readyResults} setReadyResults={setReadyResults} searchClicked={searchClicked} setSearchClicked={setSearchClicked} setCurrentTab={setCurrentTab} setCountryOptions={setCountryOptions} isVisible={sideBarVisible} setVisible={setSideBarVisible}>
            <div>
                <button type="button" className="btn-primary" aria-label="Show" onClick={(e, data) => setSideBarVisible(sideBarVisible?false:true)} />
                <ul className="nav nav-tabs" role="tablist">
                    <li>
                        <button id="globalSearchTab" className="nav-link active"  onClick={(e)=>searchTabChanged(e)} data-bs-toggle="tab" data-bs-target="#globalSearch" type="button" role="tab" aria-controls="globalSearch" aria-selected="true">Global</button>
                    </li>
                    <li> 
                        <button id="byCountrySearchTab" className="nav-link"  onClick={(e)=>searchTabChanged(e)} data-bs-toggle="tab" data-bs-target="#byCountrySearch" type="button" role="tab" aria-controls="byCountrySearch" aria-selected="false">By Country</button>
                    </li>
                </ul>
                <div className="tab-content" id="tabContent">
                    <div id="globalSearch" className="tab-pane fade show active" >
                        <Chart id="worldMap" className="map" chartType="GeoChart" data={regionData}  chartPackages={["corechart","controls"]} chartEvents={mouseSelectRegion} />
                    </div>
                    
                    
                    <div id="byCountrySearch" className="tab-pane fade" >
                        <Chart id="countryMap" className="map" chartType="GeoChart" data={regionData} options={countryOptions}  chartPackages={["geochart","corechart","controls"]} chartEvents={mouseSelectRegion} />
                    </div>
                </div>
                

                {/* <div id="resultsOffcanvas" className="offcanvas offcanvas-start" data-bs-backdrop="false" tabIndex="-1"  aria-labelledby="resultsOffcanvasLabel">
            
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="resultsOffcanvasLabel">Colored with scrolling</h5>
                        
                        <button type="button" id="offCanvasCloseBtn" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <div className="card" style={{"width":"18rem"}}>
                            <div className="card-header">Results</div>
                            <ul id="resultItemList" className="list-group list-group-flush"></ul>
                        </div>
                        
                    </div>
                </div> */}

               
                
            </div>
            </SideBarWrapper>
        
    )
}