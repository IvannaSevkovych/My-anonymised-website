import gsap from "gsap";
import barba from '@barba/core';

import { startMain, stopMain } from '../main';
import { startPortfolio, stopPortfolio } from '../portfolio';
import { startPortfolioVis, stopPortfolioVis } from '../portfolio_vis';
import { startPortfolioCodes, stopPortfolioCodes } from '../portfolio_codes';
import { startAboutMe, stopAboutMe } from '../about_me';
import { startDistortion, stopDistortion } from '../portfolio_codes_distortion';
import { startMasonry, stopMasonry } from '../portfolio_codes_masonry';
import { startMorphoDots, stopMorphoDots } from '../portfolio_codes_morphoDots';
import { startRex, stopRex } from '../portfolio_codes_rex';
import { startVolcano, stopVolcano } from '../portfolio_codes_volcano';

barba.init({
  transitions: [{
    name: 'default-transition',
    leave(data) {
      return gsap.to(data.current.container, {
        opacity: 0,
        onComplete: () => $("#loader_wrapper").fadeIn("fast")
      });
    },
    // enter(data) {
    //   return $("#loader_wrapper").fadeOut("slow");
    // }
  }],
  views: [{
    namespace: 'main.js',
    beforeEnter() {
      startMain();
    },
    afterLeave() {
      stopMain();
    }
  }, {
    namespace: 'portfolio.js',
    beforeEnter() {
      startPortfolio();
    },
    afterLeave() {
      stopPortfolio();
    }
  }, {
    namespace: 'about_me.js',
    beforeEnter() {
      startAboutMe();
    },
    afterLeave() {
      stopAboutMe();
    }
  }, {
    namespace: 'portfolio_vis.js',
    beforeEnter() {
      startPortfolioVis();
    },
    afterLeave() {
      stopPortfolioVis();
    }
  }, {
    namespace: 'portfolio_codes.js',
    beforeEnter() {
      startPortfolioCodes();
    },
    afterLeave() {
      stopPortfolioCodes();
    }
  }, {
    namespace: 'portfolio_codes_distortion.js',
    beforeEnter() {
      startDistortion();
    },
    afterLeave() {
      stopDistortion();
    }
  }, {
    namespace: 'portfolio_codes_masonry.js',
    beforeEnter() {
      startMasonry();
    },
    afterLeave() {
      stopMasonry();
    }
  }, {
    namespace: 'portfolio_codes_morphoDots.js',
    beforeEnter() {
      startMorphoDots();
    },
    afterLeave() {
      stopMorphoDots();
    }
  }, {
    namespace: 'portfolio_codes_rex.js',
    beforeEnter() {
      startRex();
    },
    afterLeave() {
      stopRex();
    }
  }, {
    namespace: 'portfolio_codes_volcano.js',
    beforeEnter() {
      startVolcano();
    },
    afterLeave() {
      stopVolcano();
    }
  }]
});

export function goto(url) {
  barba.go(url);
}

