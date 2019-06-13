import loadJson from '../components/load-json/'
import { Coastal } from './modules/coastal'


let social = {

    title : "The Bondi to Manly walk",

    url : "https://www.theguardian.com/australia-news/ng-interactive/2019/jun/14/bondi-to-manly-sydneys-spectacular-harbour-walk",

    fbImg : "",

    twImg : "",

    twHash : "#BondiManlyWalk",

    message : "The Bondi to Manly walk"

};

var waypoints = document.getElementById("waypoints");

waypoints.classList.add("isDesktop");

loadJson('<%= path %>/assets/waypoints.json?t=' + new Date().getTime())
	.then((resp) => {
		console.log("Full version")
		new Coastal(resp, social)
	})

