import loadJson from '../components/load-json/'
import { Coastal } from './modules/coastal'
import share from './modules/share'

let social = {

    title : "The Bondi to Manly walk",

    url : "https://www.theguardian.com/australia-news/ng-interactive/2019/may/18/live-results-for-the-2019-australian-election-track-the-votes",

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
		new Coastal(resp)
	})

