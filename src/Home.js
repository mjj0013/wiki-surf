// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React, { useEffect ,useState} from 'react';
import {AppContext} from './AppContext.js';
// import {chartEvents} from './chartEventHandlers.tsx'
const userAgents = require("user-agents");
import { ReactGoogleChartEvent, Chart } from 'react-google-charts';
import {Button} from 'semantic-ui-react';

import {WikiSubject, wikiTitleSearch, countryBaseData} from './wikiSubject.js';
import { SideBarWrapper } from './sideBarForm.js';
import {sendRequestToBackend} from './frontEndHelpers.js';


import {abridgedCategories, regionCodes, regionCodesReformatted} from '../server/geoHelpers.js';        //regionData
import { resolve } from 'url';
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

    // const [regionOptions, setRegionOptions] = useState({region:"US" });       //, displayMode:"continents",resolution:"countries"
    
    
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
    var lastZoom = {x:0,y:0}
    var transformMatrix = [1, 0, 0, 1, 0, 0];
    var zoomIntensity = 0.2;
    var dragStart = {x:0, y:0}
    var zoomHasHappened = 0;
    var captureZoomEvent = (e) => {
        lastZoom.x = e.offsetX;
        lastZoom.y = e.offsetY;
        let delta = e.wheelDelta/1000;
        if(delta) updateZoom(delta);
        zoomHasHappened = 1;
        return false;
    }
    var updateZoom = (delta) => {
        let wheelNorm = delta;
        let zoomVar = Math.pow(zoomIntensity,wheelNorm);
        for(var i =0; i < 6; ++i) transformMatrix[i] *=(zoomVar)
        
        transformMatrix[4] += (1-zoomVar)*(lastZoom.x);
        transformMatrix[5] += (1-zoomVar)*(lastZoom.y);

        document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
       
        zoomHasHappened = 0;
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
            // console.log(allRegionProperties[e.target.id]);
            var regionA3 = allRegionProperties[e.target.id]["ADM0_A3"];
            
            setSelectedRegion(regionA3)
            
        }
        else console.log(e.target.id);
        lastZoom.x = e.offsetX;
        lastZoom.y = e.offsetY;
        dragStart = getTransformedPt(lastZoom.x, lastZoom.y, transformMatrix);


        // these would be used for orthographic projection
        // projection.rotate([lambda(dragStart.x), theta(dragStart.y)]);
        // svg.selectAll("path").attr("d", path);
        

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        return e.preventDefault() && false;
    }
    
    
    var elementDrag = (e) => {    
        e = e || window.event;
        lastZoom = {x:e.offsetX, y:e.offsetY}
        if(dragStart) {
            var pt = getTransformedPt(lastZoom.x, lastZoom.y, transformMatrix);
            panSVG((pt.x-dragStart.x)/4, (pt.y-dragStart.y)/4)
        }
        return e.preventDefault() && false;
    }

    var panSVG = (dx,dy) =>{
        transformMatrix[4] += dx;
        transformMatrix[5] += dy;
        document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
        // document.getElementById('curveGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
        // document.getElementById('ptGroup').setAttributeNS(null, "transform", `matrix(${this.transformMatrix.join(' ')})`);
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
                    setRegionOptions({region:regionCodes[regionName]})
                    // if(!document.getElementById("byCountrySearch").classList.contains("active")) document.getElementById("byCountrySearchTab").click();
                }
            },

        },
    ]
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

                    
                    if(result.ok) {
                        // result.data.sort(function(a,b) {return a.ADM0_A3 - b.ADM0_A3})
                        
                        resolve(result.data);
                    }
                    else reject();
                })
            }
        })
    }

    // fetchVitalDB("List_of_ISO_3166_country_codes",true)
    // fetchVitalDB("ISO_3166-2",true);
    var regionData;
    
    
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
            .clipAngle(90)
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

    const [allRegionProperties,setAllRegionProperties]  = useState({});
    var continents = []

    const [mapCreated, setMapCreated] = useState(false);


    const [selectedRegion, setSelectedRegion] = useState("<global>");
    var continentHues = {"Asia":0, "South_America":90, "Africa":180, "Europe":120, "North_America":60, "Oceania":180, "Antarctica":300, "Seven_seas_open_ocean":240}
    
    const [regionOptionsLoaded, setRegionOptionsLoaded] = useState(false)
    var lastMapColorView = "default"
    var lastSelectedRegion = "<global>"

    var selectedRegionBox = {x:0,y:0}
    var worldMapBox;
    var startAutoZoom, prevTimeStampAutoZoom, doneAutoZoom=false;
    
    function automatedZoom(step)  {
        var svgW = W;
        var svgH = H;


        if(startAutoZoom===undefined) startAutoZoom = step;


        var elapsedTime = step - startAutoZoom;
        var limit = 1000;

        console.log(selectedRegionBox)
        document.getElementById("worldMap").viewBox

        if(prevTimeStampAutoZoom !== step) {
            const count= Math.min(.01*elapsedTime, limit)
            
            // var mag = (selectedRegionBox.height*selectedRegionBox.width)/(svgH*svgW);
            // for(var i =0; i < 6; ++i) transformMatrix[i] *=((1-mag))
            // transformMatrix[4] += (selectedRegionBox.x);
            // transformMatrix[5] += (selectedRegionBox.y);

            var pt = getTransformedPt(selectedRegionBox.x+selectedRegionBox.width/2, 
                selectedRegionBox.y+selectedRegionBox.height/2, transformMatrix);
            var pt2 = getTransformedPt(worldMapBox.x+worldMapBox.width/2, 
                worldMapBox.y+worldMapBox.height/2, transformMatrix);
            panSVG((worldMapBox.x-pt.x)/4, (worldMapBox.y-pt.y)/4)

            // if(count==limit) doneAutoZoom=true;
            document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);


        }
        if(worldMapBox.x == selectedRegionBox.x  && worldMapBox.y == selectedRegionBox.y) {
        // if(elapsedTime < 2000) {
            console.log("done zooming")
            prevTimeStampAutoZoom = step;
            !doneAutoZoom && window.requestAnimationFrame(automatedZoom);
        }
        



        
    }


    useEffect(()=> {
        if(lastSelectedRegion != selectedRegion) {
            // console.log("selectedRegion", selectedRegion)
            var worldMap = document.getElementById('worldMap')
            var regionObj = document.getElementById(selectedRegion);

           
            
            // worldMap.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`)
            selectedRegionBox = regionObj.getBBox()
            worldMapBox = worldMap.getBBox()
            if(selectedRegion=="USA") {
                // make alternative map that includes all states compactly
            }
            else {
                    window.requestAnimationFrame(automatedZoom)
             
                    // for(var i =0; i < 6; ++i) transformMatrix[i] *=(zoomVar)
                    // transformMatrix[4] += (1-zoomVar)*(regionCenter.x);
                    // transformMatrix[5] += (1-zoomVar)*(regionCenter.y);
            
                
                
                

            }

            lastSelectedRegion = selectedRegion;
        }
        if(!regionOptionsLoaded) {
            processClientRequest("getRegionDb","/server/getRegionDb").then(result=> {
                console.log("result",result)
                setRegionOptions(result)
                setRegionOptionsLoaded(true)
                
            })
        }
        if(searchClicked) {
            // if(inputData.module=="dailyTrends" || inputData.module=="realTimeTrends") { }
            processClientRequest("searchClicked","/server",inputData)
        }

        
        // var mercator = d3.geoProjection(function(x,y) {
        //     return [x, Math.log(Math.tan(Math.PI/4 + y/2))];
        // })
        
        var idExists = (parent, queryStr) => {
            var selection = d3.select(parent).select(queryStr);
            if(selection.size==1 && selection[0]==null) {           //its empty
                return;
            }
            else return selection[0][0]; 
        }
        svg = d3.select("#worldMap")
        if(!mapCreated) {
            svgConts = d3.select("#continents")
            d3.json("./world.json", function(error, data) {
                for(let p=0; p < data.objects.admin.geometries.length; ++p) {
                    var geometries = data.objects.admin.geometries[p];
                    
                    //mercator , orthographic
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
                
                // var paths=svg.selectAll("path")
                // for(let p=0; p < paths.data().length; ++p) {
                //     var P = paths.data()[p];  
                //     svg.append("text")
                //         .text(data.objects.admin.geometries[p].properties["ADMIN"])
                //         .datum(d3.geo.path().projection(d3.geo.mercator()))
                //         .attr("x", (d)=> d3.geo.centroid(P)[0])
                //         .attr("y", (d)=> d3.geo.centroid(P)[1])
                // }
                
                // var svgBlob = new Blob(['<?xml version="1.0" standalone"no"?\r\n', svg.html()], 
                //         {type:"image/svg+xml;charset=utf-8"})
                
                
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
        
       
        
    },[searchClicked, mapColorView, selectedRegion]);

    //for orthographic projcetion: https://bl.ocks.org/mbostock/3795040
    // https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
    
    return (

            <SideBarWrapper selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} mapColorView={mapColorView} setMapColorView={setMapColorView} sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible} setInputData={setInputData} inputData={inputData} readyResults={readyResults} setReadyResults={setReadyResults} searchClicked={searchClicked} setSearchClicked={setSearchClicked} setCurrentTab={setCurrentTab} regionOptions={regionOptions} setRegionOptions={setRegionOptions} isVisible={sideBarVisible} setVisible={setSideBarVisible}>
                <div id="globalSearch" >
                    <svg id="worldMap" className="map" width={W} height={H} >
                        <g id="continents"/>
                    </svg>
                </div>

            </SideBarWrapper>
        
    )
}