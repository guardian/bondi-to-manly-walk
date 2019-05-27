import loadJson from '../components/load-json/'
import { Coastal } from './modules/coastal_lite'
import share from './modules/share'

let social = {

    title : "The Bondi to Manly walk",

    url : "https://www.theguardian.com/australia-news/ng-interactive/2019/may/18/live-results-for-the-2019-australian-election-track-the-votes",

    fbImg : "",

    twImg : "",

    twHash : "#BondiManlyWalk",

    message : "The Bondi to Manly walk"

};

var shareFn = share(social.title, social.url, social.fbImg, social.twImg, social.twHash, social.message);

[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click',() => shareFn(network));
});

var waypoints = document.getElementById("waypoints");

waypoints.classList.add("device");

loadJson('<%= path %>/assets/waypoints.json?t=' + new Date().getTime())
	.then((resp) => {
		console.log("Lite version")
		new Coastal(resp)
	})

