import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/desktop.html'
import L from 'leaflet' // Check it out... https://blog.webkid.io/rarely-used-leaflet-features/
import walk from '../modules/walk.json'
//import * as turf from '@turf/turf'
import turf from './turfImporter';
import d3 from './d3Importer';
import YouTubePlayer from 'youtube-player';
import Ractive from 'ractive'
import ractiveTap from 'ractive-events-tap'
import smoothscroll from 'smoothscroll-polyfill';
import share from '../modules/share'
smoothscroll.polyfill();

// https://preview.gutools.co.uk/global/ng-interactive/2019/apr/06/bondi-to-manly-walk

export class Coastal {

	constructor(data, social) {

		var self = this

        this.toolbelt = new Toolbelt()

        this.status = null

        this.social = social

        this.stealth = true

        this.googledoc = data

        this.firstrun = true

        this.screenWidth = document.documentElement.clientWidth

        this.screenHeight = document.documentElement.clientHeight

        this.preloader = document.getElementById("interactive_preloader")

        this.default = "Select a popular Sydney location from the list, or explore the walk by dragging the map marker along the route. For privacy reasons small parts of the route have been skipped."

        this.latitude = -33.841715

        this.longitude = 150

        this.zoom = 11

        this.map = null

        this.url = 'wZGLq4CmmeA'

        this.walk = turf.lineString(walk.features[0].geometry.coordinates)

        this.start = turf.point([151.27439227079734, -33.89364721233857])

        this.distance_from_start = 0

        this.distance_memory = 0

        this.mps = 1.2823359317969538

        this.total = 76.18318543466248 //turf.length(self.walk, { units: 'kilometers'} )

        this.duration = 52935.76126984127

        this.current = 0

        this.currentWaypoint = 0

        this.youTubePlayerInitiated = false

        this.waypoints = this.googledoc.filter(function(value, index) {

            return value.EDITORIAL != ""

        })

        this.directory = (self.screenWidth > 960 ) ? "960" : (self.screenWidth > 640) ? "640" : "416" ;

        this.slideshowpics = [{
            image: "BRIDGE",
            caption: "Completed during the height of the Depression, the Sydney Harbour Bridge connects the city’s north and south"
        },{
            image: "OPERA",
            caption: "Formally opened in 1973, the Jørn Utzon-designed Sydney Opera House is a classic piece of modern expressionist architecture"
        },{
            image: "TARONGA",
            caption: "The 28-hectare Taronga zoo is home to more than 4,000 animals of 350 species"
        },{
            image: "LIGHTHOUSE",
            caption: "The Grotto Point Lighthouse is on a rocky headland on the north side of Sydney Harbour"
        },{
            image: "KIRRIBILLI",
            caption: "The Sydney residence of past, present and future Australian prime ministers is located just north of the Harbour Bridge"
        },{
            image: "BENCH",
            caption: "Look back at the entire Bondi-to-Manly journey from Fairfax lookout"
        },{
            image: "BALMORAL",
            caption: "With its promenade and Bathers Pavilion, Balmoral is Sydney’s Victorian-era ’fancy’ beach"
        },{
            image: "CREMOURNE",
            caption: "Teenagers skim rocks at picturesque Cremorne Point"
        },{
            image: "WOODS",
            caption: "Hiking through the undergrowth near Shell Cove, Sydney Harbour"
        },{
            image: "MANLY",
            caption: "A busy afternoon at Manly Wharf"
        },{
            image: "MIDDLE",
            caption: "The path leading up to Georges Head 1801 Battery, about halfway through the Bondi-to-Manly walk"
        },{
            image: "PLANK",
            caption: "Walking the boards near Bradleys Head, on the north shore of Sydney Harbour"
        },{
            image: "REDLEAF",
            caption: "Two walkers enjoy a stroll on the pontoon boardwalk at quiet Redleaf beach"
        },{
            image: "SOUTH",
            caption: "The Hornby Lighthouse was built in 1858 following the wrecking of the Dunbar at the foot of South Head"
        },{
            image: "WIFE",
            caption: "Sara Farnbach cooling off in the tranquil waters just north of Parriwi Lighthouse"
        }]

        this.slideshowpics.shuffle()

        this.currentslideshowpic = 0

        this.database = {

            blurb: self.default,

            waypoints: self.waypoints,

            initiated: true,

            isDesktop: true,

            directory: this.directory,

            progress: {

                percentage: 0,

                current: '0:00'

            },

            lightbox: {

                active: false,

                image: self.slideshowpics[self.currentslideshowpic].image,

                caption: self.slideshowpics[self.currentslideshowpic].caption,

                current: self.currentslideshowpic + 1,

                total: self.slideshowpics.length,

                info: true,

            }
            
        }

        this.onYouTubeIsReady = false

        this.ractivate()

	}

