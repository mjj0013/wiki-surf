const googleTrends = require('google-trends-api');
import React from 'react';

export const TrendsPage = () => {

    
    googleTrends.dailyTrends( {
        trendDate:new Date('2021-09-5'),
        geo:'US'
    }, function(err,results){
        if(err) console.log(err)
        else console.log(results)
    })
    // var req = new Request(`https://trends.google.com/trends/api/realtimetrends?hl=en-US&tz=-330&geo=US&cat=all&fi=0&fs=0&ri=300&rs=20&sort=0`,
        
    //     {method:'GET',mode:'cors'}
    // )        
    // fetch(req)
    // .then(response => {return response})
    // .then(data => {
    //     console.log(data)
    // })
    return (
        <div>


        </div>


    )
}