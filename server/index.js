const express = require('express');
const schedule = require('node-schedule')
const googleTrends = require('google-trends-api');
const fs = require('fs');
const path = require("path")
const bodyParser = require("body-parser");      // a middleware
// const {fetch} = require('node-fetch');


const {rulePacifUS, ruleCentUS, ruleEastUS, ruleMountUS} = require('./fetchDailyScheduler.js');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, "public");
const {regionCodes, getDateObj} = require('./geoHelpers.js');


const app = express();
app.use(express.static(DIST_DIR));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.listen(PORT, ()=> { console.log("Server running on port "+PORT); })



// Twitter API, try: https://www.programmableweb.com/api/twitter-search-tweets-rest-api-v11
var usDailyTrendsJob = () => {
    var trendDate = getDateObj({offset:{direction:'before', days:15}})          //always gets trends from 15 days before current day, b/c that day will not be recoverable

    googleTrends.dailyTrends( { trendDate: trendDate,  geo:"US"})
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        var days = data.default["trendingSearchesDays"]
        
        var resultData = {time:trendDate, searches:[]}
        
        for(let d=0 ; d < days.length; ++d) {
            for(let s=0; s < days[d]["trendingSearches"].length; ++s) {
                var search = days[d]["trendingSearches"][s];
                search.formattedTraffic = search.formattedTraffic.replace("K+","000" )
                resultData.searches.push({query:search.title.query, formattedTraffic:search.formattedTraffic});
            }
        }
        resultData.searches.sort(function(a,b){return parseInt(b.formattedTraffic) - parseInt(a.formattedTraffic)})
        fs.readFile('./server/trendRecords/records.json', 'utf8', (error, data)=>{
            if(error) console.log(error)
            else {
               
                var OBJ = JSON.parse(data);
               
                OBJ["United States"]["trendData"].push(resultData)
                var json = JSON.stringify(OBJ);
                
                fs.writeFile('./server/trendRecords/records.json',json,()=>{});
            }
            
        })
    })
}

const jobEastUS = schedule.scheduleJob(ruleEastUS, ()=>{usDailyTrendsJob()})
const jobCentUS = schedule.scheduleJob(ruleCentUS, ()=>{usDailyTrendsJob()})
const jobMountUS = schedule.scheduleJob(ruleMountUS, ()=>{usDailyTrendsJob()})
const jobPacifUS = schedule.scheduleJob(rulePacifUS, ()=>{usDailyTrendsJob()})


var dateWithinRange = (dateObj) => {        //tests if specified date is more than 15 days in the past OR if date is in future.
    var dayDiff = Date.now() - dateObj.getTime();
    if(Math.round(dayDiff)==0) return 0;
    else if(dayDiff < 0) return -2;         // in the future
    else if(Math.round(dayDiff/(24*60*60*1000)) >15) return -1;     //more than 15 days in the past
    else return 1
}

var interestOverTimeModule = (req,res) =>{
    var query = req.body;
    var geo = query.region? query.region : regionCodes["United States"];
    var startTime = query.startTime? new Date(query.startTime) : new Date();
    var endTime = query.endTime? new Date(query.endTime) : new Date();

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
        
        var resultData = {searches:[]}
        
        for(let d=0 ; d < days.length; ++d) {
            for(let s=0; s < days[d]["trendingSearches"].length; ++s) {
                days[d]["trendingSearches"][s].formattedTraffic = days[d]["trendingSearches"][s].formattedTraffic.replace("K+","000" )
                resultData.searches.push(days[d]["trendingSearches"][s])
                

                
                
                
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




