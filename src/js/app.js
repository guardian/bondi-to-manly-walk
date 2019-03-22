import xr from 'xr';
import { Coastal } from './modules/coastal'

xr.get('https://interactive.guim.co.uk/docsdata/1Gj92ohJx1YtretKjcrUMKOw_R5QbjjxZ-I5jMImNREU.json?t=' + new Date().getTime()).then((resp) => {

	var data  = resp.data.sheets.waypoints

	new Coastal(data)

});


