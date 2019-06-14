import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/lite.html'
import Ractive from 'ractive'
import ractiveTap from 'ractive-events-tap'
import smoothscroll from 'smoothscroll-polyfill';
import share from '../modules/share'
smoothscroll.polyfill();

export class Coastal {

	constructor(data, social) {

		var self = this

        this.toolbelt = new Toolbelt()

        this.googledoc = data

        this.social = social

        this.screenWidth = document.documentElement.clientWidth

        this.default = "Click on a location to see highlights from the walk"

        this.waypoints = this.googledoc.filter( (w) => w.EDITORIAL != "")

        this.preloader = document.getElementById("interactive_preloader")

        this.directory = (self.screenWidth > 960 ) ? "960" : (self.screenWidth > 640) ? "640" : "416" ;

        var hyperlapse = document.getElementById('waypoints');

        this.database = {

            blurb: self.default,

            waypoints: self.waypoints,

            initiated: true,

            isDesktop: false,

            isiOS: (/iPad|iPhone|iPod/.test(navigator.userAgent) && window.location.origin === "file://" || /iPad|iPhone|iPod/.test(navigator.userAgent) && window.location.origin === null) ? true : false,

            hyperWidth: hyperlapse.clientWidth,

            hyperHeight: hyperlapse.clientWidth * 0.56,

            directory: this.directory,

            lightbox: {

                active: false,

            }

        }

        this.ractivate()

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

        this.ractive.on('lite', function ( context ) {

            self.lite()

        });

        this.ractive.on('play', function(context, lat, lng, secs, ends, editorial, image) {

            self.player(lat, lng, secs, ends, editorial, image)

        })

        this.ractive.on( 'social', ( context, channel ) => {

            let shared = share(self.social.title, self.social.url, self.social.fbImg, self.social.twImg, self.social.twHash, self.social.message);
        
            shared(channel);

        });


        var video = document.getElementById("video_walk");

        document.getElementById("audio-switch").addEventListener('change',function(event) {

            video.muted = (document.getElementById("audio-switch").checked==false) ? true : false ;

        });

        self.preloader.style.display = "none" ; 

    }

    lite() {

        var video = document.getElementById("video_walk");

        if (video.paused) {

            video.play()

        } else {

            if (video.currentTime > 0 && !video.ended && video.readyState > 2) {

                video.pause()

            }

        }

    }

    panel() {

        var sidebar = document.getElementById("sidebar");

        sidebar.classList.toggle("hidebar");

        var map = document.getElementById("map");

        map.style.visibility = "hidden";

    }

    player(lat, lng, secs, ends, editorial, image) {

        var self = this

        self.database.blurb = editorial

        self.database.image = image

        self.ractive.set('blurb', self.database.blurb)

        self.ractive.set('image', self.database.image)

        var video = document.getElementById("video_walk");

        video.src = `https://interactive.guim.co.uk/2019/05/bondi_to_manly/${self.directory}/${image}.mp4`
        
        video.type = `video/mp4`
        
        video.poster = "";

        video.setAttribute(`playsinline`, true);

        video.play();

        if (self.screenWidth < 740) {

            self.scrollTo()
        }

    }

    resize() {

        var self = this

        window.addEventListener("resize", function() {

            clearTimeout(document.body.data)

            document.body.data = setTimeout( function() { 

                console.log("Resize")

            }, 200);

        });

        window.addEventListener("orientationchange", function() {
            
            console.log("orientationchange")
            
        }, false);


    }

    scrollTo() {

        var self = this

        var element = document.getElementById('walk_video');

        setTimeout(function() {

            var elementTop = window.pageYOffset + element.getBoundingClientRect().top

            window.scroll({
              top: elementTop,
              behavior: "smooth"
            });

        }, 400);

    }

}