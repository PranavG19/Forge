/**
 * Simple fluid dynamics simulation for water animations
 */

export interface FluidPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pressure: number;
  density: number;
}

export class FluidSimulation {
  private points: FluidPoint[] = [];
  private width: number;
  private height: number;
  private gravity: number = 0.05;
  private damping: number = 0.98;
  private pressureStrength: number = 0.1;
  private densityStrength: number = 0.1;
  private interactionRadius: number = 50;

  constructor(width: number, height: number, numPoints: number = 50) {
    this.width = width;
    this.height = height;
    this.initializePoints(numPoints);
  }

  /**
   * Initialize fluid points with random positions
   */
  private initializePoints(numPoints: number): void {
    this.points = [];

    for (let i = 0; i < numPoints; i++) {
      this.points.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0,
        vy: 0,
        pressure: 0,
        density: 0,
      });
    }
  }

  /**
   * Add a new point to the simulation
   */
  addPoint(x: number, y: number, vx: number = 0, vy: number = 0): FluidPoint {
    const point: FluidPoint = {
      x,
      y,
      vx,
      vy,
      pressure: 0,
      density: 0,
    };

    this.points.push(point);
    return point;
  }

  /**
   * Calculate the distance between two points
   */
  private distance(p1: FluidPoint, p2: FluidPoint): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Update the fluid simulation
   */
  update(deltaTime: number = 1): void {
    // Calculate densities
    for (const point of this.points) {
      point.density = 0;

      for (const other of this.points) {
        if (point === other) continue;

        const dist = this.distance(point, other);
        if (dist < this.interactionRadius) {
          // Density increases as points get closer
          point.density += 1 - dist / this.interactionRadius;
        }
      }
    }

    // Calculate pressures
    for (const point of this.points) {
      point.pressure = point.density * this.pressureStrength;
    }

    // Apply forces
    for (const point of this.points) {
      // Apply gravity
      point.vy += this.gravity * deltaTime;

      // Apply pressure forces
      let fx = 0;
      let fy = 0;

      for (const other of this.points) {
        if (point === other) continue;

        const dist = this.distance(point, other);
        if (dist < this.interactionRadius && dist > 0) {
          // Direction from other to point
          const dx = (point.x - other.x) / dist;
          const dy = (point.y - other.y) / dist;

          // Pressure force is proportional to both pressures
          const force =
            (point.pressure + other.pressure) *
            (1 - dist / this.interactionRadius);

          fx += dx * force * this.densityStrength;
          fy += dy * force * this.densityStrength;
        }
      }

      // Apply forces to velocity
      point.vx += fx * deltaTime;
      point.vy += fy * deltaTime;

      // Apply damping
      point.vx *= this.damping;
      point.vy *= this.damping;

      // Update position
      point.x += point.vx * deltaTime;
      point.y += point.vy * deltaTime;

      // Boundary conditions
      if (point.x < 0) {
        point.x = 0;
        point.vx *= -0.5;
      } else if (point.x > this.width) {
        point.x = this.width;
        point.vx *= -0.5;
      }

      if (point.y < 0) {
        point.y = 0;
        point.vy *= -0.5;
      } else if (point.y > this.height) {
        point.y = this.height;
        point.vy *= -0.5;
      }
    }
  }

  /**
   * Get all fluid points
   */
  getPoints(): FluidPoint[] {
    return this.points;
  }

  /**
   * Add a disturbance to the fluid
   */
  addDisturbance(x: number, y: number, strength: number = 5): void {
    for (const point of this.points) {
      const dx = point.x - x;
      const dy = point.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.interactionRadius) {
        const force = strength * (1 - dist / this.interactionRadius);
        const angle = Math.atan2(dy, dx);

        point.vx += Math.cos(angle) * force;
        point.vy += Math.sin(angle) * force;
      }
    }
  }

  /**
   * Clear all points
   */
  clear(): void {
    this.points = [];
  }

  /**
   * Set simulation parameters
   */
  setParameters(params: {
    gravity?: number;
    damping?: number;
    pressureStrength?: number;
    densityStrength?: number;
    interactionRadius?: number;
  }): void {
    if (params.gravity !== undefined) this.gravity = params.gravity;
    if (params.damping !== undefined) this.damping = params.damping;
    if (params.pressureStrength !== undefined)
      this.pressureStrength = params.pressureStrength;
    if (params.densityStrength !== undefined)
      this.densityStrength = params.densityStrength;
    if (params.interactionRadius !== undefined)
      this.interactionRadius = params.interactionRadius;
  }
}

// Create a singleton instance
export const fluidSimulation = new FluidSimulation(300, 500);
