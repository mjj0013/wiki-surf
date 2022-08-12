// import translate from 'translate';
// translate.engine = "deepl"
import './index.css'
import React, { useEffect ,useState} from 'react';
import {AppContext} from './AppContext.js';

const userAgents = require("user-agents");

import {Container,Button} from 'semantic-ui-react';

// import {wikiDataSearch, WikiSubject, wikiTitleSearch} from './wikiSubject.js';
import { SideBarWrapper } from './sideBarForm.js';
import {sendRequestToBackend} from './frontEndHelpers.js';
import {metrosByState, metroData} from './usMetroMap.js'

// import {MapInfoItem, createSubInfoItem, createRegionInfoItem} from './mapInfoItem.js'
var seStates = ["AL","GA","MS","TN","SC","NC","FL","AR","LA","KY"]     // "PR"
var neStates = ["VA","WV",'PA','NY','OH','ME','MD','DE','NJ','CT','RI','MA','NH','VT']      // 'DC',
var mwStates = ['NE','MI','WI','IA','MO','IL','KS','ND','IN','SD','MN']     //,'SE'
var swStates=['TX','NM','OK','CA','NV','CO','UT','AZ']
var nwStates = ['WA','OR','ID','MT','AK','HI', 'WY']

var childIdExistsD3 = (parent, queryStr) => {
    var selection = d3.select(parent).select(queryStr);
    if(selection.size==1 && selection[0]==null) return;         //then its empty
    else return selection[0][0]; 
}
export var US_Map = () => {
    const ctx = React.useContext(AppContext)
    var worldMapLimits;
    var xmlns = "http://www.w3.org/2000/svg";
    // var [lastZoom, setLastZoom] = useState({x:0, y:0})
    // var [transformMatrix, setTransformMatrix] = useState([1, 0, 0, 1, 0, 0]);
    // var zoomIntensity = 0.2;
    // var [dragStart, setDragStart] = useState({x:0, y:0})
    // const [data,setRegionData] = useState(null);
    // const [sideBarVisible, setSideBarVisible] = useState(false);
    // const [regionOptions, setRegionOptions] = useState([]);       //, displayMode:"continents",resolution:"countries"
    // const [searchClicked, setSearchClicked] = useState(false);
    // const [readyResults, setReadyResults] = useState(null);
    // const [inputData, setInputData] = useState(null);
    // const [mapColorView, setMapColorView] = useState("default");
    // const [mapCreated, setMapCreated] = useState(false);

    // const [regionSelectHistory, setRegionSelectHistory] = useState(false);
    // const [regHistQueueIdx, setRegHistQueueIdx] = useState(false);
    // const [selectedRegion, setSelectedRegion] = useState(false);


    var [lastZoom, setLastZoom] = useState({x:0, y:0})
    var [transformMatrix, setTransformMatrix] = useState([1, 0, 0, 1, 0, 0]);
    var zoomIntensity = 0.2;
    var [dragStart, setDragStart] = useState({x:0, y:0})
    const [regionData,setRegionData] = useState(ctx.regionData);
    const [sideBarVisible, setSideBarVisible] = useState(ctx.sideBarVisible);
    const [regionOptions, setRegionOptions] = useState(ctx.regionOptions);       //, displayMode:"continents",resolution:"countries"
    const [searchClicked, setSearchClicked] = useState(ctx.searchClicked);
    const [readyResults, setReadyResults] = useState(ctx.readyResults);
    const [inputData, setInputData] = useState({geo:"US"});
    const [mapColorView, setMapColorView] = useState("default");
    var [allRegionProperties,setAllRegionProperties]  = useState(null);
    var [allCountyProperties,setAllCountyProperties]  = useState(null);
    const [mapCreated, setMapCreated] = useState(false);
    var [selectedRegion, setSelectedRegion] = useState("<global>");
    const [regionOptionsLoaded, setRegionOptionsLoaded] = useState(false)
    var [regionSelectHistory,setRegionSelectHistory] = useState(["<global>"]);
    var [regHistQueueIdx,setRegHistQueueIdx] = useState(0);    

    var lastMapColorView = "default"
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
    var selectedRegionBox = {zoom:1, width:W, height:H ,cx:W/2, cy:H/2};
    var selectedRegionZoom = 1;
    var activeSVG = d3.select("#usCountyMap");
    var currentSelectedCounties = [];
    var startListingCounties = false
    var path = d3.geo.path().projection(projection)

   
    var [allCountyProperties,setAllCountyProperties]  = useState({});



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
        document.getElementById('usLocal').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
      
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
        
        var countyKeys = Object.keys(allCountyProperties);
        // var clickedOnRegion = regionKeys.includes(e.target.id)
        var clickedOnCounty = countyKeys.includes(e.target.id)
        lastZoom.x = e.offsetX;
        lastZoom.y = e.offsetY;
        if(clickedOnCounty) {
            
            var metroName = document.getElementById(allCountyProperties[e.target.id]["WIKIDATAID"])
            metroName = metroName? metroName.parentElement.id : null;
            // var county = allCountyProperties[e.target.id]
           
            console.log(metroData[metroName])
        }
        else {
            if(startListingCounties) {
                currentSelectedCounties.push(e.target.id)
                e.target.setAttributeNS(null, "fill", 'rgb(0,0,0)');
            }
        }
        
        

        dragStart = getTransformedPt(lastZoom.x, lastZoom.y, transformMatrix);
        // inverseMercator(dragStart.x, dragStart.y)
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
        document.getElementById('usLocal').setAttributeNS(null, "transform", `matrix(${transformMatrix.join(' ')})`);
       

    }
    
    function processClientRequest(action, path, body=null) {
        // create form where the user inputs the search criteria (geo, time, phrase) for the trends. put that search criteria in the request body
        // other possible modules:    relatedQueries, relatedTopics, interestOverTime, interestByRegion
        return new Promise((resolve, reject) => {
            var headers = {"Content-Type":"application/json", "Accept":"application/json"}
            var req;
            if(action=="searchClicked") {
                console.log("searchClicked")
                req = new Request(path, {  method:"POST",  headers:headers,    body: JSON.stringify(body)   });
                sendRequestToBackend(req).then(result=>{
                    if(result.ok) {
                        setReadyResults(result);
                        console.log('result',result)
                        resolve(result);
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

    function updateMap(svg) {
       
        if(lastMapColorView != mapColorView) {
            for(let k=0; k < regionKeys.length; ++k) {
                var key = regionKeys[k];
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
                console.log('data',data)
                for(let p=0; p < data.objects.admin_counties.geometries.length; ++p) {
                    var geometries = data.objects.admin_counties.geometries[p];
                    
                    var stateName = geometries.properties["REGION"].replace(/\(|\)/gi, '').replace(/\s/gi, '_')
                   
                    // human-readable county name
                    var countyName = geometries.properties["NAME_ALT"].replace(/\(|\)/gi, '').replace(/\s/gi, '_')

                    var countyObj = childIdExistsD3(`#usCountyMap`,`#${geometries.properties["WIKIDATAID"]}`)
                    // console.log('countyObj', countyObj)
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
                        .attr("onmousedown", (e)=> {
                            console.log(countyName)
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
            })
        }
    }



    //create map
    useEffect(()=> {
        // if(mapCreated) updateMap(activeSVG)
        // else createMap();
        createMap();
    },[mapColorView]);
    useEffect(()=> {
        if(searchClicked) {
            
            processClientRequest("searchClicked","/server",inputData).then(result=> {
                if(result!=undefined) {
                    console.log("result",result)
                    console.log("result.ok", result.ok)
                    if(result.ok) {
                        var geoMapData = result.data.geoMapData;
                        // var dmaKeys = Object.keys(geoMapData)
                        console.log('geoMapData',geoMapData)
                        // console.log('al metros', document.getElementById("AL").children)
                       
                        for(let i =0; i < geoMapData.length; ++i) {
                            if(geoMapData[i].hasData[0]) {
                                var metroId = `M${geoMapData[i].geoCode}`;
                                d3.select(`#${metroId}`)
                                .selectAll("g, path")
                                .style("fill", `hsl(0, 70%, ${100 - geoMapData[i].value[0] + 5}%)`)
                                // metroData[metroId]
                              
                           
                            }
                            else {
                                var metroId = `M${geoMapData[i].geoCode}`;
                                d3.select(`#${metroId}`)
                                .selectAll("g, path")
                                .style("fill", `hsl(0, 70%, ${90}%)`)
                    
                            
                            }
                        }
                    }
                }
                
            })
        }
    },[searchClicked]); 


    //initialize map
    useEffect(()=> {
        var usCountyMap = document.getElementById("usCountyMap")
        // make alternative map that includes all states compactly
        // usCountyMap.classList.toggle("showing")

        // adjust Hawaii, Alaska, Puerto Rico
        var stateHI = document.getElementById("HI");
        stateHI.setAttributeNS(null, "transform","translate(200 0)")
        var statePR = document.getElementById("PR");
        statePR.setAttributeNS(null, "transform","translate(-50 0)")
        var stateAK = document.getElementById("AK");
        stateAK.setAttributeNS(null, "transform",  "translate(165 385) scale(.3 .3)")

        transformMatrix = [5.751490340144962, 0, 0 ,5.751490340144962 ,-656.582896430975,-514.5546459430193]
        transformMatrix = [4.87289, 0, 0, 4.87289, -680.644, -1736.87]
        document.getElementById("usLocal").setAttributeNS(null, "transform",`matrix(${transformMatrix.join(" ")})`)
        usCountyMap.addEventListener("wheel",(e)=>captureZoomEvent(e),false);
        usCountyMap.addEventListener("DOMMouseScroll", (e)=> captureZoomEvent(e),false);
        usCountyMap.addEventListener("mousedown", (e)=>dragMouseDown(e), false);

        
    }, []);
        
    var metroKeys = Object.keys(metroData);
    for(let m=0; m < metroKeys.length; ++m) {
        metroData[metroKeys[m]]["color"] = `hsl( ${getRandomInt(0,359)}, ${getRandomInt(1,99)}%, ${getRandomInt(20,75)}%)`
    }

    


    // <SideBarWrapper regionSelectHistory={regionSelectHistory} setRegionSelectHistory={setRegionSelectHistory} regHistQueueIdx={regHistQueueIdx}  setRegHistQueueIdx={setRegHistQueueIdx} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion}  mapColorView={mapColorView} setMapColorView={setMapColorView} sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible} setInputData={setInputData} inputData={inputData} readyResults={readyResults} setReadyResults={setReadyResults} searchClicked={searchClicked} setSearchClicked={setSearchClicked} regionOptions={regionOptions} setRegionOptions={setRegionOptions} isVisible={sideBarVisible} setVisible={setSideBarVisible}></SideBarWrapper>
     {/* <div id="globalSearch"> */}
              {/* </div> */}
            {/* </SideBarWrapper> */}
    return (
        
        <SideBarWrapper regionSelectHistory={regionSelectHistory} setRegionSelectHistory={setRegionSelectHistory} regHistQueueIdx={regHistQueueIdx}  setRegHistQueueIdx={setRegHistQueueIdx} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} mapColorView={mapColorView} setMapColorView={setMapColorView} sideBarVisible={sideBarVisible} setSideBarVisible={setSideBarVisible} setInputData={setInputData} inputData={inputData} readyResults={readyResults} setReadyResults={setReadyResults} searchClicked={searchClicked} setSearchClicked={setSearchClicked} regionOptions={regionOptions} setRegionOptions={setRegionOptions} isVisible={sideBarVisible} setVisible={setSideBarVisible}>
             <div id="globalSearch">
                    
                    <svg id="usCountyMap" className="map showing" width={W} height={H} >
                        <filter id="landShadows">
                            <feGaussianBlur stdDeviation={1} result="shadowBlur" />
                            <feComposite operator='out' in='SourceGraphic' in2="shadowBlur" result="insetShadow" />
                            <feFlood floodColor="black" floodOpacity={.95} result="shadowColor" />
                            <feComposite operator="in" in="shadowColor" in2="insetShadow" result="shadow" />
                            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                        </filter>
                       
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
                    <div style={{width:W, height:H}}></div>
                    </div>
                    </SideBarWrapper>
           
    )
}