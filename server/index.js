const express = require('express');
const schedule = require('node-schedule')
const googleTrends = require('google-trends-api');

const https = require('https');
const util = require('util')
console.log(Object.keys(googleTrends));
const fs = require('fs');
const path = require("path")
const bodyParser = require("body-parser");      // a middleware
// const {fetch} = require('node-fetch');






const {rulePacifUS, ruleCentUS, ruleEastUS, ruleMountUS} = require('./fetchDailyScheduler.js');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, "public");
const {regionCodes, getDateObj, trendCategories} = require('./geoHelpers.js');


const app = express();
app.use(express.static(DIST_DIR));


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.listen(PORT, ()=> { console.log("Server running on port "+PORT); })

const permittedRegionsISOA2 = Object.entries(regionCodes).map(x=>{return x[1]})
const {metroData} = require('../src/usMetroMap.js')

const delay = ms => new Promise(r => setTimeout(r, ms))


// if 429 error: delete all cookies


                                
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
                search.formattedTraffic = search.formattedTraffic.replace("M+","000000" )
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

const refFilePath = "./server/createdDB/tableUrlRefs.json"

var dateWithinRange = (dateObj) => {        //tests if specified date is more than 15 days in the past OR if date is in future.
    var dayDiff = Date.now() - dateObj.getTime();
    if(Math.round(dayDiff)==0) return 0;
    else if(dayDiff < 0) return -2;         // in the future
    else if(Math.round(dayDiff/(24*60*60*1000)) >15) return -1;     //more than 15 days in the past
    else return 1
}

//US-AL-691
var relatedQueriesModule = (req, res) => {
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    var startTime = query.startTime? new Date(query.startTime) : new Date('2004-01-01');
    var endTime = query.endTime? new Date(query.endTime) : new Date();
    var geo = query.geo? query.geo : "US-AL";
    var keyword = query.keyword;
    googleTrends.relatedQueries({keyword: keyword, startTime: startTime, endTime: endTime, geo: geo}, function(err,results) {
        if(err) { console.log("err", err) }
        else {
            console.log('results',results)
            var data = results.toString();
            data = JSON.parse(data);
            res.send({data:data.default, ok:true, moduleName:"relatedQueries"})
        }
    })
    .catch(err=> {
        console.log("err",err)
    })
}
var autoCompleteModule = async(req,res) => {
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    
    var keyword = query.keyword;


    googleTrends.autoComplete({keyword:keyword}, (err, results)=> {
        if(err) {  console.log("err", err) }
        else {
            var data = results.toString();
            data = JSON.parse(data);
            res.send({data:data.default, ok:true, moduleName:"interestByRegion"})
        }
    })
}

var interestByRegionModule = (req, res) => {
    //************************ */
    //THIS WORKS for all 210 DMAs.
    //Idea: for searching for long strings of text, first do a 'relatedQueries', 
    //to find related queries and then plug them back into this


    // to see trends over time: you will have to call this function for each interval
 //************************ */



    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    console.log('query',query)
    var startTime = query.startTime? new Date(query.startTime) : new Date('2004-01-01');
    var endTime = query.endTime? new Date(query.endTime) : new Date();
    var keyword = query.keyword;
        //all categories might be supported, category:418
        // DMA
    googleTrends.interestByRegion({geo:'US', resolution: 'DMA', keyword:keyword, startTime: startTime, endTime:endTime , category:7}, (err, results)=> {
        if(err) {  console.log("err", err) }
        else {
            var data = results.toString();
            data = JSON.parse(data);
            res.send({data:data.default, ok:true, moduleName:"interestByRegion"})
        }
    })
}

var sendMetroRequest = async (searchParams)=> {
    return new Promise((resolve,reject)=> {
        if(searchParams.mode='interestOverTime') {
            googleTrends.interestOverTime(searchParams, (err,results)=> {
                if(err)  { console.log("error",err); reject();}
                if(results) {
                    var data = results.toString();
                    console.log(`for `,data)
                    data = JSON.parse(data);
                    resolve(data.default);
                    // allMetroData.push() 
                }
            })
            .catch(err=> {reject();})
        }
        
    })
}



