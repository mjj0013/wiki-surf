// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React, { useEffect ,useState} from 'react';
import {AppContext} from './AppContext.js';
// import {chartEvents} from './chartEventHandlers.tsx'
const userAgents = require("user-agents");
import { ReactGoogleChartEvent, Chart } from 'react-google-charts';
import {Dimmer, List, Container,Button, Card} from 'semantic-ui-react';

import wikiSubject, {wikiDataSearch, WikiSubject, wikiTitleSearch, countryBaseData} from './wikiSubject.js';
import { SideBarWrapper } from './sideBarForm.js';
import {sendRequestToBackend} from './frontEndHelpers.js';
import usMetroMap, {metrosByState, metroData} from './usMetroMap.js'


import {abridgedCategories, regionCodes, regionCodesReformatted} from '../server/geoHelpers.js';        //regionData
import { zoom } from 'd3-zoom';
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

var childIdExistsD3 = (parent, queryStr) => {
    var selection = d3.select(parent).select(queryStr);
    if(selection.size==1 && selection[0]==null) return;         //then its empty
    else return selection[0][0]; 
}



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
        if(transformMatrix[0]*zoomVar >=1) {
            for(var i =0; i < 6; ++i) {transformMatrix[i] *= zoomVar }
            transformMatrix[4] += (1-zoomVar)*(lastZoom.x);
            transformMatrix[5] += (1-zoomVar)*(lastZoom.y);
        }
        console.log('lastZoom',lastZoom)

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
            
            if(!regionSelectHistory.includes(regionA3)) {
                
                var regionQueue = document.getElementById("regionHistoryCards");
                
                regionSelectHistory.push(regionA3)

                var regionBBox = document.getElementById(regionA3).getBoundingClientRect();
                setRegHistQueueIdx(regionSelectHistory.length-1);
       
                var container = document.createElementNS("http://www.w3.org/1999/xhtml","container");
                container.setAttributeNS(null,"class","region-card");

                var card = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
                card.setAttributeNS(null,"class","ui card");

                // card.addEventListener("mouseover",(e)=> {}, false);

                var xmlns = "http://www.w3.org/2000/svg";

                var cardImage = document.createElementNS(xmlns,"svg");
                cardImage.setAttributeNS(null, "width","80");
                cardImage.setAttributeNS(null, "height","80");
                cardImage.style.display = "block"
               
                var regionShape = document.createElementNS(xmlns,"path");
                var regionD = document.getElementById(regionA3).getAttribute('d');
                var regionFill = document.getElementById(regionA3).getAttribute('fill')
                
                regionShape.setAttributeNS(null, "d", regionD);
                regionShape.setAttributeNS(null,"fill",regionFill);
                regionShape.setAttributeNS(null, "stroke", "#000")
                
                var pathStart = regionD.match(/(?<=M)[-+]?[0-9]+\.[0-9]+\,[-+]?[0-9]+\.[0-9]+/)[0].split(',')
                var pathStartPt = {x:parseFloat(pathStart[0]), y:parseFloat(pathStart[1])}
                
                var thumbnailZoom = Math.sqrt((regionBBox.height*regionBBox.width)/(100*100))/2;
                
                var thumbnailMatrix = [1,0,0,1,0,0];
                for(let i=0; i < 6; ++i) thumbnailMatrix[i] *=thumbnailZoom
                thumbnailMatrix[4] += (1-thumbnailZoom)*(pathStartPt.x)      //429
                thumbnailMatrix[5] += (1-thumbnailZoom)*(pathStartPt.y)                   //582


                // issue: in order for slightly accurate thumbnail, you have to zoom back to global and then click on next region. Solve this
                regionShape.setAttributeNS(null,'transform', `translate(${220-(100)-regionBBox.left} ${80-regionBBox.top})`) 
                
              
                cardImage.setAttributeNS(null, "viewBox",`0 0 100 100`)
                cardImage.appendChild(regionShape)
                card.appendChild(cardImage)
                container.appendChild(card)
                regionQueue.appendChild(container)

                var regionCardQueue = regionQueue.children;
                if(regionCardQueue.length >= 5) {
                    regionCardQueue[regionCardQueue.length - 1 ].classList.add("ord3") 

                    // regionCardQueue[regionCardQueue.length - 2 ].classList.remove("exit");
                    for(let c=1; c < 6; ++c) {
                        if(regionCardQueue[regionCardQueue.length-2].classList.contains(`ord${c}`)) {
                            regionCardQueue[regionCardQueue.length-2].classList.replace(`ord${c}`, "ord2") 
                            break;
                        }
                    }

                    regionCardQueue[regionCardQueue.length - 3 ].classList.remove("exit");
                    for(let c=1; c < 6; ++c) {
                        if(regionCardQueue[regionCardQueue.length-3].classList.contains(`ord${c}`)) {
                            regionCardQueue[regionCardQueue.length-3].classList.replace(`ord${c}`, "ord1") 
                            break;
                        }
                    }

                    // regionCardQueue[1].classList.remove("exit");
                    for(let c=1; c < 6; ++c) {
                        if(regionCardQueue[1].classList.contains(`ord${c}`)) {
                            regionCardQueue[1].classList.replace(`ord${c}`, "ord5") 
                            break;
                        }
                    }

                    // regionCardQueue[0].classList.remove("exit");
                    for(let c=1; c < 6; ++c) {
                        if(regionCardQueue[0].classList.contains(`ord${c}`)) {
                            regionCardQueue[0].classList.replace(`ord${c}`, "ord4") 
                            break;
                        }
                    }
                    // if difference b/w regionCardQueue.length-3 (left-most card) and 1 (right-most card) is greater than 0
                    
                    let leftMostIdx = 1;
                    let rightMostIdx = regionCardQueue.length-3
                    
                    if(rightMostIdx-leftMostIdx >= 1) {  //      (this means there are cards b/w them that are currently exited)               
                        for(let c=leftMostIdx+1; c < rightMostIdx; ++c) {
                            
                            if(regionCardQueue[c].classList.contains("exitLeft")) {
                                // regionCardQueue[c].classList.replace("exitLeft", "exitRight") 
                            }
                            else {
                                regionCardQueue[c].classList.replace("ord1","exitLeft");
                            }
                        }
                    }
                }
                else if(regionCardQueue.length==1) {
                    document.getElementById("mapBtnGroup").classList.toggle("collapsed");
                    regionCardQueue[0].classList.add("ord3");
                }
                else if(regionCardQueue.length==2) {
                    regionCardQueue[1].classList.add("ord3");
                    regionCardQueue[0].classList.replace("ord3", "ord2")
                }
                else if(regionCardQueue.length==3) {
                    regionCardQueue[2].classList.add("ord3");
                    regionCardQueue[1].classList.replace("ord3", "ord2")
                    regionCardQueue[0].classList.replace("ord2", "ord4")
                }
                else if(regionCardQueue.length==4) {
                    regionCardQueue[3].classList.add("ord3");
                    regionCardQueue[2].classList.replace("ord3", "ord2")
                    regionCardQueue[1].classList.replace("ord2", "ord4")
                    regionCardQueue[0].classList.replace("ord4", "ord1")
                }
                
            }
            else {
                var selectedCardIdx = regionSelectHistory.indexOf(regionA3);
                if(regionCardQueue.length >= 5) {
                    var firstIdx = selectedCardIdx-2<0? regionCardQueue.length+selectedCardIdx-2 : selectedCardIdx-2
                    var secondIdx = selectedCardIdx-1<0? regionCardQueue.length+selectedCardIdx-1 : selectedCardIdx-1
                    var thirdIdx = selectedCardIdx
                    var fourthIdx = (selectedCardIdx+1)%regionCardQueue.length
                    var fifthIdx = (selectedCardIdx+2)%regionCardQueue.length
                    
                    regionCardQueue[firstIdx].classList.classList[1] = "first";
                    regionCardQueue[secondIdx].classList.classList[1] = "second";
                    regionCardQueue[thirdIdx].classList.add("third");
                    regionCardQueue[fourthIdx].classList.classList[1] = "fourth";
                    regionCardQueue[fifthIdx].classList.classList[1] = "fifth";
                }
                else {
                    
                    if(regionCardQueue.length == 4) {
                        var firstIdx = selectedCardIdx-2<0? regionCardQueue.length+selectedCardIdx-2 : selectedCardIdx-2
                        var secondIdx = selectedCardIdx-1<0?regionCardQueue.length+selectedCardIdx-1: selectedCardIdx-1
                        var thirdIdx = selectedCardIdx
                        var fourthIdx = (selectedCardIdx+1)%regionCardQueue.length
                        var fifthIdx = (selectedCardIdx+2)%regionCardQueue.length
                    }

                    if(regionCardQueue.length == 3) {
                        var secondIdx = selectedCardIdx-1<0?regionCardQueue.length+selectedCardIdx-1: selectedCardIdx-1
                        var thirdIdx = selectedCardIdx
                        var fourthIdx = (selectedCardIdx+1)%regionCardQueue.length
                    }
                    regionCardQueue[firstIdx].classList.classList[1] = "first";
                    regionCardQueue[secondIdx].classList.classList[1] = "second";
                    regionCardQueue[thirdIdx].classList.add("third");
                    regionCardQueue[fourthIdx].classList.classList[1] = "fourth";
                    regionCardQueue[fifthIdx].classList.classList[1] = "fifth";
                }
                setRegHistQueueIdx(selectedCardIdx);
            }       
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
        inverseMercator(dragStart.x, dragStart.y)
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
        if(transformMatrix[0]==1 && transformMatrix[3]==1) {
            transformMatrix[4] = 0;
            transformMatrix[5] = 0;
        }
        else {
            // var currentX = Math.abs(transformMatrix[4] - transformMatrix[4]/transformMatrix[0])
            // var currentY = Math.abs(transformMatrix[5] - transformMatrix[5]/transformMatrix[3])
            // if((worldMapLimits.right > (currentX+dx)) && (worldMapLimits.left < (currentX+dx))) transformMatrix[4] += dx;
            // if((worldMapLimits.bottom > (currentY+dy)) && (worldMapLimits.top < (currentY+dy))) transformMatrix[5] += dy;
            transformMatrix[4] += dx;
            transformMatrix[5] += dy;
        }
        
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
    var W =  1208;      //960 , 1160
    var H = 1160;      // 500 , 1000
    var projection = d3.geo.mercator()
            .translate([W/2, H/2 - 25])
            .scale(192   ,192)
            // .clipAngle(30)
    
    var path = d3.geo.path().projection(projection)

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
    

    const [regionOptionsLoaded, setRegionOptionsLoaded] = useState(false)
    var lastMapColorView = "default"
    var lastRegionHistoryIdx = 0


    var [regionSelectHistory,setRegionSelectHistory] = useState(["<global>"]);
    var [regHistQueueIdx,setRegHistQueueIdx] = useState(0);         


    var backRegionBtnClicked =(e) => {

        var regionQueue = document.getElementById("regionHistoryCards");
        var regionCardQueue = regionQueue.children;
         
        for(let c=0; c < regionCardQueue.length; ++c) {
            // if(regionCardQueue[c].classList.contains('exitRight')) {
            //     regionCardQueue[c].classList.replace('exitRight', "exitLeft")
            // }
            if(regionCardQueue.length>5 && regionCardQueue[c].classList.contains("exitRight")) {
                
                document.getElementsByClassName("exitRight")[0].classList.replace("exitRight","ord1");
            }
            else {
                for(let i=1; i < 6; ++i) {
                    var checkClass = `ord${i}`
                    if(regionCardQueue[c].classList.contains(checkClass)) {
                        if(regionCardQueue.length > 5) {
                            if(i==5) regionCardQueue[c].classList.replace(checkClass, "exitRight")
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i+1}`)
                        }
                        else if(regionCardQueue.length==5 || regionCardQueue.length==4) {
                            if(i==regionCardQueue.length) regionCardQueue[c].classList.replace(checkClass, `ord${1}`)
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i+1}`)

                        }
                        
                        else if(regionCardQueue.length==2) {
                            if(i==regionCardQueue.length+1) regionCardQueue[c].classList.replace(checkClass, `ord${2}`)
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i+1}`)
                        }
                        else if(regionCardQueue.length==3) {
                            if(i==regionCardQueue.length + 1) regionCardQueue[c].classList.replace(checkClass, `ord${2}`)
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i+1}`)
                        }

                        break;
                    }    
                }
            }
            
        }
        var nextIdx = regHistQueueIdx==0? regionSelectHistory.length-1 : regHistQueueIdx-1
       
        selectedRegion = regionSelectHistory[nextIdx];
        setRegHistQueueIdx(nextIdx)


    }
    var fwdRegionBtnClicked =(e) => {
        var regionQueue = document.getElementById("regionHistoryCards");
        var regionCardQueue = regionQueue.children;
         
        for(let c=0; c < regionCardQueue.length; ++c) {
            if(regionCardQueue[c].classList.contains('exitLeft') && regionCardQueue.length>5) {
                regionCardQueue[c].classList.replace('exitLeft', "ord5")
            }
            // else if(regionCardQueue.length>5 && regionCardQueue[c].classList.contains('exitRight')) {
            //     document.getElementsByClassName("exitRight")[0].classList.replace("exitRight","ord5");
            // }
            else {
                for(let i=1; i < 6; ++i) {
                    var checkClass = `ord${i}`
                    if(regionCardQueue[c].classList.contains(checkClass)) {
                        if(regionCardQueue.length > 5) {
                            if(i==1) regionCardQueue[c].classList.replace(checkClass, "exitLeft")
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i-1}`)
                        }
                        else if(regionCardQueue.length==5 || regionCardQueue.length==4) {
                            if(i==1) regionCardQueue[c].classList.replace(checkClass, `ord${regionCardQueue.length}`)
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i-1}`)
                        }
                        else if(regionCardQueue.length==3) {
                            if(i==2) regionCardQueue[c].classList.replace(checkClass, `ord${4}`)
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i-1}`)
                        }
                        else if(regionCardQueue.length==2) {
                            if(i==2) regionCardQueue[c].classList.replace(checkClass, `ord${3}`)
                            else regionCardQueue[c].classList.replace(checkClass, `ord${i-1}`)
                        }
                        break;
                    }    
                }
            }
            
        }
        var nextIdx = (regHistQueueIdx+1)%regionSelectHistory.length
        selectedRegion = regionSelectHistory[nextIdx];
        setRegHistQueueIdx(nextIdx)

    }
    var toGlobalBtnClicked =(e) => {
        if(regionSelectHistory[regionSelectHistory.length-1] !="<global>") {
            regionSelectHistory.push("<global>")
            setRegHistQueueIdx( --regHistQueueIdx)
        }
    }

    

    function inverseMercator(x,y) {
        //https://mathworld.wolfram.com/MercatorProjection.html
        // let phi = 2*Math.atan(Math.exp(y)) - Math.PI/2;         // - 1.5707963267948966
        // let gamma = x;
        // return [Math.cos(y*0.0174533)*Math.sin(x*0.0174533), Math.sin(y*0.0174533)];


        var radToDegrees = (rad) => {
            return rad/(Math.PI/180);
        }
        console.log("zoom", transformMatrix[0])

        var numTiles = Math.round(transformMatrix[0]);
        x /= numTiles;
        y /= numTiles;




     
        // var long = (W*x/360) - 180;
        

        // var latRadians = y*(1 - W/H)
       
        // var lat = 2*Math.atan(Math.exp(latRadians))-(Math.PI/2)
        // var lat = Math.atan(y)
        // console.log("long,lat", long, lat);




        //https://stackoverflow.com/questions/14329691/convert-latitude-longitude-point-to-a-pixels-x-y-on-mercator-projection
        // var lat = (Math.atan(Math.exp(2*y/H - 1)) - 1)*90;
        // var lat = radToDegrees(Math.atan(2*y/H - 1)*Math.PI/2);
        // var lat = radToDegrees((2*Math.atan(Math.exp((2*y/(-H)))))) - 90
        var lat = radToDegrees(
            (Math.atan(Math.sinh(2*Math.PI*(H/2 -y)/(H))
            ))) - 8
        // var lat = (Math.atan(Math.exp((2*y-H)/(-2*W)))*(4/Math.PI) - 1)*90;
        var long =(2*x/W - 1)*180;     //degrees

        
        

        // as var inside exp approaches -4, exp approaches 0, which results in atan(0)
        // atan(0) = 0, so this makes -90 the latitude (the top of map) 

        console.log("at "+x+", "+y+": lat,long", lat, long);


    }

    function mercator(gamma, phi) {
        //https://mathworld.wolfram.com/MercatorProjection.html
        let x = gamma;
        // let y = Math.asinh(Math.tan(phi))

        // or try:
        let y=Math.log(Math.tan((Math.PI/2)+(phi)))
        return [x,y];
        
    }
    function regionNavBtnClicked(e) {
        if(regHistQueueIdx+1==regionSelectHistory.length-1)  document.getElementById("fwdRegionBtn").classList.add("disabled");
        else document.getElementById("fwdRegionBtn").classList.remove("disabled");

        if(regHistQueueIdx-1==0)  document.getElementById("backRegionBtn").classList.add("disabled");
        else document.getElementById("backRegionBtn").classList.remove("disabled");
        regionNavStarted = true;
    }
    function updateMap(svg) {
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
    function createMap() {
        if(!mapCreated) {
            var svgConts = d3.select("#continents")
            d3.json("./world_w_us_counties.json", function(error, data) {
                // *********************************************************************************
                // US county level
                for(let p=0; p < data.objects.admin_counties.geometries.length; ++p) {
                    var geometries = data.objects.admin_counties.geometries[p];
                   
                    var stateName = geometries.properties["REGION"].replace(/\(|\)/gi, '').replace(/\s/gi, '_')

                    // human-readable county name
                    var countyName = geometries.properties["NAME_ALT"].replace(/\(|\)/gi, '').replace(/\s/gi, '_')

                    var countyObj = childIdExistsD3(`#usCountyMap`,`#${geometries.properties["WIKIDATAID"]}`)
                    if(countyObj) {
                        var metroName = document.getElementById(`${geometries.properties["WIKIDATAID"]}`)           //getting metro name by finding parent element of county
                        metroName = metroName? metroName.parentElement.id : null;
                        
                        d3.select(`#${geometries.properties["WIKIDATAID"]}`)
                        .datum(topojson.feature(data, geometries))
                        .attr("d", path)
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
                            .attr("d", path)
                            .attr("fill", ()=> { return `hsl( ${0}, 40%, 90%)` })
                    }
                    allCountyProperties[geometries.properties["WIKIDATAID"]] = geometries.properties;
                }

                // *********************************************************************************
                // international level
                for(let p=0; p < data.objects.admin.geometries.length; ++p) {
                    var geometries = data.objects.admin.geometries[p];
                    
                   //mercator , orthographic <-- types of projections
                    var contName = geometries.properties["CONTINENT"].replace(/\(|\)/gi, '').replace(/\s/gi, '_')
                    if(!continents.includes(contName)) {                // this section is for initializing continents and adding the region belonging to the newly created continent
                        svgConts.append("g")
                            .attr("id",contName)
                            .append("path")
                                .datum(topojson.feature(data, geometries))
                                .attr("id", geometries.properties["ADM0_A3"])
                                .attr("d", path)
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
                        var regionObj = childIdExistsD3("#continents",`#${geometries.properties["ADM0_A3"]}`)
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
                            .attr("d", path)
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
                var worldMapBBox = document.getElementById('continents').getBoundingClientRect();
                console.log('worldMapBBox',worldMapBBox)
                worldMapLimits = worldMapBBox
            })
            var worldMap = document.getElementById("worldMap")
            worldMap.addEventListener("wheel",captureZoomEvent,false);
            worldMap.addEventListener("DOMMouseScroll", captureZoomEvent,false);
            worldMap.addEventListener("mousedown", dragMouseDown, false);
            setMapCreated(true)
            
        }
    }

    function mapTransitionToUS() {
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
       
        document.getElementById("usLocal").setAttributeNS(null, "transform","matrix(5.751490340144962 0 0 5.751490340144962 -656.582896430975 -514.5546459430193)")
        usCountyMap.addEventListener("wheel",(e)=>captureZoomEvent(e),false);
        usCountyMap.addEventListener("DOMMouseScroll", (e)=> captureZoomEvent(e),false);
        usCountyMap.addEventListener("mousedown", (e)=>dragMouseDown(e), false);
    }

    // ****************************************
    // try openstreetmaps, https://wiki.openstreetmap.org/wiki/API_v0.6
    // https://planet.openstreetmap.org/planet/
    // ****************************************

    var selectedRegionBox = {zoom:1, width:W, height:H ,cx:W/2, cy:H/2};
    var selectedRegionZoom = 1;
    var activeSVG = d3.select("#worldMap");
    // wikiDataSearch("Q156191")
    // .then(result=> {
    //     console.log("result",result)
    // })
    
   
    var worldMapLimits;

    useEffect(()=> {
        if(mapCreated) updateMap(activeSVG)
        else createMap();
    },[mapColorView])
    
    useEffect(()=> {
        if(!regionOptionsLoaded) {
            processClientRequest("getRegionDb","/server/getRegionDb").then(result=> {
                setRegionOptions(result)
                setRegionOptionsLoaded(true)
            })
        }
    })
    useEffect(()=> {
        console.log('regHistQueueIdx',regHistQueueIdx)
        console.log('regionSelectHistory',regionSelectHistory)
        setSelectedRegion(regionSelectHistory[regHistQueueIdx]);
     
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

        if(selectedRegion=="USA")  mapTransitionToUS()
        else if(selectedRegion=="<global>") {}
        else {
            // getWikiTitleData(allRegionProperties[selectedRegion]["ADMIN"])
            // zooming in:  zoomVar, and zoomVar>1  ;  zooming out: 1/zoomVar
            
            let box = document.getElementById(selectedRegion).getBBox();
            
            selectedRegionBox.cx = box.x+box.width/2;
            selectedRegionBox.cy = box.y+box.height/2;
            // setLastZoom({x:selectedRegionBox.cx, y:selectedRegionBox.cy})
            lastZoom = {x:selectedRegionBox.cx, y:selectedRegionBox.cy};
            
            selectedRegionZoom = Math.sqrt((selectedRegionBox.height*selectedRegionBox.width)/(box.width*box.height))/2
            

            var tempMatrix = [1,0,0,1,0,0];
            for(let i =0; i < 6; ++i) {tempMatrix[i] *= (selectedRegionZoom) }
            // tempMatrix[4] += (prevSelectedRegionZoom - selectedRegionZoom)*(selectedRegionBox.cx);
            // tempMatrix[5] += (prevSelectedRegionZoom - selectedRegionZoom)*(selectedRegionBox.cy);
            tempMatrix[4] += (1 - selectedRegionZoom)*(selectedRegionBox.cx);
            tempMatrix[5] += (1 - selectedRegionZoom)*(selectedRegionBox.cy);

            selectedRegionBox.width = box.width;
            selectedRegionBox.height = box.height;
            transformMatrix = tempMatrix;
            document.getElementById('continents').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
            console.log("moved to:", selectedRegion)

        }
    }, [regHistQueueIdx,selectedRegion])
    useEffect(()=> {
        // if(!regionNavStarted) regHistQueueIdx = regionSelectHistory.length-1;
        
        if(searchClicked) {
            // if(inputData.module=="dailyTrends" || inputData.module=="realTimeTrends") { }
            if(inputData.geo=="US") {
                console.log(inputData)
                processClientRequest("searchClicked","/server",inputData).then(result=> {
                    console.log("result",result)
                })
            }
            else processClientRequest("searchClicked","/server",inputData)
        }
    },[searchClicked]);        //selectedRegion

    //for orthographic projcetion: https://bl.ocks.org/mbostock/3795040
    // https://www.naturalearthdata.com/downloads/10m-cultural-vectors/

    var currentSelectedCounties = [];
    var startListingCounties = false

    document.addEventListener("keydown", (e)=> {
        if(e.key=='b') startListingCounties = true;
        if(e.key=='e') {
            console.log(currentSelectedCounties)
            startListingCounties = false;
            currentSelectedCounties = []
        }
    }, false);
    var metroKeys = Object.keys(metroData);
    for(let m=0; m < metroKeys.length; ++m) {
        metroData[metroKeys[m]]["color"] = `hsl( ${getRandomInt(0,359)}, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
    }

    return (
            <SideBarWrapper regionSelectHistory={regionSelectHistory} setRegionSelectHistory={setRegionSelectHistory} regHistQueueIdx={regHistQueueIdx}  setRegHistQueueIdx={setRegHistQueueIdx} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} mapColorView={mapColorView} setMapColorView={setMapColorView} sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible} setInputData={setInputData} inputData={inputData} readyResults={readyResults} setReadyResults={setReadyResults} searchClicked={searchClicked} setSearchClicked={setSearchClicked} setCurrentTab={setCurrentTab} regionOptions={regionOptions} setRegionOptions={setRegionOptions} isVisible={sideBarVisible} setVisible={setSideBarVisible}>
                <Container id="regionHistoryCards" className="region-card-container">
                </Container>
                <div id="mapBtnGroup" className="regionNavBtnGroup collapsed">
                    <Button id="backRegionBtn" className="regionNavBtn" onClick={(e)=>backRegionBtnClicked(e)} attached icon="arrow left" />
                    <Button id="toGlobalBtn" className="regionNavBtn" onClick={(e)=>toGlobalBtnClicked(e)} attached icon="bi bi-globe2"></Button>
                    
                    {/* icon={<i id="globeIcon" className="bi bi-globe2"></i>} */}
                    <Button id="fwdRegionBtn" className="regionNavBtn" onClick={(e)=>fwdRegionBtnClicked(e)} attached icon="arrow right"/>
                </div>
                
                <div id="globalSearch">
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