    tracker() {

        var self = this

        var height = document.documentElement.scrollHeight

        var lineFunction = d3.line()
                                .x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .curve(d3.curveCardinal);

        /*
        *
        *
        *
        *
        *
        *
        * The left side
        */

        var lineDataLeft = [    { "x": 50,"percentage" : 0 },  
                            { "x": 50,"percentage" : 10},
                            { "x": 220,"percentage" : 20}, 
                            { "x": 380,"percentage" : 30},
                            { "x": 210,"percentage" : 40},
                            { "x": 330,"percentage" : 50},
                            { "x": 70,"percentage" : 60},
                            { "x": 330,"percentage" : 70}, 
                            { "x": 220,"percentage" : 80},
                            { "x": 240,"percentage" : 90},
                            { "x": 380,"percentage" : 100} ];

        for (var i = 0; i < lineDataLeft.length; i++) {

            lineDataLeft[i].y = height / 100 * lineDataLeft[i].percentage

        }

        var svgContainerLeft = d3.select("#svg_container_left").append("svg")
                                .attr("width", 400)
                                .attr("height", height);

        var lineGraphLeft = svgContainerLeft.append("path")
                            .classed('pathway left', true)
                            .attr("d", lineFunction(lineDataLeft))
                            .attr("stroke-width", 2)
                            .attr("fill", "none")

                        svgContainerLeft.append("path")
                            .classed('dashed', true)
                            .attr("d", lineFunction(lineDataLeft))
                            .attr("stroke-width", 2)
                            .attr("fill", "none")

        this.pathway = d3.select('.left');

        this.pathLength = this.pathway.node().getTotalLength()

        this.pathway.attr("stroke-dasharray", this.pathLength,this.pathLength)
  
        // console.log("path length: " + this.pathLength); //prints how long the stroke is

        /*
        *
        *
        *
        *
        *
        *
        * The Right side
        */

        var lineDataRight = [{ "x": 50,"percentage" : 0 },  
                            { "x": 50,"percentage" : 10},
                            { "x": 320,"percentage" : 20}, 
                            { "x": 380,"percentage" : 30},
                            { "x": 380,"percentage" : 40},
                            { "x": 380,"percentage" : 50},
                            { "x": 70,"percentage" : 60},
                            { "x": 330,"percentage" : 70}, 
                            { "x": 220,"percentage" : 80},
                            { "x": 380,"percentage" : 90},
                            { "x": 0,"percentage" : 100}];

        for (var i = 0; i < lineDataRight.length; i++) {

            lineDataRight[i].y = height / 100 * lineDataRight[i].percentage

        }

        var svgContainerRight = d3.select("#svg_container_right").append("svg")
                                .attr("width", 400)
                                .attr("height", height);

        var lineGraphRight = svgContainerRight.append("path")
                            .classed('pathway right', true)
                            .attr("d", lineFunction(lineDataRight))
                            .attr("stroke-width", 2)
                            .attr("fill", "none")

                        svgContainerRight.append("path")
                            .classed('dashed', true)
                            .attr("d", lineFunction(lineDataRight))
                            .attr("stroke-width", 2)
                            .attr("fill", "none")

        this.pathwayRight = d3.select('.right');

        this.pathLengthRight = this.pathwayRight.node().getTotalLength()

        this.pathwayRight.attr("stroke-dasharray", this.pathLengthRight,this.pathLengthRight)
  
        // console.log("path length right: " + this.pathLengthRight); //prints how long the stroke is

        self.renderLoop()

    }

