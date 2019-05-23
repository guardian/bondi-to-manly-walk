import loadJson from '../components/load-json/'
import { Coastal } from './modules/coastal'

var waypoints = document.getElementById("waypoints");

waypoints.classList.add("isDesktop");

loadJson('<%= path %>/assets/waypoints.json?t=' + new Date().getTime())
	.then((resp) => {
		console.log("Full version")
		new Coastal(resp)
	})

