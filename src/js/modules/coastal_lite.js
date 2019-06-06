import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/template.html'
import Ractive from 'ractive'
import ractiveTap from 'ractive-events-tap'
import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

export class Coastal {

	constructor(data) {

		var self = this

        this.toolbelt = new Toolbelt()

        this.googledoc = data

        this.screenWidth = document.documentElement.clientWidth

        this.default = "Click on a popular Sydney location"

        this.waypoints = this.googledoc.filter( (w) => w.EDITORIAL != "")

        this.directory = (self.screenWidth > 960 ) ? "960" : (self.screenWidth > 640) ? "640" : "416" ;

        this.database = {

            blurb: self.default,

            waypoints: self.waypoints,

            initiated: true,

            isDesktop: false,

            directory: this.directory,

            lightbox: {

                active: false,

            }

        }

        document.getElementById("slideshow_caption").innerHTML = "Young teens skim rocks at off picturesque Cremorne Point."

        this.ractivate()

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

            self.panel()

        });

        this.ractive.on('lite', function ( context ) {

            self.lite()

        });

        this.ractive.on('play', function(context, lat, lng, secs, ends, editorial, image) {

            self.player(lat, lng, secs, ends, editorial, image)

        })

        this.hyperlapse()

        var video = document.getElementById("video_walk");

        document.getElementById("audio-switch").addEventListener('change',function(event) {

            video.muted = (document.getElementById("audio-switch").checked==false) ? true : false ;

        });

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