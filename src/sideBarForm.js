// import noUiSlider from 'nouislider';
import React, { useEffect ,useState} from 'react';
import {Icon,  Item,Card, Button, Input, Container, Dropdown, Grid, Image, Label, List, Menu, Segment, Sidebar , Transition} from 'semantic-ui-react'
import './index.css'

import {sendRequestToBackend} from './frontEndHelpers.js';

import {abridgedCategories, regionCodes, regionData, regionCodesReformatted} from '../server/geoHelpers.js';
import noUiSlider from 'nouislider';

import {A3toA2, A2toA3} from './globalDb.js'

import usMetroMap, {metrosByState, metroData} from './usMetroMap.js'
import {insights} from './insightsIcon.js'


var searchTerms = [];
var searchTermColors = []
var prependArray = (val, arr) => {
    var newArr = arr.slice();
    newArr.unshift(val);
    return newArr;
}
function countryAnalysisClicked() {
    var selectElement =  document.getElementById("regionElement");
    var mainTitle = selectElement.options[selectElement.selectedIndex].text
    var demographicsTitle = `Demographics of ${mainTitle}`;
    var mainExists = true;
    var demographicsExists = true;

    // checking for country's main Wiki page
    wikiTitleSearch(mainTitle)
    .catch((err)=>{mainExists=false})
    .then(result=> {   console.log('main result', result) })

    // checking for country's demographics Wiki page
    wikiTitleSearch(demographicsTitle)
    .catch((err)=>{demographicsExists=false})
    .then(result=> {  console.log('demographics result', result) })

    if(mainExists) {
        var mainPage = new WikiSubject({wikiTitle:mainTitle, depth:1});
        console.log('mainPage',mainPage)
    }
    if(demographicsExists) {
        var demoPage = new WikiSubject({wikiTitle:demographicsTitle, depth:1});
        console.log('demoPage',demoPage)
    }
    // var countryPage = new WikiSubject()
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function addKeywordPressed() {
    var termList = document.getElementById("termList");
    var keywordInput = document.getElementById('keywordInput');
    if(keywordInput.value.length==0) return;
    var item = document.createElement('div');
    var hue; 
    var sat;
    var uniqueColorCreated = false;

    while(!uniqueColorCreated) {
        hue = getRandomInt(0,359);
        sat = getRandomInt(1,99);
        if(searchTermColors.length==0) {
            searchTermColors.push([hue,sat])
            uniqueColorCreated = true;
        }
        else {
            for(let c=0; c < searchTermColors.length; ++c) {
                if(Math.abs(hue-searchTermColors[c][0]) > 30) {
                    if(Math.abs(sat-searchTermColors[c][1] > 15)) {
                        searchTermColors.push([hue,sat])
                        uniqueColorCreated = true;
                    }
                }
            }
        }
        
    }
    var bgColor = `hsl(${hue}, ${sat}%, 60%)`
    item.style.backgroundColor = bgColor;
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

function keyDownOnKeywordInput(e) {
    if(e.keyCode==9) {
        e.preventDefault();
        addKeywordPressed();
    }
}

function keyUpOnKeywordInput(e) {
    if(e.key=="Enter") addKeywordPressed();
}

var startDateDefault = new Date("2004-01-01").getTime()
var dateSliderOptions = {
    start:[startDateDefault,Date.now()],
    connect:true,
    step: 1, 
    behaviour:'tap-drag',
    range:{'min':startDateDefault, 'max':Date.now()},
    direction:'ltr',
   
    pips: {
        mode:'range', density:3, 
        format: {to :  function(val) {return new Date(val).toDateString()}}
    }
}
function categoryChanged() {}



export const SideBarWrapper = ({regionSelectHistory,setRegionSelectHistory,regHistQueueIdx , setRegHistQueueIdx, setRegionOptions, regionOptions, selectedRegion, setSelectedRegion, mapColorView, setMapColorView, sideBarVisible, setSideBarVisible,setInputData, inputData, setReadyResults, readyResults, setSearchClicked, searchClicked, setCurrentTab,  isVisible, setVisible,...props}) => {
    
    // const [RegionOptions, setRegionOptions] = useState({region:"US" });       //, displayMode:"regions",resolution:"countries"

    const [data,setRegionData] = useState(regionData);
    const [moduleName, setModuleName] = useState("dailyTrends");
    const [timeSliderCreated, setTimeSliderCreated] = useState(false);
    const [showSlider, setHideSlider] = useState(false)
    const [sideBarTab,setSideBarTab] = useState("trendsBtn");

    function regionChanged(e,data) {
        var selected = document.getElementById("regionElement")
        
        console.log('data.value',data.value)
        
        if(!regionSelectHistory.includes(data.value)) {
            
            setRegHistQueueIdx({...regHistQueueIdx, next:regionSelectHistory.length})
            regionSelectHistory.push(data.value)
        }
        else {
            setRegHistQueueIdx({...regHistQueueIdx, next:regionSelectHistory.indexOf(data.value)})
        }
        
        // setRegHistQueueIdx(regHistQueueIdx+1);
        
        // remember, some modules can access the city/county level of US region

        // if(selected.value=="US") setRegionOptions({...RegionOptions,region:selected.value})           // resolution:"provinces", 
        // else setRegionOptions({...RegionOptions,region:selected.value})         //resolution:"countries",
    
    }
    function buildRequestBody() {
        return new Promise((resolve, reject)=> {
            // var region = document.getElementById("regionElement").value
            var body = {  module:moduleName,  geo:null  }
            
            if(moduleName=="dailyTrends") {
                var trendDate = document.getElementById("trendDateElement").value
                body["trendDate"] = trendDate;
                if(selectedRegion=="<global>") {}       //throw error ("dailyTrends" requires a specific region)
                else if(selectedRegion.length==3) {
                    if(selectedRegion=="USA") {}
                    else body["geo"] = A3toA2[selectedRegion];
                }
                
            }
            else if(moduleName=="realTimeTrends") {
                // body["category"] = abridgedCategories[document.getElementById("categoryElement").value]
            }
            else if(moduleName=="interestOverTime" || moduleName=="interestByRegion" || moduleName=="relatedQueries") {


                var startDate = document.getElementById("startDateElement").value
                var endDate = document.getElementById("endDateElement").value
                searchTerms = []
                var searchTermElements = document.getElementsByClassName('search-term');
                for(let e=0; e < searchTermElements.length; ++e) {
                    if(!searchTerms.includes(searchTermElements[e].innerText)) searchTerms.push(searchTermElements[e].innerText)
                }
                if(selectedRegion=="<global>") body["geo"] = null

                else if(selectedRegion.length==3)  {
                    console.log(A3toA2)
                    body["geo"] = A3toA2[selectedRegion];
                }
                console.log('selectedRegion',selectedRegion)
                console.log("body", body)
                body["keyword"] = searchTerms;
                body["startTime"] = startDate;
                body["endTime"] = endDate;
            }
            resolve(body);
        })
        
    }
    
    function searchBtnHandler(e) {
        e.stopPropagation()
        buildRequestBody()
        .then(result=> {
            setInputData(result);
            setSearchClicked(searchClicked? false:true)
        })
    }
    
    function moduleChanged(e,data) {
        var modName = data.value
        setModuleName(modName)
        
        // document.getElementById("moduleSelectSection").style.display = 'block';
        if(modName=="dailyTrends") {
            // dateRangeSection --> none, trendDateSection--> block, keywordEntrySection-->none,  categorySection-->none
            setHideSlider(true)
        }
        else if(modName=="interestOverTime") {
            // dateRangeSection --> block, trendDateSection--> none, keywordEntrySection-->flex,  categorySection-->block
            // createSlider();
        }
        else if(modName=="realTimeTrends") {
            // dateRangeSection --> none, trendDateSection--> none, keywordEntrySection-->none,  categorySection-->block
            setHideSlider(true)
            //abridgedCategories
            // var categoryElement = document.getElementById('categoryElement');
            // while(categoryElement.firstChild) categoryElement.remove(categoryElement.firstChild);
            // var abridgedCats = Object.keys(abridgedCategories);
            // for(let c=0; c < abridgedCats.length; ++c) {
            //     let opt = document.createElement('option');
            //     opt.key=c;
            //     opt.innerHTML = abridgedCats[c];
            //     opt.value = abridgedCats[c];
            //     categoryElement.appendChild(opt);
            // }
            
            
        }
        else if(modName=="relatedQueries") { 
            // dateRangeSection --> block, trendDateSection--> none, keywordEntrySection-->flex,  categorySection-->block
            // createSlider();
        }
        else if(modName=="interestByRegion") {
            // dateRangeSection --> block, trendDateSection--> none, keywordEntrySection-->flex,  categorySection-->block
            document.getElementById("dateSlider").display='block'
            createSlider();
        }
    }
   
    async function displayResults(moduleName, results) {
        var resultItems = document.getElementById("resultItems")
        while(resultItems.firstChild) resultItems.removeChild(resultItems.firstChild);

        for(let i =0; i < results.length; ++i) {
            var li = document.createElement("item");
            var img = document.createElement("img");
            var content = document.createElement("content");
            var header = document.createElement("header");
            var description = document.createElement("description");
            
            if(moduleName=="dailyTrends") {
                header.innerHTML = results[i].title.query
                description.innerHTML = results[i].formattedTraffic + " views";
                img.src = results[i].image.imageUrl
            }
            else if(moduleName=="realTimeTrends") {
                header.innerHTML = results[i].title;
                img.src = results[i].image.imgUrl
            }
            else if(moduleName=="interestByRegion") {}

            content.appendChild(header);
            content.appendChild(description);
            li.appendChild(img);
            li.appendChild(content);
            // getWikiData(results[i].title.query)
            resultItems.appendChild(li)
          
        }
    }
    //regionCodesReformatted.map((obj,idx)=>{return (<Dropdown.Item key={idx} text={obj.name} value={obj.code} selected={obj.name=="United States"?true:false}></Dropdown.Item>)})
    
    
    var regionDropdownOptions  = regionOptions.map((obj,idx)=>{ 
        return {key:idx+1, text:obj.ADMIN, value:obj.ADM0_A3}          //, selected:obj.ADMIN=="United States"?true:false
    })
    
    regionDropdownOptions = prependArray({key:0, text:"All", value:"<global>"}, regionDropdownOptions)
    

    var moduleOptions = [
        {value:"dailyTrends", key:"Daily Trends", text:"Daily Trends"},
        {value:"realTimeTrends", key:"Real Time Trends", text:"Real Time Trends"},
        {value:"interestOverTime", key:"Interest Over Time", text:"Interest Over Time"},
        {value:"interestByRegion", key:"Interest By Region", text:"Interest By Region"},
        {value:"relatedQueries", key:"Related Queries", text:"Related Queries"}
    ]


    var regionViewOptions = [
        {value:"default", key:"Default", text:"Default"},
        {value:"continent", key:"Continent", text:"Continent"},
        {value:"sovereignty", key:"Sovereignty", text:"Sovereignty"},
        {value:"sphere", key:"Cultural Sphere", text:"Cultural Sphere"},
    ]

    function sideBarBtnClicked(e){
        var sideBarHandle = document.getElementById('sideBarHandle');
        if(sideBarVisible) {
            if(e.target.id == sideBarTab) {
                setSideBarVisible(sideBarVisible?false:true);
                sideBarHandle.classList.toggle('showing')
                document.getElementById("settingsBtn").classList.remove("primary");
                document.getElementById("trendsBtn").classList.remove("primary");
            }
            else {
                // then don't toggle showing class
                if(e.target.id=="settingsBtn") {
                    setSideBarTab("settingsBtn")
                    document.getElementById("settingsBtn").classList.add("primary");
                    document.getElementById("trendsBtn").classList.remove("primary");

                    document.getElementById("trendsTab").classList.remove("showing")
                    document.getElementById("settingsTab").classList.add("showing")

                }
                else if(e.target.id=="trendsBtn") {
                    setSideBarTab("trendsBtn")
                    document.getElementById("trendsBtn").classList.add("primary");
                    document.getElementById("settingsBtn").classList.remove("primary");

                    document.getElementById("trendsTab").classList.add("showing")
                    document.getElementById("settingsTab").classList.remove("showing")
                }
            }
        }

        else {
            if(e.target.id=="settingsBtn") {
                setSideBarTab("settingsBtn")
                document.getElementById("settingsBtn").classList.add("primary");
                document.getElementById("trendsBtn").classList.remove("primary");

                document.getElementById("trendsTab").classList.remove("showing")
                document.getElementById("settingsTab").classList.add("showing")
            }
            else if(e.target.id=="trendsBtn") {
                setSideBarTab("trendsBtn")

                document.getElementById("trendsBtn").classList.add("primary");
                document.getElementById("settingsBtn").classList.remove("primary");

                document.getElementById("trendsTab").classList.add("showing")
                document.getElementById("settingsTab").classList.remove("showing")
            }
            setSideBarVisible(sideBarVisible?false:true);
            sideBarHandle.classList.toggle('showing')
        }
    }

    function createSlider() {
        if(!timeSliderCreated) {
            var dateSlider = document.getElementById("dateSlider")
            noUiSlider.create(dateSlider, dateSliderOptions);
            dateSlider.noUiSlider.on('update', function (values, handle) {
                var startDateObj = new Date(parseInt(values[0]));
                var endDateObj = new Date(parseInt(values[1]));
                if(document.getElementById("startDateElement")) document.getElementById("startDateElement").value =  startDateObj.toISOString().substr(0,10)
                if(document.getElementById("endDateElement")) document.getElementById("endDateElement").value = endDateObj.toISOString().substr(0,10)
            })
            setTimeSliderCreated(true)
            return dateSlider;
        }
    }

    

    useEffect(()=>{
        
        if(moduleName == "dailyTrends" || moduleName == "realTimeTrends") {
            document.getElementById("dateSlider").classList.add('hidden')
        }
        else document.getElementById("dateSlider").classList.remove('hidden')
    }, [sideBarTab,showSlider, selectedRegion]);



 
    function regionViewChanged(e,data) {
        var choice = data.value;
        setMapColorView(choice)
    }
    return (
        
     <Sidebar.Pushable id="mapWidget" as={Segment}>
        <Card id="sideBarHandle">
            <Card.Content>
                <Container id="sideBarBtns" >
                
                    <Button id="settingsBtn" fluid className="sideBarBtn" attached onClick={(e)=>sideBarBtnClicked(e)} >
                       <Icon className="setting large fitted"  />
                    </Button>
                    <Button id="trendsBtn" fluid className="sideBarBtn" attached onClick={(e)=>sideBarBtnClicked(e)}>
                        <Icon className="chart line large fitted"  />
                    </Button>
                    <Button id="queryBtn"  fluid className="sideBarBtn" attached onClick={(e)=>sideBarBtnClicked(e)}>
                        {insights()}
                    </Button>

                    
                </Container>
            </Card.Content>
        </Card>
        
        
        <Sidebar id="inputSideBar" as={Menu} animation='overlay' icon='labeled' vertical visible={isVisible}  direction="right" >
            
            <Menu.Header>Input Form</Menu.Header>
            <Menu.Item id="settingsTab">
                <Segment>
                    <Dropdown fluid floating labeled button text="Map View" options={regionViewOptions} onChange={(e,d)=>regionViewChanged(e,d)} />

                </Segment>
            </Menu.Item>
            <Menu.Item id="trendsTab" >
                <Item.Group divided >
                    <Item>
                        <Item.Content>
                            <Grid columns={3}>
                                <Grid.Row>
                                    <Grid.Column id="moduleSelectSection" >
                                        <Dropdown fluid labeled button placeholder="Module"  id="moduleSelectElement" options={moduleOptions} onChange={(e,d)=>moduleChanged(e,d)} />
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column  id="regionSection" >
                                        <Dropdown scrolling floating labeled button placeholder='Select Region' fluid id="regionElement" onChange={(e,d)=> regionChanged(e,d)} options={regionDropdownOptions} />  
                                    </Grid.Column>    
                                    <Grid.Column id="categorySection">
                                            <Dropdown fluid floating labeled button text="Category" id="categoryElement" onChange={categoryChanged}>
                                                <Dropdown.Menu >
                                                    <Dropdown.Item text="blank"></Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                    </Grid.Column>
                                </Grid.Row>                    
                    
                                <Grid.Row stretched>
                                { (moduleName!="dailyTrends" && moduleName!="realTimeTrends") &&<Grid.Column id="keywordEntrySection">
                                        
                                        <div id="keywordField" className="form-control search-container">
                                            <div className='search-container-inputs'>
                                                <Input label="Keyword(s)" id='keywordInput' onKeyUp={(e)=> keyUpOnKeywordInput(e)} onKeyDown={(e)=> keyDownOnKeywordInput(e)}
                                                    action={
                                                        <button  className="ui icon button"  id="addKeywordButton"type="button"  onClick={addKeywordPressed} style={{display:'block'}}>
                                                            <img src="plus.svg" width="20" height="20"/>
                                                        </button>} />
                                            </div>    
                                            <div id="termList" className="search-term-container"></div>
                                        </div>
                                    </Grid.Column>}
                                </Grid.Row>
                                <Grid.Row stretched>
                                    {(moduleName=="dailyTrends") && <Grid.Column  id="trendDateSection">
                                        <Input label="Trend date" type="date" id="trendDateElement" min="2004-01-01"/>
                                    </Grid.Column>}

                                    {(moduleName!="dailyTrends") && <Grid.Column style={{maxWidth:"33%"}}>
                                        <Input label={<Label attached='top'>Start Date</Label>} type="date" id="startDateElement" min="2004-01-01"/>
                                    </Grid.Column>}

                                    {(moduleName!="dailyTrends") &&<Grid.Column style={{maxWidth:"33%"}}><br/></Grid.Column>}

                                    {(moduleName!="dailyTrends") && 
                                    <Grid.Column style={{maxWidth:"33%"}}>
                                        <Input label={<Label  attached='top'>End Date</Label>} type="date" id="endDateElement" />
                                    </Grid.Column>}
                                </Grid.Row>

                                <Grid.Row id="sliderRow" stretched width={5} style={{maxWidth:"90%", marginLeft:"10px"}}>
                                    <div id="dateSlider" />
                                </Grid.Row>
                            </Grid>
                        </Item.Content>
                    </Item>
                    <Item>
                        <Item.Content>
                            <div>
                                <Button color="blue" onClick={(e)=>searchBtnHandler(e)} >Search</Button>
                                <Button color="blue" id="analyzeButton" onClick={countryAnalysisClicked}>Analysis</Button>
                            </div>
                        </Item.Content>
                    </Item>
               
            
                </Item.Group>
                </Menu.Item>
                <List id="resultItems" divided relaxed>
                    {readyResults && readyResults.moduleName=="dailyTrends" && readyResults.data.searches.map((item,key)=> {
                        return (
                            <List.Item key={key}>
                                <img src={item.image.imgUrl}/>
                                <List.Content>
                                    <List.Header>{item.title.query}</List.Header>
                                    {readyResults.moduleName=="dailyTrends" &&  <List.Description>{item.formattedTraffic + " views"}</List.Description>}
                                </List.Content>
                            </List.Item>
                        )
                    })}
                </List>
        
                
            </Sidebar>

        <Sidebar.Pusher>{props.children}</Sidebar.Pusher>
    </Sidebar.Pushable>)
}

