// a substitution for the point class can be
// any location object which can be used as follow
// substitution = substitution.x, substitution.y
class Point {
    constructor(x, y, userData = null) {
        this.x = x;
        this.y = y;
        this.userData = userData;
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        // from center
        this.x = x;
        this.y = y;

        // half length
        this.w = w;
        this.h = h;
    }

    intersects(range) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h
        )
    }

    // check if any x, y are in the rectangle or on the exact edge
    contains(point) {
        return (
            point.x >= this.x - this.w &&
            point.x <= this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y <= this.y + this.h
        )
    }

    // return a new rectangle of a given region
    subdivide(region) {
        switch (region) {
            case 'ne':
                return new Rectangle(this.x + this.w / 2, this.y - this.h / 2, this.w / 2, this.h / 2);
            case 'nw':
                return new Rectangle(this.x - this.w / 2, this.y - this.h / 2, this.w / 2, this.h / 2);
            case 'se':
                return new Rectangle(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2);
            case 'sw':
                return new Rectangle(this.x - this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2);
        }
    }
}

// circle class for a circle shaped query
class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSquared = this.r * this.r;
    }

    contains(point) {
        // check if the point is in the circle by checking if the euclidean distance of
        // the point and the center of the circle if smaller or equal to the radius of
        // the circle
        let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
        return d <= this.rSquared;
    }

    intersects(range) {

        let xDist = Math.abs(range.x - this.x);
        let yDist = Math.abs(range.y - this.y);

        // radius of the circle
        let r = this.r;

        let w = range.w / 2;
        let h = range.h / 2;

        let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

        // no intersection
        if (xDist > (r + w) || yDist > (r + h))
            return false;

        // intersection within the circle
        if (xDist <= w || yDist <= h)
            return true;

        // intersection on the edge of the circle
        return edges <= this.rSquared;
    }
}

class QuadTree {
    constructor(boundary, capacity = 4) {
        // Rectangle class
        this.boundary = boundary;

        // the max number of points in a section
        this.capacity = capacity;

        // list of points in the quad
        this.points = [];

        // if the quad as been divided into other quads
        this.divided = false;
    }

    // divide the quad into 4 region like quad
    // northeast, northwest, southeast, southwest
    subdivide() {
        const b = this.boundary;

        this.northeast = new QuadTree(b.subdivide('ne'), this.capacity);
        this.northwest = new QuadTree(b.subdivide('nw'), this.capacity);
        this.southeast = new QuadTree(b.subdivide('se'), this.capacity);
        this.southwest = new QuadTree(b.subdivide('sw'), this.capacity);

        this.divided = true;
    }

    // adds a point like object to the quad
    // or if the quad is at max capacity divide it
    // and insert it in the corresponding region
    // point = point.x && point.y
    insert(point) {
        if (!this.boundary.contains(point)) return false;

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        } else {
            if (!this.divided) this.subdivide();

            if (this.northeast.insert(point)) return true;
            if (this.northwest.insert(point)) return true;
            if (this.southeast.insert(point)) return true;
            if (this.southwest.insert(point)) return true;
        }
    }

    // query the points like object in a given range and returns them
    query(range, found = []) {
        if (!this.boundary.intersects(range)) return found;
        for (let p of this.points)
            if (range.contains(p)) found.push(p);

        if (this.divided) {
            this.northeast.query(range, found);
            this.northwest.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }

        return found;
    }

    // use p5js to draw the QuadTree and its points
    show() {
        stroke(255);
        strokeWeight(1);
        noFill();
        rect(
            this.boundary.x - this.boundary.w,
            this.boundary.y - this.boundary.h,
            this.boundary.w * 2,
            this.boundary.h * 2
        );
        if (this.divided) {
            this.northeast.show();
            this.northwest.show();
            this.southeast.show();
            this.southwest.show();
        }
        for (let p of this.points) {
            point(p.x, p.y);
        }
    }
}