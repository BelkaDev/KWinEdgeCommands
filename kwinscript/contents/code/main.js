(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const DomParser = require("dom-parser");
const parser = new DomParser();

const registeredBorders = [];

function execSync(method) {
  return () =>
    callDBus(
      "com.belka.edgescript",
      "/Commands",
      "com.belka.edgescript",
      method
    );
}
function init() {
  for (var i in registeredBorders) {
    unregisterScreenEdge(registeredBorders[i]);
  }
  var borders = readConfig("BorderActivate", "").toString().split(",");
  for (var i in borders) {
    var border = parseInt(borders[i]);
    if (isFinite(border)) {
      registeredBorders.push(border);
      registerScreenEdge(border, execSync("gogogo"));
    }
  }
}

options.configChanged.connect(init);

init();

},{"dom-parser":2}],2:[function(require,module,exports){
var DomParser = require('./lib/DomParser');
module.exports = DomParser;

},{"./lib/DomParser":4}],3:[function(require,module,exports){
var
  tagRegExp          = /(<\/?[a-z][a-z0-9]*(?::[a-z][a-z0-9]*)?\s*(?:\s+[a-z0-9-_]+=(?:(?:'[\s\S]*?')|(?:"[\s\S]*?")))*\s*\/?>)|([^<]|<(?![a-z\/]))*/gi,
  attrRegExp         = /\s[a-z0-9-_]+\b(\s*=\s*('|")[\s\S]*?\2)?/gi,
  splitAttrRegExp    = /(\s[a-z0-9-_]+\b\s*)(?:=(\s*('|")[\s\S]*?\3))?/gi,
  startTagExp        = /^<[a-z]/,
  selfCloseTagExp    = /\/>$/,
  closeTagExp        = /^<\//,
  nodeNameExp        = /<\/?([a-z][a-z0-9]*)(?::([a-z][a-z0-9]*))?/i,
  attributeQuotesExp = /^('|")|('|")$/g,
  noClosingTagsExp   = /^(?:area|base|br|col|command|embed|hr|img|input|link|meta|param|source)/i;

var Node = require('./Node');

function findByRegExp(html, selector, onlyFirst) {

  var
    result        = [],
    tagsCount     = 0,
    tags          = html.match(tagRegExp),
    composing     = false,
    currentObject = null,
    matchingSelector,
    fullNodeName,
    selfCloseTag,
    attributes,
    attrBuffer,
    attrStr,
    buffer,
    tag;

  for (var i = 0, l = tags.length; i < l; i++) {

    tag = tags[i];
    fullNodeName = tag.match(nodeNameExp);

    matchingSelector = selector.test(tag);

    if (matchingSelector && !composing){
      composing = true;
    }

    if (composing) {

      if (startTagExp.test(tag)) {
        selfCloseTag = selfCloseTagExp.test(tag) || noClosingTagsExp.test(fullNodeName[1]);
        attributes = [];
        attrStr = tag.match(attrRegExp) || [];
        for (var aI = 0, aL = attrStr.length; aI < aL; aI++) {
          splitAttrRegExp.lastIndex = 0;
          attrBuffer = splitAttrRegExp.exec(attrStr[aI]);
          attributes.push({
            name: attrBuffer[1].trim(),
            value: (attrBuffer[2] || '').trim().replace(attributeQuotesExp, '')
          });
        }

        ((currentObject && currentObject.childNodes) || result).push(buffer = new Node({
          nodeType: 1, //element node
          nodeName: fullNodeName[1],
          namespace: fullNodeName[2],
          attributes: attributes,
          childNodes: [],
          parentNode: currentObject,
          startTag: tag,
          selfCloseTag: selfCloseTag
        }));
        tagsCount++;

        if (!onlyFirst && matchingSelector && currentObject){
          result.push(buffer);
        }

        if (selfCloseTag) {
          tagsCount--;
        }
        else {
          currentObject = buffer;
        }

      }
      else if (closeTagExp.test(tag)) {
        if (currentObject.nodeName == fullNodeName[1]){
          currentObject = currentObject.parentNode;
          tagsCount--;
        }
      }
      else {
        currentObject.childNodes.push(new Node({
          nodeType: 3,
          text: tag,
          parentNode: currentObject
        }));
      }

      if (tagsCount == 0) {
        composing = false;
        currentObject = null;

        if (onlyFirst){
          break;
        }
      }

    }

  }

  return onlyFirst ? result[0] || null : result;
}


function Dom(rawHTML) {
  this.rawHTML = rawHTML;
}

Dom.prototype.getElementsByClassName = function (className) {
  var selector = new RegExp('class=(\'|")(.*?\\s)?' + className + '(\\s.*?)?\\1');
  return findByRegExp(this.rawHTML, selector);
};

Dom.prototype.getElementsByTagName = function (tagName) {
  var selector = new RegExp('^<'+tagName, 'i');
  return findByRegExp(this.rawHTML, selector);
};

Dom.prototype.getElementById = function(id){
  var selector = new RegExp('id=(\'|")' + id + '\\1');
  return findByRegExp(this.rawHTML, selector, true);
};

Dom.prototype.getElementsByName = function(name){
    return this.getElementsByAttribute('name', name);
};

Dom.prototype.getElementsByAttribute = function(attr, value){
  var selector = new RegExp('\\s' + attr + '=(\'|")' + value + '\\1');
  return findByRegExp(this.rawHTML, selector);
};


module.exports = Dom;

},{"./Node":5}],4:[function(require,module,exports){
var Dom = require('./Dom');

function DomParser() {
}

DomParser.prototype.parseFromString = function (html) {
  return new Dom(html);
};

module.exports = DomParser;
},{"./Dom":3}],5:[function(require,module,exports){
//https://developer.mozilla.org/en-US/docs/Web/API/Element


function Node(cfg) {

  this.namespace     = cfg.namespace || null;
  this.text          = cfg.text;
  this._selfCloseTag = cfg.selfCloseTag;


  Object.defineProperties(this, {
    nodeType: {
      value: cfg.nodeType
    },
    nodeName: {
      value: cfg.nodeType == 1 ? cfg.nodeName : '#text'
    },
    childNodes: {
      value: cfg.childNodes
    },
    firstChild: {
      get: function(){
        return this.childNodes[0] || null;
      }
    },
    lastChild: {
      get: function(){
        return this.childNodes[this.childNodes.length-1] || null;
      }
    },
    parentNode: {
      value: cfg.parentNode || null
    },
    attributes: {
      value: cfg.attributes || []
    },
    innerHTML: {
      get: function(){
        var
          result = '',
          cNode;
        for (var i = 0, l = this.childNodes.length; i < l; i++) {
          cNode = this.childNodes[i];
          result += cNode.nodeType === 3 ? cNode.text : cNode.outerHTML;
        }
        return result;
      }
    },
    outerHTML: {
      get: function(){
        if (this.nodeType != 3){
          var
            str,
            attrs = (this.attributes.map(function(elem){
              return elem.name + (elem.value ? '=' + '"'+ elem.value +'"' : '');
            }) || []).join(' '),
            childs = '';

          str = '<' + this.nodeName + (attrs ? ' ' + attrs : '') + (this._selfCloseTag ? '/' : '') + '>';

          if (!this._selfCloseTag){
            childs = (this._selfCloseTag ? '' : this.childNodes.map(function(child){
              return child.outerHTML;
            }) || []).join('');

            str += childs;
            str += '</' + this.nodeName + '>';
          }
        }
        else{
          str = this.textContent;
        }
        return str;
      }
    },
    textContent: {
      get: function(){
        if (this.nodeType == Node.TEXT_NODE){
          return this.text;
        }
        else{
          return this.childNodes.map(function(node){
            return node.textContent;
          }).join('').replace(/\x20+/g, ' ');
        }
      }
    }
  });
}

Node.prototype.getAttribute = function (attributeName) {
  for (var i = 0, l = this.attributes.length; i < l; i++) {
    if (this.attributes[i].name == attributeName) {
      return this.attributes[i].value;
    }
  }
  return null;
};

function searchElements(root, conditionFn, onlyFirst){
  var result = [];
  onlyFirst = !!onlyFirst;
  if (root.nodeType !== 3) {
    for (var i = 0, l = root.childNodes.length; i < l; i++) {
      if (root.childNodes[i].nodeType !== 3 && conditionFn(root.childNodes[i])) {
        result.push(root.childNodes[i]);
        if (onlyFirst){
          break;
        }
      }
      result = result.concat(searchElements(root.childNodes[i], conditionFn));
    }
  }
  return onlyFirst ? result[0] : result;
}

Node.prototype.getElementsByTagName = function (tagName) {
  return searchElements(this, function(elem){
    return elem.nodeName == tagName;
  })
};

Node.prototype.getElementsByClassName = function (className) {
  var expr = new RegExp('^(.*?\\s)?' + className + '(\\s.*?)?$');
  return searchElements(this, function(elem){
    return elem.attributes.length && expr.test(elem.getAttribute('class'));
  })
};

Node.prototype.getElementById = function (id) {
  return searchElements(this, function(elem){
    return elem.attributes.length && elem.getAttribute('id') == id;
  }, true)
};

Node.prototype.getElementsByName = function (name) {
  return searchElements(this, function(elem){
    return elem.attributes.length && elem.getAttribute('name') == name;
  })
};


Node.ELEMENT_NODE = 1;
Node.TEXT_NODE    = 3;

module.exports = Node;
},{}]},{},[1]);
