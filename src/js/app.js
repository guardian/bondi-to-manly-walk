import xr from 'xr';
import { Coastal } from './modules/coastal'

xr.get('<%= path %>/assets/waypoints.json?t=' + new Date().getTime()).then((resp) => {

	new Coastal(resp.data)

});


