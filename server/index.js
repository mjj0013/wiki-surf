const express = require('express');
const schedule = require('node-schedule')
const googleTrends = require('google-trends-api');

const https = require('https');

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


/*
753 = Phoenix, AZ
698 = Montgomery (Selma), AL
522 = Columbus, GA
789 = Tucson (Sierra Vista), AZ
711  = Yuma AZ, El Centro CA
802 = Eureka CA
868 = Chico (Redding) CA
811 = Reno NV
803 = Los Angeles
ALABAMA  (691, 630, 606, 698, 686, 711, 522)
698 = ['Q487725', 'Q108871', 'Q488831', 'Q492888', 'Q111259', 'Q502784', 'Q503461', 'Q156168', 'Q503081', 'Q501074', 'Q488847', 'Q253538', 'Q494630', 'Q512787', 'Q502777']
691 = ['Q261672', 'Q501108', 'Q493715', 'Q366959', 'Q494626', 'Q502925', 'Q137828', 'Q502737', 'Q488892', 'Q487731', 'Q490322']
630 = ['Q502739', 'Q503088', 'Q188204', 'Q111250', 'Q493951', 'Q108832', 'Q108856', 'Q503451', 'Q112271', 'Q506291', 'Q493957', 'Q949766', 'Q493709', 'Q501147', 'Q503877', 'Q501084', 'Q461204', 'Q111266', 'Q487738', 'Q302918', 'Q156570']
686 = ['Q156163', 'Q495738', 'Q485445', 'Q485402', 'Q501157', 'Q111273', 'Q494500', 'Q156643', 'Q487716', 'Q487744', 'Q494476', 'Q501060']
711 = ['Q501051', 'Q111254', 'Q115349', 'Q485388', 'Q490864', 'Q426398', 'Q204761']
606 = ['Q488879', 'Q496292', 'Q494620', 'Q485660', 'Q488840', 'Q501000', 'Q486757']
522 = ['Q109437', 'Q503329', 'Q501055', 'Q111280', 'Q486133', 'Q498356', 'Q486344', 'Q492048', 'Q387216', 'Q486394', 'Q491514', 'Q503076', 'Q491543', 'Q498307', 'Q498684', 'Q156580']

ARIZONA (753,789,771)

753 = ['Q58696', 'Q58684', 'Q58694', 'Q58711', 'Q58759', 'Q58691', 'Q58712', 'Q58686', 'Q58692', 'Q58683', 'Q58771']
789 = ['Q58774', 'Q58689', 'Q58688']
771 = ['Q58698', 'Q169952']

ARKANSAS (693,670,734,640,628,612,619)
693

CALIFORNIA
800, 868,802, 866, 803, *813, 828, 804, *811, 862, 825, 807, 855
802 = ['Q109651', 'Q156186']
868 = ['Q156188', 'Q156350', 'Q109705', 'Q156181', 'Q271601', "Q109695"]

803 = ['Q484349', 'Q109670', 'Q108053', 'Q104994', 'Q5925', 'Q108111','Q108127']
825 = ['Q108143']
804 = ['Q108111']
800 = ['Q108047']
855 = ['Q49014', 'Q108106']
828 = ['Q108072', 'Q109656', 'Q108122']
866 = ['Q156191', 'Q109690', 'Q271915', 'Q156358', 'Q109686', 'Q109661']
807 = ['Q110739', 'Q107146', 'Q108058', 'Q108101', 'Q13188841', 'Q108117', 'Q108067', 'Q108087', 'Q156361', 'Q108137']
862 = ['Q156342', 'Q196014', 'Q156377', 'Q271609', 'Q156370', 'Q109681', 'Q156353', 'Q108093', 'Q156346', 'Q271613', 'Q156177', 'Q108503', 'Q108499', 'Q108131', 'Q108083', 'Q109709']


COLORADO
752, 751, 773
773 = ['Q312740', 'Q153251']
752 = ['Q127973', 'Q312155', 'Q115583', 'Q312746', 'Q111774', 'Q312731', 'Q128075', 'Q312254', 'Q127972', 'Q156429', 'Q312201', 'Q312509']
751 = ['Q312449', 'Q370710', 'Q311894', 'Q128080', 'Q312455', 'Q311897', 'Q156452', 'Q109442', 'Q490512', 'Q485641', 'Q484282', 'Q484282', 'Q368766', 'Q484771', 'Q489729', 'Q495969', 'Q485221', 'Q489783', 'Q489659', 'Q485058', 'Q339175', 'Q489702', 'Q312470', 'Q311908', 'Q128079', 'Q312744', 'Q312451', 'Q311921', 'Q428902', 'Q484325', 'Q312750', 'Q426699', 'Q312473', 'Q312737', 'Q311901', 'Q312563', 'Q127979', 'Q312149', 'Q113423', 'Q312742', 'Q32349', 'Q312475', 'Q312453', 'Q112977', 'Q115551', 'Q115568', 'Q492044', 'Q63729', 'Q312734', 'Q127975', 'Q115589', 'Q127970', 'Q113029', 'Q115577', 'Q127978', 'Q15906757', 'Q112807', 'Q94783', 'Q112807', 'Q492819', 'Q311904', 'Q115556', 'Q115563', 'Q312586', 'Q312487', 'Q312748']

CONNECTICUT
533

DELAWARE
504, 576

FLORIDA
571, 592, 561, 528, 534, 656, 530, 539, 548, *686
528 = ['Q263742', 'Q468557', 'Q494624']
571 = ['Q488531', 'Q494616', 'Q488488', 'Q488499', 'Q488796', 'Q488468']
548  = ['Q488528', 'Q501123', 'Q494564', 'Q648752', 'Q484294']
539 = ['Q488821', 'Q500992', 'Q488572', 'Q501043', 'Q488885', 'Q488792', 'Q501163', 'Q262708', 'Q488874', 'Q494556']
534 = ['Q501014', 'Q494541', 'Q386885', 'Q488517', 'Q501067', 'Q488543', 'Q501029', 'Q503889', 'Q280596']
592 = ['Q488826', 'Q111720', 'Q488805', 'Q501022']
561 = ['Q173867', 'Q156568', 'Q486659', 'Q488818', 'Q503059', 'Q494471', 'Q501078', 'Q156577', 'Q493605', 'Q488853', 'Q156650', 'Q110504', 'Q487016', 'Q498353', 'Q486800']
656 = ['Q503455', 'Q263418', 'Q488537', 'Q488865', 'Q488461', 'Q174913', 'Q255943', 'Q488813']
530 = ['Q486167', 'Q492070', 'Q493134', 'Q488175', 'Q498327', 'Q493029', 'Q257311', 'Q501036', 'Q488810', 'Q493107', 'Q493037', 'Q492061', 'Q493037', 'Q498372', 'Q501848', 'Q505417', 'Q488576', 'Q503064', 'Q488859', 'Q494463']

GEORGIA
524, 525, 520, 575, *522, *561, *606, 503, 507, *530
524 = ['Q327080', 'Q498395', 'Q486389', 'Q200696', 'Q493054', 'Q503546', 'Q501096', 'Q502516', 'Q503538', 'Q389365', 'Q491547', 'Q493079', 'Q492040', 'Q498675', 'Q492032', 'Q486664', 'Q488181', 'Q493092', 'Q484247', 'Q486633', 'Q490065', 'Q493092', 'Q492012', 'Q501140', 'Q544539', 'Q486348', 'Q493088', 'Q502743', 'Q486633', 'Q486325', 'Q111928', 'Q486398', 'Q501115', 'Q488201', 'Q491525', 'Q486137', 'Q486838', 'Q498312', 'Q498621', 'Q501101', 'Q156387', 'Q112061', 'Q492026', 'Q486765', 'Q493083', 'Q224910', 'Q498341', 'Q488210', 'Q492053', 'Q486150', 'Q503486', 'Q493049', 'Q491533', 'Q498377', 'Q501151', 'Q498295']
507 = ['Q495682', 'Q497880', 'Q112957', 'Q503511', 'Q488166', 'Q156637', 'Q384890', 'Q488224', 'Q384890', 'Q486848', 'Q487692', 'Q493044', 'Q505310', 'Q493033', 'Q492652', 'Q491762', 'Q488186', 'Q488219', 'Q493071', 'Q376822', 'Q493125']
520 = ['Q111894', 'Q491759', 'Q134080', 'Q491529', 'Q477951', 'Q486386', 'Q492066', 'Q505999', 'Q491519', 'Q115307', 'Q495096', 'Q498319', 'Q211360', 'Q389551', 'Q497824', 'Q497890', 'Q497917', 'Q404898']
503 = ['Q505299', 'Q492021', 'Q492036', 'Q486791', 'Q691614', 'Q493024', 'Q486401', 'Q491553', 'Q486362', 'Q498301', 'Q115272', 'Q498332', 'Q503071', 'Q491556', 'Q486843', 'Q503551', 'Q488171', 'Q493040', 'Q488206', 'Q493112', 'Q498286', 'Q486317', 'Q163529']
525 = ['Q503492', 'Q491508', 'Q156486', 'Q156632', 'Q376990', 'Q493102', 'Q113005', 'Q156431', 'Q176480', 'Q486154', 'Q488868', 'Q488194', 'Q156503', 'Q111867', 'Q492057', 'Q498346', 'Q498336']

HAWAII
744

IDAHO
757, 758, 881, 760

ILLINOIS
648, 602, 682, 649, 632, 675, 717, 610, 609, 581

INDIANA
515, 649, 509, 527, 582, 529, 588, 581
509 = ['Q24646', 'Q506525', 'Q507399', 'Q507472', 'Q505305', 'Q503478', 'Q506574', 'Q485628', 'Q351808', 'Q402945', 'Q493443', 'Q498613']

IOWA
637, 682 , 679, 652, 631, 611, 624

KANSAS
603, 616, 638, 605, 678

KENTUCKY
736, 564, 515, 649, 557, 541, 529, 659, 632, 531

LOUISIANA
644, 716, 642, 643, 628, 622, 612
628 = ['Q61129', 'Q61026', 'Q1125008', 'Q1139827', 'Q505505', 'Q507028', 'Q507180', 'Q512911', 'Q509745', 'Q504391', 'Q505282', 'Q506086', 'Q1139833', 'Q205715', 'Q505392', 'Q120080', 'Q512832', 'Q507078']
644 = ['Q504450', 'Q507063', 'Q503870', 'Q504435']
643 = ['Q497964', 'Q65433', 'Q504284', 'Q504345']
642 = ['Q504415', 'Q507609', 'Q504355', 'Q337402', 'Q504379', 'Q507099', 'Q512868', 'Q506892']
622 = ['Q503864', 'Q503883', 'Q486231', 'Q498276', 'Q507153', 'Q507629', 'Q504312', 'Q506907', 'usCountyMap', 'Q506921', 'Q485392', 'Q485441', 'Q507139', 'Q387555', 'Q507016']
716 = ['Q507088', 'Q509895', 'Q51733', 'Q506937', 'Q507112', 'Q112456', 'Q486513', 'Q506951', 'Q512993', 'Q504375', 'Q491949', 'Q145006', 'Q504350']
MAINE
537, 500, 552

MARYLAND
512, 576, 511


MASSACH
506, 521, 543

MICHIGAN
583, 505, 513, 563, 551, 553, 588, 547, 540


MINNESOTA
676, 724, 702, 737, 
613, 611
724 = ['Q491243', 'Q491208', 'Q486248', 'Q486207', 'Q48920', 'Q28523', 'Q511510', 'Q28292', 'Q48863', 'Q48931', 'Q511498', 'Q48891', 'Q28488', 'Q511470', 'Q126829', 'Q491229', 'Q180785', 'Q111566', 'Q486281', 'Q490436', 'Q372648', 'Q842938', 'Q491173', 'Q511461', 'Q111831', 'Q28285', 'Q28308', 'Q48910', 'Q511478', 'Q511524', 'Q486265', 'Q135328', 'Q48902', 'Q48937', 'Q28286']
613 = ['Q110491', 'Q111421', 'Q109986', 'Q485509', 'Q494952', 'Q376102', 'Q486309', 'Q485412', 'Q501575', 'Q486243', 'Q494919', 'Q494916', 'Q500793', 'Q487686', 'Q490652', 'Q486187', 'Q490409', 'Q491288', 'Q110684', 'Q485430', 'Q491152', 'Q490414', 'Q113255', 'Q491160', 'Q486261', 'Q486270', 'Q109981', 'Q485370', 'Q491157', 'Q486218', 'Q591156', 'Q485408', 'Q490454', 'Q491214', 'Q113333', 'Q491272', 'Q109851', 'Q490427', 'Q486255', 'Q110495', 'Q491201', 'Q111694', 'Q490423', 'Q491256', 'Q486229', 'Q490390', 'Q491148', 'Q486301', 'Q490443', 'Q490420', 'Q486313', 'Q490432', 'Q113275', 'Q497984', 'Q188275', 'Q109846', 'Q491184']
737 = ['Q110900', 'Q110340', 'Q491292', 'Q284439']
MISSISSIPPI
*716, 746, 673, 647, 710, 718, *640, 711
746 = ['Q485378', 'Q485434', 'Q490255']
710 = ['Q490219', 'Q491221', 'Q490896', 'Q490848', 'Q486064', 'Q130008', 'Q266493', 'Q490843']
711 = ['Q501051', 'Q111254', 'Q115349', 'Q485388', 'Q204761', 'Q426398', 'Q490864']
673 = ['Q505317', 'Q490852', 'Q112834', 'Q497489', 'Q491267', 'Q491276', 'Q490215', 'Q490879', 'Q486522', 'Q130083', 'Q490879', 'Q497615', 'Q111291', 'Q156445', 'Q115344', 'Q490259', 'Q109512', 'Q486435', 'Q490859', 'Q486480']
647 = ['Q112499', 'Q490869', 'Q490251', 'Q497607', 'Q484659', 'Q484643', 'Q115356']
718 = ['Q485426', 'Q483862', 'Q490835', 'Q485250', 'Q484681', 'Q490210', 'Q491190', 'Q491285', 'Q490488', 'Q491236', 'Q115419', 'Q485035', 'Q130006', 'Q485896', 'Q108788', 'Q492488', 'Q486538', 'Q486466', 'Q130009', 'Q497992', 'Q490839', 'Q156411', 'Q485420', 'Q490884']

MISSOURI
604, 603, 616, 631, 717, 619, 638, 609


MONTANA
756, 754, 798, 755, 766, 687, 762

NEBRASKA
759, 751, 722, 740, 652, 624,  725, 


NEVADA
839, 811, 770
811 = ['Q484340', 'Q156340', 'Q835104', 'Q484431', 'Q40881', 'Q484398', 'Q495376', 'Q484342', 'Q495349', 'Q111220', 'Q203022', 'Q156366', 'Q108077']
839 = ['Q484418', 'Q108403', 'Q484335']
770 = ['Q486372', 'Q494494', 'Q491331', 'Q484527', 'Q490494', 'Q484194', 'Q484563', 'Q26564', 'usCountyMap', 'Q111304', 'Q484559', 'Q483973', 'Q27041', 'Q26622', 'Q26628', 'Q27240', 'Q26723', 'Q109284', 'Q109641', 'Q484401', 'Q484381', 'Q495398', 'Q484548', 'Q109790', 'Q26907', 'Q26754', 'Q26880', 'Q26631', 'Q484556', 'Q26766', 'Q27229', 'Q26689', 'Q484577', 'Q156467', 'Q26738', 'Q484222', 'Q26760', 'Q27245', 'Q27045', 'Q26740']
NEW HAMPSHIRE
506, 523, 500,

NEW JERSEY
501, 504, 

NEW MEXICO
790, *634, *765
790 = ['Q111979', 'Q484991', 'Q156481', 'Q489652', 'Q489613', 'Q426262', 'Q484482', 'Q493260', 'Q493250', 'Q156265', 'Q493255', 'Q496511', 'Q484296', 'Q487254', 'Q487236', 'Q484465', 'Q484290', 'Q182176', 'Q111245', 'Q489616', 'Q485245', 'Q489756', 'Q496406', 'Q487243', 'Q112934', 'Q487288', 'Q487283', 'Q156297', 'usCountyMap', 'usCountyMap', 'Q312497', 'Q128096']

NEW YORK
532, 502, 514, 523, 565, 501, 538, 555, 526, 549
565 = ['Q71190', 'Q854630', 'Q71100', 'Q495613']
514 = ['Q495640', 'Q114923', 'Q115061', 'Q501340', 'Q47944', 'usCountyMap', 'Q56145', 'Q115014', 'Q115125', 'Q114969', 'Q114843']

NORTH CAROLINA
517, 570, 518, 544, 560, 550

NORTH DAKOTA
724, 687

OHIO (*564, 515, 510, 535, 542, *509, 558, *597, 547, 554, 596)
536 = ['Q336229', 'Q421960', 'Q485502', 'Q497216']
510 = ['Q421970', 'Q421963', 'Q485650', 'Q403544', 'Q403310', 'Q336167', 'Q111310', 'Q251277', 'Q251267', 'Q288606', 'Q336322', 'Q288592', 'Q336337', 'Q485536', 'Q336183', 'Q403184', 'Q421974']
596 = ['Q497208']
554 = ['Q501858', 'Q511069', 'Q489591', 'Q485513', 'Q421956', 'Q114140', 'Q504863', 'Q490937', 'Q847676', 'Q504838']
535 = ['Q485588', 'Q499295', 'Q485528', 'Q489919', 'Q490161', 'Q485526', 'Q489536', 'Q490184', 'Q489553', 'Q403777', 'Q487280', 'Q490181', 'Q485524', 'Q113237', 'Q386271', 'Q490157', 'Q490150', 'Q489586', 'Q489599', 'Q489912', 'Q490168', 'Q485532']
558 = ['Q485577']
547 = ['Q278589', 'Q113220', 'Q336190', 'Q483923', 'Q485539', 'Q195658', 'Q485596', 'Q112107', 'Q485571', 'Q485543', 'Q485553', 'Q403319', 'Q402938', 'Q167565']
542 = ['Q825807', 'Q485600', 'Q489935', 'Q485592', 'Q485549', 'Q372364', 'Q490190', 'Q389573', 'Q485558', 'Q489595', 'Q489546']
515 = ['Q507308', 'Q506779', 'Q506547', 'Q507459', 'Q500654', 'Q496771', 'Q491959', 'Q497707', 'Q491945', 'Q491112', 'Q109969', 'Q490144', 'Q111575', 'Q485582', 'Q491936', 'Q498116', 'Q113185', 'Q506727', 'Q509757', 'Q152891', 'Q113875', 'Q489576', 'Q485561']

OKLAHOMA
634, 670, 650, *657, 671, *627
671 = ['Q376446', 'Q374547', 'Q495918', 'Q490799', 'Q495937', 'Q484752', 'Q346959', 'Q491633', 'Q489457', 'Q495925', 'Q489486', 'Q495867', 'Q490690', 'Q848649', 'Q495479', 'Q489327', 'Q495951', 'Q495885', 'Q495930', 'Q484596', 'Q489481', 'Q489471', 'Q495912']
650 = ['Q485001', 'Q485013', 'Q489332', 'Q491646', 'Q489468', 'Q489318', 'Q490796', 'Q486621', 'Q495570', 'Q495873', 'Q495899', 'Q495880', 'Q495891', 'Q489477', 'Q484616', 'Q495862', 'Q484603', 'Q485038', 'Q495906', 'Q484729', 'Q267164', 'Q486614', 'Q484600', 'Q491590', 'Q485006', 'Q495958', 'Q490716', 'Q491623', 'Q490722', 'Q489447', 'Q495839', 'Q486626', 'Q111968']

OREGEON (821, *757, 801, 813, 820, *810)
801 = ['Q484426', 'Q484395', 'Q495409', 'Q484330']
820 = ['Q109665', 'Q495691', 'Q484378', 'Q484367', 'usCountyMap', 'Q484354', 'Q253186', 'Q506015', 'Q302852', 'Q495393', 'Q495359', 'Q484371', 'Q484015', 'Q156276', 'Q304791', 'Q820502', 'Q495368', 'Q484685', 'Q495356', 'Q303491', 'Q495388', 'Q484404', 'Q484361', 'Q156287', 'Q484385', 'Q484538', 'Q450374', 'Q484346', 'Q484408']
821 = ['Q484420']
813 = ['Q156374', 'Q484388', 'Q495340', 'Q450159', 'Q484391', 'Q484411']

PENNSYLVANIA
*514, *565, 516, 566, 574, 504, 508, 577, *536

574 = ['Q490908', 'Q490077', 'Q494233', 'Q494156', 'Q494254', 'Q494142', 'Q494248', 'Q494152', 'Q494174', 'Q494077']
577 = ['Q488687', 'Q495603', 'Q494167', 'Q495588', 'Q494207', 'Q494164', 'Q495595', 'Q488698', 'Q501306', 'Q495633', 'Q494093', 'Q501248', 'Q495687', 'Q488693', 'Q501292', 'Q501350', 'Q495677']
504 = ['Q490920', 'Q27840', 'Q156156', 'Q128137', 'Q497795', 'Q497845', 'Q502587', 'Q497928', 'Q138141', 'Q495658', 'Q494192', 'Q496886', 'Q494117', 'Q378527', 'Q496900', 'Q27844', 'Q497810', 'Q502463']
566 = ['Q142369', 'Q490914', 'Q351865', 'Q494121', 'Q494134', 'Q501298', 'Q501270', 'Q494161', 'Q488690', 'Q781165']
516 = ['Q494086', 'Q495662', 'Q488679']
508 = ['Q494186', 'Q488672', 'Q501256', 'Q494241', 'Q494104', 'Q497200', 'Q494098', 'Q488649', 'Q495157', 'Q501236', 'Q488683', 'Q495645', 'Q494146', 'Q156291', 'Q494198', 'Q494236']

RHODE ISLAND
(none, just use US-RI)

SOUTH CAROLINA
520, 519, 517, 546, 570, 567, 507


SOUTH DAKOTA
764, 725

TENNESSEE
575, 639, 557, 640, 659 , 531

659 = ['Q502479', 'Q505968', 'Q494970', 'Q501976', 'Q494716', 'Q495448', 'Q494998', 'Q495013', 'Q494774', 'Q501964', 'Q501563', 'Q495045', 'Q494751', 'Q494776', 'Q494818', 'Q494634', 'Q494794', 'Q494810', 'Q495052', 'Q502348', 'Q501948', 'Q502393', 'Q486067', 'Q505453', 'Q175756', 'Q491850', 'Q490306', 'Q502077', 'Q502047', 'Q502945', 'Q491479', 'Q502920', 'Q111709', 'Q506332', 'Q506332', 'Q501954', 'Q502368', 'Q501606', 'Q501939', 'Q502072', 'Q506175', 'Q1177705', 'Q495043', 'Q502345', 'Q495072', 'Q494815', 'Q502397', 'Q489007', 'Q494806', 'Q489430']
639 = ['Q494799', 'Q494755', 'Q502442', 'Q494905', 'Q495031', 'Q302165']
575 = ['Q486179', 'Q498321', 'Q486654', 'Q501968', 'Q502386', 'Q491537', 'Q200696', 'Q493074', 'Q502050', 'Q484664', 'Q494803', 'Q494636', 'Q502356', 'Q502377', 'Q494822', 'Q502351', 'Q188376', 'Q260871']
557 = ['Q505428', 'Q494791', 'Q491941', 'Q500751', 'Q501914', 'Q475301', 'Q488943', 'Q502342', 'Q502373', 'Q495059', 'Q495017', 'Q495006', 'Q502054', 'Q494760', 'Q489056', 'Q502380', 'Q372373', 'Q490318', 'Q494768', 'Q501935', 'Q495003', 'Q501927']
531 = ['Q503501', 'Q505499', 'Q495169', 'Q495181', 'Q507117', 'Q510915', 'Q378896', 'Q501918', 'Q505834', 'Q513982', 'Q502984', 'Q514008', 'Q501918', 'Q501568', 'Q502428', 'Q494990', 'Q502400', 'Q495037', 'Q495067']
640 = ['Q495078', 'Q502364', 'Q495022', 'Q502069', 'Q501982', 'Q111286', 'Q484648', 'Q110655', 'Q485383', 'Q490272', 'Q842902', 'Q490266', 'Q156575', 'Q61470', 'Q61150', 'Q61145', 'Q61036', 'Q61153','Q502437', 'Q502360', 'Q501602', 'Q486526', 'Q339724', 'Q484668', 'Q474999', 'Q61346', 'Q61157']


TEXAS
662, 634, 635, 692, 600, 623, 765, 636, 618, 749, 651, 633, 661, 641, 657, *612, 709, 626, 625, 627
663 = 
636 = ['Q27051', 'Q26519', 'Q26762', 'Q114503']
749 = ['Q109298', 'Q484183']
600 = ['Q27031', 'Q26527', 'Q483893', 'Q113132', 'Q26705', 'Q108397', 'Q114043', 'Q27037', 'Q279452', 'Q26584', 'Q111753', 'Q107982']
641 = ['Q26730', 'Q26595', 'Q26528', 'Q26710', 'Q26697', 'Q110983', 'Q113984', 'Q110407', 'Q27011', 'Q156440', 'Q26619', 'Q26735', 'Q108367', 'Q110421', 'Q108372', 'Q16861', 'Q115428', 'Q109204', 'Q156479', 'Q114043', 'Q111385', 'Q26610', 'Q26614', 'Q27023', 'Q26712']
626 = ['Q26699']
618 = ['Q26598', 'Q26719', 'Q111744', 'Q113375', 'Q26883', 'Q26756', 'Q26616', 'Q27009', 'Q156444', 'Q108386', 'Q26885', 'Q26605', 'Q110262', 'Q483916', 'Q485910', 'Q26895', 'Q27034', 'Q27034', 'Q26587', 'Q26676', 'Q26701']
692 = ['Q26502', 'Q110575', 'Q112565', 'Q109215', 'Q156471', 'Q109270']
709 = ['Q156496', 'Q108842', 'Q156278', 'Q112652', 'Q110624', 'Q108837', 'Q111782', 'Q109275', 'Q110773', 'Q156455', 'Q108379', 'Q26744', 'Q26889']
612 = ['Q113096', 'Q156388', 'Q108612', 'Q495851', 'Q61384', 'Q61034', 'Q61355', 'Q61167', 'Q61358', 'Q504318', 'Q369211', 'Q507047', 'Q507000', 'Q110389', 'Q383739', 'Q156380', 'Q507126', 'Q513078', 'Q498042', 'Q177562', 'Q110904', 'Q112125', 'Q109150', 'Q61381', 'Q61526']
657 = ['Q110764','Q489463', 'Q485042', 'Q490727', 'Q495856', 'Q486651', 'Q497854', 'Q489312', 'Q489306', 'Q491616', 'Q109457', 'Q490745']
627 = ['Q495581', 'Q484590', 'Q489324', 'Q485030', 'Q109317', 'Q110750', 'Q108520', 'Q114339', 'Q115433', 'Q483857', 'Q485024', 'Q108793', 'Q109631', 'Q484574', 'Q156613', 'Q113854']
635 = ['Q111374', 'Q27024', 'Q110336', 'Q108784', 'Q112686', 'Q27025', 'Q110755', 'Q26591', 'Q108436', 'Q110426', 'Q27018', 'Q26914']
661 = ['Q112149', 'Q111821', 'Q26526', 'Q26891', 'Q108957', 'Q110760', 'Q109795', 'Q113396', 'Q156582', 'Q156618', 'Q108846']
662 = ['Q156270', 'Q114529', 'Q114550', 'Q112768', 'Q110570', 'Q113906', 'Q109975', 'Q111759', 'Q112442', 'Q490287', 'Q114026', 'Q483895', 'Q108827', 'Q109170', 'Q109825', 'Q112634']
623 = ['Q108952', 'Q109308', 'Q108424', 'Q110384', 'Q112603', 'Q110565', 'Q108391', 'Q112793', 'Q110130', 'Q113843', 'Q111844', 'Q485912', 'Q110500', 'Q484567', 'Q110779', 'Q110412', 'Q111168', 'Q110486', 'Q113834', 'Q112698', 'Q111729', 'Q111391', 'Q112115', 'Q109289', 'Q113313', 'Q484570', 'Q109457', 'Q111593', 'Q111174', 'Q109265', 'Q111316', 'Q112673', 'Q109636']
625 = ['Q484586', 'Q156463', 'Q108784', 'Q113919', 'Q109785', 'Q108428', 'Q111368', 'Q27238', 'Q26716', 'Q108821', 'Q109616', 'Q27021', 'Q113117', 'Q26601', 'Q26506']
651 = ['Q107973', 'Q112781', 'Q111622', 'Q110528', 'Q483888', 'Q108962', 'Q109279', 'Q111790', 'Q483847', 'Q109779', 'Q112619', 'Q113864', 'Q114323', 'Q111663', 'Q110978', 'Q108866', 'Q110670', 'Q109836', 'Q109836']
634 = ['Q487534', 'Q484496', 'Q484496', 'Q489642', 'Q485020', 'Q485044', 'Q109303', 'Q485017', 'Q114423', 'Q485047', 'Q112584', 'Q112078', 'Q111766', 'Q111647', 'Q109751', 'Q109622', 'Q108803', 'Q112882', 'Q109165', 'Q109830', 'Q484521', 'Q109804', 'Q112086', 'Q107977', 'Q109451', 'Q109312', 'Q114445', 'Q485920', 'Q109646', 'Q484542', 'Q156464', 'Q112714', 'Q112526', 'Q113293', 'Q109155']
765 = ['Q108607', 'Q110257', 'Q108494', 'Q112953']
UTAH
(none, just use US-UT)

VERMONT
523

VIRGINIA
*559, 584, 569, 544, 556, 573, *531, 511

531 = ['Q514008', 'Q502400', 'Q502428', 'Q501568', 'Q495037', 'Q494990', 'Q495067', 'Q501918', 'Q513982', 'Q505499', 'Q495169', 'Q495181', 'Q507117', 'Q510915', 'Q378896', 'Q505834', 'Q502984', 'Q503366', 'Q503501']
573 = ['Q501312', 'Q495165', 'Q488675', 'Q511908', 'Q495185', 'Q951290', 'Q495112', 'Q513950', 'Q502207', 'Q488917', 'Q503000', 'Q502031', 'Q502036', 'Q505841', 'Q513744', 'Q511922', 'Q502240', 'Q505886', 'Q427732', 'Q490325', 'Q494216', 'Q502230', 'Q501796', 'Q514038', 'Q495120', 'Q495120', 'Q586070', 'Q513968', 'Q495132', 'Q495171', 'Q505861', 'Q513805', 'Q503014', 'Q513805', 'Q513805', 'Q844012', 'Q470626', 'Q513805', 'Q501761', 'Q515150']
584 = ['Q488653', 'Q488653', 'Q123766', 'Q502014', 'Q163097', 'Q513891']
556 = ['Q505941', 'Q505292' , 'Q508192', 'Q494180', 'Q340605', 'Q177678', 'Q340591', 'Q337776', 'Q502235', 'Q511964', 'Q501789', 'Q340608', 'Q341639', 'Q513792', 'Q506225', 'Q515166', 'Q341679', 'Q43421', 'Q341708', 'Q506191', 'Q461562', 'Q340606', 'Q182112', 'Q341865', 'Q337067', 'Q337204', 'Q337270', 'Q495204', 'Q505884', 'Q515220', 'Q495116', 'Q505854']


544 = ['Q49289', 'Q49290', 'Q336948', 'Q337348', 'Q337688', 'Q492346', 'Q506187', 'Q349995', 'Q342043', 'Q335017', 'Q751202', 'Q509838', 'Q943772', 'Q201014', 'Q507438', 'Q504294', 'Q511761', 'Q295787', 'Q49259', 'Q49231', 'Q342803', 'Q49222', 'Q350001', 'Q337915', 'Q342428', 'Q338052', 'Q506209', 'Q335121']
569 = ['Q490903', 'Q513919', 'Q511935', 'Q502250', 'Q501779', 'Q285625']

511 = ['Q494211', 'Q511164', 'Q156257', 'Q501345', 'Q488659', 'Q494223', 'Q510407', 'Q501277', 'Q511120', 'Q501319', 'Q107126', 'Q61', 'Q26807', 'Q183263', 'Q511876', 'Q341915', 'Q88', 'Q501785', 'Q341915', 'Q341915', 'Q408744', 'Q490953', 'Q490949', 'Q490946', 'Q493610', 'Q370310', 'Q510947', 'Q513818', 'Q506202', 'Q492342', 'Q495154', 'Q510920', 'Q510934', 'Q502021', 'Q492355', 'Q495142', 'Q495310', 'Q502213', 'Q341755', 'Q2613700', 'Q494413']



WASHINGTON (*820, 819, 881, 810)
819 = ['Q156623', 'Q113892', 'Q110403', 'Q156306', 'Q384737', 'Q484146', 'Q493243', 'Q108861', 'Q484159', 'Q111904', 'Q156459', 'Q493222', 'Q483990', 'Q483950', 'Q493236', 'Q156220', 'Q113773']
810 = ['Q156629', 'Q156216', 'Q485305', 'Q118716', 'Q111540', 'Q495344']
881 = ['Q490344', 'Q494518', 'Q483932', 'Q175799', 'Q494480', 'Q495382', 'Q491073', 'Q494569', 'Q156295', 'Q695782', 'Q156253', 'Q284840', 'Q484153', 'Q156273', 'Q281681', 'Q484150', 'Q485276', 'Q494460', 'Q486376', 'Q485301', 'Q483954', 'Q493228', 'Q483958', 'Q486366']



WEST VIRGINIA
559, 564, 598, *569, 597, *511, *554
564 = ['Q498072', 'Q486095', 'Q400753', 'Q498104', 'Q502715', 'Q500702', 'Q496729', 'Q494598', 'Q495160', 'Q490925', 'Q501800', 'Q501835', 'Q283657', 'Q847673', 'Q494138', 'Q501555', 'Q490958', 'Q489942', 'Q489915', 'Q504856', 'Q738043', 'Q485646', 'Q500670', 'Q491996', 'Q495126', 'Q503521', 'Q495151', 'Q494129', 'Q501809', 'Q501830', 'Q499302', 'Q485615']
598 = ['Q495137', 'Q501819', 'Q118743', 'Q495175', 'Q493599', 'Q495147', 'Q504842', 'Q501839', 'Q494081', 'Q504850', 'Q511095', 'Q504846']
597 = ['Q489571', 'Q501331', 'Q377952']
559 = ['Q501843', 'Q501804', 'Q506197', 'Q501823', 'Q501827', 'Q488769', 'Q494203', 'Q504830', 'Q501815']

WISCONSIN
676, 658, 702, 669, 617, 613, 705

WYOMING
756, 767, 759, 751, 758, 764, 770

*/

