import React from 'react';
import {UserContext} from './App.js';
import './App.css'


function changeCurrentPage(e) {
    var allListItems = document.querySelectorAll(".nav-item.activePage");
    for(let li=0; li < allListItems.length; ++li) {
      allListItems[li].classList.remove("activePage");
    }
    if(e.target.id!="homeLink") e.target.parentElement.classList.add("activePage")
  }


export const NavBar =(intUser) => {

    const ctx = React.useContext(UserContext)

    return(
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark navBarMain">
          <a id="homeLink" className="navbar-brand" href="#"    onMouseDown={(e)=>{changeCurrentPage(e)}}
            data-bs-trigger="hover" data-bs-toggle="popover" title="Return to Bad-Bank landing page">Home</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <img src="./homeIcon.svg" />
          </button>
          <div id="navbarNav" className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto" >
              {/* <li className="nav-item ">
                <a className="nav-link" href="#/TrendsPage/"   onMouseDown={(e)=>{changeCurrentPage(e)}}
                  data-bs-trigger="hover" data-bs-toggle="popover">TrendsPage</a>
              </li> */}
              
            </ul>
            <span id="userGreeting" className="navbar-text"></span>    
          </div>
        
        </nav>
  
    );
}