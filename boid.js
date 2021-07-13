class Boid {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = p5.Vector.random2D().setMag(4);
        this.acc = createVector();
        this.maxForce = 0.3;
        this.maxSpeed = 3;
        this.size = 3;
    }

    checkEdges() {
        if (this.pos.x < 0) this.pos.x = width;
        else if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = height;
        else if (this.pos.y > height) this.pos.y = 0;
    }

    flockInBoids(boids, action, perceptionRadius = 50) {
        let steeringAmount = createVector();
        let total = 0;

        for (boid of boids) {
            let distance = dist(boid.pos.x, boid.pos.y, this.pos.x, this.pos.y);
            if (boid != this && distance < perceptionRadius) {
                steeringAmount = action(boid, steeringAmount, distance);
                total++;
            }
        }

        return { steeringAmount, total };
    }

    alignment(boids, alignmentForce = 0.7) {
        const { steeringAmount, total } =
        this.flockInBoids(
            boids,
            (boid, steering) => steering.add(boid.vel),
            45
        );
        if (total > 0) steeringAmount.div(total).sub(this.vel).limit(this.maxForce).mult(alignmentForce);
        this.applyForce(steeringAmount);
    }

    cohesion(boids, cohesionForce = 0.3) {
        const { steeringAmount, total } =
        this.flockInBoids(
            boids,
            (boid, steering) => steering.add(boid.pos),
            30
        );
        if (total > 0) steeringAmount.div(total).sub(this.pos).sub(this.vel).limit(this.maxForce).mult(cohesionForce);
        this.applyForce(steeringAmount);
    }


    separation(boids, separationForce = 5) {
        const { steeringAmount, total } =
        this.flockInBoids(
            boids,
            (boid, steering, distance) =>
            steering.add(p5.Vector.sub(this.pos, boid.pos).div(distance)),
            12
        );
        if (total > 0) steeringAmount.div(total).sub(this.vel).limit(this.maxForce).mult(separationForce);
        this.applyForce(steeringAmount);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.setMag(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show(theOne) {
        const boidColor = theOne ? color('tomato') : 255
            // strokeWeight(16);
        stroke(boidColor);
        fill(boidColor);
        // point(this.pos.x, this.pos.y);
        push();
        strokeWeight(1);
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        triangle(0, this.size / 2, 0, -this.size / 2, this.size * 2, 0);
        pop();
        if (theOne) {
            noFill();
            strokeWeight(2);
            stroke(color('tomato'));
            circle(this.pos.x, this.pos.y, 200);
        }
    }

    flock(
        boids,
        theOne = false, {
            alignmentForce = 0.7,
            cohesionForce = 0.3,
            separationForce = 5
        } = {
            alignmentForce: 0.7,
            cohesionForce: 0.3,
            separationForce: 5
        }
    ) {
        this.alignment(boids, alignmentForce);
        this.cohesion(boids, cohesionForce)
        this.separation(boids, separationForce);
        this.checkEdges();
        this.update();
        this.show(theOne);
    }
}