//US-AL-691
var relatedQueriesModule = (req, res) => {
    var query = req.body;
    var startTime = query.startTime? new Date(query.startTime) : new Date('2004-01-01');
    var endTime = query.endTime? new Date(query.endTime) : new Date();
    var geo = query.region? query.region : regionCodes["United States"];
    geo = 'US-AL-691';

    
    // geo = 'US-AL-630';
    var keyword = query.keyword;
    googleTrends.relatedQueries({keyword: keyword, startTime: startTime, endTime: endTime, geo: geo})
    .then(results=> {
        var data = results.toString();
        data = JSON.parse(data);
        res.send({data:data.default, ok:true, moduleName:"relatedQueries"})
      
    })
}


var interestByRegionModule = (req, res) => {
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    
    var startTime = query.startTime? new Date(query.startTime) : new Date('2004-01-01');
    var endTime = query.endTime? new Date(query.endTime) : new Date();
    var keyword = query.keyword;

    //all categories might be supported
    googleTrends.interestByRegion({ keyword:keyword, startTime: startTime, endTime:endTime , category:7})       // , category:418
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        res.send({data:data.default, ok:true, moduleName:"interestByRegion"})
    })
}

var interestOverTimeModule = (req,res) =>{
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");
    var query = req.body;
    var geo = query.region? query.region : regionCodes["United States"];
    var startTime = query.startTime? new Date(query.startTime) : new Date('2004-01-01');
    var endTime = query.endTime? new Date(query.endTime) : new Date();
    var keyword = query.keyword;
    googleTrends.interestOverTime({ keyword:keyword, startTime: startTime, endTime:endTime, geo:geo, category:418 })
    .then((results)=> {
        var data = results.toString();
        data = JSON.parse(data);
        res.send({data:data.default, ok:true, moduleName:"interestOverTime"})
    })
    
}

var realTimeTrendsModule = (req,res) => {
    // categories are abridged: {"All":"all", "Entertainment":"e", "Business":"b", "Science/Tech":"t", "Sports":"s", "Top Stories":"h"}
    res.setHeader("Accept", "application/json");
    res.setHeader("Content-Type", "application/json");

    var query = req.body;
    var geo = query.region? query.region : regionCodes["United States"];
    var category = query.category? query.category : 'all'
    var optionsObj = { geo:geo, category:category}

    console.log('optionsObj',optionsObj)
    googleTrends.realTimeTrends(optionsObj)
    .then((results)=> {
        
        var data = results.toString();
        data = JSON.parse(data);
        // console.log("data",data)
        
        var stories = data["storySummaries"]["trendingStories"]
        // console.log(stories)
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
    var geo = query.region? query.region : regionCodes["United States"];
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
            var regionDb = []
            var regionGeos = objD.objects.admin.geometries;
            for(let r=0; r < regionGeos.length; ++r) {
                // ADMIN,  ADM0_A3,  ISO_A2
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