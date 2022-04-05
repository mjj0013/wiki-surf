
import React from 'react';
import {AppContext} from './AppContext.js';
import mapboxgl from 'mapbox-gl';
// mapboxgl.accessToken = 'pk.eyJ1IjoibWpqMDAxMyIsImEiOiJjbDE2bXg0YmYwODduM2RwbnJkcmQ1bnduIn0.IYgBcJUZkVwjjsdeD6F2Kw';
// let map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v11',
//     center: [-71.104081, 42.365554],
//     zoom: 14,
// });
import {regionCodes} from '../server/geoHelpers.js';

const regions = Object.keys(regionCodes)

const regionCodesReformatted = regions.map(i=>{
    return {name:i, code:regionCodes[i]}
})
regionCodesReformatted.sort(function(a,b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
})


// import {sendRequestToBackend} from './frontEndHelpers.js';

async function sendRequestToBackend(req) {

    //'/server'
    const response = await fetch(req);
    const body = await response.json();
    if(response.status!==200) throw Error(body.message);
    return body;
}

function searchClicked() {
    var moduleSelect = document.getElementById("moduleSelectElement").value
    
    if(moduleSelect=="dailyTrends") {
        listTrends();
    }
}

function listTrends() {

    // create form where the user inputs the search criteria (geo, time, phrase) for the trends. put that search criteria in the request body
    // other possible modules:    relatedQueries, relatedTopics, interestOverTime, interestByRegion
    
    var trendDate = document.getElementById("trendDateElement").value
    var region = document.getElementById("regionElement").value
    var tempCriteria = {
        module:"dailyTrends",         
        region:region? region : null,
        trendDate:trendDate? trendDate : null
    }
    var headers = {"Content-Type":"application/json", "Accept":"application/json"}
    var req = new Request('/server', {
        method:"POST", 
        headers:headers,
        body: JSON.stringify(tempCriteria)
    })


    sendRequestToBackend(req).then(result=>{
        console.log(result);
    })
}
export const Home = () => {          
    // This is the map instance
    return (
        <div>
            <label htmlFor="moduleSelectElement">Module:</label>
            <select id="moduleSelectElement">
                <option value="dailyTrends">Daily Trends</option>
            </select>

            <label htmlFor="trendDateElement">Trend date:</label>
            <input type="date" id="trendDateElement" />

            <label htmlFor="regionElement">Region:</label>
            <select id="regionElement">
                {
                    regionCodesReformatted.map((obj,idx)=>{return (<option key={idx} value={obj.code}>{obj.name}</option>)})
                }
            </select>
            <button onClick={searchClicked} style={{display:"block",top:"25%", left:"25%",position:"absolute"}}>Search</button>
           
            {/* <div id="map"></div>
            <div className="map-overlay top">
                <button  style={{fontSize:"2em",position:"absolute",top:"150px",width:"650px"}}>
                    Show stops between MIT and Harvard
                </button>
            </div> */}
            
        </div>
        
    )
}