H$ = {};
(function(){
    loadClasses();
    if(typeof window === "object") loadClientCode();
    loadMetaclasses();

    function loadClasses(){
        /**
         * Creates and initializes a hexagonal grid.
         * The grid itself is stored as a hash of Point objects to Hexagons.
         * This allows for sparse boards. The Point class has a toString method => "x,y"
         * that means Points with the same coords will be hashed to the same value, allowing
         * for random access by coordinate pair.
         *
         * @param cx                the pixel x-coordinate of the center of the grid
         * @param cy                the pixel y-coordinate of the center of the grid
         * @param hexSize           the length from center to vertex of each hexagon in the grid
         * @param klass             the DOM class of the svg element this grid will be drawn in
         * @constructor
         */
        H$.HexGrid = function HexGrid(cx, cy, hexSize, klass){
            var boardCenter = new Point(cx, cy);
            function HexGrid_getCenter(){ return boardCenter; }
            this.getCenter = HexGrid_getCenter;

            function HexGrid_getHexagonSize(){ return hexSize; }
            this.getHexagonSize = HexGrid_getHexagonSize;

            function HexGrid_getDOMClass(){ return klass; }
            this.getDOMClass = HexGrid_getDOMClass;

            this.grid = {};
            this.patterns = {};

            // Client-side setup. Possible TODO: move into .init() API method?
            if(typeof window === "object"){
                this.detachedAssets = [];

                var defs = d3.select("." + klass + " defs");
                if(defs.empty()) d3.select("." + klass).append("svg:defs");
            }
        };

        (function(){

            /* Instance methods */

            // TODO: updateFromJson (and maybe a differ?)
            H$.HexGrid.prototype.loadFromJson = HexGrid_loadFromJson;
            function HexGrid_loadFromJson(json){
                var raw = JSON.parse(json);
                var rawGrid = raw.grid;
                for(var rawCoords in rawGrid){
                    if(!rawGrid.hasOwnProperty(rawCoords)) continue;
                    var coords = rawCoords.split(",");
                    var rawHex = rawGrid[rawCoords];

                    this.add(coords[0], coords[1]);
                    if(rawHex.fill){
                        this.grid[rawCoords].fill = "url(#" + this.getDOMClass() + "-bg" + rawHex.fill.substr(rawHex.fill.lastIndexOf("-"));
                    } else {
                        this.grid[rawCoords].fill = null;
                    }

                    var payload = this.grid[rawCoords].payload;
                    payload.data = rawHex.data || null;
                    payload.asset = rawHex.asset || null;

                }
                for(var pattern in raw.patterns){
                    if(!raw.patterns.hasOwnProperty(pattern)) continue;
                    this.initNewBackgroundImage(pattern);
                }

                return this;
            }

            /* Placeholder function -- client-only d3 code injected here */
            H$.HexGrid.prototype.initNewBackgroundImage = HexGrid_initNewBackgroundImage_placeholder;
            function HexGrid_initNewBackgroundImage_placeholder(){}

            H$.HexGrid.prototype.add = HexGrid_add;
            function HexGrid_add(q, r){
                var coords = new Point(q, r);
                // if(this.grid[coords] != null) throw "exception: attempting to add a duplicate hexagon!";
                this.grid[coords] = new H$.Hexagon(this, axialToPixel(this, q, r), coords);
                return this.grid[coords];
            }
            H$.HexGrid.prototype.addMegahex = HexGrid_addMegahex;
            function HexGrid_addMegahex(cq, cr, diameter){
                if(diameter % 2 === 0) throw "exception: diameter of megahex must be an odd number";
                var steps = Math.floor(diameter / 2);
                for(var dx = -steps; dx <= steps; dx++){
                    var dyMin = Math.max(-steps, -dx-steps);
                    var dyMax = Math.min(steps, -dx+steps);
                    for(var dy = dyMin; dy <= dyMax; dy++){
                        var dz = -dx-dy;
                        var q = cq + dx;
                        var r = cr + dz;
                        var coords = new Point(q, r);
                        this.grid[coords] = new H$.Hexagon(this, axialToPixel(this, q, r), coords);
                    }
                }
                return this.grid[new Point(cq, cr)];
            }

            /**
             * A shortcut to create a large grid with customized background images per-hex.
             * @param data     [ [x, y, bgimage]... ]   bgimage is optional for each hex
             * @type {Function}
             */
            H$.HexGrid.prototype.addMany = HexGrid_addMany;
            function HexGrid_addMany(data){
                for (var i = 0; i < data.length; i++){
                    var datum = data[i];
                    var coords = new Point(datum[0], datum[1]);
                    this.grid[coords] = (new H$.Hexagon(this, axialToPixel(this, coords.x(), coords.y()), coords));
                    if(datum[2]) this.grid[coords].setBackgroundImage(datum[2]);
                }
                return this;
            }

            H$.HexGrid.prototype.remove = HexGrid_remove;
            function HexGrid_remove(q, r){
                var coords = new Point(q, r);
                if(this.grid[coords] === undefined) throw "exception: attempting to remove nonexistent hexagon!";
                this.grid[coords].undraw();
                delete this.grid[coords];
            }

            H$.HexGrid.prototype.removeAll = HexGrid_removeAll;
            function HexGrid_removeAll(){
                for(var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].undraw();
                    delete this.grid[pointStr];
                }
                return this;
            }

            H$.HexGrid.prototype.drawAll = HexGrid_drawAll;
            function HexGrid_drawAll(){
                for(var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].draw();
                }
                for(var i = 0; i < this.detachedAssets.length; i++){
                    d3.select("." + this.detachedAssets[i].klass).moveToFront();
                }
                return this;
            }

            H$.HexGrid.prototype.preloadBackgroundImage = HexGrid_preloadBackgroundImage;
            function HexGrid_preloadBackgroundImage(path){
                if(this.patterns[path] === undefined){
                    this.initNewBackgroundImage(path);
                }
                return this;
            }

            /**
             * Reset the background images "defs" section by reloading all patterns
             * @type {Function}
             */
            H$.HexGrid.prototype.preloadBackgroundImages = HexGrid_preloadBackgroundImages;
            function HexGrid_preloadBackgroundImages(){
                var klass = this.getDOMClass();
                var defs = d3.select("." + klass + " defs");
                if(defs.empty()) d3.select("." + klass).append("svg:defs");
                var patterns = this.patterns;
                this.patterns = [];
                for(var path in patterns){
                    this.initNewBackgroundImage(path);
                }
                return this;
            }

            H$.HexGrid.prototype.setGlobalBackgroundImage = HexGrid_setGlobalBackgroundImage;
            function HexGrid_setGlobalBackgroundImage(path){
                if(this.patterns[path] === undefined){
                    this.initNewBackgroundImage(path);
                }
                for (var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].fill = "url(#" + this.patterns[path] + ")";
                }
                return this;
            }

            H$.HexGrid.prototype.getImageForFill = HexGrid_getImageForFill;
            function HexGrid_getImageForFill(fill){
                if(fill === undefined) return undefined;
                var patterns = this.patterns;
                for(var path in patterns){
                    if(!patterns.hasOwnProperty(path)) continue;
                    if(fill.indexOf(patterns[path]) !== -1) return path;
                }
                return null;
            }

            H$.HexGrid.prototype.setGlobalBackgroundColor = HexGrid_setGlobalBackgroundColor;
            function HexGrid_setGlobalBackgroundColor(css){
                for (var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].setBackgroundColor(css);
                }
                return this;
            }

            H$.HexGrid.prototype.get = HexGrid_get;
            function HexGrid_get(arg1, arg2){
                var coords;
                if(typeof arg2 === "number"){
                    // x, y
                    coords = new Point(arg1, arg2);
                } else if(arg1.hasOwnProperty(1)){
                    // array or array-like
                    coords = new Point(arg1[0], arg1[1]);
                } else {
                    throw "exception: arg format unknown (H$.HexGrid.get)";
                }
                return this.grid[coords]
            }

            /**
             * Calls the given function on each Hexagon in the grid
             * @type {Function}
             */
            H$.HexGrid.prototype.forEach = HexGrid_forEach;
            function HexGrid_forEach(fn){
                for (var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    fn(this.grid[pointStr]);
                }
                return this;
            }

            /**
             * Returns the hexagon found at the given relative coordinates--
             * assuming the top left corner of the SVG board is (0,0).
             * @param x             array [x,y] of coordinates, OR first coordinate
             * @param y (optional)  second coordinate
             * @type {Function}
             */
            H$.HexGrid.prototype.getAt = HexGrid_getAt;
            function HexGrid_getAt(x, y){
                if(!y){
                    y = x[1];
                    x = x[0];
                }
                x -= this.getCenter().x();
                y -= this.getCenter().y();
                var q = (1/3 * Math.sqrt(3) * x - 1/3 * y) / this.getHexagonSize();
                var r = 2/3 * y / this.getHexagonSize();
                var roundedLoc = roundAxial(q, r);
                var hex = this.grid[roundedLoc];
                // Avoid returning undefined
                return (hex ? hex : null);
            }

            H$.HexGrid.prototype.setMovementCost = HexGrid_setMovementCost;
            function HexGrid_setMovementCost(costFn){
                this.movementCost = costFn;
            }

            H$.HexGrid.prototype.serialize = HexGrid_serialize;
            function HexGrid_serialize(){
                // Censor: skip the circular "grid" pointers when serializing hexagons in grid
                var censor = (function(){
                    var first = true;
                    return function(key, value){
                        if(!first && value instanceof H$.HexGrid) return undefined;
                        first = false;
                        return value;
                    }
                })();
                return JSON.stringify(this, censor);
            }

            //TODO: set gridline colors, both globally and individually (for walls etc)

            /* Begin private HexGrid functions */

            /**
             * Converts from axial coordinates to pixel coordinates,
             * Runs the coordinates through parseInt to avoid weirdness with duck typing
             * @param grid
             * @param q
             * @param r
             * @returns a new Point object
             */
            function axialToPixel(grid, q, r){
                q = parseInt(q);
                r = parseInt(r);
                var size = grid.getHexagonSize();
                var dx = size * Math.sqrt(3.0) * (q + r/2.0);
                var dy = size * 3.0/2.0 * r;
                return grid.getCenter().next(dx, dy);
            }

            function roundAxial(x, z){
                var y = -x-z;
                var rx = Math.round(x);
                var ry = Math.round(y);
                var rz = Math.round(z);

                var xErr = Math.abs(rx - x);
                var yErr = Math.abs(ry - y);
                var zErr = Math.abs(rz - z);

                if(xErr > yErr && xErr > zErr){
                    rx = -ry-rz
                } else if(yErr > zErr){
                    ry = -rx-rz;
                } else {
                    rz = -rx-ry;
                }
                return new Point(x, z);
            }


        })();

        /* Begin public helper classes */

        /**
         * A simple wrapper around the necessary information to add an asset.
         * @constructor
         */
        var Asset = function(path, width, height){
            this.path = path;
            this.width = width;
            this.height = height;
        };
        (function(){
            Asset.CSS_SUFFIX = "-asset";
            Asset.DEFAULT_ANIMATION_DURATION = 800;
        })();
        H$.Asset = Asset;

        var Payload = function(data, asset){
            this.data = data;
            this.asset = asset;
        };
        (function(){
            function Payload_getData(){
                return this.data;
            }

            function Payload_setData(data){
                this.data = data;
            }

            function Payload_getAsset(){
                return this.asset;
            }

            function Payload_setAsset(asset){
                this.asset = asset;
            }

            Payload.prototype = {
                getData: Payload_getData,
                setData: Payload_setData,
                getAsset: Payload_getAsset,
                setAsset: Payload_setAsset
            }
        })();
        H$.Payload = Payload;

        /* End public classes */
        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
        /* Begin private-constructor helper classes */

        /**
         * A class that manages the details
         * (pixel coordinates, payload, and vertices) about an individual
         * hexagon.
         * @param grid
         * @param c
         * @param coords
         * @constructor
         */
        H$.Hexagon = function(grid, c, coords) {
            this.grid = grid;

            function Hexagon_center(){ return c; }
            this.center = Hexagon_center;

            function Hexagon_getLocation(){ return coords; }
            this.getLocation = Hexagon_getLocation;

            function Hexagon_getCoords(){ return [coords.x(), coords.y()] }
            this.getCoords = Hexagon_getCoords;

            this.fill = null;

            this.payload = new Payload(null, null);

            this.animationActive = false;
        };

        (function(){

            H$.Hexagon.prototype.vertices = Hexagon_vertices;
            function Hexagon_vertices(){
                // Sets up the vertices
                var s = this.size();
                var r = H$.Util.calcR(s);
                var h = s / 2;
                var c = this.center();
                //calculate all vertices by offset from center, starting at top and going clockwise
                var vertices = [
                    c.next(0, -s),
                    c.next(r, -h),
                    c.next(r, h),
                    c.next(0, s),
                    c.next(-r, h),
                    c.next(-r, -h)
                ];
                return vertices;
            }

            H$.Hexagon.prototype.height = Hexagon_height;
            function Hexagon_height(){
                return 2 * this.size();
            }

            H$.Hexagon.prototype.width = Hexagon_width;
            function Hexagon_width(){
                return 2 * H$.Util.calcR(this.size());
            }

            H$.Hexagon.prototype.size = Hexagon_size;
            function Hexagon_size(){
                return this.grid.getHexagonSize();
            }

            H$.Hexagon.prototype.getGridClass = Hexagon_getGridClass;
            function Hexagon_getGridClass(){
                return this.grid.getDOMClass();
            }

            H$.Hexagon.prototype.getHexClass = Hexagon_getHexClass;
            function Hexagon_getHexClass(){
                return this.grid.getDOMClass() + "-" + this.center().toString().replace(",", "-");
            }

            H$.Hexagon.prototype.setBackgroundImage = Hexagon_setBackgroundImage;
            function Hexagon_setBackgroundImage(path){
                if(path === null){
                    this.fill = null;
                    return this;
                }
                if(!this.grid.patterns[path]){
                    this.grid.initNewBackgroundImage(path);
                }
                this.fill = "url(#" + this.grid.patterns[path] + ")";
                return this;
            }

            H$.Hexagon.prototype.getBackgroundImage = Hexagon_getBackgroundImage;
            function Hexagon_getBackgroundImage(){
                return this.grid.getImageForFill(this.fill);
            }

            // Aliases
            H$.Hexagon.prototype.getBackgroundColor = Hexagon_getBackgroundFill;
            H$.Hexagon.prototype.getBackgroundFill = Hexagon_getBackgroundFill;
            function Hexagon_getBackgroundFill(css){
                return this.fill;
            }

            // Aliases
            H$.Hexagon.prototype.setBackgroundColor = Hexagon_setBackgroundFill;
            H$.Hexagon.prototype.setBackgroundFill = Hexagon_setBackgroundFill;
            function Hexagon_setBackgroundFill(css){
                this.fill = css;
                return this;
            }

            // Private helper
            function makePayload(arg1, arg2){
                var payload;
                if(typeof arg2 === "object"){
                    payload = new Payload(arg1, arg2);
                } else if(arg2 === undefined){
                    payload = arg1;
                } else throw "exception: must provide H$.Asset, not just image path";
                if(payload === null) payload = new Payload(null, null);
                return payload;
            }

            H$.Hexagon.prototype.setPayload = Hexagon_setPayload;
            function Hexagon_setPayload(arg1, arg2){
                this.payload = makePayload(arg1, arg2);
                return this;
            }

            /**
             * Add another payload to the hexagon's collection. Converts a single
             * payload to an array of payloads first, if necessary.
             */
            H$.Hexagon.prototype.pushPayload = Hexagon_pushPayload;
            function Hexagon_pushPayload(arg1, arg2){
                var payload = makePayload(arg1, arg2);
                if(!Array.isArray(this.payload)){
                    var old = this.payload;
                    this.payload = [];
                    if(JSON.stringify(old) !== JSON.stringify(makePayload(null))) this.payload.push(old);
                }
                this.payload.push(payload);
            }

            H$.Hexagon.prototype.getPayload = Hexagon_getPayload;
            function Hexagon_getPayload(){
                return this.payload;
            }

            H$.Hexagon.prototype.getPayloadData = Hexagon_getPayloadData;
            function Hexagon_getPayloadData(){
                return this.payload.getData();
            }

            /**
             * A shortcut function that clears the hexagon's payload,
             * and returns it. Convenient for "move"
             * actions in games.
             */
            H$.Hexagon.prototype.popPayload = Hexagon_popPayload;
            function Hexagon_popPayload(){
                var payload = this.payload;
                this.payload = new Payload(null, null);
                return payload;
            }

            // Private helper
            var findNeighbor = function(hex, direction){
                var neighbor = hex.grid.grid[hex.getLocation().add(direction.offset)];
                if(neighbor === undefined) return null;
                return neighbor;
            };

            H$.Hexagon.prototype.getNeighbor = Hexagon_getNeighbor;
            function Hexagon_getNeighbor(direction){
                return findNeighbor(this, direction);
            }

            H$.Hexagon.prototype.getNeighbors = Hexagon_getNeighbors;
            function Hexagon_getNeighbors(){
                var neighbors = [];
                for(var i = DIRECTION.START; i < DIRECTION.END; i++){
                    var next = findNeighbor(this, DIRECTION[i]);
                    if(next != null) neighbors.push(next);
                }
                return neighbors;
            }

            /**
             * These two functions look for straight lines between two hexagons.
             */
            H$.Hexagon.prototype.getDirectionTo = Hexagon_getDirectionTo;
            function Hexagon_getDirectionTo(finish){
                var delta = finish.getLocation().subtract(this.getLocation());
                for(var i = DIRECTION.START; i < DIRECTION.END; i++){
                    var q = delta.divide(DIRECTION[i].offset);
                    if(q != null) return DIRECTION[i];
                }
                return null;
            }

            H$.Hexagon.prototype.getStraightLineDistanceTo = Hexagon_getStraightLineDistanceTo;
            function Hexagon_getStraightLineDistanceTo(finish){
                var delta = finish.getLocation().subtract(this.getLocation());
                for(var i = DIRECTION.START; i < DIRECTION.END; i++){
                    var q = delta.divide(DIRECTION[i].offset);
                    if(q != null) return Math.abs(q);
                }
                return null;
            }

            H$.Hexagon.prototype.farthestInDirection = Hexagon_farthestInDirection;
            function Hexagon_farthestInDirection(dir){
                var farthest = null;
                var current = this;
                while(current !== null){
                    farthest = current;
                    current = current.getNeighbor(dir);
                }
                return farthest;
            }

            /**
             * Uses a flood fill to calculate movement range from this hex. Operates under the following
             * assumption: if a single move costs more than the remaining distance, it is not allowed EXCEPT
             * on the first move; movement into an adjacent hex is always allowed regardless of cost
             * unless the cost is Infinity (which means forbidden).
             * Does not include the starting hex.
             * @param distance      distance to move
             * @param costFn        funciton(payloadData, hex) => cost to move into
             * @type {Function}
             */
            H$.Hexagon.prototype.getMovementRange = Hexagon_getMovementRange;
            function Hexagon_getMovementRange(distance, costFn){
                costFn = costFn || this.grid.movementCost || function(data, hex){ return 1; };
                var data = this.getPayloadData();
                var visited = {};
                var range = [];
                visit(this, distance, true);
                return range;

                function visit(hex, movementLeft, isStart){
                    if(!hex) return;
                    var loc = hex.getLocation();
                    var stepsSoFar = distance - movementLeft;
                    if(visited[loc] !== undefined && visited[loc] <= stepsSoFar) return;
                    visited[loc] = stepsSoFar;

                    var cost = 0;
                    if(!isStart){
                        cost = costFn(data, hex);

                        // (Insufficient movement left AND movement started ) OR movement impossible
                        if((movementLeft < cost && movementLeft < distance) || cost === Infinity) return;
                        range.push(hex);
                    }
                    for(var d = DIRECTION.START; d < DIRECTION.END; d++){
                        visit(hex.getNeighbor(DIRECTION[d]), movementLeft - cost);
                    }
                }
            }

            H$.Hexagon.prototype.getDistanceTo = Hexagon_getDistanceTo;
            function Hexagon_getDistanceTo(end){
                var delta = end.getLocation().subtract(this.getLocation());
                var x = delta.x();
                var y = delta.y();
                var z = 0 - x - y;
                return (Math.abs(x) + Math.abs(y) + Math.abs(z)) / 2;
            }

            // Finds a path to the target hex using the A* graph search algorithm.
            // Uses an optional cost function to account for
            // arbitrary boundaries / movement rules.
            H$.Hexagon.prototype.getPathTo = Hexagon_getPathTo;
            function Hexagon_getPathTo(destHex, costFn){
                costFn = costFn || this.grid.movementCost || function(data, hex){ return 1; };
                var data = this.getPayloadData();
                var dest = destHex.getLocation().toString();

                var all = this.grid.grid;
                var todo = {};
                var visited = {};
                var done = {};
                for(var coords in all){
                    if(!all.hasOwnProperty(coords)) continue;
                    todo[coords] = new Node(coords, all[coords]);
                }
                var start = visit(this.getLocation(), 0);

                var pq = new PriorityQueue();
                pq.push(start, priority(start));

                var u;
                while(Object.keys(visited).length > 0){
                    u = pq.pop();
                    var d = finalize(u);
                    if(u.coords === dest) break;
                    var neighbors = u.hex.getNeighbors();
                    for(var i = 0; i < neighbors.length; i++){
                        var hex = neighbors[i];
                        var loc = hex.getLocation();
                        var L = costFn(data, hex);
                        if(loc in todo){
                            var v = todo[loc];
                            visit(v.coords, d + L);
                            v.parent = u;
                            pq.push(v, d + L + priority(v));
                        }
                        if(loc in visited && visited[loc].candidate > d + L){
                            var v = visited[loc];
                            v.candidate = d + L;
                            v.parent = u;
                            pq.move(v, d + L + priority(v));
                        }
                    }
                }

                // Path does not include start node
                var path = [];
                while(u.parent !== null){
                    path.push(u.hex);
                    u = u.parent;
                }

                // reverse to get start => finish
                return path.reverse();

                //Generates priority value, including A* heuristic function
                function priority(cur){
                    return cur.candidate + cur.hex.getDistanceTo(destHex);
                }

                function Node(coords, hex){
                    this.coords = coords;
                    this.hex = hex;
                    this.parent = null;
                    this.candidate = null;
                }

                function visit(coords, candidate){
                    visited[coords] = todo[coords];
                    visited[coords].candidate = candidate;
                    delete todo[coords];
                    return visited[coords];
                }

                function finalize(node){
                    node.distance = node.candidate;
                    done[node.coords] = node;
                    delete visited[node.coords];
                    return node.distance;
                }

            }
        })();

        /**
         * A simple semi-immutable Point class with a hashable
         * and svg-compatible toString representation. Mimics an
         * array of length 2.
         * @param x
         * @param y
         * @constructor
         */
        H$.Point = Point;
        function Point(x, y){
            function Point_x(){ return x; }
            function Point_y(){ return y; }

            this.x = Point_x;
            this.y = Point_y;

            this[0] = x;
            this[1] = y;
            this.length = 2;
        }

        (function(){

            /**
             * Returns a new Point at the given offset from the current point.
             */
            Point.prototype.next = Point_next;
            function Point_next(dx, dy){
                return new Point(this.x() + dx, this.y() + dy);
            }

            Point.prototype.add = Point_add;
            function Point_add(pt2){
                return new Point(this.x() + pt2.x(), this.y() + pt2.y());
            }

            Point.prototype.subtract = Point_subtract;
            function Point_subtract(pt2){
                return new Point(this.x() - pt2.x(), this.y() - pt2.y());
            }

            /**
             * If this point is a scalar multiple of the given point,
             * returns that scalar. Otherwise, returns null. We do some
             * fiddling to allow "dividing" by zero so that (0,2) / (0,1) = 2
             */
            Point.prototype.divide = Point_divide;
            function Point_divide(pt2){

                function psuedoDivide(a, b){
                    if(a === 0 && b === 0) return 0;
                    else if(a === 0 || b === 0) return null;
                    else return a / b;
                }

                var qx = psuedoDivide(this.x(), pt2.x());
                var qy = psuedoDivide(this.y(), pt2.y());

                if((qx >= 0 && qy >= 0) && (qx === 0 || qy === 0 || qx === qy) && qx === Math.round(qx) && qy === Math.round(qy)) return Math.max(qx, qy);
                return null;
            }

            Point.prototype.toString = Point_toString;
            function Point_toString(){
                return Math.round(this.x()) + "," + Math.round(this.y());
            }

        })();

        /* End helper classes */

        /* Begin misc utilities */
        H$.Util = {};
        //TODO: separate private and public utilities
        H$.Util.sizeof = function(obj){
            var size = 0;
            for(var key in obj){
                if(obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        H$.Util.calcR = function(s){
            return Math.cos(Math.PI / 6.0) * s;
        };

        H$.Util.relativeCoordsFromClick= function(klass, click){
            var board = d3.select("." + klass)[0][0];
            return [click.pageX - board.offsetLeft, click.pageY - board.offsetTop];
        };


        var DIRECTION = {
            NE: { value: 0, name: "Northeast", offset: new Point(1, -1) },
            E: { value: 1, name: "East", offset: new Point(1, 0) },
            SE: { value: 2, name: "Southeast", offset: new Point(0, 1) },
            SW: { value: 3, name: "Southwest", offset: new Point(-1, 1) },
            W: { value: 4, name: "West", offset: new Point(-1, 0) },
            NW: { value: 5, name: "Northwest", offset: new Point(0, -1) }
        };
        (function(){
            // Set up reverse mapping for DIRECTION lookup
            for(var prop in DIRECTION){
                if(!DIRECTION.hasOwnProperty(prop)) continue;
                DIRECTION[DIRECTION[prop].value] = DIRECTION[prop];
                DIRECTION[DIRECTION[prop].name] = DIRECTION[prop];
                DIRECTION[DIRECTION[prop].offset] = DIRECTION[prop];
            }
            DIRECTION.START = 0;
            DIRECTION.END = 6;
        })();
        H$.DIRECTION = Object.freeze(DIRECTION);

        /* End utilities */

    }

    function loadMetaclasses(){
        H$.Action = function(obj){
            if(obj instanceof H$.HexGrid){
                this.steps = [];
                this.root = obj;
            } else if(obj instanceof H$.Hexagon){
                var loc = obj.getLocation();
                return new H$.Action(obj.grid).get(loc.x(), loc.y());
            } else throw "exception: H$.Action doesn't support mocking objects of that type";
        };

        H$.Action.$deserialize = Action_deserialize;
        function Action_deserialize(root, json){
            return fromRaw(JSON.parse(json));

            function fromRaw(raw){
                var action = root.action();
                action.steps = raw.steps;
                for(var i = 0; i < action.steps.length; i++){
                    // Extract arguments from the current step
                    var args = action.steps[i][2];
                    for(var j = 0; j < args.length; j++){
                        var arg = args[j];
                        if(arg && arg.hasOwnProperty("root")) args[j] = fromRaw(arg);
                    }
                }
                return action;
            }
        }

        H$.Action.prototype.$exec = Action_exec;
        function Action_exec(){
            return this.steps.reduce(function(prev, cur){
                var klass = cur[0];
                var fn = cur[1];
                var args = cur[2];
                var evaluatedArgs = [];
                for(var i = 0; i < args.length; i++){
                    if(args[i] instanceof H$.Action){
                        evaluatedArgs.push(args[i].$exec());
                    } else {
                        evaluatedArgs.push(args[i]);
                    }
                }
                return H$[klass].prototype[fn].apply(prev, evaluatedArgs);
            }, this.root);
        }

        // TODO: serialize Hexagon objects as a board.get call
        var classes = ["HexGrid", "Hexagon"];
        for(var i = 0; i < classes.length; i++){
            var klass = classes[i];
            var fns = H$[klass].prototype;
            for(var fnName in fns){
                // Skip hasOwnProperty check since we're explicitly going through the prototype
                if(H$.Action.prototype[fnName]) throw "exception: repeat function name in Action. ABANDON SHIP!";
                H$.Action.prototype[fnName] = function(k, f){
                    return function(){
                        this.steps.push([k, f, Array.prototype.slice.call(arguments)]);
                        return this;
                    }
                }(klass, fnName);
            }
            H$[klass].prototype.action = Action_factory;
            function Action_factory(json){
                if(json) return H$.Action.$deserialize(this, json);
                else return new H$.Action(this);
            }
        }

        H$.Action.prototype.$serialize = Action_serialize;
        function Action_serialize(){
            function censor(key, value){
                if(value instanceof H$.Action) value.root = null;
                return value;
            }
            return JSON.stringify(this, censor);
        }
    }

    /**
     * What follows is code for rendering and manipulating the grid in an svg canvas.
     * This code is only used on the client-side.
     */
    function loadClientCode(){
        // d3 extensions
        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
                this.parentNode.appendChild(this);
            });
        };

        // Private helpers and utilities
        var calcAssetX = function(hex, asset){
            return hex.center().x() - (asset.width / 2.0);
        };

        var calcAssetY = function(hex, asset){
            return hex.center().y() - (asset.height / 2.0);
        };

        //Begin client-side code injection

        H$.HexGrid.prototype.initNewBackgroundImage = HexGrid_initNewBackgroundImage_client;
        function HexGrid_initNewBackgroundImage_client(path){
            // Generate unique id for new pattern
            var id = this.getDOMClass() + "-bg-" + (H$.Util.sizeof(this.patterns) + 1);
            var s = this.getHexagonSize();
            d3.select("." + this.getDOMClass() + " defs")
                .append("svg:pattern")
                .attr("id", id)
                .attr("width", 1)
                .attr("height", 1)
                .append("svg:image")
                .attr("xlink:href", path)
                // Centers a square background in the hexagon
                .attr("x", (H$.Util.calcR(s) - s))
                .attr("y", 0)
                .attr("width", s * 2)
                .attr("height", s * 2);
            this.patterns[path] = id;
            return this;
        }

        H$.HexGrid.prototype.destroyDetachedAsset = HexGrid_destroyDetachedAsset;
        function HexGrid_destroyDetachedAsset(asset){
            delete asset.animating;
            d3.select("." + asset.klass).remove();
            var i = this.detachedAssets.indexOf(asset);
            this.detachedAssets.splice(i, 1);
            return this;
        }

        /**
         * The move animations are designed to be as interruptable as possible; the payload
         * and asset are loaded into the destination at the beginning of the animation,
         * and a dummy asset is created and moved from the source to the destination.
         * If animations are interrupted, internal state is clean but these dummy assets
         * do not get cleaned up (they are left to sit forever, invisible, under the grid).
         * This function cleans these up.
         */
        H$.HexGrid.prototype.interruptAnimations = HexGrid_interruptAnimations;
        function HexGrid_interruptAnimations(){

            // slice to copy array to avoid concurrent modification issues
            var rogue = this.detachedAssets.slice(0);
            for(var i = 0; i < rogue.length; i++){
                if(rogue[i].animating) this.destroyDetachedAsset(rogue[i]);
            }
            return this;
        }

        /**
         * Note: this is not compatible with the array-of-payloads
         * generated by pushPayload
         */
        H$.Hexagon.prototype.detachDrawnAsset = Hexagon_detachDrawnAsset;
        function Hexagon_detachDrawnAsset(){
            var assetClass = this.getHexClass() + H$.Asset.CSS_SUFFIX;
            var newClass = assetClass + "-detached";
            d3.select("." + assetClass)
                .attr("class", newClass);
            var asset = this.payload.getAsset();
            this.payload.setAsset(null);
            asset.klass = newClass;
            this.grid.detachedAssets.push(asset);
            return asset;
        }

        H$.Hexagon.prototype.reattachAsset = Hexagon_reattachAsset;
        function Hexagon_reattachAsset(asset){
            var assetClass = this.getHexClass() + H$.Asset.CSS_SUFFIX;
            d3.select("." + asset.klass)
                .attr("class", assetClass);
            var i = this.grid.detachedAssets.indexOf(asset);
            this.grid.detachedAssets.splice(i, 1);
            delete asset.klass;
            delete asset.animating;
            this.payload.setAsset(asset);
            return this;
        }

        // Private helper
        function drawAsset(hex, asset, i){
            var assetClass = hex.getHexClass() + H$.Asset.CSS_SUFFIX;
            if(i) assetClass += "-" + i;

            d3.select("." + assetClass).remove();
            if(asset != null){
                d3.select("." + hex.getGridClass()).append("svg:image")
                    .attr("class", assetClass)
                    .attr("xlink:href", asset.path)
                    .attr("width", asset.width)
                    .attr("height", asset.height)
                    .attr("x", calcAssetX(hex, asset))
                    .attr("y", calcAssetY(hex, asset));
            }
        }

        H$.Hexagon.prototype.draw = Hexagon_draw;
        function Hexagon_draw(){
            d3.select("." + this.getHexClass()).remove();
            d3.select("." + this.getGridClass()).append("svg:polygon")
                .attr("class", this.getHexClass())
                .attr("points", this.vertices().join(" "))
                .style("stroke", "black")
                .style("fill", (this.fill != null ? this.fill : "none"));

            if(Array.isArray(this.payload)){
                // TODO
            } else {
                drawAsset(this, this.payload.asset);
            }

            return this;
        }

        H$.Hexagon.prototype.undraw = Hexagon_undraw;
        function Hexagon_undraw(){
            d3.select("." + this.getHexClass()).remove();
            d3.select("." + this.getHexClass() + H$.Asset.CSS_SUFFIX).remove();
        }

        /**
         * This is also not yet compatible with arrays of payloads.
         */
        H$.Hexagon.prototype.movePayload = Hexagon_movePayload;
        function Hexagon_movePayload(targetHex, options){
            return this.movePayloadAlongPath([targetHex], options);
        }

        H$.Hexagon.prototype.movePayloadAlongPath = Hexagon_movePayloadAlongPath;
        function Hexagon_movePayloadAlongPath(path, options){
            options = options || {};
            var duration = options["duration"] || H$.Asset.DEFAULT_ANIMATION_DURATION;
            duration /= path.length;

            var grid = this.grid;
            var targetHex = path[path.length - 1];

            var asset = this.detachDrawnAsset();
            asset.animating = true;

            //targetHex.draw = function(){ throw "tried to draw" };
            targetHex.setPayload(this.popPayload());
            targetHex.payload.setAsset(asset);

            animate(0);
            return targetHex;

            function animate(i){
                var nextHex = path[i];
                d3.select("." + asset.klass)
                    .moveToFront()
                    .transition()
                    .duration(duration)
                    .attr("x", calcAssetX(nextHex, asset))
                    .attr("y", calcAssetY(nextHex, asset))
                    .each("end", function(){
                        if(i === path.length - 1){
                            grid.destroyDetachedAsset(asset);
                            targetHex.draw();
                            if(options["callback"]) options["callback"](targetHex);
                        } else {
                            animate(i + 1);
                        }
                    });
            }

        }

    }
})();