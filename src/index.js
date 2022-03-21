import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


/* GOAL: create a 'product' selector-like website where pages are generated from random topics on Wikipedia; 
    -For each randomly generated topic, fetch links from its 'See Also' section Wiki page and include those somehow
    -Add functionalities like sorting, advanced search, etc.
*/


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();




