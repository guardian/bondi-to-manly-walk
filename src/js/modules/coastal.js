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

        console.log("Ready player one")

        this.toolbelt = new Toolbelt()

        this.googledoc = data

        this.screenWidth = document.documentElement.clientWidth

        this.screenHeight = document.documentElement.clientHeight

        this.path = 'http://gdn-cdn.s3.amazonaws.com/2019/03/bondi-to-manly'

        this.isMobile = this.toolbelt.mobileCheck()

        this.latitude = -33.841715

        this.longitude = 150

        this.zoom = (self.screenWidth < 600) ? 11 : (self.screenWidth < 800) ? 11 : 11 ;

        this.map = null

        this.url = 'iJySPs2ayPg'

        this.walk = turf.lineString(walk.features[0].geometry.coordinates)

        this.start = turf.point([151.2737502, -33.893446])

        this.total = turf.length(self.walk, { units: 'kilometers'} )

        this.youTubePlayerInitiated = false

        this.googledoc.forEach(function(value, index) {
            value.id = index
            value.x = self.toolbelt.temporalToSeconds(value.START)
            value.y = self.toolbelt.temporalToSeconds(value.END)
            value.LATITUDE = +value.LATITUDE
            value.LONGITUDE = +value.LONGITUDE

        })

        this.database = {

            blurb: "Drag the map marker to a point on the route to play the video at that point or take the tour below.",

            weypoints: self.googledoc
            
        }

        this.video = document.getElementById('video');

        this.videoPlayer = new videoPlayer(self.video, self.path, self.screenWidth, self.isMobile)

        this.videoPlayer.init().then( (data) => {

            self.setupVideo()

        })

	}

    setupVideo() {

        var self = this

        console.log("Initiated video setup")

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

        this.ractive.on( 'close', function ( context ) {


        });

        this.ractive.on( 'social', function ( context, channel ) {

            var title = "The Bondi to Manly walk" ;

            var message = "This interactive tells the stories that have long been kept out of our history books. It shows evidence of mass killings from 1788 until 1927: a sustained and systematic process of conflict and expansion"

            var fbImg = "https://i.guim.co.uk/img/media/c87aa28f1a03e77c01e6b9ad30a6ed020fad07f1/0_0_2000_1200/master/2000.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctZGVmYXVsdC5wbmc&s=7cdd30f3def215679560b5fb119570dd";

            // title, shareURL, fbImg, twImg, hashTag, FBmessage=''

            let sharegeneral = share(title, "https://www.theguardian.com/australia-news/ng-interactive/2019/mar/04/massacre-map-australia-the-killing-times-frontier-wars", fbImg, '', '#KillingTimes', message);

            sharegeneral(channel);

        });

        this.ractive.on('play', function(context, lat, lng, secs, ends, editorial) {

            self.youTubePlayer.seekTo(secs, true)

            console.log(lat, lng)

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
                'modestbranding': 1,
                'playsinline': 1
            },
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
            .loadVideoById(self.url)
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

        self.route = L.geoJson(walk, {
            style: {
                weight: 1,
                opacity: 1,
                color: 'black',
                fillOpacity: 1,
            }
        }).addTo(self.map);

        self.map.attributionControl.setPrefix(false);

        self.bounds = self.route.getBounds()

        self.map.fitBounds(self.bounds, {padding: [10, 10]});

        self.route.on('click', function(ev) {

          var latlng = self.map.mouseEventToLatLng(ev.originalEvent);

          console.log(latlng.lat + ', ' + latlng.lng);

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

            let position = self.playhead.getLatLng();

            let updated = self.nearestPointOnLine(position)

            self.playhead.setLatLng([updated[1],updated[0]], {

                draggable: true

            })

            self.calculatePlayhead(updated[1], updated[0])

            console.log("Play video at nearest point on the walk")

        });

        // Set the circle radius depending on zoom level

        self.map.on('zoomend', function(e) {

            console.log("You finished zooming")

        });

        self.map.on('click', function(e) {

            console.log("You clicked on the map")

        });

        console.log("Map initiated")

    }

    nearestPointOnLine(latlng) {

        var self = this

        var pt = turf.point([ latlng.lng, latlng.lat ]);

        var nearest = turf.nearestPointOnLine( self.walk, pt, { units: 'kilometers' } );

        return nearest.geometry.coordinates

    }

    calculatePlayhead(lat, lng) {

        var self = this

        //https://stackoverflow.com/questions/41668577/distance-between-two-points-over-a-path-with-turf-js

        /*
        Slice the line using your two points using turf.lineSlice. 
        This will return a new line which consists of just the sections on the line between your two points.
        Next you can use turf.lineDistance to calculate the distance of that sliced line.
        */
        
        var stop = turf.point([lng, lat]);
        var sliced = turf.lineSlice(self.start, stop, self.walk);
        var length = turf.length(sliced, { units: 'kilometers'} );
        var pecentage = 100 / self.total * length
        var duration = 52935 // Length of video in seconds
        var playhead = Math.floor(duration / 100 * pecentage)
        console.log(pecentage + '% | ' + length + ' | ' + self.total + ' | ' + playhead)

        self.youTubePlayer.seekTo(playhead, true)

    }

    viewporter() {

        var self = this

        var mapheight = self.screenHeight

        if (self.isMobile || window.location.origin === "file://" || window.location.origin === null) {

            if (self.screenWidth > self.screenHeight) {

                mapheight = self.screenWidth / 2

            } else {

                mapheight = self.screenWidth
            }

        }

        return mapheight

    }

    screenTest() {

        return (window.innerWidth < 740) ? true : false ;

    }

    resize() {

        var self = this

        window.addEventListener("resize", function() {

            clearTimeout(document.body.data)

            document.body.data = setTimeout( function() { 

                console.log("Resized")

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

                    console.log("Paused intro video")

                    self.video.pause()

                }

                // You tube video
                if (self.status==2) {

                    self.youTubePlayer.playVideo();

                }


            } else {

                // You tube video
                if (self.status==1) {

                    console.log("Paused YouTube video")

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