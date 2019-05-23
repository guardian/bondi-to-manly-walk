import loadJson from '../components/load-json/'
import { Coastal } from './modules/coastal_lite'

var waypoints = document.getElementById("waypoints");

waypoints.classList.add("device");

loadJson('<%= path %>/assets/waypoints.json?t=' + new Date().getTime())
	.then((resp) => {
		console.log("Lite version")
		new Coastal(resp)
	})

