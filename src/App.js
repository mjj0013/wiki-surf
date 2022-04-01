import './App.css';
import React from 'react';

import {Home} from './Home.js';
import {NavBar} from './NavBar.js';
import {HashRouter, Route, Routes} from 'react-router-dom'
import {TrendsPage} from './searchTrends.js'
export const UserContext = React.createContext(null);
import {WikiSearchPage} from './wikiSearchPage'

function App() {
  return (
    <HashRouter>
      <NavBar />
    
      <UserContext.Provider value={{currentUserIdx:0,users:[{name:'abel',email:'abel@mit.edu',password:'secret',balance:100, id:0}]}}>
        <div className="container" style={{padding: "20px"}}>
          <Routes>
          <Route path="/WikiSearchPage" exact element={<WikiSearchPage />} />
          <Route path="/" exact element={<Home />} />
           
          </Routes>
        </div>
      </UserContext.Provider>      

    </HashRouter>
  );
}

export default App;
