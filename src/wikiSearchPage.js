import {WikiSubject} from './wikiSubject.js'
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

function sampleWikiSearch() {
    var s = new WikiSubject({depth:2});
    console.log(s)
}


export const WikiSearchPage = () => {
    
                
    // This is the map instance
    
    return (
        <div>

            {/* <WikiSubject depth={2}/> */}
            <button onClick={sampleWikiSearch} style={{display:"block",top:"25%", left:"25%",position:"absolute"}}>Search</button>
           
            {/* <div id="map"></div>
            <div className="map-overlay top">
                <button  style={{fontSize:"2em",position:"absolute",top:"150px",width:"650px"}}>
                    Show stops between MIT and Harvard
                </button>
            </div> */}
            
        </div>
        
    )
}