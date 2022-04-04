
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



import {sendRequestToBackend} from './frontEndHelpers.js';

function sampleWikiSearch() {
    var s = new WikiSubject({depth:2});
    console.log(s)
}


function listTrends() {

    // create form where the user inputs the search criteria (geo, time, phrase) for the trends. put that search criteria in the request body
    // other possible modules:    relatedQueries, relatedTopics, interestOverTime, interestByRegion
    var tempCriteria = {
        module:"dailyTrends",         
        region:"United States",
        startTime:null,
        endTime:null
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
            
            <button onClick={listTrends} style={{display:"block",top:"25%", left:"25%",position:"absolute"}}>Search</button>
           
            {/* <div id="map"></div>
            <div className="map-overlay top">
                <button  style={{fontSize:"2em",position:"absolute",top:"150px",width:"650px"}}>
                    Show stops between MIT and Harvard
                </button>
            </div> */}
            
        </div>
        
    )
}