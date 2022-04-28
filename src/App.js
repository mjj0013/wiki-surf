import './App.css';
import React, {Component, useState, useEffect} from 'react';

import {Home} from './Home.js';
import {NavBar} from './NavBar.js';
import {HashRouter, Route, Routes} from 'react-router-dom'
import * as d3 from "d3";

import {AppContextProvider} from './AppContext';
import {WikiSearchPage} from './wikiSearchPage'

import {TrendsPage} from './searchTrends.js'


export function App() {
  // var req = new Request('/server')
  // sendRequestToBackend(req);
  
  return (
    <HashRouter>
      <NavBar />

      <AppContextProvider value={{currentUserIdx:0,users:[{name:'abel',email:'abel@mit.edu',password:'secret',balance:100, id:0}]}}>
        <div className="container" style={{padding: "20px"}}>
          <Routes>
          <Route path="/WikiSearchPage" exact element={<WikiSearchPage />} />
          <Route path="/" exact element={<Home />} />
          </Routes>
        </div>
      </AppContextProvider>      


    </HashRouter>
  );
  
}

export default App;
