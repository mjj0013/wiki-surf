// var axios = require('axios').default;
const googleTrends = require('google-trends-api');
const express = require('express');
const PORT = process.env.PORT || 3000;
// const fetch = require('node-fetch')
var countries= require('./countries.json')


var data =null


//https://www.faa.gov/air_traffic/publications/atpubs/cnt_html/appendix_a.html
var stateAbbreviations = {
    "Alabama":"AL",
    "Alaska":"AK",
    "Arizona":"AZ",
    "Arkansas":"AR",
    "American Samoa":"AS",
    "California":"CA",
    "Colorado":"CO",
    "Connecticut":"CT",
    "Delaware":"DE",
    "DC": "DC",
    "Florida": "FL",
    "Georgia": "GA"
}





const app = express();


app.get('/', (req,res)=>{
    let countryIdx = 8
    var geo = countries["0"][countryIdx]["cca2"]
    console.log(countries["0"][countryIdx]["name"]["common"])
    googleTrends.dailyTrends({
        trendDate: new Date(),
        geo:geo

    })
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        console.log("data", data.default);
        res.send(data.default.trendingSearchesDays[0])
    
    })
    
})

app.listen(PORT, ()=> {
    console.log("Server running");
    

})

