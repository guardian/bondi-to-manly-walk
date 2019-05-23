import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/template.html'
import Ractive from 'ractive'
import ractiveTap from 'ractive-events-tap'

export class Coastal {

	constructor(data) {

		var self = this

        this.toolbelt = new Toolbelt()

        this.googledoc = data

        this.screenWidth = document.documentElement.clientWidth

        this.screenHeight = document.documentElement.clientHeight

        this.default = "Click on a popular Sydney location"

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

        var i = 0;

        self.directory = "gear9"

        self.screen_res = "416"

        while (self.bitrate[i].width < self.screenWidth && i < self.bitrate.length) {

          self.directory = self.bitrate[i].directory

          self.screen_res = self.bitrate[i].width

          i++;

        }

        console.log(self.screen_res)

        this.database = {

            blurb: self.default,

            waypoints: self.waypoints,

            directory: self.directory,

            initiated: true,

            isDesktop: false
        }

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

            var sidebar = document.getElementById("sidebar");

            sidebar.classList.toggle("hidebar");

            var map = document.getElementById("map");

            map.style.visibility = "hidden";

        });

        this.ractive.on('play', function(context, lat, lng, secs, ends, editorial, image) {

            console.log("Play video " + image)

            self.database.blurb = editorial

            self.database.image = image

            self.ractive.set('blurb', self.database.blurb)

            self.ractive.set('image', self.database.image)

            var video = document.getElementById("video_walk");

            video.src = `https://interactive.guim.co.uk/2019/03/bondi-to-manly/hyperlapse.mp4` //${self.path}/hyperlapse${self.vidType.src}`;
            
            video.type = `video/mp4`
            
            video.muted = true;

            video.play();


        })

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
}