var interestOverTimeModule = async (req,res) =>{
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    var geo = query.geo? query.geo : regionCodes["United States"];
    var startTime = query.startTime? new Date(query.startTime) : new Date('2004-01-01');
    var endTime = query.endTime? new Date(query.endTime) : new Date();
    var keyword = query.keyword;
    
    var searchParams = {mode:'interestOverTime',  startTime: startTime, endTime:endTime }
   
    // const result = sendMetroRequests(searchParams)
    // var metroKeys = Object.keys(metroData);
    // var i=0;
    
    // var interval = setInterval(()=>{
    //     var metro = metroKeys[i]
    //     let metroObj = metroData[metro];
    //     let metroGeo = '';
    //     if(metro=="H" || metro=="P") { metroGeo = `US-${metroObj.state}` }
    //     else { metroGeo = `US-${metroObj.state}-${metro.slice(1)}` }
       
    //     const result = sendMetroRequest({...searchParams, geo:metroGeo});
    //     allMetroData.push(result);
    //     ++i;
    //     if(i==202) {
    //         clearInterval(interval);
    //         res.send({data:allMetroData, ok:true, moduleName:"interestOverTime"})
    //     }
    // }, 5000/10);
    var allMetroGeoCodes = []
    var allKeyWords = []
    var metroKeys = Object.keys(metroData);
    for(let i =0; i < 7; ++i ) {
        var metro = metroKeys[i];
        let metroObj = metroData[metro];
        let metroGeo = `US-${metroObj.state}-${metro.slice(1)}`       
        if(metro=="H" || metro=="P") { metroGeo = `US-${metroObj.state}` }
        else { metroGeo = `US-${metroObj.state}-${metro.slice(1)}` }

        allMetroGeoCodes.push(metroGeo)
       
        allKeyWords = allKeyWords.concat(keyword)
    }

    searchParams = {...searchParams, geo:allMetroGeoCodes, keyword:allKeyWords}
    console.log('searchParams', searchParams)
    googleTrends.interestOverTime(searchParams, (err,results)=> {
        if(err)  { console.log("error",err);}
        if(results) {
            var data = results.toString();
            console.log(`for `,data)
            data = JSON.parse(data);
            res.send({data:data, ok:true, moduleName:"interestOverTime"})
            // allMetroData.push() 
        }
    })
    .catch((err)=> console.log("err",err))
    

    // sendRequestsToMetros(searchParams)
    // .then(result=> {
        //  res.send({data:allMetroData, ok:true, moduleName:"interestOverTime"})
    // })
    // .catch(err=>console.log("err",err))
    
   

    
}

var realTimeTrendsModule = (req,res) => {
    // categories are abridged: {"All":"all", "Entertainment":"e", "Business":"b", "Science/Tech":"t", "Sports":"s", "Top Stories":"h"}
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");

    var query = req.body;
    var geo = query.geo? query.geo : regionCodes["United States"];
    var category = query.category? query.category : 'all'
    var optionsObj = { geo:geo, category:category}




    console.log('optionsObj',optionsObj)
    googleTrends.realTimeTrends(optionsObj)
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        
        var stories = data["storySummaries"]["trendingStories"]
        var resultData = {searches:[]}
        
        for(let d=0 ; d < stories.length; ++d) {
            resultData.searches.push(stories[d])
        }
        console.log("resultData",resultData)
        res.send({data:resultData, ok:true, moduleName:"realTimeTrends"})
    })
}

var dailyTrendsModule = (req,res) =>{
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    var geo = query.geo? query.geo : regionCodes["United States"];
    var trendDate = query.trendDate? new Date(query.trendDate) : new Date();
    var category = query.category? query.category : 7
    
    var optionsObj = { trendDate: trendDate,  geo:geo, category:category}
    
    if(query.category) {
        optionsObj["category"] = query.category;
    }
    var dateTest = dateWithinRange(trendDate);
    if(dateTest==-1) {           //invalid trendDate
        res.send({data:"Invalid date: The specified date was more than 15 days in the past", ok:false})
        return;
    }
    if(dateTest==-2) {           //invalid trendDate
        res.send({data:"Invalid date: The specified date is in the future", ok:false})
        return;
    }
    console.log('optionsObj',optionsObj)
    googleTrends.dailyTrends( optionsObj)
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        var days = data.default["trendingSearchesDays"]
        var resultData = {searches:[], ok:true}
        
        for(let d=0 ; d < days.length; ++d) {
            for(let s=0; s < days[d]["trendingSearches"].length; ++s) {
                days[d]["trendingSearches"][s].formattedTraffic = days[d]["trendingSearches"][s].formattedTraffic.replace("K+","000" )
                days[d]["trendingSearches"][s].formattedTraffic = days[d]["trendingSearches"][s].formattedTraffic.replace("M+","000000" )
                resultData.searches.push(days[d]["trendingSearches"][s])
            }
        }
        console.log("resultData",resultData)
        res.send({data:resultData, ok:true, moduleName:"dailyTrends"})
    })
}
app.post('/server/savetables',(req,res)=>{
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var pageTableData = req.body.data;
    var isVital= req.body.isVital;
   
    for(let table=0; table < pageTableData.length; ++table) {
        var fileName = pageTableData[table].sectionName
        var srcInfo = pageTableData[table]["srcInfo"].value;
    
        console.log('srcInfo',srcInfo)
        var jsonData = JSON.stringify(pageTableData[table])
        var path = `./server/createdDB/${fileName}.json`
        if(isVital) path = `./server/createdDB/vital/${fileName}.json`
        if(fs.existsSync(path)) continue;

        fs.writeFile(path,jsonData,  {encoding:'utf8', flag:"w"},(error, data)=>{if(error) console.log(error)})


        if(!fs.existsSync(refFilePath))  {
            fs.writeFile(refFilePath,"{}",  {encoding:'utf8', flag:"w"},(error, data)=>{if(error) console.log(error)})
        }
        fs.readFile(refFilePath, (error, data)=> {
            if(Object.entries(JSON.parse(data)).length==0) {
                var OBJ = {};
                var tableFiles = pageTableData.map((x)=>{
                    if(isVital) return "/vital/"+x.sectionName
                    else return x.sectionName
                })
                OBJ[srcInfo] = tableFiles;
                var json = JSON.stringify(OBJ);
                fs.writeFile(refFilePath,json,()=>{});
            }
            else {
                
                if(OBJ[srcInfo.value]) {
                    OBJ[srcInfo.value].concat(pageTableData.map((x)=>{
                        if(isVital) return "/vital/"+x.sectionName
                        else return x.sectionName
                }))}
                var json = JSON.stringify(OBJ);
                
                fs.writeFile(refFilePath,json,()=>{});
            } 
        })
    }
})


