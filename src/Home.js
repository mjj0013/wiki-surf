// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React, { useEffect ,useState} from 'react';
import {AppContext} from './AppContext.js';
// import {chartEvents} from './chartEventHandlers.tsx'
const userAgents = require("user-agents");
import { ReactGoogleChartEvent, Chart } from 'react-google-charts';
import {Button} from 'semantic-ui-react';

import {wikiDataSearch, WikiSubject, wikiTitleSearch, countryBaseData} from './wikiSubject.js';
import { SideBarWrapper } from './sideBarForm.js';
import {sendRequestToBackend} from './frontEndHelpers.js';
import usMetroMap, {metrosByState, metroData} from './usMetroMap.js'


import {abridgedCategories, regionCodes, regionCodesReformatted} from '../server/geoHelpers.js';        //regionData
// import { resolve } from 'url';
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





function getWikiTitleData(queryName) {
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







export var Home = () => {   
    var searchTerms = []
   


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
            // getWikiTitleData(results[i].title.query)
    
            resultItemList.appendChild(li)
            li.appendChild(img) 
        }
    }
    var [lastZoom, setLastZoom] = useState({x:0, y:0})

    var [transformMatrix, setTransformMatrix] = useState([1, 0, 0, 1, 0, 0]);
    var transformMatrixHistory = [];
    var zoomIntensity = 0.2;
    var [dragStart, setDragStart] = useState({x:0, y:0})


    var captureZoomEvent = (e) => {
        
        lastZoom.x = e.offsetX;
        lastZoom.y = e.offsetY;
        let delta = e.wheelDelta/1000;
        if(delta) updateZoom(delta);
        return false;
    }
    var updateZoom = (delta) => {
        let wheelNorm = delta;
        let zoomVar = Math.pow(zoomIntensity,wheelNorm);
    
        for(var i =0; i < 6; ++i) {transformMatrix[i] *= zoomVar }
        console.log("zoomVar",zoomVar)
        transformMatrix[4] += (1-zoomVar)*(lastZoom.x);
        transformMatrix[5] += (1-zoomVar)*(lastZoom.y);
        
        
        
        if(selectedRegion == "USA") {
            document.getElementById('usLocal').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        }
        else {
            document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        }
    }

    var closeDragElement = () =>{
        document.onmouseup = null;
        document.onmousemove = null;
    }
    function getTransformedPt(x,y, transformMatrix) {
        var focalPt = new DOMPoint();
        focalPt.x = x;
        focalPt.y = y;
        var matrix = new DOMMatrix(transformMatrix)
        return focalPt.matrixTransform(matrix.inverse());
    }
    
    var dragMouseDown = (e) =>{
        
        e = e || window.event;
        var regionKeys = Object.keys(allRegionProperties);
        if(regionKeys.includes(e.target.id)) {
            var regionA3 = allRegionProperties[e.target.id]["ADM0_A3"];
            console.log('regionHistoryIdx',regionHistoryIdx)
            setRegionHistoryIdx(++regionHistoryIdx)
            regionSelectHistory.push(regionA3)
            
            
        }
        else {
            if(startListingCounties) {
                currentSelectedCounties.push(e.target.id)

                e.target.setAttributeNS(null, "fill", 'rgb(0,0,0)');
            }
          
        }
        lastZoom.x = e.offsetX;
        lastZoom.y = e.offsetY;
        dragStart = getTransformedPt(lastZoom.x, lastZoom.y, transformMatrix);

     

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        return e.preventDefault() && false;
    }
    
    
    var elementDrag = (e) => {    
        e = e || window.event;
        lastZoom = {x:e.offsetX, y:e.offsetY}
      
        
        
        // document.getElementById("worldMap").querySelectorAll("path").attr("d",path)
        if(dragStart) {
            var pt = getTransformedPt(lastZoom.x, lastZoom.y, transformMatrix);
            
            panSVG((pt.x-dragStart.x)/4, (pt.y-dragStart.y)/4)
            
            // projection.rotate([(lambda(lastZoom.x)),theta((lastZoom.y))])
            // d3.select("#continents").selectAll("path").attr("d",path)
        }return e.preventDefault() && false;
    }

    var panSVG = (dx,dy) =>{
        transformMatrix[4] += dx;
        transformMatrix[5] += dy;
        // document.getElementById('usLocal').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        
        // document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        // document.getElementById('curveGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
        // document.getElementById('ptGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);


        if(selectedRegion == "USA") {
            document.getElementById('usLocal').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        }
        else {
            document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        }

    }
    
    function processClientRequest(action, path, body=null) {
        // create form where the user inputs the search criteria (geo, time, phrase) for the trends. put that search criteria in the request body
        // other possible modules:    relatedQueries, relatedTopics, interestOverTime, interestByRegion
        return new Promise((resolve, reject) => {
            var headers = {"Content-Type":"application/json", "Accept":"application/json"}
            var req;
            if(action=="searchClicked") {
                req = new Request(path, {  method:"POST",  headers:headers,    body: JSON.stringify(body)   });
                sendRequestToBackend(req).then(result=>{
                    if(result.ok) {
                        setReadyResults(result);
                        console.log('result',result)
                        resolve();
                        // if(result.moduleName=="dailyTrends") displayResults(result.data.searches)
                        // else if(result.moduleName=="realTimeTrends") displayResults(result.data.searches)
                        // else if(result.moduleName=="interestByRegion") displayMapValues(result.data);
                    }
                    else reject();
                })
            }
            else if(action=="getRegionDb") {
                req = new Request(path, {  method:"GET",  headers:headers   });
                sendRequestToBackend(req).then( result=>{
                    if(result.ok) resolve(result.data);
                    else reject();
                })
            }
        })
    }
    
    const [data,setRegionData] = useState(null);
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [regionOptions, setRegionOptions] = useState([]);       //, displayMode:"continents",resolution:"countries"
    const [currentTab, setCurrentTab] = useState("globalSearchTab"); 
    const [searchClicked, setSearchClicked] = useState(false);
    const [readyResults, setReadyResults] = useState(null);
    const [inputData, setInputData] = useState(null);
    const [mapColorView, setMapColorView] = useState("default");

    


    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
    var W =  1160;      //960 , 1160
    var H = 1000;      // 500 , 1000
    var projection = d3.geo.orthographic()
            .scale(250)
            .translate([W/2, H/2])
            .clipAngle(30)
    var lambda = d3.scale.linear()
        .domain([0,W])
        .range([-180,180])
    var theta = d3.scale.linear()
        .domain([0,H])
        .range([-90,90])
    var path = d3.geo.path()
        .projection(projection)
    var svg;
    var svgConts;

    var [allRegionProperties,setAllRegionProperties]  = useState({});
    var [allCountyProperties,setAllCountyProperties]  = useState({});
    var continents = []

    const [mapCreated, setMapCreated] = useState(false);

    var [selectedRegion, setSelectedRegion] = useState("<global>");
    var continentHues = {"Asia":0, "South_America":90, "Africa":180, "Europe":120, "North_America":60, "Oceania":180, "Antarctica":300, "Seven_seas_open_ocean":240}
    
    
    var seStates = ["AL","GA","MS","TN","SC","NC","FL","AR","LA","KY"]     // "PR"
    var neStates = ["VA","WV",'PA','NY','OH','ME','MD','DE','NJ','CT','RI','MA','NH','VT']      // 'DC',
    var mwStates = ['NE','MI','WI','IA','MO','IL','KS','ND','IN','SD','MN']     //,'SE'
    var swStates=['TX','NM','OK','CA','NV','CO','UT','AZ']
    var nwStates = ['WA','OR','ID','MT','AK','HI', 'WY']
    var usRegionHues = {"midwest":0, "southeast":72, "northwest":144, "southwest":216, "northeast":288}

    const [regionOptionsLoaded, setRegionOptionsLoaded] = useState(false)
    var lastMapColorView = "default"
    var lastSelectedRegion = "<global>"

    // var selectedRegionBox = {x:0,y:0}
    // selectedRegionBox = regionObj.getBBox()

    var [regionSelectHistory,setRegionSelectHistory] = useState(["<global>"]);
    var [regionHistoryIdx,setRegionHistoryIdx] = useState(0);
    var regionNavStarted = false;
    

    function regionNavBtnClicked(e) {
        
        var btnName = e.target.id;
        if(regionHistoryIdx+1==regionSelectHistory.length-1)  document.getElementById("fwdRegionBtn").classList.add("disabled");
        else document.getElementById("fwdRegionBtn").classList.remove("disabled");

        if(regionHistoryIdx-1==0)  document.getElementById("backRegionBtn").classList.add("disabled");
        else document.getElementById("backRegionBtn").classList.remove("disabled");

        if(btnName=="fwdRegionBtn") {
            if(regionHistoryIdx+1 <= regionSelectHistory.length-1) {
                var nextRegion = regionSelectHistory[regionHistoryIdx+1]
                selectedRegion = nextRegion;
               
                setRegionHistoryIdx( ++regionHistoryIdx)
                // if(nextRegion!="<global>") {}
            }
        }
        if(btnName=="backRegionBtn") {
            if(regionHistoryIdx-1 >= 0) {
                var nextRegion = regionSelectHistory[regionHistoryIdx-1]
                selectedRegion = nextRegion;
                setRegionHistoryIdx( --regionHistoryIdx)
            }
        }

        if(btnName=="toGlobalBtn") {
            if(regionSelectHistory[regionSelectHistory.length-1] !="<global>") {
                regionSelectHistory.push("<global>")
                setRegionHistoryIdx( --regionHistoryIdx)
            }
            
        }
        console.log("current Region: "+regionSelectHistory[regionHistoryIdx])
        regionNavStarted = true;
        
    }
    var selectedRegionBox = {width:W, height:H ,cx:W/2, cy:H/2};
    var selectedRegionZoom = 1;
    useEffect(()=> {
        console.log('regionSelectHistory',regionSelectHistory)
        if(!regionNavStarted) regionHistoryIdx = regionSelectHistory.length-1;
        selectedRegion = regionSelectHistory[regionHistoryIdx];
        setSelectedRegion(regionSelectHistory[regionHistoryIdx]);
        if(lastSelectedRegion != selectedRegion) {
            
            
            var worldMap = document.getElementById('worldMap')
            var regionObj = document.getElementById(selectedRegion);
            // regionSelectHistory.push(selectedRegion)
            if(regionSelectHistory.length>1) {
                // document.getElementById("mapBtnGroup").classList.toggle("showing");
                document.getElementById("backRegionBtn").classList.remove("disabled")
                document.getElementById("toGlobalBtn").classList.remove("disabled")  
           
            }

            if(document.getElementById("worldMap").classList.contains("hidden") && selectedRegion!="USA") {
                console.log("changing from US")
                var usCountyMap = document.getElementById("usCountyMap")
                usCountyMap.classList.remove("showing")
                document.getElementById("worldMap").classList.remove("hidden")
                document.getElementById("continents").classList.remove("withEase")
                document.getElementById("continents").classList.remove("usLocal")
            }

            
            if(selectedRegion=="USA") {
                var usCountyMap = document.getElementById("usCountyMap")
                // make alternative map that includes all states compactly
                
                document.getElementById("continents").classList.toggle("withEase")
                document.getElementById("continents").classList.toggle("usLocal")
                
                usCountyMap.classList.toggle("showing")
                document.getElementById("worldMap").classList.toggle("hidden")

                // adjust Hawaii, Alaska, Puerto Rico
                var stateHI = document.getElementById("HI");
                stateHI.setAttributeNS(null, "transform","translate(125 0)")
                var statePR = document.getElementById("PR");
                statePR.setAttributeNS(null, "transform","translate(-50 0)")
                var stateAK = document.getElementById("AK");
                stateAK.setAttributeNS(null, "transform",  "translate(125 175) scale(.3 .3)")

                transformMatrix = [5.751490340144962, 0, 0 ,5.751490340144962 ,-656.582896430975,-514.5546459430193]
                console.log(usCountyMap.getBBox())
                console.log("svg dims", W, H)
                document.getElementById("usLocal").setAttributeNS(null, "transform","matrix(5.751490340144962 0 0 5.751490340144962 -656.582896430975 -514.5546459430193)")
              
                usCountyMap.addEventListener("wheel",(e)=>captureZoomEvent(e),false);
                usCountyMap.addEventListener("DOMMouseScroll", (e)=> captureZoomEvent(e),false);
                usCountyMap.addEventListener("mousedown", (e)=>dragMouseDown(e), false);
                
            }
            else {
                var box = document.getElementById(selectedRegion).getBBox();
                console.log('box',box)
                // var pt = getTransformedPt(lastZoom.x, lastZoom.y, transformMatrix);
                // panSVG((pt.x-dragStart.x)/4, (pt.y-dragStart.y)/4)
                
                // zooming in:  zoomVar, and zoomVar>1
                // zooming out: 1/zoomVar
                // var zoomVar = 1/1.2130435711726304;
                
              
                // selectedRegionBox.cx = box.x + box.width/2;
                // selectedRegionBox.cy = box.y + box.height/2;
                selectedRegionBox.cx = box.x + box.width/2
                selectedRegionBox.cy = box.y + box.height/2
             
                // selectedRegionBox = getTransformedPt(selectedRegionBox.cx, selectedRegionBox.cy, transformMatrix);
                selectedRegionZoom = .5*((selectedRegionBox.width)/(box.width)) 
                // selectedRegionZoom = ((selectedRegionBox.height*selectedRegionBox.width)/(16*box.width*box.height)) 

                var tempMatrix = [1,0,0,1,0,0];
                for(var i =0; i < 6; ++i) {tempMatrix[i] *= (selectedRegionZoom) }
                tempMatrix[4] += (1-selectedRegionZoom)*(selectedRegionBox.cx);
                tempMatrix[5] += (1-selectedRegionZoom)*(selectedRegionBox.cy);
                selectedRegionBox.height = box.height;
                selectedRegionBox.width = box.width;
           
                console.log("vp", document.getElementById("worldMap").viewPort)
                
                transformMatrixHistory.push(transformMatrix)
                transformMatrix = tempMatrix;
                document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);

            }
            lastSelectedRegion = selectedRegion;
        }
        if(!regionOptionsLoaded) {
            processClientRequest("getRegionDb","/server/getRegionDb").then(result=> {
                
                setRegionOptions(result)
                setRegionOptionsLoaded(true)
            })
        }
        if(searchClicked) {
            // if(inputData.module=="dailyTrends" || inputData.module=="realTimeTrends") { }
            if(inputData.geo=="US") {
                // var mKeys = Object.keys(metroData).map(k=> {
                //     return `US-${metroData[k].state}-${k.substr(1)}`
                // })
                // if(inputData.keyword.length==1) {
                //     var newKeyword = []
                //     for(let k=0; k < mKeys.length; ++k) {
                //         newKeyword.push(inputData.keyword[0])
                        
                //     }
                //     inputData.keyword = newKeyword;
                    
                // }
                
                // inputData.geo = mKeys     //mKeys
                // processClientRequest("searchClicked","/server",inputData)
                // let k =0;
                
                // inputData.geo = mKeys  
                console.log(inputData)
                processClientRequest("searchClicked","/server",inputData).then(result=> {
                    console.log("result",result)
                })
                
            }
            else processClientRequest("searchClicked","/server",inputData)

        }

        var idExists = (parent, queryStr) => {
            var selection = d3.select(parent).select(queryStr);
            if(selection.size==1 && selection[0]==null) return;         //then its empty
            else return selection[0][0]; 
        }


        
        svg = d3.select("#worldMap")
        if(!mapCreated) {
            svgConts = d3.select("#continents")
            d3.json("./world_w_us_counties.json", function(error, data) {
                
                // US county level
                for(let p=0; p < data.objects.admin_counties.geometries.length; ++p) {
                    var geometries = data.objects.admin_counties.geometries[p];
                   
                    
                    var stateName = geometries.properties["REGION"];
                    stateName = stateName.replace(/\(|\)/gi, '')
                    stateName = stateName.replace(/\s/gi, '_')


                    
                    // human-readable county name
                    var countyName = geometries.properties["NAME_ALT"];              
                    countyName = countyName.replace(/\(|\)/gi, '')
                    countyName = countyName.replace(/\s/gi, '_')

                    var countyObj = idExists(`#usCountyMap`,`#${geometries.properties["WIKIDATAID"]}`)
                    if(countyObj) {
                        var metroName = document.getElementById(`${geometries.properties["WIKIDATAID"]}`)           //getting metro name by finding parent element of county
                        metroName = metroName? metroName.parentElement.id : null;
                        
                        d3.select(`#${geometries.properties["WIKIDATAID"]}`)
                        .datum(topojson.feature(data, geometries))
                        .attr("d", d3.geo.path().projection(d3.geo.mercator()))
                        .attr("fill", ()=> {
                            if(metroName) return metroData[metroName].color
                            else return 'black'  
                        })
                    }
                    else {
                        d3.select(`#${stateName}`)
                        .append("path")
                        .datum(topojson.feature(data, geometries))
                        .attr("id", geometries.properties["WIKIDATAID"])
                        .attr("d", d3.geo.path().projection(d3.geo.mercator()))
                        .attr("fill", ()=> {
                             return `hsl( ${0}, 40%, 90%)`
                        
                        })
                    }

                    allCountyProperties[geometries.properties["WIKIDATAID"]] = geometries.properties;
                    
                }

                // *********************************************************************************
                // international level
                for(let p=0; p < data.objects.admin.geometries.length; ++p) {
                    var geometries = data.objects.admin.geometries[p];
                    
                   //mercator , orthographic <-- types of projections
                    var contName = geometries.properties["CONTINENT"];
                    contName = contName.replace(/\(|\)/gi, '')
                    contName = contName.replace(/\s/gi, '_')
    
                    if(!continents.includes(contName)) {                // this section is for initializing continents and adding the region belonging to the newly created continent
                        svgConts.append("g")
                            .attr("id",contName)
                            .append("path")
                                .datum(topojson.feature(data, geometries))
                                .attr("id", geometries.properties["ADM0_A3"])
                                .attr("d", d3.geo.path().projection(d3.geo.mercator()))
                                // .attr("d", d3.geo.path().projection(d3.geo.orthographic()))
                                .attr("fill", ()=> {
                                    if(mapColorView=="default") {
                                        return `hsl( 120, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
                                    }
                                    if(mapColorView=="continent") {
                                        return `hsl( ${continentHues[contName]},${getRandomInt(40,55)}%, ${getRandomInt(30,45)}%)`;
                                    }
                                })
                        continents.push(contName);
                        allRegionProperties[geometries.properties["ADM0_A3"]] = geometries.properties;
                    }
                    else {                                          // this section is for adding region to already existing continent
                        var group = d3.selectAll(`#${contName}`)
                        var regionObj = idExists("#continents",`#${geometries.properties["ADM0_A3"]}`)
                        if(regionObj) {
                            regionObj.attr("fill", ()=> {
                                if(mapColorView=="default") {
                                    return `hsl( 120, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
                                }
                                if(mapColorView=="continent") {
                                    return `hsl( ${continentHues[contName]}, ${getRandomInt(40,55)}%, ${getRandomInt(30,45)}%)`
                                }
                            })
                            continue;
                        }
                        group.append("path")
                            .datum(topojson.feature(data, geometries))
                            .attr("id", geometries.properties["ADM0_A3"])
                            .attr("d", d3.geo.path().projection(d3.geo.mercator()))
                            // .attr("d", d3.geo.path().projection(d3.geo.orthographic()))
                            .attr("fill", ()=> {
                                if(mapColorView=="default") {
                                    return `hsl( 120, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
                                }
                                if(mapColorView=="continent") {
                                    return `hsl( ${continentHues[contName]}, ${getRandomInt(40,55)}%, ${getRandomInt(30,45)}%)`    
                                }
                            })
                        allRegionProperties[geometries.properties["ADM0_A3"]] = geometries.properties;
                    }
                }
                console.log("allRegionProperties",allRegionProperties)
                
                
            })
            var worldMap = document.getElementById("worldMap")
            worldMap.addEventListener("wheel",captureZoomEvent,false);
            worldMap.addEventListener("DOMMouseScroll", captureZoomEvent,false);
            worldMap.addEventListener("mousedown", dragMouseDown, false);
            setMapCreated(true)
        }
        else {
            var regionKeys = Object.keys(allRegionProperties);
            if(lastMapColorView != mapColorView) {
                for(let k=0; k < regionKeys.length; ++k) {
                    var key = regionKeys[k];
                    var regionObj = allRegionProperties[key];
                    var contName = regionObj["CONTINENT"];
                    contName = contName.replace(/\(|\)/gi, '')
                    contName = contName.replace(/\s/gi, '_')
    
                    svg.select("#continents").select(`#${contName}`)
                    .select(`#${key}`)
                    .attr("fill", ()=> {
                        if(mapColorView=="default") {
                            return `hsl( 120, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
                        }
                        if(mapColorView=="continent") {
                            return `hsl( ${continentHues[contName]}, ${getRandomInt(40,55)}%, ${getRandomInt(30,45)}%)`    
                        }
                    })
                }
                lastMapColorView = mapColorView;
            }
        }
    },[searchClicked, mapColorView, regionHistoryIdx, selectedRegion]);

    //for orthographic projcetion: https://bl.ocks.org/mbostock/3795040
    // https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
    //SE = 10
    //NE = 15
    //MW = 9
    //SW = 8
    //NW = 6

    var currentSelectedCounties = [];
    var startListingCounties = false

    document.addEventListener("keydown", (e)=> {
        if(e.key=='b') startListingCounties = true;
       
        if(e.key=='e') {
            console.log(currentSelectedCounties)
            startListingCounties = false;
            currentSelectedCounties = []
        }
    }, false)
    var metroKeys = Object.keys(metroData);
    for(let m=0; m < metroKeys.length; ++m) {
        metroData[metroKeys[m]]["color"] = `hsl( ${getRandomInt(0,359)}, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
    }

    return (
            <SideBarWrapper regionHistoryIdx={regionHistoryIdx}  setRegionHistoryIdx={setRegionHistoryIdx} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} mapColorView={mapColorView} setMapColorView={setMapColorView} sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible} setInputData={setInputData} inputData={inputData} readyResults={readyResults} setReadyResults={setReadyResults} searchClicked={searchClicked} setSearchClicked={setSearchClicked} setCurrentTab={setCurrentTab} regionOptions={regionOptions} setRegionOptions={setRegionOptions} isVisible={sideBarVisible} setVisible={setSideBarVisible}>
                <div id="globalSearch" >
                   <div id="mapBtnGroup" className="regionNavBtnGroup">
                        <Button id="backRegionBtn" className="regionNavBtn" onClick={(e)=>regionNavBtnClicked(e)} attached icon="arrow left" />
                        <Button id="toGlobalBtn" className="regionNavBtn" onClick={(e)=>regionNavBtnClicked(e)} attached icon={<i className="bi bi-globe2"></i>}/>
                        <Button id="fwdRegionBtn" className="regionNavBtn" onClick={(e)=>regionNavBtnClicked(e)} attached icon="arrow right"/>
                   </div>
                    
                    <svg id="usCountyMap" className="map" width={W} height={H} >
                        <filter id="landShadows">
                            <feGaussianBlur stdDeviation={1} result="shadowBlur" />
                            <feComposite operator='out' in='SourceGraphic' in2="shadowBlur" result="insetShadow" />
                            <feFlood floodColor="black" floodOpacity={.95} result="shadowColor" />
                            <feComposite operator="in" in="shadowColor" in2="insetShadow" result="shadow" />
                            <feComposite operator="over" in="shadow" in2="SourceGraphic" />

                        </filter>
                        <rect className="ocean"/>
                        <g id="usLocal">

                            <g id="southeast">        
                                { seStates.map((s,idx0)=> { return (
                                        <g id={s} key={idx0} className="state">
                                            { metrosByState[s].map((x, idx1)=> { return ( 
                                            <g id={x.metroId} key={idx1} className="metro">  
                                                { metrosByState[s][idx1].counties.map((y,idx2)=> { return (
                                                <path id={y} key={idx2} className="county" />) })
                                                }
                                            </g> ) })
                                            }
                                        </g> )})
                                }      
                                <g id="PR"/>
                            </g>
                            <g id="northeast">
                                {  neStates.map((s,idx0)=> { return (
                                        <g id={s} key={idx0} className="state">
                                            { metrosByState[s].map((x, idx1)=> {  return ( 
                                            <g id={x.metroId} key={idx1} className="metro">  
                                                { metrosByState[s][idx1].counties.map((y,idx2)=> { return (
                                                <path id={y} key={idx2} className="county" />) })
                                                }
                                            </g> ) })
                                            }
                                        </g> )})
                                }      
                            </g>
                            
                            <g id="midwest">
                            { mwStates.map((s,idx0)=> { return (
                                <g id={s} key={idx0} className="state">
                                    { metrosByState[s].map((x, idx1)=> { return ( 
                                    <g id={x.metroId} key={idx1} className="metro">  
                                        { metrosByState[s][idx1].counties.map((y,idx2)=> { return (
                                        <path id={y} key={idx2} className="county"/>) })
                                        }
                                    </g> ) })
                                    }
                                </g>)})
                            }      
                            </g>
                            <g id="southwest">
                            { swStates.map((s,idx0)=> { return (
                                <g id={s} key={idx0} className="state">
                                    { metrosByState[s].map((x, idx1)=> { return ( 
                                    <g id={x.metroId} key={idx1} className="metro">  
                                        { metrosByState[s][idx1].counties.map((y,idx2)=> {return (
                                        <path id={y} key={idx2} className="county"/>) })
                                        }
                                    </g> ) })
                                    }
                                </g> ) })
                            } 
                            </g>
                            
                            <g id="northwest">
                            { nwStates.map((s,idx0)=> { return (
                                <g id={s} key={idx0} className="state">
                                    { metrosByState[s].map((x, idx1)=> { return ( 
                                    <g id={x.metroId} key={idx1} className="metro">  
                                        { metrosByState[s][idx1].counties.map((y,idx2)=> { return (
                                        <path id={y} key={idx2} className="county"/>) })
                                        }
                                    </g> ) })
                                    }
                                </g> ) })
                            } 
                            </g>
                        </g>
                    </svg>
                    <svg id="worldMap" className="map" width={W} height={H} >
                        <rect className="ocean"/>
                        <g id="continents"/>
                    </svg>
                </div>

            </SideBarWrapper>
        
    )
}