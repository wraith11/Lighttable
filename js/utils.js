export function getWallPoints(p1, p2, inCurve) {
    if (Math.abs(inCurve) < 0.1) return [{x:p1.x, y:p1.y}, {x:p2.x, y:p2.y}];

    const points = [];
    const curve = Math.max(-9.9, Math.min(9.9, inCurve));
    
    const dx = p2.x - p1.x; const dy = p2.y - p1.y;
    const L_sq = dx*dx + dy*dy;
    const L = Math.sqrt(L_sq);
    const sagitta = (curve / 10.0) * (L * 0.5); 
    
    if (Math.abs(sagitta) < 1) return [{x:p1.x, y:p1.y}, {x:p2.x, y:p2.y}];
    
    const sSafe = Math.abs(sagitta) < 0.1 ? 0.1 : Math.abs(sagitta);
    const R = (L_sq + 4*sagitta*sagitta) / (8*sSafe);
    
    const mx = (p1.x + p2.x) / 2; const my = (p1.y + p2.y) / 2;
    const nx = -dy / L; const ny = dx / L;
    
    const distToCenter = R - Math.abs(sagitta);
    const dir = sagitta > 0 ? 1 : -1;
    
    const cx = mx + nx * distToCenter * dir;
    const cy = my + ny * distToCenter * dir;
    
    const startAngle = Math.atan2(p1.y - cy, p1.x - cx);
    const endAngle = Math.atan2(p2.y - cy, p2.x - cx);
    
    let totalAngle = endAngle - startAngle;
    while (totalAngle <= -Math.PI) totalAngle += Math.PI * 2;
    while (totalAngle > Math.PI) totalAngle -= Math.PI * 2;

    const arcLength = Math.abs(totalAngle * R);
    const segments = Math.max(10, Math.ceil(arcLength / 10));

    for(let i=0; i<=segments; i++) {
        const t = i/segments;
        const ang = startAngle + totalAngle * t;
        points.push({x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R});
    }
    return points;
}

export function getWallPoly(p1, p2, width, curve) {
    if(Math.abs(curve) < 0.1) {
         const dx = p2.x - p1.x; const dy = p2.y - p1.y;
         const len = Math.hypot(dx, dy);
         if(len < 0.1) return [];
         const nx = -(dy / len) * (width/2);
         const ny = (dx / len) * (width/2);
         return [
             p1.x + nx, p1.y + ny,
             p2.x + nx, p2.y + ny,
             p2.x - nx, p2.y - ny,
             p1.x - nx, p1.y - ny
         ];
    } else {
        const centerPoints = getWallPoints(p1, p2, curve);
        if(centerPoints.length < 2) return [];
        const polyPoints = []; const halfThick = width / 2;
        // Outer
        for(let i=0; i<centerPoints.length; i++) {
            const curr = centerPoints[i]; let normal;
            if (i < centerPoints.length - 1) {
                const next = centerPoints[i+1]; const dx = next.x - curr.x; const dy = next.y - curr.y; const len = Math.hypot(dx, dy); normal = { x: -dy/len, y: dx/len };
            } else {
                const prev = centerPoints[i-1]; const dx = curr.x - prev.x; const dy = curr.y - prev.y; const len = Math.hypot(dx, dy); normal = { x: -dy/len, y: dx/len };
            }
            polyPoints.push(curr.x + normal.x * halfThick, curr.y + normal.y * halfThick);
        }
        // Inner
        for(let i=centerPoints.length-1; i>=0; i--) {
            const curr = centerPoints[i]; let normal;
            if (i < centerPoints.length - 1) {
                const next = centerPoints[i+1]; const dx = next.x - curr.x; const dy = next.y - curr.y; const len = Math.hypot(dx, dy); normal = { x: -dy/len, y: dx/len };
            } else {
                const prev = centerPoints[i-1]; const dx = curr.x - prev.x; const dy = curr.y - prev.y; const len = Math.hypot(dx, dy); normal = { x: -dy/len, y: dx/len };
            }
            polyPoints.push(curr.x - normal.x * halfThick, curr.y - normal.y * halfThick);
        }
        return polyPoints;
    }
}

export function distToSegment(p, v, w) { 
    const l2 = (w.x - v.x)**2 + (w.y - v.y)**2; 
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y); 
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2; 
    t = Math.max(0, Math.min(1, t)); 
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y))); 
}

export function getIntersection(r1,r2,s1,s2) { 
    const rdx=r2.x-r1.x, rdy=r2.y-r1.y, sdx=s2.x-s1.x, sdy=s2.y-s1.y; 
    const d=sdx*rdy-sdy*rdx; 
    if(d===0) return null; 
    const u=(rdx*(s1.y-r1.y)+rdy*(r1.x-s1.x))/d, t=(s1.x+sdx*u-r1.x)/rdx; 
    return (u>=0&&u<=1&&t>=0&&t<=1)?{x:r1.x+rdx*t, y:r1.y+rdy*t}:null; 
}

