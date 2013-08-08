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
                if(this.grid[coords] != null) throw "exception: attempting to add a duplicate hexagon!";
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
                    var datum = data[i]
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
                for (var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].undraw();
                    delete this.grid[pointStr];
                }
                return this;
            }

            H$.HexGrid.prototype.drawAll = HexGrid_drawAll;
            function HexGrid_drawAll(){
                for (var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].draw();
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
            H$.HexGrid.prototype.setGlobalBackgroundColor = HexGrid_setGlobalBackgroundColor;

            function HexGrid_setGlobalBackgroundColor(css){
                for (var pointStr in this.grid){
                    if(!this.grid.hasOwnProperty(pointStr)) continue;
                    this.grid[pointStr].setBackgroundColor(css);
                }
                return this;
            }
            H$.HexGrid.prototype.get = HexGrid_get;
            function HexGrid_get(q, r){
                var coords = new Point(q, r);
                if(this.grid[coords] === undefined) throw "exception: attempting to get nonexistent hexagon!";
                return this.grid[coords]
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
            function Asset_path(){ return path; }
            this.path = Asset_path;

            function Asset_width(){ return width; }
            this.width = Asset_width;

            function Asset_height(){ return height; }
            this.height = Asset_height;
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

            this.fill = null;

            this.payload = new Payload(null, null);
        };

        (function(){


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

            function Hexagon_height(){
                return 2 * this.size();
            }

            function Hexagon_width(){
                return 2 * H$.Util.calcR(this.size());
            }

            function Hexagon_size(){
                return this.grid.getHexagonSize();
            }

            function Hexagon_getGridClass(){
                return this.grid.getDOMClass();
            }

            function Hexagon_getHexClass(){
                return this.grid.getDOMClass() + "-" + this.center().toString().replace(",", "-");
            }

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

            function Hexagon_setBackgroundColor(css){
                this.fill = css;
                return this;
            }

            function Hexagon_setPayload(payload){
                if(payload === null) this.payload = new Payload(null, null);
                else this.payload = payload;
                return this;
            }

            function Hexagon_getPayload(){
                return this.payload;
            }

            function Hexagon_getPayloadData(){
                return this.payload.getData();
            }

            /**
             * A shortcut function that clears the hexagon's payload,
             * and returns it. Convenient for "move"
             * actions in games.
             */
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

            function Hexagon_getNeighbor(direction){
                return findNeighbor(this, direction);
            }

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
            function Hexagon_getDirectionTo(finish){
                var delta = finish.getLocation().subtract(this.getLocation());
                for(var i = DIRECTION.START; i < DIRECTION.END; i++){
                    var q = delta.divide(DIRECTION[i].offset);
                    if(q != null) return DIRECTION[i];
                }
                return null;
            }

            function Hexagon_getStraightLineDistanceTo(finish){
                var delta = finish.getLocation().subtract(this.getLocation());
                for(var i = DIRECTION.START; i < DIRECTION.END; i++){
                    var q = delta.divide(DIRECTION[i].offset);
                    if(q != null) return Math.abs(q);
                }
                return null;
            }

            H$.Hexagon.prototype = {
                vertices: Hexagon_vertices,
                height: Hexagon_height,
                width: Hexagon_width,
                size: Hexagon_size,
                getGridClass: Hexagon_getGridClass,
                getHexClass: Hexagon_getHexClass,
                setBackgroundImage: Hexagon_setBackgroundImage,
                setBackgroundColor: Hexagon_setBackgroundColor,
                getPayload: Hexagon_getPayload,
                getPayloadData: Hexagon_getPayloadData,
                setPayload: Hexagon_setPayload,
                popPayload: Hexagon_popPayload,
                getNeighbor: Hexagon_getNeighbor,
                getNeighbors: Hexagon_getNeighbors,
                getDirectionTo: Hexagon_getDirectionTo,
                getStraightLineDistanceTo: Hexagon_getStraightLineDistanceTo
            };

        })();

        /**
         * A simple immutable Point class with a hashable
         * and svg-compatible toString representation.
         * @param x
         * @param y
         * @constructor
         */
        var Point = function(x, y){
            function Point_x(){ return x; }
            function Point_y(){ return y; }

            this.x = Point_x;
            this.y = Point_y;
        };

        (function(){
            /**
             * Returns a new Point at the given offset from the current point.
             */
            function Point_next(dx, dy){
                return new Point(this.x() + dx, this.y() + dy);
            }

            function Point_add(pt2){
                return new Point(this.x() + pt2.x(), this.y() + pt2.y());
            }

            function Point_subtract(pt2){
                return new Point(this.x() - pt2.x(), this.y() - pt2.y());
            }

            /**
             * If this point is a scalar multiple of the given point,
             * returns that scalar. Otherwise, returns null. We do some
             * fiddling to allow "dividing" by zero so that (0,2) / (0,1) = 2
             */
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

            function Point_toString(){
                return Math.round(this.x()) + "," + Math.round(this.y());
            }
            Point.prototype = {
                next: Point_next,
                add: Point_add,
                subtract: Point_subtract,
                divide: Point_divide,
                toString: Point_toString
            };
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
                    var args = action.steps[i][2];
                    for(var j = 0; j < args.length; j++){
                        if(args[j].hasOwnProperty("root")) args[j] = fromRaw(args[j]);
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
                for(var i = 0; i < args.length; i++){
                    if(args[i] instanceof H$.Action) args[i] = args[i].$exec();
                }
                return H$[klass].prototype[fn].apply(prev, args);
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

        //TODO: deserialize (with root param)

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
            return hex.center().x() - (asset.width() / 2.0);
        };

        var calcAssetY = function(hex, asset){
            return hex.center().y() - (asset.height() / 2.0);
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
        }

        H$.Hexagon.prototype.detachDrawnAsset = Hexagon_detachDrawnAsset;
        function Hexagon_detachDrawnAsset(){
            var assetClass = this.getHexClass() + H$.Asset.CSS_SUFFIX;
            d3.select("." + assetClass)
                .attr("class", assetClass + "-detached");
            var asset = this.payload.getAsset();
            this.payload.setAsset(null);
            return asset;
        }

        H$.Hexagon.prototype.draw = Hexagon_draw;
        function Hexagon_draw(){
            d3.select("." + this.getHexClass()).remove();
            d3.select("." + this.getGridClass()).append("svg:polygon")
                .attr("class", this.getHexClass())
                .attr("points", this.vertices().join(" "))
                .style("stroke", "black")
                .style("fill", (this.fill != null ? this.fill : "none"));

            var assetClass = this.getHexClass() + H$.Asset.CSS_SUFFIX;
            var asset = this.payload.asset;
            d3.select("." + assetClass).remove();
            if(asset != null){
                d3.select("." + this.getGridClass()).append("svg:image")
                    .attr("class", assetClass)
                    .attr("xlink:href", asset.path())
                    .attr("width", asset.width())
                    .attr("height", asset.height())
                    .attr("x", calcAssetX(this, asset))
                    .attr("y", calcAssetY(this, asset));
            }
            return this;
        }

        H$.Hexagon.prototype.undraw = Hexagon_undraw;
        function Hexagon_undraw(){
            d3.select("." + this.getHexClass()).remove();
            d3.select("." + this.getHexClass() + H$.Asset.CSS_SUFFIX).remove();
        }

        H$.Hexagon.prototype.movePayload = Hexagon_movePayload;
        function Hexagon_movePayload(targetHex, options){
            var currentHex = this;
            options = options || {};
            duration = options["duration"] || H$.Asset.DEFAULT_ANIMATION_DURATION;
            var assetClass = this.getHexClass() + H$.Asset.CSS_SUFFIX;
            var asset = this.payload.getAsset();

            targetHex.setPayload(this.payload);
            if(currentHex != targetHex) currentHex.payload = new H$.Payload(null, null);

            d3.select("." + assetClass)
                .moveToFront()
                .transition()
                .duration(duration)
                .attr("x", calcAssetX(targetHex, asset))
                .attr("y", calcAssetY(targetHex, asset))
                .each("end", function(){
                    targetHex.draw();
                    currentHex.draw();
                    if(options["callback"] != undefined) options["callback"](targetHex);
                });
            return targetHex;
        }

    }
})();