    ractivate() {

        var self = this

        this.ractive = new Ractive({
            events: { 
                tap: ractiveTap,
            },
            el: '#master_blaster',
            data: self.database,
            template: template,
        })

        this.ractive.on( 'panel', function ( context ) {

            self.panel()

        });

        this.ractive.on( 'controller', function ( context ) {

            (self.status==2) ? self.youTubePlayer.playVideo() : (self.status==1) ? self.youTubePlayer.pauseVideo() : console.log(`You tube status ${self.status}`) ;

        });

        this.ractive.on( 'skip', function ( context, direction, distance ) {

            self.skip(direction, distance)

        });

        this.ractive.on('play', function(context, lat, lng, secs, ends, editorial, image, id) {

            self.play(lat, lng, secs, ends, editorial, image, id)

        })

        this.ractive.on( 'close', function ( context, direction, distance ) {

            self.database.lightbox.active = false

            self.ractive.set('lightbox', self.database.lightbox)

        });

        this.ractive.on( 'next', function ( context ) {

            self.currentslideshowpic = (self.currentslideshowpic === self.slideshowpics.length - 1) ? 0 : self.currentslideshowpic + 1 ;

            self.updateSlideshow()

        });

        this.ractive.on( 'previous', function ( context ) {

            self.currentslideshowpic = (self.currentslideshowpic === 0) ? self.slideshowpics.length - 1 : self.currentslideshowpic - 1 ;

            self.updateSlideshow()

        });

        this.ractive.on( 'info', function ( context ) {

            self.database.lightbox.info = (self.database.lightbox.info) ? false : true ;

            console.log(self.database.lightbox.info)

            self.ractive.set('lightbox', self.database.lightbox)

        });

        this.ractive.on( 'social', ( context, channel ) => {

            let shared = share(self.social.title, self.social.url, self.social.fbImg, self.social.twImg, self.social.twHash, self.social.message);
        
            shared(channel);

        });


        this.video = document.getElementById("video");

        this.createPlayer()

        this.loadedInterval = window.setInterval(function(){ self.isReady(); }, 200);

    }

    isReady() {

        var self = this

        if ( self.video.readyState === 4 ) {

            clearInterval(self.loadedInterval); 

            self.loadedInterval = null
                
            console.log(`This video is ready to play ${self.video.readyState}`)

            self.playVideo()

            //this.finalTests = window.setInterval(function(){ self.checklist(); }, 1000);

            self.config();
            

        } else {

            console.log("The video is loading")

        }

    }

    checklist() {

        console.log("Beep")

    }

    config() {

        var self = this

        document.getElementById("video-skip-btn").addEventListener('click',function(event) {

            var target = document.getElementById("flaneur")

            self.scrollTo(target, -130)

        });

        document.getElementById("slideshow").addEventListener('click',function(event) {

            self.database.lightbox.active = true

            self.ractive.set('lightbox', self.database.lightbox)

        });

        this.progressInterval = window.setInterval(function(){ self.progress(); }, 1000);

    }

    updateSlideshow() {

        var self = this 

        self.database.lightbox.current = self.currentslideshowpic + 1

        self.database.lightbox.image = self.slideshowpics[self.currentslideshowpic].image

        self.database.lightbox.caption = self.slideshowpics[self.currentslideshowpic].caption

        self.ractive.set('lightbox', self.database.lightbox)

    }

    panel() {

        var sidebar = document.getElementById("sidebar");

        sidebar.classList.toggle("hidebar");

        var map = document.getElementById("map");

        map.style.visibility = map.style.visibility == "hidden" ? "visible" : "hidden" ;

    }

