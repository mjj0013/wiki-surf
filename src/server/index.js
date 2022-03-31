// var axios = require('axios').default;
const googleTrends = require('google-trends-api');
const express = require('express');
const PORT = process.env.PORT || 3000;
// const fetch = require('node-fetch')
var countries= require('./countries.json')      //https://restcountries.com/#filter-response
// const NodeGeocoder = require('node-geocoder')
// const geocoder = NodeGeocoder({provider:'openstreetmap', formatter:null})

const app = express();
app.get('/', (req,res)=>{
    let countryIdx = 7
    var localGeoCode = "BR"
    var geo = countries["0"][countryIdx]["cca2"]
    console.log(countries["0"][countryIdx]["name"]["common"])
    // geocoder.reverse({lat:45.288, lon:-60.983})
    // .then(result=> {
    //     console.log(result)
    // })
    googleTrends.dailyTrends({
        trendDate: new Date(),
        geo:localGeoCode

    })
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        console.log("data", data.default);
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
        res.send(dayStrings)
    })
    
})

app.listen(PORT, ()=> {
    console.log("Server running");
    
})

