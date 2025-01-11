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

function DrawParameters(center_x, center_y, scale, max_iter, pixel_size, color_depth, escape_distance) {
    // An object used to store parameters for drawing the Mandelbrot Set
    this.center_x = center_x;
    this.center_y = center_y;
    this.scale = scale;
    this.max_iter = max_iter;
    this.pixel_size = pixel_size;
    this.color_depth = color_depth;
    this.escape_distance = escape_distance;
};

function drawMandelbrot(context, parameters) {

};

function testFunction() {
    alert(math.evaluate("2+2"));
};

