import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/template.html'
import { $, $$, round, numberWithCommas, wait, getDimensions } from '../modules/util'
import L from 'leaflet' // Check it out... https://blog.webkid.io/rarely-used-leaflet-features/
import share from '../modules/share'
import walk from '../modules/walk.json'
import * as turf from '@turf/turf'
import YouTubePlayer from 'youtube-player';
import { videoPlayer } from '../modules/video'
import Ractive from 'ractive'
import ractiveTap from 'ractive-events-tap'
//Ractive.DEBUG = false;
//https://www.youtube.com/watch?v=DFN3iy8y9rQ
//vimeo.com/user7712081/download/317861443/32650fa416

export class Coastal {

	constructor(data) {

		var self = this

        this.toolbelt = new Toolbelt()

        this.googledoc = data

        this.screenWidth = document.documentElement.clientWidth

        this.screenHeight = document.documentElement.clientHeight

        this.path = 'https://gdn-cdn.s3.amazonaws.com/2019/03/bondi-to-manly'

        this.isMobile = this.toolbelt.mobileCheck()

        this.latitude = -33.841715

        this.longitude = 150

        this.zoom = (self.screenWidth < 600) ? 11 : (self.screenWidth < 800) ? 11 : 11 ;

        this.map = null

        this.url = 'iJySPs2ayPg'

        this.walk = turf.lineString(walk.features[0].geometry.coordinates)

        this.start = turf.point([151.27439227079734, -33.89364721233857])

        this.total = 76.18318543466248 //turf.length(self.walk, { units: 'kilometers'} )

        this.youTubePlayerInitiated = false

        this.waypoints = this.googledoc.filter(function(value, index) {

            return value.EDITORIAL != ""

        })

        this.bitrate = [{
            "directory" : "gear1",
            "bitrate":200,
            "width":416,
            "height":234
        },{
            "directory" : "gear4",
            "bitrate":1200,
            "width":640,
            "height":540
        },{
            "directory" : "gear5",
            "bitrate":1800,
            "width":960,
            "height":540
        },{
            "directory" : "gear7",
            "bitrate":4500,
            "width":1280,
            "height":720
        },{
            "directory" : "gear9",
            "bitrate":7995,
            "width":1920,
            "height":1080
        }]

        /*
        {
        "directory" : "gear8",
        "bitrate":6500,
        "width":1280,
        "height":720
        },{
        "directory" : "gear6",
        "bitrate":2500,
        "width":960,
        "height":540
        },{
        "directory" : "gear2",
        "bitrate":480,
        "width":416,
        "height":270
        },{
        "directory" : "gear3",
        "bitrate":640,
        "width":416,
        "height":360
        }
        */

        var i = 0;

        self.directory = "gear9"

        while (self.bitrate[i].width < self.screenWidth && i < self.bitrate.length) {

          self.directory = self.bitrate[i].directory

          i++;

        }

        this.database = {

            blurb: "Drag the map marker along the route or click on one of the destionations below.",

            waypoints: self.waypoints,

            directory: self.directory
            
        }

        this.video = document.getElementById('video');

        this.videoPlayer = new videoPlayer(self.video, self.path, self.directory, self.screenWidth, self.isMobile)

        this.videoPlayer.init().then( (data) => {

            self.setupVideo()

        })

	}

    setupVideo() {

        var self = this

        this.video.play()

        self.ractivate()

    }

    ractivate() {

        var self = this

        this.ractive = new Ractive({
            events: { 
                tap: ractiveTap,
            },
            el: '#app',
            data: self.database,
            template: template,
        })

        this.ractive.on( 'panel', function ( context ) {

            var sidebar = document.getElementById("sidebar");

            sidebar.classList.toggle("hidebar");

        });

        this.ractive.on( 'social', function ( context, channel ) {

            var title = ""

            var shareURL = ""

            var fbImg = ""

            var twImg = ""

            var twHash = ""

            var message = ""

            let sharegeneral = share(title, shareURL, fbImg, twImg, twHash, message);

            sharegeneral(channel);

        });

        this.ractive.on('play', function(context, lat, lng, secs, ends, editorial) {

            self.youTubePlayer.seekTo(secs, true)

            self.playhead.setLatLng([lat, lng], {

                draggable: true

            })

            self.database.blurb = editorial

            self.ractive.set('blurb', self.database.blurb)

        })

        this.createPlayer()

    }

