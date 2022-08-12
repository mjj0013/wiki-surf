import './App.css';
import React, {Component, useState, useEffect} from 'react';

import {Home} from './Home.js';
import {US_Map} from './US_Map.js'
import {NavBar} from './NavBar.js';
import {HashRouter, Route, Routes} from 'react-router-dom'
import * as d3 from "d3";

import {AppContextProvider} from './AppContext';
import {WikiSearchPage} from './wikiSearchPage'

import {TrendsPage} from './searchTrends.js'


export function App() {
  // var req = new Request('/server')
  // sendRequestToBackend(req);
  var [dragStart, setDragStart] = useState({x:0, y:0})
  const [regionData,setRegionData] = useState(null);
  const [sideBarVisible, setSideBarVisible] = useState(false);
  const [regionOptions, setRegionOptions] = useState([]);       //, displayMode:"continents",resolution:"countries"
  const [searchClicked, setSearchClicked] = useState(false);
  const [readyResults, setReadyResults] = useState(null);
  const [inputData, setInputData] = useState({geo:"US"});
  const [mapColorView, setMapColorView] = useState("default");
  const [mapCreated, setMapCreated] = useState(false);
  const [sideBarTab,setSideBarTab] = useState("trendsBtn");
  const [regionSelectHistory, setRegionSelectHistory] = useState(false);
  const [regHistQueueIdx, setRegHistQueueIdx] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(false);
  return (
    <HashRouter>
      <NavBar />

      <AppContextProvider value={{regionData, setRegionData, dragStart, setDragStart, sideBarVisible, setSideBarVisible, setRegionOptions,regionOptions, searchClicked, setSearchClicked, readyResults, setReadyResults, inputData, setInputData, mapColorView,setMapColorView, mapCreated, setMapCreated, regionSelectHistory, setRegionSelectHistory, regHistQueueIdx, setRegHistQueueIdx, selectedRegion, setSelectedRegion}}>
        <div className="container" style={{padding: "20px"}}>
          <Routes>
            <Route path="/WikiSearchPage" exact element={<WikiSearchPage />} />
            <Route path="/US_Map" exact element={<US_Map />} />
            <Route path="/" exact element={<Home />} />
          </Routes>
        </div>
      </AppContextProvider>      


    </HashRouter>
  );
  
}

export default App;
