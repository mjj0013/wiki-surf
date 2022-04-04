// var axios = require('axios').default;
// import {regionCodes, getDateObj} from './geoHelpers.js'
const {regionCodes, getDateObj} = require('./geoHelpers.js');

const googleTrends = require('google-trends-api');
const express = require('express');
const PORT = process.env.PORT || 3000;
const path = require("path")
const bodyParser = require("body-parser");      // a middleware
// const fetch = require('node-fetch')

const DIST_DIR = path.join(__dirname, "public");

const app = express();
app.use(express.static(DIST_DIR));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.listen(PORT, ()=> { console.log("Server running on port "+PORT); })



app.get('/server',(req,res)=>{
    
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");

    console.log("req",req)

    var chosenGeoCode = regionCodes["United States"]
    var trendDate = new Date();

    googleTrends.dailyTrends({ trendDate: trendDate,  geo:chosenGeoCode})
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        var days = data.default["trendingSearchesDays"]
        var dayStrings = `\n************************************\n`
        for(let d=0 ; d < days.length; ++d) {
            var queries = `\n`
            for(let s=0; s < days[d]["trendingSearches"].length; ++s) {
                queries+=days[d]["trendingSearches"][s]["title"]["query"]+"\n"
            }
            dayStrings += days[d]["formattedDate"]+queries+`\n************************************\n`
        }
        console.log(dayStrings)
        res.send({data:{dayStrings}})
    })
})