var resolveSrcRef = () => {                 // accesses file that contains file names in createdDB and the table names that they contain. So if a request asks for a table name, it can resolve the path for 

}
var regionDb = []

app.post('/server/fetchData', (req,res)=>{
    
    var isVital= req.body.isVital;
    var fetchBody = req.body;
    var path = `./server/createdDB/${fetchBody.fileName}.json`
    if(isVital) path = `./server/createdDB/vital/${fetchBody.fileName}.json`

    if(fs.existsSync(path)) {
        console.log("fetched resource exists")
        // fs.readFile(path, {encoding:'utf8'}, (error, data)=>{
        fs.readFile(path, (error, data)=>{
            if(error) console.log(error)
            res.setHeader("Accept", "application/json");
            res.setHeader("Content-Type", "application/json");
            res.send({data:data, message:"", ok:true})
        })
        
    }
    else {          // file does not exist
        res.setHeader("Accept", "application/json");
        res.setHeader("Content-Type", "application/json");
        if(fs.existsSync(refFilePath)) {
            fs.readFile(refFilePath, (error, data)=> {
                var OBJ = JSON.parse(data);
                var entries = Object.entries(OBJ);
                var newSrc = null;
                for(let e=0; e < entries.length; ++e) {
                    if(fetchBody.fileName == entries[e][0]) {
                        if(entries[e][1].length==1) newSrc = entries[e][1][0];      // the request asks for a URL that points to a single table file, so its safe to return the single table file name
                        else if(entries[e][1].length > 1) { /* ??? */ }          // the request asked for a URL that points to multiple table files
                    }
                    else if(fetchBody.fileName == entries[e][1][0]) newSrc = entries[e][1][0];
                    
                }
                if(newSrc) {
                    // fs.writeFile(path,jsonData,  {encoding:'utf8', flag:"w"},(error, data)=>{if(error) console.log(error)})
                    fs.readFile(`./server/createdDB/${newSrc}.json`, (error, data)=> {  
                        res.send({data:data, message:"", ok:true})
                    })
                    
                }
            })
        }
        else res.send({data:null, message:"does not exist", ok:true})
    }  
})

app.get('/server/getRegionDb',(req,res)=>{
    fs.readFile(`./public/world.json`, (error, data)=> {  
        if(error) console.log(error)
        else {
            var D = data.toString();
            var objD = JSON.parse(D);
            regionDb = []
            var regionGeos = objD.objects.admin.geometries;
            for(let r=0; r < regionGeos.length; ++r) {
                // ADMIN,  ADM0_A3,  ISO_A2
                // console.log(regionGeos[r].properties["ISO_A2"], regionGeos[r].properties["ADM0_A3"])
                var regionObj = {
                    "ADMIN":regionGeos[r].properties["ADMIN"], 
                    "ADM0_A3":regionGeos[r].properties["ADM0_A3"], 
                    "ISO_A2":regionGeos[r].properties["ISO_A2"],
                    "permittedForTrendSearch":permittedRegionsISOA2.includes(regionGeos[r].properties["ISO_A2"])
                }
                regionDb.push(regionObj)
            }
            regionDb.sort(function(a,b){
                let aStr = a.ADMIN.toUpperCase()
                let bStr = b.ADMIN.toUpperCase()
                if(aStr < bStr) return -1;
                if(aStr > bStr) return 1;
                return 0;
            })
            
  
            res.send({data:regionDb, message:"", ok:true})
        }
    })
})


app.post('/server',(req,res)=>{
    switch(req.body.module) {
        case "realTimeTrends":
            realTimeTrendsModule(req,res);
            break;
        case "dailyTrends":
            console.log("skdfjidf");
            dailyTrendsModule(req,res)
            break;
        case "interestByRegion":
            interestByRegionModule(req,res);
            break;
        case "interestOverTime":
            interestOverTimeModule(req,res);
            break;
        case "relatedQueries":
            relatedQueriesModule(req,res);
            break;
    }
})