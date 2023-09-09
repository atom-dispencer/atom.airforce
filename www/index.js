// iatom.uk



// TOUCH SCREENS

function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
}



// SCROLLING

function isUserAtTop() {
    return (document.documentElement.scrollTop || document.body.scrollTop) === 0;
}

var autoScrolling = false
var scrollTimeout;
addEventListener('scroll', function(e) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
        autoScrolling = false
    }, 100);
});

window.addEventListener("wheel", function (event) {

    if(autoScrolling) {
        event.preventDefault()
    }

    if (isUserAtTop() && event.deltaY > 0) {
        autoScrolling = true
        event.preventDefault()
        const elem = document.getElementById("main-section")
        console.log("Autoscrolling to " + elem)

        this.setTimeout(function () {
            elem.scrollIntoView({
                block: "center"
            })
        }, 100)
    }
}, {passive: false})




// BUTTONS

function openUrl(url) {
    if($('[name="openLinksInNewTabSwitch"]').is(':checked')) {
        open(url, "_blank")
    } else {
        open(url, "_self")
    }
}


// BURRING



const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const centreX = (elem) => elem.offset().left + (elem.width() / 2)
const centreY = (elem) => elem.offset().top + (elem.height() / 2)
const centre = (elem) => { x = centreX(elem), y = centreY(elem) }

// Blur intro as you scroll
$(window).scroll(function () {
    var BLUR_MODULUS = 50
    var BLUR_MAX_PX = 250

    var pixs = $(window).scrollTop() / BLUR_MODULUS
    pixs = Math.min(pixs, BLUR_MAX_PX)
    var newCss = {
        "-webkit-filter": "blur(" + pixs + "px)",
        "filter": "blur(" + pixs + "px)"
    }
    $(".intro").css(newCss)
});

// Blur left and right subheadings as you move
$(window).mousemove(function (event) {
    var shLeft = $('#subheading-left')
    var shRight = $('#subheading-right')

    var minX = shLeft.offset().left + (shLeft.width() / 2)
    var maxX = shRight.offset().left + (shRight.width() / 2)
    var mouseX = event.pageX
    var mouseY = event.pageY
    var width = maxX - minX

    var clampMX = clamp(mouseX, minX, maxX)
    var percent = (clampMX - minX) / (width)
    var blurScale = Math.pow(percent, 3)

    function shBlur(sh, scale) {
        var BLUR_MAX_PX = 5
        var blur = BLUR_MAX_PX * scale

        var newCss = {
            "-webkit-filter": "blur(" + blur + "px)",
            "filter": "blur(" + blur + "px)"
        }
        sh.css(newCss)
    }
    function shTranslate(sh, scale) {
        var tX = scale * 10
        tX = Math.sqrt(Math.abs(scale)) * (scale < 0 ? -1 : 1)
        var newCss = {
            "transform": "translate(" + tX + "%)"
        }
        sh.css(newCss)
    }
    if(isTouchDevice()) {
        shBlur(shLeft, 0)
        shBlur(shRight, 0)
        shTranslate(shLeft, 0)
        shTranslate(shRight, 0)
    } else {
        shBlur(shLeft, blurScale)
        shBlur(shRight, 1 - blurScale)
        shTranslate(shLeft, mouseX / $(window).width())
        shTranslate(shRight, mouseX / $(window).width())
    }
});