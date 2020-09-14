/*
 * Imports
 */
// npm
import gsap from "gsap";
// libs
import { navigationLeftSelector } from './_constants';


const defaultAnimationProps = {
    canvasContainerSelector: '#container',
    infoSelector: '#codes__info',
    playInfo: true,
    duration: 0.7,
    stagger: 0.2,
}

/*
 * Exports
 */
export function playEnterAnimation(animationProps = defaultAnimationProps) {
    let { duration, stagger, playInfo, canvasContainerSelector } = animationProps;

    if (duration === undefined) {
        duration = defaultAnimationProps.duration;
    }
    if (stagger === undefined) {
        stagger = defaultAnimationProps.stagger;
    }

    const tl = gsap.timeline({ defaults: { duration, stagger } });
    tl.fromTo(canvasContainerSelector,
        {
            opacity: 0,
            y: 30,
        },
        {
            opacity: 1,
            y: 0,
        })
        .fromTo(navigationLeftSelector,
            {
                opacity: 0,
                x: 30
            },
            {
                opacity: 1,
                x: 0,
                duration: duration / 2
            });

    if (playInfo) {
        const { infoSelector } = animationProps;
        tl.fromTo(infoSelector,
            {
                opacity: 0,
                y: -30
            },
            {
                opacity: 1,
                y: 0,
                duration: duration
            });
    }
}
