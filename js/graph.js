var graph = (function graph(){

  var visible = {};

  visible.init = function(){
    network = generateFakeData(10, 30);

    // Create a grapher instance (width, height, options)
    var grapher = new Grapher({
      data: network
    });

    // Variable to keep track of the node we're dragging and the current offset
    var dragging = null,
        offset = null;

    var width = window.innerWidth;
    var height = window.innerHeight;

    // Setup D3's force layout
    var force = d3.layout.force()
        .nodes(network.nodes)
        .links(network.links)
        .size([width, height])
        .on('tick', onTick)
        .charge(-5000)
        .gravity(0.005)
        .linkStrength(0.2)
        .linkDistance(100)
        .friction(0.02)
        .start();
    
    registerHandlers();
    visible.create();
    
  }

  visible.create = function(){
    // Append the grapher's view onto the page
    document.body.appendChild(grapher.canvas);

    // Render the graph using play. This will call render in a requestAnimationFrame loop.
    grapher.play();
  }

  function generateFakeData(nodes, links){
    var network = {nodes: [], links: []},
        width = window.innerWidth,
        height = window.innerHeight,
        numNodes = nodes,
        numLinks = links,
        i;

    for (i = 0; i < numNodes; i++) {
      network.nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 10 + 5,
        weight: 1
      });
    }

    for (i = 0; i < numLinks; i++) {
      var from = Math.floor(Math.random() * numNodes),
          to = Math.floor(Math.random() * numNodes);
      network.links.push({
        from: from,
        to: to,
        source: network.nodes[from],
        target: network.nodes[to]
      });
    }
    return network;
  }


  // We create a function that determines whether a click event falls on a node.
  var getNodeIdAt = function (point) {
    var node = -1,
        x = point.x, y = point.y;

    network.nodes.every(function (n, i) {
      var inX = x <= n.x + n.r && x >= n.x - n.r,
          inY = y <= n.y + n.r && y >= n.y - n.r,
          found = inX && inY;
      if (found) node = i;
      return !found;
    });

    return node;
  };

  // Helper function for offsets.
  function getOffset (e) {
    if (e.offsetX) return {x: e.offsetX, y: e.offsetY};
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    return {x: x, y: y};
  };

  // onTick gets called on each tick of D3's force
  var onTick = function () {
    if (dragging && offset) {
      // update the node's position here so it's sticky
      dragging.node.x = offset.x;
      dragging.node.y = offset.y;
    }
    grapher.update(); // update the grapher
  };


  function registerHandlers(){
    // On mousedown, grab the node that was clicked.
    grapher.on('mousedown', function (e) {
      var eOffset = getOffset(e);
      var point = grapher.getDataPosition(eOffset);
      var nodeId = getNodeIdAt(point);
      if (nodeId > -1) {
        dragging = {node: network.nodes[nodeId], id: nodeId};
        offset = point;
      }
      else dragging = offset = null;
    });

    // When the user moves the mouse, we update the node's position
    grapher.on('mousemove', function (e) {
      var eOffset = getOffset(e);
      var point = grapher.getDataPosition(eOffset);
      if (dragging) {
        offset = point;
        force.alpha(1); // restart the force graph
      }
    });

    // Finally when the user lets go of the mouse, we stop dragging
    grapher.on('mouseup', function (e) { dragging = offset = null; });
  }

    return visible;
})(window.controller = window.controller || {}, undefined);

graph.init()
