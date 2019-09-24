"use strict";

/**
 * "This is completely intentional."
 * https://bugs.webkit.org/show_bug.cgi?id=141832#c5
 *
 * @return {Boolean}
 */
const isTallerThanViewport = () => {
  return window.innerHeight !== document.documentElement.clientHeight;
};

/**
 * @return {Boolean}
 */
const couldHaveSmartAppBanner = () => {
  return window.navigator.vendor === "Apple Computer, Inc." &&
    "platform" in window.navigator &&
    (
      window.navigator.platform === "iPhone" ||
      window.navigator.platform === "iPad"
    );
};

/**
 * @return {Boolean}
 */
const isSmartAppBannerVisible = () => {
  return window.innerHeight - document.documentElement.clientHeight < 0;
};

/**
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
const isElementInViewport = (el) => {
  let clientRect = el.getBoundingClientRect();

  return parseInt(clientRect.top, 10) >= 0 &&
    parseInt(clientRect.left, 10) >= 0 &&
    parseInt(clientRect.bottom, 10) <= window.innerHeight &&
    parseInt(clientRect.right, 10) <= window.innerWidth;
};

const centerDebugging = () => {
  let el = document.querySelector(".debugging");

  // let clientRect = el.getBoundingClientRect();

  // if (clientRect.height > window.innerHeight) {
  //   el.style.fontSize = "12px";
  //   el.style.maxHeight = `calc(${window.innerHeight}px - 3rem)`;
  //   el.style.overflowY = "auto";
  //   console.log(`calc(${window.innerHeight}px - 2rem)`)
  // } else {
  //   el.style.fontSize = null;
  //   el.style.maxHeight = null;
  //   el.style.overflowY = null;
  // }

  if (isSmartAppBannerVisible()) {
    let marginTop = (window.innerHeight - document.documentElement.clientHeight) / 2;
    el.style.marginTop = `${marginTop}px`;
  } else {
    el.style.marginTop = null;
  }
};

const handleMagic = () => {
  if (isTallerThanViewport()) {
    let diff = document.documentElement.clientHeight - window.innerHeight;
    diff = diff < 0 ? 0 : diff;
    document.querySelector(".stuck--top.with-magic").style.top = `${diff}px`;
    document.querySelector(".stuck--bottom.with-magic").style.bottom = `${diff}px`;
  } else {
    document.querySelector(".stuck--top.with-magic").style.top = null;
    document.querySelector(".stuck--bottom.with-magic").style.bottom = null;
  }
};

const CHECK_HEIGHT = [
  {
    label: "100vh",
    selector: ".tester--viewport-height",
  },
  {
    label: "available",
    selector: ".tester--available",
  },
  {
    label: "stretch",
    selector: ".tester--stretch",
  },
  {
    label: "calc / var",
    selector: ".tester--calc",
  },
];

const BOOL_METHODS = Object.freeze([
  "isTallerThanViewport",
  "couldHaveSmartAppBanner",
  "isSmartAppBannerVisible",
]);

const CHECK_VISIBILITY = [
  "bottom",
  "top",
];

const writeDebuggingData = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

  centerDebugging();
  handleMagic();

  const correctValue = window.innerHeight;

  let debuggingData = `
    <table class="mb-2">
      <caption class="mb-1">Height checks</caption>
      <tr class="is-correct">
        <td>innerHeight</td>
        <td>${window.innerHeight}</td>
      </tr>
      <tr class="${window.innerHeight === document.documentElement.clientHeight ? "is-correct" : ""}">
        <td>clientHeight</td>
        <td>${document.documentElement.clientHeight}</td>
      </tr>
  `;

  CHECK_HEIGHT.forEach(testingCase => {
    let height = document.querySelector(testingCase.selector).getBoundingClientRect().height;
    debuggingData += `
      <tr class="${height === correctValue ? "is-correct" : ""}">
        <td>${testingCase.label}</td>
        <td>${height}</td>
      </tr>
    `;
  });

  debuggingData += `
    </table>
    <table class="mb-2">
      <caption class="mb-1">Can fully see fixed elements?</caption>
  `;

  CHECK_VISIBILITY.forEach(location => {
    let val = isElementInViewport(document.querySelector(`.stuck--${location}`)) ? "yes" : "no";
    debuggingData += `
      <tr class="${val === "yes" ? "is-correct" : ""}">
        <td>${location}</td>
        <td>${val}</td>
      </tr>
    `;
  });

  CHECK_VISIBILITY.forEach(location => {
    let val = isElementInViewport(document.querySelector(`.stuck--${location}.with-magic`)) ? "yes" : "no";
    debuggingData += `
      <tr class="${val === "yes" ? "is-correct" : ""}">
        <td>with magic: ${location}</td>
        <td>${val}</td>
      </tr>
    `;
  });

  debuggingData += `
    </table>
    <table>
      <caption class="mb-1">Is something fishy?</caption>
  `;

  BOOL_METHODS.forEach(methodName => {
    debuggingData += `
      <tr>
        <td>${methodName}</td>
        <td>${eval(`${methodName}()`) ? "yes" : "no"}</td>
      </tr>
    `;
  });

  debuggingData += "</table>";

  document.querySelector(".debugging").innerHTML = debuggingData;
}

writeDebuggingData();

let requestID;

const EVENTS = ["resize", "scroll"];

EVENTS.forEach(eventName => {
  window.addEventListener(eventName, () => {
    if (requestID) {
      window.cancelAnimationFrame(requestID);
    }

    requestID = window.requestAnimationFrame(() => {
      writeDebuggingData();
    });
  }, {passive: true});
});
