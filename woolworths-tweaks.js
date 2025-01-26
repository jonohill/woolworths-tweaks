// ==UserScript==
// @name        Woolworths Tweaks
// @description Tweaks for woolworths.co.nz
// @match       *://*.woolworths.co.nz/*
// ==/UserScript==

// @ts-check

/** 
 * Replace everyday rewards points with dollar value 
 * @param {Node} node
 */
function monetiseEdrPoints(node) {
    const CONVERSION_RATE = 15 / 2000;
    const RE_POINTS = /(\d+) points/;
    const SELECTORS = [
        '.isBoostOffer .productStrap-text',
        '.boost-strap p',
        '.boost-details-card__body__content__header',
        '.card-boost__info-title span',
    ];

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const element = /** @type {Element} */ (node);

    // Try child elements
    for (const selector of SELECTORS) {
        const matchingDescendants = element.querySelectorAll(selector);
        matchingDescendants.forEach(monetiseEdrPoints);
    }

    if (!element.textContent) {
        return;
    }

    if (!SELECTORS.some((selector) => element.matches(selector))) {
        return;
    }

    const match = RE_POINTS.exec(element.textContent);
    if (match) {
        const points = parseInt(match[1]);
        const value = points * CONVERSION_RATE;

        const beforeText = element.textContent.substring(0, match.index);
        const afterText = element.textContent.substring(match.index + match[0].length);

        element.textContent = `${beforeText}$${value.toFixed(2)}${afterText}`;
    }
}

const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {

        mutation.addedNodes.forEach(monetiseEdrPoints);
        monetiseEdrPoints(mutation.target);

    }
});

const config = {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
};
observer.observe(document.body, config);
