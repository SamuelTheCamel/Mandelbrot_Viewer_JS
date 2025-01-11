// Module for Mandelbrot Viewer JS

function DrawParameters(center_x, center_y, scale, max_iter, pixel_size, color_depth, escape_distance) {
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

