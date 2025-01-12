/*
Module for Mandelbrot Viewer JS
by Samuel Voltz

Dependencies:
math.js
*/

function loadScript(src) {
    const script_elem = document.createElement("script");
    script_elem.src = src;
    script_elem.onerror = function() {
        alert("Failed to load script from " + src);
    }
    document.head.appendChild(script_elem)
}

// Load libraries
loadScript("https://unpkg.com/mathjs@14.0.1/lib/browser/math.js");

function DrawParameters(center_x, center_y, zoom, max_iter, pixel_size, color_depth, complex_mode, 
    recursive_function_z, recursive_function_x, recursive_function_y, escape_condition) {
    /*
    Constructs an object used to store parameters for drawing the Mandelbrot Set
    center_x, center_y: set the coordinates at the center of the canvas
    zoom: determines how far zoomed in the image is (logarithmic scale)
    max_iter: the maximum number of iterations of the recursive function before quitting
    pixel_size: the size of each pixel that will be drawn (set to larger value to decrease computation time)
    color_depth: the rate of color change
    recursive_function: the recursive function represented by a parse tree (use math.parse())
    escape_condition: when this condition is true, the recursive function will be counted as escaped (use math.parse())
    complex_mode: true for complex variable z, false for real variables x and y
    */

    // Default values
    center_x ??= 0;
    center_y ??= 0;
    zoom ??= 4;
    max_iter ??= 1000;
    pixel_size ??= 1;
    color_depth ??= 6;
    complex_mode ??= true;
    recursive_function_z ??= math.parse("z^2 + c");
    recursive_function_x ??= math.parse("x^2 - y^2 + cx")
    recursive_function_y ??= math.parse("2*x*y + cy")
    if (complex_mode) {
        escape_condition ??= math.parse("abs(z) > 2");
    } else {
        escape_condition ??= math.parse("x^2 + y^2 > 4");
    }

    this.center_x = center_x;
    this.center_y = center_y;
    this.zoom = zoom;
    this.max_iter = max_iter;
    this.pixel_size = pixel_size;
    this.color_depth = color_depth;
    this.recursive_function_z = recursive_function_z;
    this.recursive_function_x = recursive_function_x;
    this.recursive_function_y = recursive_function_y;
    this.escape_condition = escape_condition;
    this.complex_mode = complex_mode;
};

function calcNextIterComplex(recursive_function, z, c) {
    /*
    Performs the recursive function one time (for complex mode)
    Returns z'
    */
    let eval_node = recursive_function.cloneDeep();
    return eval_node.evaluate({z:z, c:c});
}

function calcNextIterReal(recursive_function_x, recursive_function_y, x, y, cx, cy) {
    /*
    Performs the recursive function one time (for real mode)
    Returns {x', y'}
    */
    let eval_node_x = recursive_function_x.cloneDeep();
    let eval_node_y = recursive_function_y.cloneDeep();
    let new_x = eval_node_x.evaluate({x:x, y:y, cx:cx, cy:cy});
    let new_y = eval_node_y.evaluate({x:x, y:y, cx:cx, cy:cy});
    return {x:new_x, y:new_y}
}

function checkEscapeComplex(escape_condition, z) {
    let eval_node = escape_condition.cloneDeep();
    return Boolean(eval_node.evaluate({z:z}));
}

function checkEscapeReal(escape_condition, x, y) {
    let eval_node = escape_condition.cloneDeep();
    return Boolean(eval_node.evaluate({x:x, y:y}));
}

function calcEscapeIterationsComplex(parameters, c) {
    /*
    Calculates the number of iterations to escape from the given starting value c. (for complex mode)
    If it escapes, this returns the number of iterations (a positive integer).
    If it does not escape, this returns Infinity.
    */
    let z = c;
    let iter = 0;
    while (!checkEscapeComplex(z) && iter < parameters.max_iter) {
        z = calcNextIterComplex(parameters.recursive_function_z, z, c);
        iter++;
    }
    if (iter == parameters.max_iter) {
        return Infinity
    } else {
        return iter
    }
}

function calcEscapeIterationsReal(parameters, cx, cy) {
    /*
    Calculates the number of iterations to escape from the given starting point (cx, cy). (for real mode)
    If it escapes, this returns the number of iterations (a positive integer).
    If it does not escape, this returns Infinity.
    */
    let x = cx;
    let y = cy;
    let iter = 0;
    while (!checkEscapeReal(x,y) && iter < parameters.max_iter) {
        let xy = calcNextIterReal(parameters.recursive_function_x, parameters.recursive_function_y, x, y, cx, cy);
        x = xy.x;
        y = xy.y;
        iter++;
    }
    if (iter == parameters.max_iter) {
        return Infinity
    } else {
        return iter
    }
}

function drawFractal(context, parameters) {
    
};

function testFunction() {
    // TODO: delete this
    alert(math.evaluate("2+2"));
};