    skip(direction, distance) {

        var self = this

        var orbit = +distance

        self.stealth = false

        if (self.status ===1 || self.status ===2) {

            var destination = ( direction==='back') ? self.current - orbit : self.current + orbit ;

            self.current = (destination > 0 && destination < self.duration) ? destination : 0 ;

            self.youTubePlayer.seekTo(self.current, true)

            self.database.progress.current = self.toolbelt.temporalFormat(self.current)

            self.database.progress.percentage = Math.floor( 100 / self.duration * self.current )

            self.ractive.set('progress', self.database.progress)

            self.distance_from_start = ( direction==='back') ? ( (self.distance_from_start * 1000 ) - (orbit * self.mps) ) / 1000 : ( ( self.distance_from_start * 1000 ) + (orbit * self.mps) ) / 1000 ;

            if (self.distance_from_start > self.next_waypoint) {

                self.transitional()

            }

            self.stealth = true

            self.relocate()

        }

    }

    relocate() {

        var self = this

        if (self.stealth) {

            //console.log(`Current waypoint: ${self.currentWaypoint}`)

            var difference = Math.abs(self.distance_memory - self.distance_from_start)

            if (difference > 0.4 || self.distance_memory === 0) {

                console.log("Time to reposition the map marker")

                self.distance_memory = self.distance_from_start

                var repositioned = self.calculateAlong(self.walk, self.distance_from_start).geometry.coordinates

                if (repositioned!=undefined) {

                    self.playhead.setLatLng([repositioned[1],repositioned[0]], {

                        draggable: true

                    })

                }

            }

        }

    }

