(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:4000/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.tree = undefined;
	
	var _tree = __webpack_require__(1);
	
	var _tree2 = _interopRequireDefault(_tree);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var tree = exports.tree = _tree2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	__webpack_require__(2);
	
	var _nodes = __webpack_require__(6);
	
	var _nodes2 = _interopRequireDefault(_nodes);
	
	var _links = __webpack_require__(9);
	
	var _links2 = _interopRequireDefault(_links);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//import d3 from "d3"
	
	var actions = {};
	
	exports.default = tree;
	
	function tree() {
	
	  var instance = {},
	      state = {};
	
	  instance.dom = function (dom) {
	    return state.dom = dom, instance;
	  };
	  instance.flow = function (flow) {
	    return state.flow = flow, track(flow, state), instance;
	  };
	  instance.render = function () {
	    for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
	      data[_key] = arguments[_key];
	    }
	
	    return render.apply(undefined, [state].concat(data));
	  };
	
	  return instance;
	}
	
	function track(f, s) {
	  render(s, 'start', toObj(f), null, null);
	  nflow.logger(function (flow, name, newData, oldData) {
	    render(s, name, toObj(flow), toObj(newData), toObj(oldData));
	  });
	}
	
	function toObj(d) {
	  return d && d.name && d.name.isFlow ? d.toObj() : d;
	}
	
	function render(s, name) {
	  if (!s.d3dom) init(s);
	  //console.log('action', name, data)
	
	  for (var _len2 = arguments.length, data = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	    data[_key2 - 2] = arguments[_key2];
	  }
	
	  actions[name] && actions[name].apply(actions, [s].concat(data));
	  resizeSvg(s);
	
	  s.nodes = s.tree.nodes(s.root).reverse(), s.links = s.tree.links(s.nodes);
	
	  //Normalize for fixed-depth.
	  s.nodes.forEach(function (d) {
	    d.y = d.depth * 60;
	  });
	
	  s.render();
	}
	
	function init(s) {
	  s.nodeMap = {};
	  s.tree = d3.layout.tree();
	
	  //s.tree.nodeSize(function(d){ return [60,90]})
	  //s.tree.separation((a,b)=>Math.min(1,b.name.length))
	  s.diagonal = d3.svg.diagonal();
	  s.d3dom = d3.select(s.dom);
	  s.width = parseInt(s.d3dom.style('width'));
	  s.height = parseInt(s.d3dom.style('height'));
	  s.svg = s.d3dom.html("").append("svg");
	
	  s.d3g = s.svg.append('g').call(d3.behavior.zoom().scaleExtent([.2, 8]).on("zoom", zoom)).append('g');
	
	  s.d3g.append("rect").attr("class", "overlay").attr("width", s.width).attr("height", s.height);
	
	  s.d3links = s.d3g.append("g");
	  s.d3routes = s.d3g.append("g").classed('routes', true);
	  s.d3nodes = s.d3g.append("g");
	  s.margin = { top: 20, right: 40, bottom: 20, left: 20 };
	  s.delay = 0;
	  s.duration = 600;
	  s.nodes = [];
	  s.links = [];
	  s.showRoute = null;
	  s.d3g.attr("transform", "translate(" + s.margin.left + "," + s.margin.top + ")");
	
	  s.diagonal.projection(function (d) {
	    return [d.x, d.y];
	  });
	
	  s.render = function () {
	
	    (0, _nodes2.default)(s);
	    (0, _links2.default)(s);
	  };
	
	  function zoom() {
	    s.d3g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	  }
	}
	
	actions.listenerAdded = actions.listenerRemoved = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	};
	
	actions.start = function (s, f, newData, oldData) {
	  s.root = {
	    name: f.name,
	    id: f.guid,
	    parent: null,
	    children: [],
	    isNew: true,
	    numInstances: 1,
	    source: f
	  };
	  s.nodeMap[s.root.id] = s.root;
	};
	
	actions.create = function (s, f, newData, oldData) {
	  var p = s.nodeMap[f.guid];
	  if (!p) return;
	  p.children = p.children || [];
	  var existingNode = p.children.filter(function (c) {
	    return c.name == newData.name;
	  }).pop();
	
	  s.nodeMap[newData.guid] = {
	    name: newData.name,
	    id: newData.guid,
	    children: [],
	    isNew: true,
	    numInstances: 1,
	    x0: p.x0,
	    y0: p.y0,
	    source: newData
	  };
	
	  if (existingNode) {
	    removeNode(existingNode, s);
	    s.nodeMap[newData.guid].numInstances += existingNode.numInstances;
	    s.nodeMap[newData.guid].isNew = false;
	  }
	
	  p.children.push(s.nodeMap[newData.guid]);
	};
	
	actions.emit = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	  e.isFlow = true;
	};
	actions.emitted = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	};
	
	actions.cancel = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	};
	
	actions.childRemoved = function (s, f, oldParent) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.isRemoved = true;
	};
	
	actions.childAdded = function (s, f, newParent, oldParent) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.isRemoved = newParent == null;
	
	  // remove child from old parent
	  var oldP = oldParent && s.nodeMap[oldParent.guid];
	  if (oldP && newParent) oldP.children = oldP.children.filter(function (n) {
	    return n.id != f.guid;
	  });
	
	  // add to new parent
	  var newP = newParent && s.nodeMap[newParent.guid];
	  if (newP) {
	    newP.children = newP.children || [];
	    newP.children.push(e);
	  }
	};
	
	function removeNode(d, s) {
	  d.childen && d.children.forEach(function (n) {
	    return removeNode(n, s);
	  });
	  if (d.parent) d.parent.children = d.parent.children.filter(function (n) {
	    return n.id != d.id;
	  });
	  delete s.nodeMap[d.id];
	}
	
	function resizeSvg(s) {
	  var width = s.width - s.margin.right - s.margin.left,
	      height = s.height - s.margin.top - s.margin.bottom;
	  s.tree.size([width, height]);
	  s.root.x0 = s.root.x = width / 2 + s.margin.left;
	  s.root.y0 = s.root.y = 0;
	
	  s.svg.attr("width", s.width).attr("height", s.height);
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderNodes;
	
	var _paths = __webpack_require__(7);
	
	var _utils = __webpack_require__(8);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function renderNodes(s) {
	  // Update the nodes…
	  var node = s.d3nodes.selectAll("g.node").data(s.nodes, function (d) {
	    return d.id;
	  });
	
	  var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function (d) {
	    return "translate(" + d.x0 + "," + d.y0 + ")";
	  }).on("mouseover", function (d) {
	    return mouseover(s, d);
	  }).on("mouseout", function (d) {
	    return mouseout(s, d);
	  });
	
	  nodeEnter.append('path').attr("transform", "scale(.8)").attr("d", _paths.CIRCLE);
	
	  nodeEnter.append('g').classed('listeners', true);
	
	  nodeEnter.append("text").attr("x", _paths.RADIUS + 4).attr("dy", ".35em").attr("text-anchor", function (d) {
	    return d.children || d._children ? "end" : "start";
	  }).style("fill-opacity", .1);
	
	  // Transition nodes to their new position.
	  var nodeUpdate = node.transition().duration(s.duration).delay(function (d) {
	    return d.isNew ? s.delay : 0;
	  }).attr("transform", function (d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  }).each("end", function (d) {
	    d.x0 = d.x;
	    d.y0 = d.y;
	    delete d.isNew;
	  });
	
	  node.select('path').classed('is-flow', function (d) {
	    return d.isFlow;
	  });
	
	  node.classed('is-cancelled', function (d) {
	    return d.source.status == 'CANCELLED';
	  }).classed('is-parent-cancelled', function (d) {
	    return _utils2.default.parentCancelled(d);
	  }).classed('is-recipient', function (d) {
	    return _utils2.default.isRecipient(d, s);
	  }).classed('has-no-recipients', function (d) {
	    return _utils2.default.hasNoRecipients(d);
	  });
	
	  node.call(listeners);
	
	  nodeUpdate.select("path").attr('d', function (d) {
	    return d.isFlow ? _paths.DROP : _paths.CIRCLE;
	  });
	
	  nodeUpdate.select("text").text(function (d) {
	    return (d.numInstances > 1 ? d.numInstances + 'x ' : '') + d.name;
	  }).style("fill-opacity", 1);
	
	  // Transition exiting nodes to the parent's new position.
	  var nodeExit = node.exit().remove();
	
	  showRoute(s);
	}
	
	function listeners(sel) {
	  var R = 2;
	
	  var e = sel.select('.listeners').selectAll('.listener').data(function (d) {
	    return d.source.listeners;
	  });
	
	  e.enter().append('circle').classed('listener', true).attr("cx", _paths.RADIUS + R).attr("cy", function (d, i) {
	    return _paths.RADIUS + i * (R + .5) * 2;
	  }).attr("r", R).attr('title', String);
	}
	
	function mouseover(s, d) {
	  s.showRoute = d;
	  s.render();
	}
	
	function mouseout(s, d) {
	  s.showRoute = null;
	  s.render();
	}
	
	function showRoute(s) {
	  if (!s.showRoute || !s.showRoute.source.recipients) {
	    s.d3routes.html('');
	    return;
	  };
	  var line = d3.svg.line().x(function (d) {
	    return d.x;
	  }).y(function (d) {
	    return d.y;
	  }).interpolate('linear');
	
	  var paths = s.d3routes.selectAll("g.route").data(s.showRoute.source.recipients, function (d) {
	    return d.flow.guid;
	  });
	
	  paths.enter().append('g').classed('route', true);
	
	  //paths.attr("transform", (d,i)=>
	  //  "translate(" + (i*3) + ",0)");
	
	  var links = paths.selectAll('path.link').data(function (d) {
	    var r = d.route.concat();
	    var pairs = [];
	    while (r.length > 1) {
	
	      pairs.push({
	        source: s.nodeMap[r[0].guid],
	        target: s.nodeMap[r[1].guid] });
	      r.shift();
	    }
	    return pairs;
	  });
	
	  links.enter().insert("path", "g").attr("class", "link");
	
	  links.attr("d", function (d) {
	    var upstream = d.source.y > d.target.y;
	
	    return s.diagonal({
	      source: { x: d.source.x, y: d.source.y },
	      target: { x: d.target.x, y: d.target.y }
	    });
	  });
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var CIRCLE = exports.CIRCLE = 'm-12.50001,0.54385c0,-7.20655 5.8373,-13.04385 13.04385,-13.04385c7.20655,0 13.04385,5.8373 13.04385,13.04385c0,7.20655 -5.8373,13.04385 -13.04385,13.04385c-7.20655,0 -13.04385,-5.8373 -13.04385,-13.04385z';
	var DROP = exports.DROP = 'm9.72864,6.18447c0,5.21228 -4.34827,9.44253 -9.70596,9.44253c-5.35769,0 -9.80507,-4.2312 -9.70595,-9.44253c0.1317,-6.99036 5.4678,-9.83766 9.70595,-17.87197c4.50158,7.77089 9.70596,12.65969 9.70596,17.87197z';
	var RADIUS = exports.RADIUS = 10.4;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var utils = {};
	
	utils.parentCancelled = function (node) {
	  if (!node) return false;
	  return node.source.status == 'CANCELLED' || utils.parentCancelled(node.parent);
	};
	
	utils.hasNoRecipients = function (node) {
	  return node.source.recipients && node.source.recipients.length == 0;
	};
	
	utils.isRecipient = function (node, s) {
	  if (!node || !s.showRoute || !s.showRoute.source.recipients) return false;
	
	  return s.showRoute.source.recipients.some(function (f) {
	    return f.flow.guid == node.id;
	  });
	};
	
	exports.default = utils;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderLinks;
	
	var _paths = __webpack_require__(7);
	
	var _utils = __webpack_require__(8);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function renderLinks(s) {
	  // Update the links
	  var link = s.d3links.selectAll("path.link").data(s.links, function (d) {
	    return d.target.id;
	  });
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g").attr("class", "link").attr("d", function (d) {
	    var o = { x: d.source.x0, y: d.source.y0 };
	    return s.diagonal({ source: o, target: o });
	  });
	
	  // Transition links to their new position.
	  link.transition().duration(s.duration).delay(function (d) {
	    return d.target.isNew ? s.delay : 0;
	  }).attr("d", function (d) {
	
	    return s.diagonal({
	      source: { x: d.source.x, y: d.source.y },
	      target: { x: d.target.x, y: d.target.y } //-RADIUS+1 }
	    });
	  });
	
	  link.classed('is-flow', function (d) {
	    return d.target.isFlow;
	  }).classed('is-removed', function (d) {
	    return d.target.isRemoved;
	  }).classed('is-cancelled', function (d) {
	    return _utils2.default.parentCancelled(d.target);
	  });
	  // Transition exiting nodes to the parent's new position.
	  link.exit().remove();
	}

/***/ }
/******/ ])));
//# sourceMappingURL=nflow-vis.js.map