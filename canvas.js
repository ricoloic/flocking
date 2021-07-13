let canvas;
let theOne;
let boids = [];

let alignmentSlider, cohesionSlider, separationSlider;

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    const mainNodeDOM = canvas.parent();
    canvas.parent("canvas-container");
    mainNodeDOM.remove();

    alignmentSlider = createSlider(0, 5, 0.5, 0.1).position(50, 10);
    cohesionSlider = createSlider(0, 5, 0.2, 0.1).position(200, 10);
    separationSlider = createSlider(0, 5, 4.3, 0.1).position(350, 10);
    alignmentP = createP().position(60, 30).style('color', 'white');
    cohesionP = createP().position(210, 30).style('color', 'white');
    separationP = createP().position(360, 30).style('color', 'white');

    for (let i = 0; i < 80; i++)
        boids.push(new Boid());
    theOne = new Boid();
}

function draw() {
    background(30);
    alignmentP.html(`alignment: ${alignmentSlider.value()}`);
    cohesionP.html(`cohesion: ${cohesionSlider.value()}`);
    separationP.html(`separation: ${separationSlider.value()}`);
    
    const tempBoids = [...boids]
    for (boid of boids) {
        boid.flock(
            tempBoids,
            false,
            {
                alignmentForce: alignmentSlider.value(),
                cohesionForce: cohesionSlider.value(),
                separationForce: separationSlider.value()
            }
        );
    }
    theOne.flock(boids, true);
}