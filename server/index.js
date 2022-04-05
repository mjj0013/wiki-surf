const {regionCodes, getDateObj} = require('./geoHelpers.js');
const googleTrends = require('google-trends-api');
const express = require('express');
const PORT = process.env.PORT || 3000;
const path = require("path")
const bodyParser = require("body-parser");      // a middleware
const DIST_DIR = path.join(__dirname, "public");


const app = express();
app.use(express.static(DIST_DIR));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.listen(PORT, ()=> { console.log("Server running on port "+PORT); })


var dateWithinRange = (dateObj) => {        //tests if specified date is more than 15 days in the past OR if date is in future.
    var dayDiff = Date.now() - dateObj.getTime();
    if(Math.round(dayDiff)==0) return 0;
    else if(dayDiff < 0) return -2;         // in the future
    else if(Math.round(dayDiff/(24*60*60*1000)) >15) return -1;     //more than 15 days in the past
    else return 1
}

var dailyTrendsModule = (req,res) =>{
    var query = req.body;
    var geo = query.region? query.region : regionCodes["United States"];
    var trendDate = query.trendDate? new Date(query.trendDate) : new Date();
    var dateTest = dateWithinRange(trendDate);
    if(dateTest==-1) {           //invalid trendDate
        res.send({data:"Invalid date: The specified date was more than 15 days in the past", ok:false})
        return;
    }
    if(dateTest==-2) {           //invalid trendDate
        res.send({data:"Invalid date: The specified date is in the future", ok:false})
        return;
    }
    
    googleTrends.dailyTrends( { trendDate: trendDate,  geo:geo})
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        var days = data.default["trendingSearchesDays"]
        var resultData = {queries:[]}
        
        for(let d=0 ; d < days.length; ++d) {
            for(let s=0; s < days[d]["trendingSearches"].length; ++s) {
                resultData.queries.push(days[d]["trendingSearches"][s]["title"]["query"])
            }
        }
        res.send({data:resultData, ok:true})
    })
}




app.post('/server',(req,res)=>{
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    
    if(req.body.module=="dailyTrends") dailyTrendsModule(req,res)
})