    play(lat, lng, secs, ends, editorial, image, id) {

        var self = this

        self.currentWaypoint = id

        self.youTubePlayer.seekTo(secs, true)

        self.playhead.setLatLng([lat, lng], {

            draggable: true

        })

        self.database.blurb = editorial

        self.database.image = image

        self.ractive.set('blurb', self.database.blurb)

        self.ractive.set('image', self.database.image)

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
                'start': 0,
                'enablejsapi':1
            }
        });

        self.youTubePlayer.on('error', error => {

            console.log(error)

            console.log("You tube has not loaded properly")

        });

        self.youTubePlayer.on('ready', event => {

            self.preloader.style.display = "none" ; 

            event.target.mute();

            document.getElementById("walk_video").setAttribute("webkit-playsinline", true);

            document.getElementById("walk_video").setAttribute("playsinline", true);

            self.youTubePlayer.seekTo(0)

        });

        var overlay = document.getElementById('overlay');
        
        self.youTubePlayer.on('stateChange', event => {

            self.status = event.data

            switch (self.status) {
              case -1:
                // console.log('unstarted');
                break;
              case 0:
                // console.log('ended');
                break;
              case 1:
                // console.log('play');
                if (!self.database.initiated) {
                    self.database.initiated = true
                    self.ractive.set('initiated', self.database.initiated)
                }
                self.toolbelt.alpharizer(overlay,0)
                overlay.className = 'youtube_overlay video_play';
                break;
              case 2:
                self.toolbelt.alpharizer(overlay,100)
                overlay.className = 'youtube_overlay video_pause';
                // console.log('paused');
                break;
              case 3:
                 // console.log('buffering');
                break;
              case 5:
                // console.log('video cued');
                break;
              default:
               // console.log("Something is not right");
            }

        });

        // https://developers.google.com/youtube/iframe_api_reference#setPlaybackQuality

        self.youTubePlayer
            .loadVideoById({
                'videoId': self.url,
                'startSeconds': 0,
           }).then(() => self.hyperlapse());


    }

    progress() {

        var self = this

        if (self.status ===1 || self.status ===2) {

            self.youTubePlayer.getCurrentTime().then((current) => {

                if (self.status === 1 && self.current != current) {

                    self.distance_from_start = ( ( self.distance_from_start * 1000) + self.mps) / 1000

                    if (self.distance_from_start > self.next_waypoint) {

                        self.transitional()

                    }

                }

                self.current = current

                self.database.progress.current = self.toolbelt.temporalFormat(self.current)

                self.database.progress.percentage = Math.floor(100 / self.duration * current)

                self.ractive.set('progress', self.database.progress)

                self.relocate()

            });

        }

    }

    transitional() {

        var self = this

        console.log("You have crossed aboundary")

        var waypoint = self.currentWaypoint + 1

        var mps = self.googledoc[waypoint].mps

        var next_waypoint = (waypoint < self.googledoc.length - 1) ? self.googledoc[waypoint+1].distance_from_start : self.total ;

        if (self.googledoc[waypoint].SKIP) {

            console.log("The user has crossed into a deadzone skip to the next waypoint")

            mps = self.googledoc[waypoint+1].mps

            next_waypoint = (waypoint < self.googledoc.length - 2) ? self.googledoc[waypoint+2].distance_from_start : self.total ;

        }

        self.currentWaypoint = waypoint

        self.mps = mps

        self.next_waypoint = next_waypoint


    }

    hyperlapse() {

        var self = this        

        var hyperlapse = document.getElementById('hyperlapse');

        var hyperWidth = hyperlapse.clientWidth

        var hyperHeight = hyperWidth * 0.56

        var iframe = document.createElement('iframe');
        iframe.src = "https://www.youtube.com/embed/63wARkXeiRk?autoplay=0&fs=0&iv_load_policy=3&showinfo=0&rel=0&cc_load_policy=0&start=0&end=0&origin=https://youtubeembedcode.com"
        iframe.frameborder = "0"
        iframe.height = hyperHeight
        iframe.width = hyperWidth
        iframe.scrolling = "no" 
        iframe.marginheight = "0"
        iframe.marginwidth = "0" 
        hyperlapse.appendChild(iframe);

        self.activate()

    }

    activate() {

        var self = this

        document.getElementById("nav-wrap").style.display = "block";

        document.getElementById("audio-switch").addEventListener('change',function(event) {

            (document.getElementById("audio-switch").checked==false) ? self.youTubePlayer.mute() : self.youTubePlayer.unMute() ;

            (document.getElementById("audio-switch").checked==false) ? self.hyperlapsePlayer.mute() : self.hyperlapsePlayer.unMute() ;

        });


        this.initMap()

    }

    initMap() {

        var self = this

        this.map = new L.Map('map', { 
            //renderer: L.canvas(),
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

        //L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(self.map);

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

        var imageUrl = '<%= path %>/assets/harbour.png',

        imageBounds = self.map.getBounds()

        //[[self.latitude, self.longitude], [self.latitude, self.longitude]];

        L.imageOverlay(imageUrl, imageBounds).addTo(self.map);



        self.route.on('click', function(ev) {

          var latlng = self.map.mouseEventToLatLng(ev.originalEvent);

        });

        var locationIcon = L.icon({
            iconUrl: '<%= path %>/assets/location.png',
            iconSize:     [20, 20], // size of the icon
            iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
        });

        self.playhead = L.marker([-33.893446, 151.2737502], {

            icon: locationIcon,

            draggable: true

        }).addTo(self.map);

        self.playhead.on('drag', function(e) {

            let position = self.playhead.getLatLng();

        });

        self.playhead.on('dragstart', function(e) {

            self.stealth = false

            //console.log("Pause any currently playing videos")

        });

        self.playhead.on('dragend', function(e) {

            self.stealth = true

            let coordinates = self.playhead.getLatLng();

            self.calculatePosition(coordinates)

        });

        // Set the circle radius depending on zoom level
        self.map.on('zoomend', function(e) {

            //console.log("You finished zooming")

        });

        self.map.on('click', function(e) {

            //console.log("You clicked on the map")

        });

        this.tracker()

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

                var currentWaypoint = ( i > 0 ) ? i - 1 : 0 ;

                break
            }

        }

        this.reposition(currentWaypoint, distance, longitudeLatitude)

    }

    reposition(waypoint, distance, longitudeLatitude) {

        var self = this 
        var stage_distance = self.googledoc[waypoint].stage_distance
        var distance_from_start = self.googledoc[waypoint].distance_from_start
        var video_start = self.googledoc[waypoint].x
        var duration = self.googledoc[waypoint].duration
        var pecentage = 100 / stage_distance * ( distance - distance_from_start )
        var playhead = Math.floor(duration / 100 * pecentage) + video_start
        var mps = self.googledoc[waypoint].mps
        var next_waypoint = (waypoint < self.googledoc.length - 1) ? self.googledoc[waypoint+1].distance_from_start : self.total ;
        var log = (waypoint < self.googledoc.length - 1) ? `${self.googledoc[waypoint].LOCATION} to ${self.googledoc[waypoint+1].LOCATION}` : `` ;

        // If the user has selected a deadzone skip to the next waypoint
        if (self.googledoc[waypoint].SKIP) {

            distance = self.googledoc[waypoint+1].distance_from_start

            longitudeLatitude = self.googledoc[waypoint+1].intersection

            playhead = self.googledoc[waypoint+1].x

            mps = self.googledoc[waypoint+1].mps

            next_waypoint = (waypoint < self.googledoc.length - 2) ? self.googledoc[waypoint+2].distance_from_start : self.total ;

            log = `Skipped deadzone: ${self.googledoc[waypoint].LOCATION} to ${self.googledoc[waypoint+1].LOCATION}`

        }

        self.currentWaypoint = waypoint

        self.distance_from_start = distance

        self.next_waypoint = next_waypoint

        self.mps = mps

        console.log(`Waypoint: ${waypoint}\nCurrent stage: ${log}\nLatitude: ${longitudeLatitude[1]}\nLongitude: ${longitudeLatitude[0]}\nVideo: ${self.toolbelt.temporalFormat(playhead)}\nDistance from start: ${distance}\n----------------------------------\n\n`);

        self.playhead.setLatLng([longitudeLatitude[1],longitudeLatitude[0]], {

            draggable: true

        })

        self.database.blurb = self.default

        self.ractive.set('blurb', self.database.blurb)

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

    calculateAlong(track, along) {

        return turf.along(track, along, { units: 'kilometers'})

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

    renderLoop() {

        var self = this

        let video = self.calculateCover({width: self.screenWidth, height: self.screenHeight}, [16,9])

        let xenon = window.innerHeight - 100

        var elem = document.getElementById('walk_video');

        var elemRect = elem.getBoundingClientRect();

        var elemViewportOffset = elemRect.top;

        this.requestAnimationFrame = requestAnimationFrame( function() {

            self.pathway.attr("stroke-dashoffset", `${self.pathLength - window.pageYOffset - xenon}px`)

            self.pathwayRight.attr("stroke-dashoffset", `${self.pathLengthRight - window.pageYOffset - xenon}px`)

    
            console.log(`${window.pageYOffset} | ${video.height / 2}`)

            // If the user has scrolled past the intro video... pause the intro video and play the you tube video
            if (window.pageYOffset > video.height / 2) {

                if (self.video.readyState === 4) {

                    if (!self.video.paused) {

                        self.video.pause()

                    }
                }

                // You tube video
                if (self.status==2 && self.firstrun) {

                    self.firstrun = false

                    self.youTubePlayer.playVideo();

                }


            } else {

                if (self.video.readyState === 4) {

                    if (self.video.paused) {

                        self.playVideo()

                    }

                }

            }

            self.renderLoop()

        })
    }

    async playVideo() {

        var self = this
        try {
            await self.video.play();
        } catch(err) {

        }
    }

    scrollTo(element, extra=0) {

        var self = this

        // console.log("scroll to")

        setTimeout(function() {

            var elementTop = (window.pageYOffset + element.getBoundingClientRect().top) + extra

            window.scroll({
              top: elementTop,
              behavior: "smooth"
            });

        }, 400);

    }


}