// D3: Räumliche Grid-Indexierung der Wand-Segmente.
// Berechnet nur Segmente, deren Bounding-Box in Zellen um den Ursprung liegt.
// Identisches visuelles Ergebnis, aber deutlich schneller bei vielen Segmenten.
function buildSegmentGrid(segments, cellSize) {
    const grid = new Map();
    for (let s of segments) {
        const minX = Math.floor(Math.min(s.a.x, s.b.x) / cellSize);
        const maxX = Math.floor(Math.max(s.a.x, s.b.x) / cellSize);
        const minY = Math.floor(Math.min(s.a.y, s.b.y) / cellSize);
        const maxY = Math.floor(Math.max(s.a.y, s.b.y) / cellSize);
        for (let gx = minX; gx <= maxX; gx++) {
            for (let gy = minY; gy <= maxY; gy++) {
                const k = gx + '_' + gy;
                let arr = grid.get(k);
                if (!arr) { arr = []; grid.set(k, arr); }
                arr.push(s);
            }
        }
    }
    return grid;
}

function querySegmentGrid(grid, origin, radius, cellSize) {
    // +1 Zelle Rand in jede Richtung: Segmente an Zellgrenzen gehen sonst verloren,
    // was zu Lücken (Bleeding-Linien) an senkrechten Zellgrenzen führt.
    const minX = Math.floor((origin.x - radius) / cellSize) - 1;
    const maxX = Math.floor((origin.x + radius) / cellSize) + 1;
    const minY = Math.floor((origin.y - radius) / cellSize) - 1;
    const maxY = Math.floor((origin.y + radius) / cellSize) + 1;
    const result = [];
    const seen = new Set();
    for (let gx = minX; gx <= maxX; gx++) {
        for (let gy = minY; gy <= maxY; gy++) {
            const arr = grid.get(gx + '_' + gy);
            if (!arr) continue;
            for (let s of arr) {
                if (!seen.has(s)) { seen.add(s); result.push(s); }
            }
        }
    }
    return result;
}

export function calculateVisibility(origin, segments, gridCache) {
    let points = []; 
    for (let i = 0; i < segments.length; i++) {
        points.push(segments[i].a, segments[i].b);
    }
    const R = origin.radius; 
    
    // Strict Visibility: Keine künstliche Penetration mehr.
    // Das Licht stoppt exakt an der Wandkante.
    const boundaryCount = 32;
    for(let i=0; i<boundaryCount; i++) {
        const angle = (i / boundaryCount) * Math.PI * 2;
        points.push({
            x: origin.x + Math.cos(angle) * R,
            y: origin.y + Math.sin(angle) * R
        });
    }
    
    let angles = []; 
    for(let i=0; i<points.length; i++) {
        const p = points[i];
        const ang = Math.atan2(p.y-origin.y, p.x-origin.x);
        angles.push({val: ang-0.0001, p:p}, {val: ang, p:p}, {val: ang+0.0001, p:p});
    }
    
    angles.sort((a,b) => a.val - b.val);

    // D3: Bei vielen Segmenten nur die relevanten testen (Bounding-Box um den Ursprung).
    // Das Grid wird gecacht (über gridCache), damit es nicht pro Aufruf neu gebaut wird.
    let testSegments = segments;
    if (segments.length > 40) {
        const cellSize = Math.max(1, R * 0.5);
        let grid = gridCache ? gridCache.grid : null;
        if (!grid || grid.cellSize !== cellSize || grid.version !== gridCache.version) {
            grid = { cellSize, map: buildSegmentGrid(segments, cellSize) };
            if (gridCache) { gridCache.grid = grid; grid.version = gridCache.version; }
        }
        testSegments = querySegmentGrid(grid.map, origin, R, cellSize);
    }
    
    let intersects = [];
    for(let i=0; i<angles.length; i++) {
        const angObj = angles[i];
        const dx = Math.cos(angObj.val);
        const dy = Math.sin(angObj.val);
        
        let closest = {x: origin.x+dx*R, y: origin.y+dy*R, dist: R*R, hit: false};
        
        for(let j=0; j<testSegments.length; j++) {
            const s = testSegments[j];
            const target = {x: origin.x+dx*R, y: origin.y+dy*R};
            const hitPt = getIntersection(origin, target, s.a, s.b);
            
            if(hitPt) {
                const distSq = (hitPt.x-origin.x)**2 + (hitPt.y-origin.y)**2;
                if(distSq < closest.dist) {
                    closest = {x: hitPt.x, y: hitPt.y, dist: distSq, hit: true};
                }
            }
        }
        intersects.push(closest);
    }
    return intersects;
}