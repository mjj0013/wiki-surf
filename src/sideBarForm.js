// import noUiSlider from 'nouislider';
import React, { useEffect ,useState} from 'react';
import {Button, Input, Container, Dropdown, Grid, Image, Label, List, Menu, Segment, Sidebar , Transition} from 'semantic-ui-react'
import './index.css'

import {sendRequestToBackend} from './frontEndHelpers.js';
import { DateRangeSlider } from './dateRangeSlider';


var searchTermColors = []

import {abridgedCategories, regionCodes, regionData, regionCodesReformatted} from '../server/geoHelpers.js';

import noUiSlider from 'nouislider';


var searchTerms = [];


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

    // console.log('titleSearch',titleSearch)
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


// function searchTabChanged(e) {
//     if(e.target.id=="globalSearchTab") {
//         setCurrentTab("globalSearchTab");
//         document.getElementById("regionSection").style.display = "none";
//         document.getElementById('analyzeButton').style.display = "none";
//         document.getElementById('categorySection').style.gridColumn = 2;
//         document.getElementById('categorySection').style.gridRow = 1;
//         moduleChanged()
//     }
//     if(e.target.id=="byCountrySearchTab") {
//         setCurrentTab("byCountrySearchTab");
//         document.getElementById("regionSection").style.display = "block";
//         document.getElementById('analyzeButton').style.display = "block";
//         document.getElementById('categorySection').style.gridColumn = 2;
//         document.getElementById('categorySection').style.gridRow = 2;
       
//         moduleChanged()
//     }
// }





{/* <Sidebar.Pushable as={Segment}> */}
{/* <div className="ui segment pushable"> */}
    
        {/* <form className="inputForm"> */}
        {/* <div className="ui inverted vertical labeled icon ui overlay left thin visible sidebar menu"> */}




