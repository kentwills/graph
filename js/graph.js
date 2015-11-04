var graph = (function graph() {

    var visible = {};

    visible.init = function (network) {

        visible.network = network;

        // Create a grapher instance (width, height, options)
        visible.grapher = new Grapher({
            data: visible.network
        });

        // Variable to keep track of the node we're dragging and the current offset
        visible.dragging = null, visible.offset = null;

        visible.width = window.innerWidth;
        visible.height = window.innerHeight;

        // Setup D3's force layout
        visible.force = d3.layout.force()
            .nodes(visible.network.nodes)
            .links(visible.network.links)
            .size([visible.width, visible.height])
            .on('tick', onTick)
            .charge(-5000)
            .gravity(0.005)
            .linkStrength(0.2)
            .linkDistance(100)
            .friction(0.02)
            .start();

        registerHandlers();
    }

    visible.create = function () {
        // Append the grapher's view onto the page
        document.body.appendChild(visible.grapher.canvas);

        // Render the graph using play. This will call render in a requestAnimationFrame loop.
        visible.grapher.play();
    }

    // We create a function that determines whether a click event falls on a node.
    var getNodeIdAt = function (point) {
        var node = -1,
            x = point.x, y = point.y;

        visible.network.nodes.every(function (n, i) {
            var inX = x <= n.x + n.r && x >= n.x - n.r,
                inY = y <= n.y + n.r && y >= n.y - n.r,
                found = inX && inY;
            if (found) node = i;
            return !found;
        });

        return node;
    };

    // Helper function for offsets.
    function getOffset(e) {
        if (e.offsetX) return {x: e.offsetX, y: e.offsetY};
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left,
            y = e.clientY - rect.top;
        return {x: x, y: y};
    };

    // onTick gets called on each tick of D3's force
    var onTick = function () {
        if (visible.dragging && visible.offset) {
            // update the node's position here so it's sticky
            visible.dragging.node.x = visible.offset.x;
            visible.dragging.node.y = visible.offset.y;
        }
        visible.grapher.update(); // update the grapher
    };


    function registerHandlers() {
        // On mousedown, grab the node that was clicked.
        visible.grapher.on('mousedown', function (e) {
            var eOffset = getOffset(e);
            var point = visible.grapher.getDataPosition(eOffset);
            var nodeId = getNodeIdAt(point);
            if (nodeId > -1) {
                visible.dragging = {node: visible.network.nodes[nodeId], id: nodeId};
                visible.offset = point;
            }
            else visible.dragging = visible.offset = null;
        });

        // When the user moves the mouse, we update the node's position
        visible.grapher.on('mousemove', function (e) {
            var eOffset = getOffset(e);
            var point = visible.grapher.getDataPosition(eOffset);
            if (visible.dragging) {
                visible.offset = point;
                visible.force.alpha(1); // restart the force graph
            }
        });

        // Finally when the user lets go of the mouse, we stop dragging
        visible.grapher.on('mouseup', function (e) {
            visible.dragging = visible.offset = null;
        });
    }

    return visible;
})(window.controller = window.controller || {}, undefined);


function generateFakeData(nodes, links) {
    var network = {nodes: [], links: []},
        width = window.width,
        height = window.height,
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

graph.init(generateFakeData(100, 200))
graph.create()
