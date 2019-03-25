import Hls from 'hls.js'

export class videoPlayer {

    constructor(element, path, directory, width=480, isMobile) {

        var self = this

        this.element = element

        this.path = path

        this.directory = directory

        this.width = width

        this.isMobile = isMobile

        this.vidType = this.checker()

    }

    init() {

        var self = this

        return new Promise((resolve, reject) => {

            if (self.vidType.src === '.m3u8') {

                var hls = new Hls( { autoStartLoad : true, muted : true } );

                hls.attachMedia(video);
                hls.on(Hls.Events.MEDIA_ATTACHED, function () {

                    hls.loadSource( `${self.path}/hyperlapse/${self.directory}/prog_index.m3u8` );

                    resolve(true); 

                });

            } else {

                self.element.src = `${self.path}/hyperlapse${self.vidType.src}`;
                self.element.type = self.vidType.type;
                self.element.muted = true;
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

}

