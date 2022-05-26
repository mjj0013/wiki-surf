var searchTerms = []
    function displayMapValues(moduleName, data) {
        if(moduleName=="interestByRegion") {
            var header= ["Region", ...searchTerms];
            // for(let t=0; t < searchTerms.length; ++t) {
            //     header.push(searchTerms[t])
            // }
            var includedCountries = Object.keys(regionCodes)
            var newregionData = [header]
            for(let reg=0; reg < data.georegionData.length; ++reg) {
                var regData = data.georegionData[reg];
                if(!includedCountries.includes(regData.geoName)) continue;
                
                var termData = [regData.geoName]
                for(let term=0; term < regData.value.length; ++term) {
                    if(regData.hasData[term]) termData.push(regData.value[term])
                    else termData.push(0)
                }
                newregionData.push(termData);
                // if(regData.hasData[0]) newregionData.push([data.georegionData[reg].geoName,data.georegionData[reg].value[0]])
            }
            setRegionData(newregionData)
        }
    }
    
    async function displayResults(moduleName, results) {
        var resultItemList = document.getElementById("resultItemList")
        while(resultItemList.firstChild) resultItemList.removeChild(resultItemList.firstChild);
        for(let i =0; i < results.length; ++i) {
            var li = document.createElement("li");
            var img = document.createElement("img");

            li.className = "list-group-item"   
            if(moduleName=="dailyTrends") {
                li.innerHTML =results[i].title.query + " | +" + results[i].formattedTraffic + " views";
                img.src = results[i].image.imageUrl
            }
            else if(moduleName=="realTimeTrends") {
                li.innerHTML = results[i].title;
                img.src = results[i].image.imgUrl
            }
            else if(moduleName=="interestByRegion") {}
            // getWikiTitleData(results[i].title.query)
    
            resultItemList.appendChild(li)
            li.appendChild(img) 
        }
    }