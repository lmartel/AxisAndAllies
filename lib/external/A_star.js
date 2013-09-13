/**
 * A* pathfinding algorithm implementation by Leo Martel (http://lpm.io)
 * Use it if you want it; MIT License.
 *
 * {Location} can be any object that works with ===. Just make sure your grid, start, and target are all {Location}s.
 *
 * @param {Array.Location} all       array of all possible grid locations
 * @param {Location} start           the starting location
 * @param {Location} target          the ending location
 * @param {Object} options :
 *      neighbors: function(Location) => {Array.Location}   produces all viable neighbors.
 *          Default: assumes Location is a [x,y] tuple on a rectangular grid.
 *      heuristic: function(Location) => {Number}           a function that "guesses" the distance and never overestimates
 *          (for example, Manhattan distance on a rectangular grid)
 *          Default: always guesses 0. This reduces A* to Dijkstra's algorithm.
 *      cost: function(Location) => {Number}                a function that calculates the movement cost through the given location.
 *          Default: all Locations cost 1 to move through.
 */
A_star = function a_star(all, start, target, options){
    var neighborsFn = options["neighbors"] || function(point){
        return [
            [ point[0] - 1, point[1] ],
            [ point[0] + 1, point[1] ],
            [ point[0], point[1] - 1 ],
            [ point[0], point[1] + 1 ]
        ];
    };
    var heuristicFn = options["heuristic"] || function(point){ return 0; };
    var costFn = options["cost"] || function(point){ return 1; };

    var todo = [];
    var visited = [];
    var done = [];
    for(var i = 0; i < all.length; i++){
        todo.push(new Node(all[i]));
    }
    var startNode = visit(start, 0); //this.getlocation

    var pq = new PriorityQueue();
    pq.push(startNode, priority(startNode));

    var u;
    while(Object.keys(visited).length > 0){
        u = pq.pop();
        var d = finalize(u);
        if(u.coords === target) break;
        var neighbors = neighborsFn(u.coords); // u.hex.getNeighbors();
        for(var i = 0; i < neighbors.length; i++){
            var loc = neighbors[i];
            //var loc = hex.getLocation();
            var L = costFn(loc);

            var v = todo[find(todo, loc)];
            if(v){
                visit(v.coords, d + L);
                v.parent = u;
                pq.push(v, d + L + priority(v));
            }
            v = visited[find(visited, loc)];
            if(v && v.candidate > d + L){
                v.candidate = d + L;
                v.parent = u;
                pq.move(v, d + L + priority(v));
            }
        }
    }

    // Path does not include start node
    var path = [];
    while(u.parent !== null){
        path.push(u.coords);
        u = u.parent;
    }

    // reverse to get start => finish
    return path.reverse();

    function find(array, coords){
        for(var i = 0; i < array.length; i++){
            if(array[i].coords === coords) return i;
        }
        return false;
    }

    //Generates priority value, including A* heuristic function
    function priority(cur){
        return cur.candidate + heuristicFn(cur.coords);
    }

    function Node(coords){
        this.coords = coords;
        this.parent = null;
        this.candidate = null;
    }

    function visit(coords, candidate){
        var i = find(todo, coords);
        var node = todo.splice(i, 1)[0];

        node.candidate = candidate;
        visited.push(node);
        return node;
    }

    function finalize(node){
        node.distance = node.candidate;
        done.push(node);
        visited.splice(find(visited, node.coords), 1);
        return node.distance;
    }

};
