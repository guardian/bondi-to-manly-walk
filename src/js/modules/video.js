import Hls from 'hls.js'

export class videoPlayer {

    constructor(element, path, width=480, isMobile) {

        var self = this

        this.element = element

        this.path = path

        this.width = width

        this.isMobile = isMobile

        this.startLevel = this.getHlsLevel(self.width)

        this.vidType = this.checker()

    }

    init() {

        var self = this

        return new Promise((resolve, reject) => {

            if (self.vidType.src === '.m3u8') {

                /*
                1 416
                2 480
                3 640
                5 960
                7 1280
                9 1920
                */

                var hls = new Hls( { autoStartLoad : true } );

                hls.attachMedia(video);
                hls.on(Hls.Events.MEDIA_ATTACHED, function () {

                    hls.loadSource( `${self.path}/hyperlapse/index.m3u8` );

                    resolve(true); 

                });

            } else {

                let dir = self.getBestVideo(width)

                self.element.src = `${self.path}/hyperlapse${self.vidType.src}`;
                self.element.type = self.vidType.type;
                //self.element.poster = `${self.path}/hyperlapse.jpg`

                resolve(true); 

            }

        })

    }

    checker() {

        var self = this

        var attributes = { src: '.mp4', type: 'video/mp4' }

        var isApp = (window.location.origin === "file://" && /(android)/i.test(navigator.userAgent) || window.location.origin === "file://" && /(iPad)/i.test(navigator.userAgent)) ? true : false;

        // if (Hls.isSupported() && this.isMobile == false && navigator.userAgent.toLowerCase().indexOf('firefox') == -1)

        if (Hls.isSupported()) {

            attributes = { src: '.m3u8', type: 'application/x-mpegURL' }

        } else {

            let sUsrAg = navigator.userAgent;

            if (sUsrAg.indexOf("Opera") > -1) {

                //attributes = { src: '.ogv', type: 'video/ogg' }

            } else if (sUsrAg.indexOf("Firefox") > -1) {

                //attributes = { src: '.ogv', type: 'video/ogg' }

            }

        }

        return  attributes

    }

    getHlsLevel(width) {

        return (width < 416) ? 1 :
            (width < 480) ? 2 :
            (width < 640) ? 3 :
            (width < 960) ? 5 :
            (width < 1280) ? 7 : 9 ;

    }

    getBestVideo(width) {

        return (width < 640) ? 320 :
            (width < 1024) ? 640 :
            (width < 1420) ? 1024 : 1920 ;

    }

}

