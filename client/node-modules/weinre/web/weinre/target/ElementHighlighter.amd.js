;modjewel.define("weinre/target/ElementHighlighter", function(require, exports, module) { // Generated by CoffeeScript 1.8.0
var ElementHighlighter, canvasAvailable, currentHighlighterElement, fromPx, getMetricsForElement, highlighterClass, supportsCanvas;

canvasAvailable = null;

highlighterClass = null;

currentHighlighterElement = null;

module.exports = ElementHighlighter = (function() {
  ElementHighlighter.create = function() {
    if (highlighterClass == null) {
      highlighterClass = require('./ElementHighlighterDivs2');
    }
    return new highlighterClass();
  };

  function ElementHighlighter() {
    this.hElement = this.createHighlighterElement();
    this.hElement.__weinreHighlighter = true;
    this.hElement.style.display = "none";
    this.hElement.style.zIndex = 10 * 1000 * 1000;
    if (currentHighlighterElement) {
      document.body.removeChild(currentHighlighterElement);
    }
    currentHighlighterElement = this.hElement;
    document.body.appendChild(this.hElement);
  }

  ElementHighlighter.prototype.on = function(element) {
    if (null === element) {
      return;
    }
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    this.redraw(getMetricsForElement(element));
    return this.hElement.style.display = "block";
  };

  ElementHighlighter.prototype.off = function() {
    return this.hElement.style.display = "none";
  };

  return ElementHighlighter;

})();

getMetricsForElement = function(element) {
  var cStyle, el, left, metrics, top;
  metrics = {};
  left = 0;
  top = 0;
  el = element;
  while (true) {
    left += el.offsetLeft;
    top += el.offsetTop;
    if (!(el = el.offsetParent)) {
      break;
    }
  }
  metrics.x = left;
  metrics.y = top;
  cStyle = document.defaultView.getComputedStyle(element);
  metrics.width = element.offsetWidth;
  metrics.height = element.offsetHeight;
  metrics.marginLeft = fromPx(cStyle["margin-left"] || cStyle["marginLeft"]);
  metrics.marginRight = fromPx(cStyle["margin-right"] || cStyle["marginRight"]);
  metrics.marginTop = fromPx(cStyle["margin-top"] || cStyle["marginTop"]);
  metrics.marginBottom = fromPx(cStyle["margin-bottom"] || cStyle["marginBottom"]);
  metrics.borderLeft = fromPx(cStyle["border-left-width"] || cStyle["borderLeftWidth"]);
  metrics.borderRight = fromPx(cStyle["border-right-width"] || cStyle["borderRightWidth"]);
  metrics.borderTop = fromPx(cStyle["border-top-width"] || cStyle["borderTopWidth"]);
  metrics.borderBottom = fromPx(cStyle["border-bottom-width"] || cStyle["borderBottomWidth"]);
  metrics.paddingLeft = fromPx(cStyle["padding-left"] || cStyle["paddingLeft"]);
  metrics.paddingRight = fromPx(cStyle["padding-right"] || cStyle["paddingRight"]);
  metrics.paddingTop = fromPx(cStyle["padding-top"] || cStyle["paddingTop"]);
  metrics.paddingBottom = fromPx(cStyle["padding-bottom"] || cStyle["paddingBottom"]);
  metrics.x -= metrics.marginLeft;
  metrics.y -= metrics.marginTop;
  return metrics;
};

fromPx = function(string) {
  return parseInt(string.replace(/px$/, ""));
};

supportsCanvas = function() {
  var element;
  element = document.createElement('canvas');
  if (!element.getContext) {
    return false;
  }
  if (element.getContext('2d')) {
    return true;
  }
  return false;
};

require("../common/MethodNamer").setNamesForClass(module.exports);

});
