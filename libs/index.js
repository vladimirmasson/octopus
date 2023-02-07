
import "./../styles/style.scss";

import Octopus from "./Octopus"
import { options } from "./helper/options";

import { startAnimation, playTranslateAnim } from "./StringAnimation"
import { CheckContent } from "./helper/Safety";

const line_1 = document.querySelector(".symbols").children[0];
const line_3 = document.querySelector(".symbols").children[1];

playTranslateAnim(line_1, 31000, true);
playTranslateAnim(line_3, 31000, true);

//#####################

const bigText_1 = document.querySelector(".big_text").children[0];
const bigText_2 = document.querySelector(".big_text").children[1];
const bigText_3 = document.querySelector(".big_text").children[2];
const setStyle = (div, opacity, translateX) => {
    div.style.opacity = opacity;
    div.style.transform = `translateX(${translateX}px)`;
}
addEventListener("scroll", (event) => {
    const currentScroll = document.body.scrollTop;

    const percent = Math.min(currentScroll / 359, 1);
    const percent2 = percent < 0.7 ? 0 : (percent - 0.6) / (1 - .6);

    CheckContent(bigText_1);
    CheckContent(bigText_2);
    CheckContent(bigText_3);
    setStyle(bigText_1, 1 - percent2, window.innerWidth * 0.8 * percent)
    setStyle(bigText_2, 1 - percent2, -window.innerWidth * 0.4 * percent)
    setStyle(bigText_3, 1 - percent2, window.innerWidth * 0.6 * percent)

});

//#####################
[...document.querySelectorAll(".line .left"),
...document.querySelectorAll(".line .right")].
    forEach(element => {
        element.addEventListener('mouseover', function (ev) {
            const target = ev.target;

            var baseText = target.getAttribute('baseText');
            if (baseText) {

            } else {
                target.setAttribute("baseText", target.textContent);
                baseText = target.textContent;
            }
            // console.log(`[${target.textContent}]`,
            //     `[${baseText}]`)
            startAnimation(target,
                target.textContent,
                baseText, 400)
        });
    })

//#####################

/* options.gui.addButton({ title: "startAnim" }).on('click', () => {
    startLoadingAnimation();
})

options.gui.addInput(options, 'duration', { step: 100 }).on('change', (ev) => {
});
options.gui.addInput(options, 'percentD', { min: 0, max: 1, step: 0.01 }).on('change', (ev) => {
});

options.gui.addInput(options, 'countC', { min: 1, max: 50 }).on('change', (ev) => {
}); */



// //@ts-ignore
// window.game = game;

window.initAnimation = () => { }

const loading_div = document.getElementsByClassName('loading')[0];
const content_div = document.getElementsByClassName('content')[0];

const startLoadingAnimation = () => {
    startAnimation(loading_div, "", "Loading_", options.duration, () => {
        startFakeLoading(loading_div, "Loading_", 800)
    })
};


const octopus = new Octopus();

function startFakeLoading(div, startText, duration) {

    const countAnim = 30;
    const distanceI = 100 / countAnim;
    const delay = duration / countAnim;
    for (let i = 0; i <= countAnim; ++i) {
        setTimeout(() => {
            div.textContent = `${startText}${Math.floor(i * distanceI)}%`;
        }, delay * i);
    }

    setTimeout(() => {
        finishAvait()
    }, duration + 300);
}


const mainCanvas = document.getElementById("orbitControl");
mainCanvas.style.display = 'none';

function finishAvait() {
    if (octopus.loaded != 1) {
        setTimeout(() => {
            finishAvait();
        }, 2000)

        startAnimation(loading_div, "Loading_100%", "Loading_100%", 800)
        return;
    }

    startMainPage()
}


if (options.hasLocal) {
    startMainPage();
} else {
    startLoadingAnimation();
}

function startMainPage() {
    loading_div.style.display = 'none';
    mainCanvas.style.display = 'block';
    content_div.style.display = 'block';
}
addEventListener("scroll", (event) => {
    const currentScroll = document.body.scrollTop;

    const scrollTo = document.body.scrollHeight - window.innerHeight

    const scrollFrom = 0;
    var percent = (currentScroll - scrollFrom) / (scrollTo - scrollFrom);
    percent = Math.max(0, percent);
    // console.log(percent)

    octopus.rotate(percent)
})


