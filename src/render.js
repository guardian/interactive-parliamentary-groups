import mainTemplate from './src/templates/main.html!text'
import handlebars from 'handlebars'
import rp from 'request-promise-native'
import config from '../config.json'

var mpLimit = 12;
var mpsLookup = {};
var mpsList = [];

async function getData(){
	var uriopts = {'uri': config.docData,'json': true}
	var response = await rp(uriopts);

	response.sheets['MPs on APPGs'].forEach(function(mp){
		if(mpsLookup[mp.Name]){
			mpsLookup[mp.Name]++;
		}else{
			mpsLookup[mp.Name] = 1;
		}
	})


	var structuredData = response.sheets['APPGs Total Funds'].map(function(APPG){
		APPG.mps = response.sheets['MPs on APPGs'].filter(function(mp){
			return mp['APPG'] === APPG['APPG']
		}).map(function(mp,i){
			if(mpsList.indexOf(mp.Name) < 0){
				mpsList.push(mp.Name)
			}

			return {
				"isCollapsed": i >= mpLimit,
				"id": mp.Name.toLowerCase(),
				"name": mp.Name,
				"position": mp.Position,
				"party": mp.Party,
				"totalFunds": mpsLookup[mp.Name]
			}
		})

		APPG.funds = response.sheets['Funds to APPGs'].filter(function(fund){
			return fund['Group'] === APPG['APPG']
		}).map(function(fund,i){
			fund.id = fund["Sponsor"].toLowerCase();
			fund.name = fund["Sponsor"];
			fund.totalFormatted = numberWithCommas(fund["Minimum Donated"])
			fund.Total = Number(fund["Minimum Donated"])
			return fund
		}).sort(function(a,b){
			if (a["Total"] < b["Minimum Donated"])
				return 1;
			if (a["Total"] > b["Minimum Donated"])
				return -1;
			return 0;
		}).map(function(fund,i){
			fund.isCollapsed = i >= 6
			return fund
		})

		APPG.Total = numberWithCommas(APPG["Total Funding"])
		APPG.isCollapsed = APPG.funds.length > 6;
		return APPG;
	})

	var template = handlebars.compile(mainTemplate);
	return template({groups:structuredData, mpsList: mpsList})
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function render() {
    return getData();
}