    createPlayer() {

        var self = this

        let video = self.calculateCover({width: self.screenWidth - 300, height: self.screenHeight}, [16,9])

        /*
        The behavior for the rel parameter is changing on or after September 25, 2018. 
        The effect of the change is that you will not be able to disable related videos. 
        However, you will have the option of specifying that the related videos shown in 
        the player should be from the same channel as the video that was just played
        https://stackoverflow.com/questions/13418028/youtube-javascript-api-disable-related-videos
        */

        self.youTubePlayer = new YouTubePlayer('walk_video', {
            height: video.height,
            width: video.width,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'rel': 0,
                'showinfo': 0,
                'loop': 1,
                'modestbranding': 1,
                'playsinline': 1,
                'start': 0
            }
        });

        self.youTubePlayer.on('ready', event => {

            event.target.mute();

            self.youTubePlayer.seekTo(0)

        });
        
        self.youTubePlayer.on('stateChange', event => {

            self.status = event.data

            switch (self.status) {
              case -1:
                console.log('unstarted');
                break;
              case 0:
                console.log('ended');
                break;
              case 1:
                console.log('playing');
                break;
              case 2:
                console.log('paused');
                break;
              case 3:
                console.log('buffering');
                break;
              case 5:
                console.log('video cued');
                break;
              default:
               console.log("Something is not right");
            }

        });

