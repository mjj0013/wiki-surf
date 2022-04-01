// var axios = require('axios').default;
const googleTrends = require('google-trends-api');
const express = require('express');
const PORT = process.env.PORT || 3000;
// const fetch = require('node-fetch')
var countries= require('./countries.json')      //https://restcountries.com/#filter-response



var regions = {
    "South Africa": "SA",
    "France":"FR",
    "Russia":"RU",
    "Egypt":"EG",
    "Sweden":"SE",
    "Nigeria":"NG",
    "Netherlands":"NL",
    "Serbia":"RS",
    "Denmark":"DK",
    "Finland":"FI",
    "Japan":"JP",
    "Indonesia":"ID",
    "Argentina":"AR",
    "Brazil":"BR",
    "Phillippines":"PH",
    "Taiwan":"TW",
    "Vietnam" :"VN",
    "Thailand":"TH",
    "Chile" :"CL",
    "Malaysia":"MY",
    "Hong Kong":"HK",
    "Singapore":"SG",
    "Bangladesh":"BD",
    "Peru" : "PE",
    "Mexico": "MX",
    "Colombia":"CO",
    "India":"IN",
    "South Korea":"KR",
    "Iran":"IR",
    "Ecuador":"EC",
    "Turkey":"TR",
    "Portugal":"PT",
    "Pakistan":"PK",
    "Australia":"AU",
    "Saudi Arabia":"SA",
    "Costa Rica":"CR",
    "United States":"US",
    "Spain":"ES",
    "Canada":"CA",
    "Italy":"IT",
    "Germany":"DE",
    "Hungary":"HU",
    "Ireland":"IE",
    "New Zealand":"NZ",
    "United Kingdom":"GB",
    "Czechia":"CZ",
    "UAE":"AE",
    "Austria":"AT",
    "Venezuela":"VE",
    "Romania":"RO",
    "Israel":"IL",
    "Greece":"GR",
    "Poland":"PL",
    "Norway":"NO",
    "Belgium" : "BE",
    "Switzerland": "CH"
}


var getDateObj = (time) =>{
    // time     :   {date:Object,  offset: <>}
    //offset    :   {direction:<before, after>, minutes:<int>, hours:<int>, day:<int>, months:<int>, years:<int>, }
    var date = time.date? time.date : Date.now();
    var yearOffset = time.offset.years? time.offset.years*365*24*60*60*1000 : 0;
    var dayOffset = time.offset.days? time.offset.days*24*60*60*1000 : 0;
    var hourOffset = time.offset.hours? time.offset.hours*60*60*1000 : 0;
    var minutesOffset = time.offset.minutes? time.offset.minutes*60*1000 : 0;
    
    if(time.offset.direction=="before") {
        date = new Date(date - (yearOffset + dayOffset + hourOffset + minutesOffset))
    }
    else if(time.offset.direction=="after") {
        date = new Date(date+ (yearOffset + dayOffset + hourOffset + minutesOffset))
    }
    if(Date.now() > date.getTime()) return date;
    else new Date();
    
    
}



const app = express();
app.get('/', (req,res)=>{
    let countryIdx = 7
    var localGeoCode = "CH"
    
    var geo = countries["0"][countryIdx]["cca2"]
    console.log(countries["0"][countryIdx]["name"]["common"])

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

