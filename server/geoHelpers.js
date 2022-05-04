//  https://github.com/pat310/google-trends-api/wiki/Google-Trends-Categories
const abridgedCategories = {"All":"all", "Entertainment":"e", "Business":"b", "Science/Tech":"t", "Sports":"s", "Top Stories":"h"}
// const fs = require('fs');



const allCategories = {
    "All Categories":0,
    
    "Finance":7,
    "Self care": {
        "Obesity":818,
        "Eating Disorders":571,
        "Running & Walking":541             // ***
    },

    "General": {                            // "anyone, anyday"
        "Sleep Disorders":633,
        "Pain Management":819,
        "Injury":817,
        "Cleaning Supplies & Services": 949,
        "Ear Nose & Throat":1211,
        "Allergies":626,
        "Oral & Dental Care":245,
               
        
    },
    "Policy": {                             // about rules, legislation, policies
        "Public Health":947,
        
        "Local": {                          // seeks most immediate 
            "Public Policy":1316,
            "State & Local Government":966,
            "Legal":75,
            "Public safety" : 166,
            "Social Services":508
        },
        "Global": {
            "Embassies & Consulates":962,
            "Intelligence & Counterterrorism":1221
        }
    },

    "News": {
        "Fringe/Skepticism": {
            "Media Critics & Watchdogs":1203,
        },
        "Global": {
            "World News":1209,
        },
        "Local": {
            "Local News":572
        }
    },



    "Occupational": {
        "Jobs":60,
        "Work & Labor Issues":703
    },
    "Travel": 67,
    "Sentimental": {
        "Antiques & Collectibles":64
    },


    "Humor": {                               //think "performer/painter"
        "Live Comedy":895,
        "Political Humor":1180,
        "Spoofs & Satire":1244
    },

    "Healthcare": {                          // think healthcare professional
        "Health Education & Medical Training":254,
        "Health Foundations & Medical Research":252,
        "Medical Literature & Resources":253,
        "Nutrition":456,
        "Nursing":418,
        "Oral & Dental Care":245
    },

    "Athletics": {                          //think "competitor"
        "Alternative & Natural Medicine":499,
        "Nutrition":456,
        "Sports News": 1077,
        "Sports":20

    },
    

    "Entertainment": {           
        "Movies":34,
        "Music & Audio":35,
        "TV & Video":36,
        "Performing Arts":23,
        "Online Video":211,
    },
    "Arts": {       
        "Online Image Galleries": 1222,
        "Visual Art & Design":24

    },
    


    "Introversion": {
        "Leisure": {
            "Computer & Video Games":41,
            "Books & Literature":22,
            
        },
        "Productivity": {
            "Science":174
        }
        
    },
    "Extroversion": {
        "Anti": {
            "Goth Subculture":503
        },

        
        "Leisure": {
            "Outdoors":688,
            "Clubs & Nightlife": 188,
            "People Search" : 1234,
            "Celebrities & Entertainment News":184,
            "Gossip & Tabloid News":507,
        },
        "Productivity": {
            "Photographic & Digital Arts":439,
            "Crafts":284,
            "Apparel":68,

           
            
        }
    },

    "Edgy & Bizarre": 538,          //horror
    "Occult & Paranormal":449,      //horror

    "Home & Garden": 11,            //home improvement

    "Belief": {
        "Fringe": {
            "Astrology & Divination":448,
            "Occult & Paranormal":449,
            "Pagan & Esoteric Traditions":1258,
            "Scientology":1251,
            "Spirituality":101
        },
        "Mainstream": {
            "Buddhism":862,
            "Christianity":864,
            "Judaism":869,
            "Hinduism":866,
            "Islam":868,
        },
        "Anti": {
            "Skeptics & Non-Believers":975,
        },
        "Pro": {
            "Theology & Religious Study":1340
        }
    },
    
    "Construction & Maintenance":48,


}




const angloSphere = [
    "United States",
    "United Kingdom",
    "Canada",
    "New Zealand",
    "Ireland",
    "Australia"
]
var regionsNotWorking = [
    "UAE",
    "Phillippines",
    "Ecuador",
]




// https://en.wikipedia.org/wiki/ISO_3166-2
var regionCodes = {
   


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
    "Austria":"AT",
    "Venezuela":"VE",
    "Romania":"RO",
    "Israel":"IL",
    "Greece":"GR",
    "Poland":"PL",
    "Norway":"NO",
    "Belgium" : "BE",
    "Switzerland": "CH",
    "China":"CN",
    "Belize":"BZ",
    "Ukraine":"UA",
    "Yemen":"YE",
    "Uganda":"UG",
    "Turkmenistan":"TM",
    "Panama":"PA",
    "Mongolia":"MN",
    "Madagascar":"MG",
    "Mali":"ML",
    "Myanmar":"MM",
    "Somalia":"SO",
    "Belarus":"BY",
    "Afghanistan":"AF",
    "Iraq":"IQ",
    "Cambodia":"KH",
    "Kazakhstan":"KZ",
    "Latvia":"LV",
    "Kyrgyzstan":"KG",
    "Iceland":"IS",
    "Niger":"NE",
    "Zimbabwe":"ZW",
    "Sudan":"SD",
    "Libya":"LY",
    "Kenya":"KE",
    "Jordan":"JO",
    "Kuwait":"KW",
    "Greenland":"GL",
    "Papua New Guinea":"PG",
    "Honduras":"HN",
    "Algeria":"DZ",
    "Angola":"AO",
    "Barbados":"BB",



}

const regions = Object.keys(regionCodes)
const regionCodesReformatted = regions.map(i=>{return {name:i, code:regionCodes[i]}})

regionCodesReformatted.sort(function(a,b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
})

var regionNames = Object.keys(regionCodes)
var regionData = [
    ["Country"],
];
for(let r=0; r < regionNames.length; ++r) {
    regionData.push([regionNames[r]])
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
    else return new Date();
}


module.exports = {
    getDateObj:getDateObj,
    regionCodes:regionCodes,
    allCategories: allCategories,
    abridgedCategories:abridgedCategories,
    regionData:regionData,
    regionCodesReformatted:regionCodesReformatted
}