        self.youTubePlayer
            .loadVideoById({
                'videoId': self.url,
                'startSeconds': 0,
                'suggestedQuality': 'large'
           })
            .then(() => {

                self.initMap()

                self.renderLoop()            

            });

    }

    initMap() {

        var self = this

        this.map = new L.Map('map', { 
            renderer: L.canvas(),
            center: new L.LatLng(self.latitude, self.longitude), 
            zoom: self.zoom,
            scrollWheelZoom: false,
            dragging: false,
            zoomControl: false,
            doubleClickZoom: false,
            zoomAnimation: false
        })

        /* Nice leaflet canvas overlay worth checking out
        http://bl.ocks.org/Sumbera/11114288
        */

        L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(self.map);

        self.route = L.geoJson(walk, {
            style: {
                weight: 1,
                opacity: 1,
                color: '#ef0bd7',
                fillOpacity: 1,
            }
        }).addTo(self.map);

        self.map.attributionControl.setPrefix(false);

        self.bounds = self.route.getBounds()

        self.map.fitBounds(self.bounds, {padding: [10, 10]});

        self.route.on('click', function(ev) {

          var latlng = self.map.mouseEventToLatLng(ev.originalEvent);

        });

        var locationIcon = L.icon({
            iconUrl: '<%= path %>/assets/location.png',
            iconSize:     [20, 20], // size of the icon
            iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
        });

        self.playhead = L.marker([-33.893446, 151.2737502], {

            icon: locationIcon,

            draggable: true

        }).addTo(self.map);

        self.playhead.on('drag', function(e) {

            let position = self.playhead.getLatLng();

        });

        self.playhead.on('dragstart', function(e) {

            console.log("Pause any currently playing videos")

        });

        self.playhead.on('dragend', function(e) {

            let coordinates = self.playhead.getLatLng();

            self.calculatePosition(coordinates)

        });

        // Set the circle radius depending on zoom level

        self.map.on('zoomend', function(e) {

            console.log("You finished zooming")

        });

        self.map.on('click', function(e) {

            console.log("You clicked on the map")

        });

    }

    calculatePosition(coordinates) {

        var self = this

        var extent = self.nearestPointOnLine(self.walk, [coordinates.lng, coordinates.lat]).geometry.coordinates

        var point = self.getPoint(extent)

        var stage = self.sliceTrack(self.start, point, self.walk)

        var distance = self.calculateDistance(stage)

        var longitudeLatitude = point.geometry.coordinates

        for (var i = 0; i < self.googledoc.length; i++) {

            if (self.googledoc[i].distance_from_start > distance) {

                var stage_distance = self.googledoc[i].stage_distance
                var distance_from_start = (i>0) ? self.googledoc[i-1].distance_from_start : 0 ;
                var video_start = (i>0) ? self.googledoc[i-1].x : 0 ; // video start
                var duration = self.googledoc[i].duration // video duration
                var pecentage = 100 / stage_distance * ( distance - distance_from_start )
                var playhead = Math.floor(duration / 100 * pecentage) + video_start
                var leg = (i>0) ? self.googledoc[i-1].LOCATION : "Bondi" ;

                // If the user has selected a deadzone skip to the next waypoint
                if (self.googledoc[i].SKIP) {

                    distance = self.googledoc[i].distance_from_start

                    longitudeLatitude = self.googledoc[i].intersection

                    playhead = self.googledoc[i].x

                    leg = self.googledoc[i].LOCATION

                }

                console.log(`Current stage of the walk: ${leg}`)

                break
            }

        }

        self.playhead.setLatLng([longitudeLatitude[1],longitudeLatitude[0]], {

            draggable: true

        })


        self.youTubePlayer.seekTo(playhead, true)

    }

    getPoint(lnglat) {

        return turf.point(lnglat)

    }

    getTrack(coordinates) {

        return turf.lineString(coordinates)

    }

    calculateDistance(track) {

        return turf.length(track, { units: 'kilometers'} )

    }

    sliceTrack(start, stop, total) {

        return turf.lineSlice(start, stop, total);

    }

    nearestPointOnLine(track, coordinates) {

        return turf.nearestPointOnLine( track, coordinates, { units: 'kilometers' } );

    }

    resize() {

        var self = this

        window.addEventListener("resize", function() {

            clearTimeout(document.body.data)

            document.body.data = setTimeout( function() { 

                self.screenWidth = document.documentElement.clientWidth

                self.screenHeight = document.documentElement.clientHeight

                if (self.screenHeight > (self.screenWidth * 2)) {

                    self.screenHeight = self.screenWidth

                } else {

                    self.screenHeight = self.screenHeight - 100

                }

                if (self.map!=null) {

                    self.map.invalidateSize();

                }

            }, 200);

        });

        window.addEventListener("orientationchange", function() {
            
            console.log("orientationchange")
            
        }, false);


    }

    calculateCover(frame, sides) {

        var ratio = sides[1] / sides[0],
          cover = { 
              width: frame.width,
              height: Math.ceil(frame.width * ratio) 
          };

        if (cover.height <= frame.height) {
            cover.height = frame.height;
            cover.width = Math.ceil(frame.height / ratio);
        }

        return cover;
    }

    appscroll() {

        var isAndroidApp = (window.location.origin === "file://" && /(android)/i.test(navigator.userAgent) ) ? true : false ;

        var el = document.getElementById('map');

        el.ontouchstart = function(e){

            if (isAndroidApp && window.top.GuardianJSInterface.registerRelatedCardsTouch) {

              window.top.GuardianJSInterface.registerRelatedCardsTouch(true);

            }
        };

        el.ontouchend = function(e){

            if (isAndroidApp && window.top.GuardianJSInterface.registerRelatedCardsTouch) {

              window.top.GuardianJSInterface.registerRelatedCardsTouch(false);

            }

        };

    }

    renderLoop() {

        var self = this

        let video = self.calculateCover({width: self.screenWidth, height: self.screenHeight}, [16,9])

        this.requestAnimationFrame = requestAnimationFrame( function() {

            // If the user has scrolled past the intro video... pause the intro video and play the you tube video
            if (window.pageYOffset > video.height) {

                // Intro video
                if (!self.video.paused) {

                    self.video.pause()

                }

                // You tube video
                if (self.status==2) {

                    self.youTubePlayer.playVideo();

                }


            } else {

                // You tube video
                if (self.status==1) {

                    self.youTubePlayer.pauseVideo();

                }

                // Intro video
                if (self.video.paused) {

                    self.video.play()

                }

            }

            self.renderLoop()

        })
    }
}