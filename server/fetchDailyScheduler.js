const schedule = require('node-schedule')

const ruleEastUS = new schedule.RecurrenceRule();
const ruleCentUS = new schedule.RecurrenceRule();
const ruleMountUS = new schedule.RecurrenceRule();
const rulePacifUS = new schedule.RecurrenceRule();
ruleEastUS.tz = 'US/Eastern';
ruleCentUS.tz = 'US/Central';
ruleMountUS.tz = 'US/Mountain';
rulePacifUS.tz = 'US/Pacific';
ruleEastUS.hour = 12;
ruleCentUS.hour = 12;
ruleMountUS.hour = 12;
rulePacifUS.hour = 12;
ruleEastUS.minute = 0;
ruleCentUS.minute = 0;
ruleMountUS.minute = 0;
rulePacifUS.minute = 0;

module.exports = {
    ruleEastUS:ruleEastUS,
    ruleCentUS:ruleCentUS,
    ruleMountUS:ruleMountUS,
    rulePacifUS:rulePacifUS
}