export const SideBarWrapper = ({sideBarVisible, setSideBarVisible,setInputData, inputData, setReadyResults, readyResults, setSearchClicked, searchClicked, setCurrentTab, setCountryOptions, countryOptions, isVisible, setVisible,...props}) => {
    
    // const [countryOptions, setCountryOptions] = useState({region:"US" });       //, displayMode:"regions",resolution:"countries"
    const [data,setRegionData] = useState(regionData);

    const [moduleName, setModuleName] = useState("dailyTrends");

    const [timeSliderCreated, setTimeSliderCreated] = useState(false);
    
    

    function regionChanged() {
        var selected = document.getElementById("regionElement")
        
        if(selected.value=="ALL") {
            document.getElementById("backToGlobalBtn").classList.remove("showing");
        }
        else {
            document.getElementById("backToGlobalBtn").classList.add("showing");
        }
        

        if(selected.value=="US") setCountryOptions({...countryOptions,region:selected.value})           // resolution:"provinces", 
        else setCountryOptions({...countryOptions,  region:selected.value})         //resolution:"countries",
    
    }
    function buildRequestBody() {
        return new Promise((resolve, reject)=> {
            var region = document.getElementById("regionElement").value
            var body = {  module:moduleName,  region:region?region:null  }
            
            if(moduleName=="dailyTrends") {
                var trendDate = document.getElementById("trendDateElement").value
                body["trendDate"] = trendDate;
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
            // document.getElementById('dateRangeSection').style.display = 'none';
            // document.getElementById('trendDateSection').style.display = 'block';
            // document.getElementById('keywordEntrySection').style.display = 'none'
            // document.getElementById('categorySection').style.display = 'none'
            // document.getElementsByClassName("formGrid2")[0].style.display = 'none'
        }
        else if(modName=="interestOverTime") {
            // document.getElementById('dateRangeSection').style.display = 'block';
            // document.getElementById('trendDateSection').style.display = 'none';
            // document.getElementById('keywordEntrySection').style.display = 'flex'   
            // document.getElementsByClassName("formGrid2")[0].style.display = 'grid'
            // document.getElementById('categorySection').style.display = 'block'
            // createSlider();
        }
        else if(modName=="realTimeTrends") {
            // document.getElementById('dateRangeSection').style.display = 'none';
            // document.getElementById('trendDateSection').style.display = 'none';
            // document.getElementById('keywordEntrySection').style.display = 'none'   
            // document.getElementById('categorySection').style.display = 'block'
            
    
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
            // document.getElementById('dateRangeSection').style.display = 'block';
            // document.getElementById('trendDateSection').style.display = 'none';
            // document.getElementById('keywordEntrySection').style.display = 'flex'   
            // document.getElementsByClassName("formGrid2")[0].style.display = 'grid'
            // // document.getElementById('categorySection').style.display = 'block'
            
            // createSlider();
        }
        else if(modName=="interestByRegion") {
            // document.getElementById('dateRangeSection').style.display = 'block';
            // document.getElementById('trendDateSection').style.display = 'none';
            // document.getElementById('keywordEntrySection').style.display = 'flex'   
            // document.getElementsByClassName("formGrid2")[0].style.display = 'grid'
            // document.getElementById('categorySection').style.display = 'block'
            document.getElementById("dateSlider").display='block'
            createSlider();
            
        }
    }
   
    async function displayResults(moduleName, results) {
        var resultItems = document.getElementById("resultItems")
        while(resultItems.firstChild) resultItems.removeChild(resultItems.firstChild);

        
        for(let i =0; i < results.length; ++i) {


            /*
                item
                    img
                    content
                        header
                        description
            */
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
    var regionOptions  = regionCodesReformatted.map((obj,idx)=>{ 
        return {key:idx, text:obj.name, value:obj.code, selected:obj.name=="United States"?true:false}
    })

    var moduleOptions = [
        {value:"dailyTrends", key:"Daily Trends", text:"Daily Trends"},
        {value:"realTimeTrends", key:"Real Time Trends", text:"Real Time Trends"},
        {value:"interestOverTime", key:"Interest Over Time", text:"Interest Over Time"},
        {value:"interestByRegion", key:"Interest By Region", text:"Interest By Region"},
        {value:"relatedQueries", key:"Related Queries", text:"Related Queries"}

    ]
    function sideBarHandleClicked(e){
        var sideBarHandle = document.getElementById('sideBarHandle');
        setSideBarVisible(sideBarVisible?false:true);
        
        sideBarHandle.classList.toggle('showing')

        // e.target.firstChild.classList.toggle('left')
        // e.target.firstChild.classList.toggle('right')
 
    }

    function createSlider() {
        if(!timeSliderCreated) {
            // var dateSlider = document.createElement("div");
            // dateSlider.id = "dateSlider"
            var dateSlider = document.getElementById("dateSlider")
            // document.getElementById('sliderRow').appendChild(dateSlider);
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
    

    return (
        
     <Sidebar.Pushable as={Segment}>
        {/* <Transition.Group> */}
        {/* <Button id="sideBarHandle" attached icon="caret square left outline" onClick={(e)=>sideBarHandleClicked(e)} /> */}

        <Button id="backToGlobalBtn" attached icon="arrow left" />
        <Button id="sideBarHandle" attached icon="chart line" onClick={(e)=>sideBarHandleClicked(e)} />
        {/* </Transition.Group> */}
        
        <Sidebar id="inputSideBar" as={Menu} animation='overlay' icon='labeled' vertical visible={isVisible}  direction="right" >
            <Menu.Header>
                Input Form
            </Menu.Header>
            <Menu.Item  >
                <Grid columns={3}>

                    <Grid.Row>
                        <Grid.Column id="moduleSelectSection" >
                            <Dropdown fluid labeled button placeholder="Module"  id="moduleSelectElement" options={moduleOptions} onChange={(e,d)=>moduleChanged(e,d)}>
                            </Dropdown>
                        </Grid.Column>
                        
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column  id="regionSection" >
                            <Dropdown  scrolling floating labeled button placeholder='Select Region' fluid id="regionElement" onChange={regionChanged} options={regionOptions}>  
                            </Dropdown>
      
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

                        {(moduleName!="dailyTrends") && <Grid.Column>
                            <Input label={<Label attached='top'>Start Date</Label>} type="date" id="startDateElement" min="2004-01-01"/>
                        </Grid.Column>}

                        {(moduleName!="dailyTrends") &&<Grid.Column><br/></Grid.Column>}

                        {(moduleName!="dailyTrends") && 
                        <Grid.Column>
                            <Input label={<Label  attached='top'>End Date</Label>} type="date" id="endDateElement" />
                        </Grid.Column>}


                    </Grid.Row>

                    <Grid.Row id="sliderRow" stretched width={5}>
                        <div id="dateSlider" />
                       
                       
                        
                     
                    
                    </Grid.Row>
                </Grid>
            </Menu.Item>
            <Menu.Item className="formButtonGrid mb-3">
                <button className="btn btn-primary"  type="button" onClick={(e)=>searchBtnHandler(e)} >Search</button>
                <button id="analyzeButton" className="btn btn-success" type="button" onClick={countryAnalysisClicked}>Analysis</button>
            </Menu.Item>

            <List id="resultItems" divided relaxed>
                {readyResults && readyResults.data.searches.map((item,key)=> {
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
        
        <Sidebar.Pusher>
            
            {props.children}
        </Sidebar.Pusher>
        
        
    </Sidebar.Pushable>)
}

