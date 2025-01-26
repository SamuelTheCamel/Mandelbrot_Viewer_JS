/*
Module for Mandelbrot Viewer JS
by Samuel Voltz

Dependencies:
math.js
*/

function loadScript(src) {
    /*
    Loads a script from the given location (creates a script HTML element)
    */
    const script_elem = document.createElement("script");
    script_elem.src = src;
    script_elem.onerror = function() {
        alert("Failed to load script from " + src);
    }
    document.head.appendChild(script_elem)
}

// Load libraries
loadScript("https://unpkg.com/mathjs@14.0.1/lib/browser/math.js");

class DrawParameters {
    constructor(center_x, center_y, zoom, max_iter, pixel_size, color_depth, complex_mode,
        recursive_function_z, recursive_function_x, recursive_function_y, escape_condition) {
        /*
        Constructs an object used to store parameters for drawing the Mandelbrot Set
        center_x, center_y: set the coordinates at the center of the canvas
        zoom: determines how far zoomed in the image is (logarithmic scale)
        max_iter: the maximum number of iterations of the recursive function before quitting
        pixel_size: the size of each pixel that will be drawn (set to larger value to decrease computation time)
        color_depth: the rate of color change
        recursive_function: the compiled recursive function (created using math.parse("...").compile())
        escape_condition: when this condition is true, the recursive function will be counted as escaped (use math.parse("...").compile())
        complex_mode: true for complex variable z, false for real variables x and y
        */
        // Default values
        center_x ??= 0;
        center_y ??= 0;
        zoom ??= 5;
        max_iter ??= 200;
        pixel_size ??= 3;
        color_depth ??= 20;
        complex_mode ??= true;
        recursive_function_z ??= math.parse("z^2 + c").compile();
        recursive_function_x ??= math.parse("x^2 - y^2 + cx").compile();
        recursive_function_y ??= math.parse("2*x*y + cy").compile();
        if (complex_mode) {
            escape_condition ??= math.parse("abs(z) > 100").compile();
        } else {
            escape_condition ??= math.parse("x^2 + y^2 > 10000").compile();
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
    }
};

function calcNextIterComplex(recursive_function, z, c) {
    /*
    Performs the recursive function one time (for complex mode)
    Returns z'
    */
    return recursive_function.evaluate({z:z, c:c});
}

function calcNextIterReal(recursive_function_x, recursive_function_y, x, y, cx, cy) {
    /*
    Performs the recursive function one time (for real mode)
    Returns {x', y'}
    */
    let new_x = recursive_function_x.evaluate({x:x, y:y, cx:cx, cy:cy});
    let new_y = recursive_function_y.evaluate({x:x, y:y, cx:cx, cy:cy});
    return {x:new_x, y:new_y}
}

function checkEscapeComplex(escape_condition, z) {
    /*
    Checks if z satisfies the escape condition or is Infinity / NaN
    */
    return Boolean(escape_condition.evaluate({z:z}) || !isFinite(math.abs(z)));
}

function checkEscapeReal(escape_condition, x, y) {
    /*
    Checks if the given values for x and y satisfy the escape condition or are Infinity / NaN
    */
    return Boolean(escape_condition.evaluate({x:x, y:y}) || !isFinite(x) || !isFinite(y));
}

function calcEscapeIterationsComplex(parameters, c) {
    /*
    Calculates the number of iterations to escape from the given starting value c. (for complex mode)
    If it escapes, this returns the number of iterations (a positive integer).
    If it does not escape, this returns Infinity.
    */
    let z = c;
    let iter = 0;
    while (!checkEscapeComplex(parameters.escape_condition, z) && iter < parameters.max_iter) {
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
    while (!checkEscapeReal(parameters.escape_condition, x, y) && iter < parameters.max_iter) {
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

function drawPixel(context, parameters, pixel_x, pixel_y, num_iters) {
    /*
    Draws a pixel on the canvas at the given location with the given number of iterations.
    num_iters:
        = finite number if recursive funciton escaped
        = infinity if recursive function did not escape
        = NaN if an error occured
    context: the context of the canvas (use canvas.getContext("2d"))
    */

    if (isFinite(num_iters)) {
        let hue = num_iters * 0.1 * parameters.color_depth;
        context.fillStyle = "hsl(" + hue % 360 + ", 100%, 50%)";
    } else {
        if (isNaN(num_iters)) {
            context.fillStyle = "hsl(0, 0%, 50%)";
        } else {
            context.fillStyle = "hsl(0, 100%, 0%)";
        }
    }

    context.fillRect(pixel_x, pixel_y, parameters.pixel_size, parameters.pixel_size);
}

async function drawFractal(canvas, context, parameters, abort_signal, callback, _start_x, _start_y) {
    /*
    Draws the desired fractal on the given canvas with the given context.

    context: the context of the given canvas (use canvas.getContext("2d"))
    parameters: a DrawParameters instance that specifies the recursive function, location, zoom, etc.
    abort_signal: an abort signal
    callback: function that will be called once completed (will not be called if aborted)

    DO NOT USE THESE PARAMETERS:
    _start_x: the starting value of pixel_x
    _start_y: the starting value of pixel_y
    */

    _start_x ??= 0;
    _start_y ??= 0;

    let pixel_x = _start_x;
    let pixel_y = _start_y;

    const scale = 1 / Math.exp(parameters.zoom);

    const width = canvas.width
    const height = canvas.height
    const mid_x = (canvas.width) / 2;
    const mid_y = (canvas.height) / 2;

    const start_time = Date.now()

    while (pixel_y < height) {
        while (pixel_x < width) {

            if (abort_signal != null && abort_signal.aborted) { // check for abort signal
                return
            }

            if (parameters.complex_mode) {

                let c_real = (pixel_x - mid_x) * scale + parameters.center_x;
                let c_imag = - (pixel_y - mid_y) * scale + parameters.center_y;
                let num_iters = NaN;

                try {
                    num_iters = calcEscapeIterationsComplex(parameters, math.complex(c_real, c_imag));
                } catch (error) {
                    showErrorMessage("Error in computation: " + String(error));
                }
                drawPixel(context, parameters, pixel_x, pixel_y, num_iters);

            } else {

                let cx = (pixel_x - mid_x) * scale + parameters.center_x;
                let cy = - (pixel_y - mid_y) * scale + parameters.center_y;
                let num_iters = NaN;

                try {
                    num_iters = calcEscapeIterationsReal(parameters, cx, cy);
                } catch (error) {
                    showErrorMessage("Error in computation: " + String(error));
                }
                drawPixel(context, parameters, pixel_x, pixel_y, num_iters);

            }
            
            pixel_x += parameters.pixel_size;
        }

        // allow website to render in between lines
        if (Date.now() - start_time > 33) {
            requestIdleCallback(function() {
                drawFractal(canvas, context, parameters, abort_signal, callback, pixel_x, pixel_y);
            });
            return
        }

        pixel_y += parameters.pixel_size;
        pixel_x = 0;
    }

    // call callback function once complete

    if (callback != null) {
        callback();
    }
};

function showErrorMessage(message) {
    /*
    Displays an error message to the user in the HTML document
    */
    document.getElementById("error_message").innerHTML = message;
    document.getElementById("error_message").setAttribute("style", "display:block; color:red");
}