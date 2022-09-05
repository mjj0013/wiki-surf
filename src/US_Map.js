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

/* 
    AL counties touching interstates:
    ['Q493715', 'Q501108', 'Q137828', 'Q188204', 'Q111250', 'Q112271', 'Q503877', 'Q493709', 'Q501051', 'Q494626', 'Q493951', 'Q503451', 'Q108856', 'Q327080', 'Q302918', 'Q112271', 'Q501084', 'Q111266', 'Q111280', 'Q501055', 'Q502777', 'Q494630', 'Q156168', 'Q503461', 'Q502784', 'Q108871', 'Q487716', 'Q487744', 'Q156163', 'Q495738', 'Q506291', 'Q502739']
    AL counties 1 county removed:
    ['Q261672', 'Q502737', 'Q503088', 'Q488892', 'Q502925', 'Q366959', 'Q108832', 'Q502743', 'Q156570', 'Q487738', 'Q512787', 'Q505317', 'Q493957', 'Q949766', 'Q501157', 'Q111254', 'Q501074', 'Q111273', 'Q501060', 'Q503081', 'Q488847', 'Q253538', 'Q461204', 'Q501147', 'Q487725', 'Q494620', 'Q496292', 'Q488831', 'Q492888', 'Q111259', 'Q503329']
    AL counties 2 counties removed:
    ['Q487731', 'Q485660', 'Q488840', 'Q501000', 'Q109437']



    FL counties with 2 digit interstates:
    ['Q156643', 'Q494500', 'Q494476', 'Q503455', 'Q488879', 'Q263418', 'Q488537', 'Q501848', 'Q488576', 'Q488859', 'Q494463', 'Q501036', 'Q257311', 'Q173867', 'Q156568', 'Q488826', 'Q501014', 'Q493605', 'Q488818', 'Q494471', 'Q386885', 'Q494541', 'Q503889', 'Q488572', 'Q500992', 'Q494556', 'Q488874', 'Q262708', 'Q501163', 'Q488499', 'Q494616', 'Q488531', 'Q494624', 'Q468557', 'Q484294', 'Q648752', 'Q494564', 'Q488528', 'Q501067', 'Q501043', 'Q488543', 'Q280596', 'Q488517']

    FL counties 1 county removed:
    ['Q488865', 'Q174913', 'Q255943', 'Q505417', 'Q503064', 'Q488810', 'Q111720', 'Q501022', 'Q488821', 'Q501029', 'Q503059', 'Q488853', 'Q156577', 'Q501078', 'Q263742', 'Q488488', 'Q488885', 'Q488796', 'Q488792', 'Q488468', 'Q501123']

    FL counties 2 counties removed:
    ['Q488461', 'Q488813', 'Q488805']


    GA counties touching interstates:
    ['Q488210', 'Q501101', 'Q493134', 'Q156431', 'Q498346', 'Q498336', 'Q156486', 'Q492036', 'Q486362', 'Q491553', 'Q486401', 'Q488171', 'Q493024', 'Q486843', 'Q503551', 'Q491556', 'Q503071', 'Q111894', 'Q488224', 'Q488166', 'Q486848', 'Q487692', 'Q492652', 'Q110504', 'Q487016', 'Q156637', 'Q384890', 'Q493049', 'Q503486', 'Q111928', 'Q501151', 'Q498295', 'Q486133', 'Q492048', 'Q493088', 'Q544539', 'Q486325', 'Q486633', 'Q484247', 'Q486664', 'Q488181', 'Q200696', 'Q498675', 'Q491537', 'Q260871', 'Q490065', 'Q486398', 'Q486150', 'Q492053', 'Q498621', 'Q486838', 'Q486137', 'Q488201', 'Q385931', 'Q491301', 'Q492012', 'Q498312', 'Q493083', 'Q486765', 'Q134080', 'Q491529', 'Q492066', 'Q498319', 'Q115307', 'Q486654']


    GA counties 1 county removed:
    ['Q498321', 'Q486179', 'Q486389', 'Q498395', 'Q501140', 'Q493074', 'Q493054', 'Q492032', 'Q493092', 'Q492040', 'Q389365', 'Q501096', 'Q503546', 'Q498362', 'Q156387', 'Q492016', 'Q112061', 'Q492026', 'Q491525', 'Q491759', 'Q491519', 'Q211360', 'Q486386', 'Q477951', 'Q224910', 'Q498341', 'Q493112', 'Q501115', 'Q486394', 'Q503076', 'Q491508', 'Q486154', 'Q113005', 'Q498372', 'Q493037', 'Q492061', 'Q498327', 'Q488175', 'Q493029', 'Q486167', 'Q498353', 'Q486659', 'Q491762', 'Q493033', 'Q156650', 'Q493044', 'Q505310', 'Q376822', 'Q493125', 'Q498332', 'Q492070', 'Q488868', 'Q492057', 'Q111867', 'Q486791', 'Q115272', 'Q498301', 'Q492021', 'Q505299', 'Q498356', 'Q498377', 'Q491533', 'Q486348', 'Q493040', 'Q486317', 'Q163529', 'Q503511', 'Q389551']

    GA counties 2 counties removed:
    ['Q486757', 'Q493107', 'Q376990', 'Q493102', 'Q176480', 'Q503492', 'Q491514', 'Q491543', 'Q387216', 'Q486344', 'Q691614', 'Q493071', 'Q156503', 'Q488194', 'Q488219', 'Q486800', 'Q488186', 'Q488206', 'Q498286', 'Q493079', 'Q491547', 'Q503538']

    GA counties 3 counties removed:
    ['Q498684', 'Q156580', 'Q498307', 'Q156632']


    SC counties with interstates:
    ['Q404898', 'Q502411', 'Q515177', 'Q508288', 'Q502273', 'Q489420', 'Q513833', 'Q507488', 'Q619609', 'Q384754', 'Q497377', 'Q505975', 'Q506162', 'Q502285', 'Q512816', 'Q502404', 'Q505987', 'Q495105', 'Q181015', 'Q502431', 'Q502473', 'Q112957', 'Q497880', 'Q506068', 'Q489377', 'Q497871', 'Q513933', 'Q304065', 'Q505993']

    SC counties 1 county removed:
    ['Q513905', 'Q502447', 'Q306343', 'Q505999', 'Q495096', 'Q513775', 'Q502278', 'Q497890', 'Q497917', 'Q497824', 'Q495682', 'Q502210', 'Q505980', 'Q502456', 'Q502288', 'Q495090', 'Q502419']


    LA counties touching interstates:
    ['Q177562', 'Q498042', 'Q513078', 'Q369211', 'Q507047', 'Q383739', 'Q120080', 'Q507078', 'Q507028', 'Q507180', 'Q503870', 'Q504435', 'Q504379', 'Q507099', 'Q337402', 'Q504355', 'Q504345', 'Q506892', 'Q512868', 'Q504350', 'Q145006', 'Q491949', 'Q506937', 'Q504312', 'Q506921', 'Q486231', 'Q498276', 'Q507153', 'Q51733', 'Q507016', 'Q507629']


    LA counties 1 county removed:
    ['Q497964', 'Q504284', 'Q507063', 'Q507000', 'Q507126', 'Q504318', 'Q512832', 'Q1125008', 'Q1139827', 'Q505505', 'Q512911', 'Q509745', 'Q507609', 'Q504415', 'Q507088', 'Q509895', 'Q507139', 'Q503864', 'Q503883', 'Q506951', 'Q65433', 'Q504450', 'Q1139833', 'Q505392', 'Q205715', 'Q504391', 'Q505282', 'Q506086']

    LA counties 2 counties removed:
    ['Q387555']

    AR counties touching interstates:
    ['Q61381', 'Q61355', 'Q61500', 'Q61200', 'Q61348', 'Q61296', 'Q61289', 'Q61327', 'Q61160', 'Q61143', 'Q61472', 'Q61181', 'Q61145', 'Q61346', 'Q61157', 'Q61084', 'Q61005', 'Q61048', 'Q61315', 'Q61352', 'Q61468', 'Q61148', 'Q61020']


    AR counties 1 county removed:
    ['Q61167', 'Q61358', 'Q61138', 'Q61012', 'Q61032', 'Q61294', 'Q61414', 'Q61470', 'Q61150', 'Q61036', 'Q61153', 'Q61354', 'Q61204', 'Q61170', 'Q61502', 'Q61039', 'Q61379', 'Q61370', 'Q61484', 'Q61216', 'Q61176', 'Q61363', 'Q61317', 'Q61131', 'Q61077', 'Q61521', 'Q61202', 'Q61034', 'Q61384', 'Q61526']

    AR counties 2 counties removed:
    ['Q61368', 'Q61135', 'Q61129', 'Q61029', 'Q61458', 'Q61026', 'Q61478', 'Q61024', 'Q61461', 'Q61014', 'Q61350', 'Q61165', 'Q61010', 'Q61173', 'Q61086', 'Q61339', 'Q61018', 'Q61330']

    AR counties 3 counties removed:
    ['Q61042', 'Q61007', 'Q61481', 'Q61365']
*/

var clickedOnCounties = []



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

    window.addEventListener("keypress", (e)=> {
        if(e.key=="Enter") {console.log("Cleared County List"); clickedOnCounties = []}
    })

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
            
            e.target.setAttributeNS(null, "fill","black")
            clickedOnCounties.push(e.target.id)
            var metroName = document.getElementById(allCountyProperties[e.target.id]["WIKIDATAID"])
            metroName = metroName? metroName.parentElement.id : null;
            // var county = allCountyProperties[e.target.id]
            console.log("clickedOnCounties", clickedOnCounties)
            // console.log(metroData[metroName])
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
                // console.log('data',data)
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