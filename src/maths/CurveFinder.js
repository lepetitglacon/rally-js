export default class CurveFinder {

    static TYPES = {
        BRUTE_FORCE: 'brute force',
        CLOSEST_POINT: 'closest point'
    }

    constructor(type) {



        switch (type) {
            case CurveFinder.TYPES.BRUTE_FORCE: {
                this.getClosestPoint = this.findClosestPoint
            }
        }
    }

    findClosestPoint(curvePoints, targetPoint) {
        let closestPoint = null;
        let minDistance = Infinity;

        for (const point of curvePoints) {
            const distance = targetPoint.distanceTo(point)
            // console.log(distance)
            // const distance = Math.sqrt(Math.pow(point.x - targetPoint.x, 2) + Math.pow(point.y - targetPoint.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        }

        return { point: closestPoint, distance: minDistance };
    }

    closestPointOnLineSegment(p0, p1, targetPoint) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const t = ((targetPoint.x - p0.x) * dx + (targetPoint.y - p0.y) * dy) / (dx * dx + dy * dy);

        if (t < 0) {
            return p0; // Closest point is p0 (beginning of the line segment)
        } else if (t > 1) {
            return p1; // Closest point is p1 (end of the line segment)
        }

        const projection = {
            x: p0.x + t * dx,
            y: p0.y + t * dy,
        };
        return projection; // Closest point is the projection of targetPoint onto the line segment
    }
}