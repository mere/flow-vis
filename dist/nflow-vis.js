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
	exports.nflowVis = undefined;
	
	var _vis = __webpack_require__(1);
	
	var _vis2 = _interopRequireDefault(_vis);
	
	var _tree = __webpack_require__(8);
	
	var _tree2 = _interopRequireDefault(_tree);
	
	var _timeline = __webpack_require__(16);
	
	var _timeline2 = _interopRequireDefault(_timeline);
	
	var _debug = __webpack_require__(17);
	
	var _debug2 = _interopRequireDefault(_debug);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var nflowVis = exports.nflowVis = {
	  Vis: _vis2.default,
	  Tree: _tree2.default,
	  Timeline: _timeline2.default,
	  Debug: _debug2.default
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	var _parser = __webpack_require__(3);
	
	var _parser2 = _interopRequireDefault(_parser);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	  return _nflow2.default.create('nflow-vis').parent(parent).call(_parser2.default);
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	(function() { module.exports = this["nflow"]; }());

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _utils = __webpack_require__(4);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _consts = __webpack_require__(5);
	
	var _actions = __webpack_require__(6);
	
	var _actions2 = _interopRequireDefault(_actions);
	
	var _model = __webpack_require__(7);
	
	var _model2 = _interopRequireDefault(_model);
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	
	  var f = _nflow2.default.create('parser').parent(parent).call(_actions2.default).call(_model2.default).on('track', track);
	
	  /**
	   *  Tracks a note and treats as the root of the subtree to visualise
	   */
	
	  function track(root) {
	    _utils2.default.assert(!root.name.isFlow, _consts.ERRORS.invalidTrackArgs);
	
	    f.emit('action', 'start', _utils2.default.toObj(root), null, null);
	    initLogger();
	  }
	
	  /**
	   *  
	   */
	  function initLogger() {
	    if (initLogger.inited) return;
	    var model = f.emit('get-model').data();
	    initLogger.inited = true;
	    _nflow2.default.logger(function (flow, name, newData, oldData) {
	
	      // avoid circular tracking
	      if (flow.parents.has('nflow-vis')) return;
	
	      // only track subnodes of the root node
	      if (!model.nodeMap[flow.guid()]) {
	        //console.warn('not tracking:', flow.name())
	        return;
	      };
	
	      f.emit('action', name, _utils2.default.toObj(flow), _utils2.default.toObj(newData), _utils2.default.toObj(oldData));
	    });
	  }
	
	  return f;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var utils = {};
	
	utils.parentCancelled = function (node) {
	  if (!node) return false;
	  return node.f.source.status == 'CANCELLED' || utils.parentCancelled(node.parent);
	};
	
	utils.hasNoRecipients = function (node) {
	  return node.f.source.recipients && node.f.source.recipients.length == 0;
	};
	
	utils.isRecipient = function (node, s) {
	  if (!node || !s.showRoute || !s.showRoute.f.source.recipients) return false;
	
	  return s.showRoute.f.source.recipients.some(function (f) {
	    return f.flow.guid == node.f.guid;
	  });
	};
	
	utils.isEmitter = function (node, s) {
	  if (!node || !s.showRoute || !s.showRoute.f.source.recipients) return false;
	
	  return s.showRoute.f.source.parent.guid == node.f.guid;
	};
	
	/**
	 * the node where the event re-enters into the tree
	 * from an event chain
	 */
	utils.isEntryPoint = function (node, s) {
	  if (!node || !s.showRoute || !s.showRoute.f.source.recipients) return false;
	
	  var entryPoint = s.showRoute;
	  while (entryPoint && entryPoint.f.isEvent) {
	    entryPoint = entryPoint.parent;
	  }
	  return entryPoint.f.guid == node.f.guid;
	};
	
	utils.assert = function (condition, error, val) {
	  if (condition) {
	    throw new Error(error.replace("%s", val));
	  }
	  return condition;
	};
	
	utils.toObj = function (d) {
	  return d && d.name && d.name.isFlow ? d.toObj() : d;
	};
	
	//TODO check maxHeight as well
	utils.fitText = function (maxWidth) {
	  return function (d) {
	    var d3text = d3.select(this);
	    var bb = d3text.node().getBBox();
	    var r = maxWidth / bb.width;
	    r = Math.min(r, 1);
	    d3text.style('transform', 'scale(' + r + ')');
	  };
	};
	utils.wrapText = function (maxWidth) {
	  return function (d) {
	
	    var d3text = d3.select(this),
	        words = d.displayName.replace(/(-|\.|\s)/g, '$&{SEP}').split('{SEP}').reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = .5,
	        // ems
	    x = d3text.attr("x"),
	        y = d3text.attr("y"),
	        dy = parseFloat(d3text.attr("dy")),
	        tspan = d3text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
	
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(""));
	      if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
	        line.pop();
	        tspan.text(line.join(""));
	        line = [word];
	        tspan = d3text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
	      }
	    }
	  };
	};
	
	exports.default = utils;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ERRORS = exports.ERRORS = {
	  invalidRootArgs: 'Invalid Argument. Please use a flow object as the root parameter',
	  invalidTrackArgs: 'Invalid Argument. Please use the imported nFlow object as the track parameter',
	  invalidOnChangeArgs: 'Invalid Argument. Please use a Function as the callback'
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var actions = {};
	
	exports.default = function (parent) {
	  var f = _nflow2.default.create('actions').parent(parent).on('action', parseAction);
	
	  /**
	   *  Parses a new action(eg. flow emitted action),
	   *  and stores the new tree state in the model 
	   */
	  function parseAction(name) {
	    var s = f.emit('get-model').data();
	
	    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      data[_key - 1] = arguments[_key];
	    }
	
	    if (actions[name]) {
	      //console.log(name, data)
	      actions[name].apply(actions, [s].concat(data));
	      throttledUpdate();
	    } else {
	      console.warn('no parser found for "' + name + '"', data);
	    }
	  }
	
	  function throttledUpdate() {
	    if (throttledUpdate.timer) return;
	
	    throttledUpdate.timer = setTimeout(function () {
	      delete throttledUpdate.timer;
	      var s = f.emit('get-model').data();
	      //console.log('update', s)
	      f.emit('update', s);
	    }, 200);
	  }
	};
	
	actions.listenerAdded = actions.listenerRemoved = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	  updateHash(e);
	};
	
	actions.start = function (s, f, newData, oldData) {
	  console.log('starting', s, f);
	  s.root = {
	    name: f.name,
	    guid: f.guid,
	    parent: null,
	    children: [],
	    numInstances: 1,
	    source: f
	  };
	  updateHash(s.root);
	  s.nodeMap[s.root.guid] = s.root;
	};
	
	actions.create = function (s, f, newData, oldData) {
	  if (!s.root) actions.start(s, f, newData, oldData);
	
	  var p = s.nodeMap[f.guid];
	  if (!p) return;
	  p.children = p.children || [];
	  var existingNode = p.children.filter(function (c) {
	    return c.name == newData.name;
	  }).pop();
	  var e = s.nodeMap[newData.guid] = {
	    name: newData.name,
	    guid: newData.guid,
	    children: [],
	    numInstances: 1,
	    x0: p.x0,
	    y0: p.y0,
	    source: newData
	  };
	  updateHash(e);
	  // if (existingNode){
	  //   removeNode(existingNode,s)
	  //   s.nodeMap[newData.guid].numInstances+=existingNode.numInstances
	  //   s.nodeMap[newData.guid].isNew= false
	  // }
	
	  p.children.push(e);
	};
	
	actions.emit = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	  e.isEvent = true;
	  updateHash(e);
	};
	
	actions.name = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	  e.name = f.name;
	  updateHash(e);
	};
	
	actions.data = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.data = newData;
	  //updateHash(e)
	};
	actions.emitted = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	  updateHash(e);
	};
	
	actions.cancel = function (s, f, newData, oldData) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.source = f;
	  updateHash(e);
	};
	
	actions.childRemoved = function (s, f, oldParent) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.isRemoved = true;
	  updateHash(e);
	};
	
	actions.childAdded = function (s, f, newParent, oldParent) {
	  var e = s.nodeMap[f.guid];
	  if (!e) return;
	  e.isRemoved = newParent == null;
	  updateHash(e);
	
	  // remove child from old parent
	  var oldP = oldParent && s.nodeMap[oldParent.guid];
	  if (oldP && newParent) oldP.children = oldP.children.filter(function (n) {
	    return n.guid != f.guid;
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
	    return n.guid != d.guid;
	  });
	  delete s.nodeMap[d.guid];
	}
	
	function updateHash(d) {
	  d.hash = createGuid();
	}
	
	function createGuid() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0,
	        v = c == 'x' ? r : r & 0x3 | 0x8;
	    return v.toString(16);
	  });
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	  return _nflow2.default.create('model').parent(parent).data({
	    root: null,
	    nodeMap: {}
	  }).on('get-model', function () {
	    this.data(this.target.data());
	  });
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	__webpack_require__(9);
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	var _nodes = __webpack_require__(13);
	
	var _nodes2 = _interopRequireDefault(_nodes);
	
	var _links = __webpack_require__(15);
	
	var _links2 = _interopRequireDefault(_links);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	  return _nflow2.default.create('tree').parent(parent).call(_nodes2.default).call(_links2.default).data({
	    tree: null,
	    dom: null,
	    duration: 200,
	    delay: 0,
	    dragging: true, //true, false, horizontal
	    showEvents: true,
	    nodes: null,
	    links: null,
	    maxBatchLength: 7,
	    clonedNodes: {}
	  }).on('update', update, render).on('dom', dom, init, resize).on('dragging', dragging).on('show-events', showEvents).on('select-node', selectNode).on('type', setType).on('resize', resize, redraw).call(function (f) {
	    return setType.call(f);
	  });
	};
	
	function dragging(flag) {
	  this.target.data().dragging = flag;
	}
	
	function showEvents(flag) {
	  this.target.data().showEvents = flag;
	}
	
	function selectNode(node) {
	  if (this.target.data().selectedNode == node) return;
	  this.target.data().selectedNode = node;
	  console.log('selectedNode', this.target.data().selectedNode);
	  var s = this.emit('get-model').data();
	  this.emit('update', s);
	}
	
	function redraw() {
	  var s = this.emit('get-model').data();
	  this.emit('update', s);
	}
	
	function update(d) {
	  console.log('update');
	  var flow = this.target;
	  var tree = flow.data().tree;
	  var fd = flow.data();
	  var pd = flow.parent().data();
	  fd.nodesByDepth = [];
	  var i = 0;
	  if (d) {
	    var rootNode = pd && pd.eventRoot || d.root;
	    if (!rootNode) {
	      this.stopPropagation();
	      return;
	    }
	
	    var root = cloneNode(rootNode, fd);
	    fd.nodes = tree.nodes(root); //.reverse(),
	    fd.links = tree.links(fd.nodes);
	    fd.nodeMap = {};
	    fd.nodes.forEach(function (d) {
	      if (!fd.nodesByDepth[d.depth]) fd.nodesByDepth[d.depth] = [];
	
	      fd.nodesByDepth[d.depth].push(d);
	      fd.nodeMap[d.f.guid] = d;
	      //d.y0 =d.y = d.depth*50+Math.random()*50
	      d.y = d.depth * (root.hidden ? 40 : 50) + (root.hidden ? 0 : 50);
	      d.x += fd.width / 2;
	
	      d.hidden = d.f.hidden;
	      d.needsUpdate = d.f.hash != d.f.hash0 || d.x != d.x0 || d.y != d.y0;
	
	      if (d.needsUpdate) d.updateIndex = i++;
	      d.f.hash0 = d.f.hash;
	
	      d.x0 = d.x0 != null ? d.x : d.parent && !d.parent.hidden ? d.parent.x : d.x;
	      d.y0 = d.y0 != null ? d.y : d.parent && !d.parent.hidden ? d.parent.y : d.y;
	    });
	    fd.nodesByDepth.forEach(function (nodes, i) {
	      if (nodes.length == 1) {
	        var node = nodes[0];
	        node.displayName = node.f.name;
	        node.recurring = false;
	      }
	      nodes.reduce(function (a, b) {
	        var distance = b.x - a.x;
	        a.recurring = a.f.name == b.f.name && distance < a.f.name.length * 18;
	        a.displayName = a.recurring ? '' : a.f.name;
	        b.displayName = b.f.name;
	        return b;
	      });
	    });
	  }
	  //console.log(d)
	}
	
	function dom(dom) {
	  this.target.data().dom = dom;
	  this.target.data().isSVG = dom instanceof SVGElement;
	}
	
	function setType() {
	  var type = arguments.length <= 0 || arguments[0] === undefined ? 'tree' : arguments[0];
	
	  var f = this.target || this;
	
	  var d = f.data();
	  d.type = type;
	  if (type == 'tree') {
	    d.tree = d3.layout.tree();
	  }
	  if (type == 'cluster') {
	    d.tree = d3.layout.cluster();
	  }
	  d.tree.separation(function (a, b) {
	    //console.log('sep', a.f.name, b.f.name, a.depth, b)
	    return a.f.name == b.f.name ? .05 : 1; //b.f.name.length*.1
	  }).nodeSize([100, 50]).children(function (e) {
	    return d.showEvents ? e.f.children.map(function (e) {
	      return cloneNode(e, d);
	    }) : e.f.children && e.f.children.filter(function (e) {
	      return !e.isEvent;
	    }).map(function (e) {
	      return cloneNode(e, d);
	    });
	  });
	}
	
	function cloneNode(e, d) {
	  if (!d.clonedNodes[e.guid]) d.clonedNodes[e.guid] = { f: e };
	  return d.clonedNodes[e.guid];
	}
	
	function init() {
	  var _this = this;
	
	  var d = this.target.data();
	  var d3dom = d3.select(d.dom);
	
	  d.d3svg = d3dom.html("");
	  if (!d.isSVG) d.d3svg = d3dom.append("svg");
	
	  d.d3g = d.d3svg.classed('nflow-vis-tree', true).append('g').classed('drag', true);
	
	  d.dragging && d.d3g.call(d3.behavior.zoom().scaleExtent([.2, 1]).on("zoom", zoom));
	  //.call(zoom)
	
	  d.d3overlay = d.d3g.append("rect").classed("overlay", true).on("click", function () {
	    return _this.emit('select-node', null);
	  });
	
	  //TODO: move these into their respective nodes
	  d.d3contents = d.d3g.append('g').classed('tree', true);
	  d.d3links = d.d3contents.append('g').classed('links', true);
	  d.d3routes = d.d3contents.append('g').classed('routes', true);
	  d.d3nodes = d.d3contents.append('g').classed('nodes', true);
	
	  // this.target
	  //   .get('links')
	  //   .emit.downstream('dom', d.d3links.node())
	
	  function zoom() {
	    var t = d3.event.translate,
	        s = d3.event.scale;
	    if (d.dragging == 'horizontal') t[1] = 0;
	    //zoom.translate(t);
	    d.d3contents.attr("transform", "translate(" + t + ")scale(" + s + ")");
	  }
	}
	
	function render() {
	  var d = this.target.data();
	  // d.d3links
	  //   .selectAll('.link')
	  //   .data(d.links)
	}
	
	function resize() {
	  var d = this.target.data();
	  var d3dom = d3.select(d.dom);
	  d.width = d.isSVG ? parseInt(d3dom.attr('width')) : parseInt(d3dom.style('width'));
	  d.height = d.isSVG ? parseInt(d3dom.attr('height')) : parseInt(d3dom.style('height'));
	
	  d.d3svg.attr("width", d.width).attr("height", d.height);
	
	  d.d3overlay.attr("width", d.width).attr("height", d.height);
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _paths = __webpack_require__(14);
	
	var _utils = __webpack_require__(4);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	  return _nflow2.default.create('nodes').parent(parent).data({
	    dom: null,
	    diagonal: d3.svg.diagonal()
	  }).on('dom', dom).on('update', render);
	};
	
	function dom(dom) {
	  this.target.data().dom = dom;
	}
	
	function render() {
	  var flow = this.target;
	  var tree = this.target.parent();
	  var d = this.target.data();
	  var td = tree.data();
	  var d3dom = td.d3nodes;
	  var nodes = td.nodes.filter(function (e) {
	    return !e.hidden;
	  });
	  // Update the nodes
	  var node = d3dom.selectAll("g.node").data(nodes, function (d) {
	    return d.f.guid;
	  });
	
	  var nodeEnter = node.enter().append("g").attr("class", "node").style("opacity", 0).attr("transform", function (d) {
	    return "translate(" + d.x0 + "," + d.y0 + ")";
	  }).on("click", function (d) {
	    return flow.emit('select-node', d);
	  });
	
	  nodeEnter.append('path').attr("transform", "scale(.8)").attr("d", _paths.CIRCLE);
	
	  nodeEnter.append('g').classed('listeners', true);
	
	  nodeEnter.append('g').attr("transform", 'translate(' + (_paths.RADIUS + 4) + ',0)').append("text").attr("x", 0).attr("dy", ".35em").style("fill-opacity", .1);
	
	  var changedNodes = node.filter(function (d) {
	    return d.needsUpdate;
	  });
	
	  console.log('changedNodes', changedNodes.size());
	  var nodeUpdate = changedNodes.transition().delay(function (d) {
	    return d.updateIndex * td.delay;
	  }).style("opacity", 1).duration(td.duration).attr("transform", function (d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  }).each("end", function (d) {
	    d3.select(this).select("text").text(function (d) {
	      return d.displayName;
	    }).style("fill-opacity", 1).each(_utils2.default.wrapText(120)).each(_utils2.default.fitText(70));
	  });
	
	  changedNodes.select('path').classed('is-flow', function (d) {
	    return d.f.isEvent;
	  });
	
	  changedNodes.classed('is-cancelled', function (d) {
	    return d.f.source.status == 'CANCELLED';
	  }).classed('is-parent-cancelled', function (d) {
	    return _utils2.default.parentCancelled(d);
	  }).classed('is-recipient', function (d) {
	    return _utils2.default.isRecipient(d, td);
	  }).classed('has-no-recipients', function (d) {
	    return _utils2.default.hasNoRecipients(d);
	  }).classed('is-emitter', function (d) {
	    return _utils2.default.isEntryPoint(d, td);
	  }).call(listeners);
	
	  nodeUpdate.select("path").attr('d', function (d) {
	    return d.f.isEvent ? _paths.DROP : _paths.CIRCLE;
	  });
	
	  var nodeExit = node.exit().remove();
	}
	
	function listeners(sel) {
	  var R = 2;
	
	  var e = sel.select('.listeners').selectAll('.listener').data(function (d) {
	    return d.f.source.listeners;
	  });
	
	  var l = e.enter().append('g').classed('listener', true).attr("transform", function (d, i) {
	    return "translate(" + (_paths.RADIUS + R) + "," + (_paths.RADIUS + i * (R + .5) * 2) + ")";
	  });
	
	  //TODO add tooltips
	  //l.append('text')
	  //.text(String)
	
	  l.append('circle').attr("r", R).attr('title', String);
	
	  e.exit().remove();
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var CIRCLE = exports.CIRCLE = 'm-12.50001,0.54385c0,-7.20655 5.8373,-13.04385 13.04385,-13.04385c7.20655,0 13.04385,5.8373 13.04385,13.04385c0,7.20655 -5.8373,13.04385 -13.04385,13.04385c-7.20655,0 -13.04385,-5.8373 -13.04385,-13.04385z';
	var DROP = exports.DROP = 'm9.72864,6.18447c0,5.21228 -4.34827,9.44253 -9.70596,9.44253c-5.35769,0 -9.80507,-4.2312 -9.70595,-9.44253c0.1317,-6.99036 5.4678,-9.83766 9.70595,-17.87197c4.50158,7.77089 9.70596,12.65969 9.70596,17.87197z';
	var RADIUS = exports.RADIUS = 10.4;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _paths = __webpack_require__(14);
	
	var _utils = __webpack_require__(4);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	  return nflow.create('links').parent(parent).data({
	    dom: null,
	    diagonal: d3.svg.diagonal()
	  }).on('dom', dom).on('update', render, updateRoutes);
	};
	
	function dom(dom) {
	  this.target.data().dom = dom;
	}
	
	function render() {
	
	  var tree = this.target.parent();
	  var flow = this.target;
	  var d = flow.data();
	  var td = tree.data();
	  var d3dom = td.d3links;
	  var links = td.links.filter(function (link) {
	    return !link.source.hidden && !link.target.hidden;
	  });
	  // Update the links
	  var link = d3dom.selectAll("path.link").data(links, function (d) {
	    return d.target.f.guid;
	  });
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g").attr("class", "link").attr("d", function (d0) {
	    var o = {
	      x: d0.source.x,
	      y: d0.source.y
	    };
	    return d.diagonal({ source: o, target: o });
	  });
	
	  var changedLinks = link.filter(function (d) {
	    return d.source.needsUpdate || d.target.needsUpdate;
	  });
	  // Transition links to their new position.
	  changedLinks.transition().duration(td.duration).delay(function (d) {
	    return d.target.updateIndex * td.delay;
	  }).attr("d", getCoords.bind(flow));
	
	  changedLinks.classed('is-flow', function (d) {
	    return d.target.f.isEvent;
	  }).classed('is-removed', function (d) {
	    return d.target.f.isRemoved;
	  }).classed('is-cancelled', function (d) {
	    return _utils2.default.parentCancelled(d.target);
	  });
	  // Transition exiting nodes to the parent's new position.
	  link.exit().remove();
	}
	
	function updateRoutes(data) {
	  var flow = this.target;
	  var tree = flow.parent();
	  var d = flow.data();
	  var td = tree.data();
	  var d3dom = td.d3nodes;
	  var nodes = td.nodes;
	  if (!td.showRoute || !td.showRoute.f.source.recipients) {
	    td.d3routes.html('');
	    return;
	  };
	  var line = d3.svg.line().x(function (d) {
	    return d.x;
	  }).y(function (d) {
	    return d.y;
	  }).interpolate('linear');
	
	  var paths = td.d3routes.selectAll("g.route").data(td.showRoute.f.source.recipients, function (d) {
	    return d.flow.guid;
	  });
	
	  paths.enter().append('g').classed('route', true);
	
	  var links = paths.selectAll('path.link').data(function (d) {
	    var r = d.route.concat();
	    var pairs = [];
	    while (r.length > 1) {
	      pairs.push({
	        source: td.nodeMap[r[0].guid],
	        target: td.nodeMap[r[1].guid] });
	      r.shift();
	    }
	    pairs = pairs.filter(function (pair) {
	      return pair.source && pair.target;
	    }).filter(function (pair) {
	      return !pair.source.hidden && !pair.target.hidden;
	    });
	    return pairs;
	  });
	
	  links.enter().insert("path", "g").attr("class", "link");
	
	  links.attr("d", getCoords.bind(flow));
	}
	
	function getCoords(d) {
	  return this.data().diagonal({
	    source: { x: d.source.x, y: d.source.y },
	    target: { x: d.target.x, y: d.target.y - (d.target.f.isEvent ? 7 : 0) }
	  });
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _tree = __webpack_require__(8);
	
	var _tree2 = _interopRequireDefault(_tree);
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	exports.default = function (parent) {
	  return _nflow2.default.create('timeline').parent(parent).call(_tree2.default).data({
	    eventRoot: {
	      name: 'event-root',
	      guid: -1,
	      parent: null,
	      children: [],
	      source: null,
	      hidden: true
	    },
	    d3dom: null
	  }).on('update', updateEventRoot, updateBG).call(init)
	  // .on('allow-dragging', allowDragging)
	  // .on('show-events', showEvents)
	  // .on('show-route', showRoute)
	  // .on('type', setType)
	
	  ;
	};
	
	function init(f) {
	  var d = f.data();
	  f.emit.downstream('dragging', 'horizontal');
	  f.create('lines').on('dom', function (dom) {
	    d.d3dom = d3.select(dom);
	  }, dom);
	}
	
	function dom(d) {
	
	  var d3dom = d3.select(d);
	
	  var drag = d3dom.select('.tree').insert('g', ":first-child").classed('timeline-bg', true);
	}
	
	function updateEventRoot(d) {
	  //console.log('timeline update')
	  d.eventRoot = this.target.data().eventRoot;
	  d.eventRoot.source = d.root.source;
	  d.eventRoot.guid = d.root.guid;
	  d.eventRoot.children = [];
	  findEvents(d.root);
	
	  function findEvents(node) {
	    node.children.forEach(function (e) {
	      if (e.isEvent) {
	        //let n = clone(e, node)
	        var n = e;
	        n && d.eventRoot.children.push(n);
	      } else findEvents(e);
	    });
	  }
	
	  function clone(e, p) {
	    var lastEvent = d.eventRoot.children.length && d.eventRoot.children[d.eventRoot.children.length - 1];
	
	    // if (lastEvent.source == p.source) {
	    //   lastEvent.children.push(e)
	    //   return null
	    // }
	    return {
	      name: p.name,
	      guid: p.guid + '-' + d.eventRoot.children.length,
	      children: [e],
	      source: p.source
	    };
	  }
	}
	
	function updateBG(d) {
	  var maxDepth = getMaxDepth(d.eventRoot);
	  var depthArr = Array(maxDepth).fill();
	
	  var data = this.target.data();
	  var sel = data.d3dom.select('.timeline-bg').selectAll('rect').data(depthArr);
	
	  sel.enter().append('rect').attr("x", -10000).attr("y", function (d, i) {
	    return 40 + i * 40;
	  }).attr("width", 20000).attr("height", 40);
	
	  sel.exit().remove();
	}
	
	function getMaxDepth(node) {
	  var _Math;
	
	  var i = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	  if (!node.children || !node.children.length) return i;
	  return (_Math = Math).max.apply(_Math, _toConsumableArray(node.children.map(function (e) {
	    return getMaxDepth(e, i + 1);
	  })));
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _nflow = __webpack_require__(2);
	
	var _nflow2 = _interopRequireDefault(_nflow);
	
	var _parser = __webpack_require__(3);
	
	var _parser2 = _interopRequireDefault(_parser);
	
	var _tree = __webpack_require__(8);
	
	var _tree2 = _interopRequireDefault(_tree);
	
	var _timeline = __webpack_require__(16);
	
	var _timeline2 = _interopRequireDefault(_timeline);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (parent) {
	  return _nflow2.default.create('flow-vis-debug').parent(parent).data({
	    d3dom: null,
	    selectedNode: null
	  }).call(_parser2.default).on('dom', dom).on('select-node', selectNode);
	};
	
	function dom(dom) {
	  console.log(dom);
	  var flow = this.target;
	  var d = flow.data();
	  var isSVG = dom instanceof SVGElement;
	  d.d3dom = d3.select(dom);
	
	  if (!isSVG) d.d3dom = d.d3dom.append('svg').attr('width', '100%').attr('height', '100%');
	
	  d.d3dom.classed('flow-vis-debug', true);
	
	  d.d3tree = d.d3dom.append('g').classed('tree', true);
	
	  d.d3timeline = d.d3dom.append('g').classed('timeline', true);
	
	  resize(d);
	  var tree = (0, _tree2.default)(flow);
	  tree.emit.downstream('dom', d.d3tree.node());
	  tree.emit.downstream('show-events', false);
	
	  var timeline = nflowVis.Timeline(flow);
	  timeline.emit.downstream('dom', d.d3timeline.node());
	}
	
	function resize(d) {
	  var w = parseInt(d.d3dom.style('width'));
	  var h = parseInt(d.d3dom.style('height'));
	  var TIMELINE_HEIGHT = 200;
	  d.d3tree.attr('width', w).attr('height', h);
	
	  d.d3timeline.attr('width', w).attr('height', TIMELINE_HEIGHT).attr('transform', 'translate(0,' + (h - TIMELINE_HEIGHT) + ')');
	}
	
	function selectNode(node) {
	  if (this.target.data().selectedNode == node) return;
	  this.target.data().selectedNode = node;
	  console.log('selectedNode', this.target.data().selectedNode);
	  var s = this.emit('get-model').data();
	  this.emit('update', s);
	}

/***/ }
/******/ ])));
//# sourceMappingURL=nflow-vis.js.map