import { lineString, point } from "@turf/helpers";
import lineSlice from "@turf/line-slice";
import length from '@turf/length';
import nearestPointOnLine from "@turf/nearest-point-on-line";

export default {
    lineString: lineString,
    point: point,
    lineSlice: lineSlice,
    length: length,
    nearestPointOnLine: nearestPointOnLine,
};