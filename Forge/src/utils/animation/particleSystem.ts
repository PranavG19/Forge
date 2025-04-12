/**
 * Particle system utility for creating dynamic particle effects
 */

export interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: {
    x: number;
    y: number;
  };
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private lastId = 0;

  /**
   * Create a new particle
   */
  createParticle(
    x: number,
    y: number,
    options: {
      size?: number;
      opacity?: number;
      velocityX?: number;
      velocityY?: number;
      rotation?: number;
      rotationSpeed?: number;
      lifetime?: number;
      color?: string;
    } = {},
  ): Particle {
    const {
      size = 10,
      opacity = 1,
      velocityX = 0,
      velocityY = 0,
      rotation = 0,
      rotationSpeed = 0,
      lifetime = 1000,
      color = '#FFFFFF',
    } = options;

    const particle: Particle = {
      id: `particle_${++this.lastId}`,
      x,
      y,
      size,
      opacity,
      velocity: {
        x: velocityX,
        y: velocityY,
      },
      rotation,
      rotationSpeed,
      lifetime,
      maxLifetime: lifetime,
      color,
    };

    this.particles.push(particle);
    return particle;
  }

  /**
   * Create multiple particles at once
   */
  createParticles(
    count: number,
    x: number,
    y: number,
    optionsFactory: (index: number) => any = () => ({}),
  ): Particle[] {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(this.createParticle(x, y, optionsFactory(i)));
    }
    return particles;
  }

  /**
   * Update all particles based on elapsed time
   */
  update(deltaTime: number): void {
    // Update each particle
    this.particles.forEach(particle => {
      // Update position based on velocity
      particle.x += particle.velocity.x * deltaTime;
      particle.y += particle.velocity.y * deltaTime;

      // Update rotation
      particle.rotation += particle.rotationSpeed * deltaTime;

      // Update lifetime
      particle.lifetime -= deltaTime;

      // Update opacity based on lifetime
      particle.opacity = Math.max(0, particle.lifetime / particle.maxLifetime);
    });

    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.lifetime > 0);
  }

  /**
   * Get all active particles
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Remove all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Create fire particles
   */
  createFireParticles(
    x: number,
    y: number,
    count: number = 10,
    options: {
      baseSize?: number;
      baseVelocity?: number;
      colors?: string[];
    } = {},
  ): Particle[] {
    const {
      baseSize = 15,
      baseVelocity = 50,
      colors = ['#FF5722', '#FF9800', '#FFEB3B'],
    } = options;

    return this.createParticles(count, x, y, index => {
      const angle = Math.random() * Math.PI * 2;
      const speed = baseVelocity * (0.5 + Math.random() * 0.5);
      const size = baseSize * (0.5 + Math.random() * 0.5);
      const lifetime = 500 + Math.random() * 1000;
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        size,
        opacity: 0.7 + Math.random() * 0.3,
        velocityX: Math.cos(angle) * speed * 0.2,
        velocityY: Math.sin(angle) * speed - speed * 0.8, // Mostly upward
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        lifetime,
        color,
      };
    });
  }

  /**
   * Create water particles
   */
  createWaterParticles(
    x: number,
    y: number,
    count: number = 10,
    options: {
      baseSize?: number;
      baseVelocity?: number;
      colors?: string[];
    } = {},
  ): Particle[] {
    const {
      baseSize = 12,
      baseVelocity = 30,
      colors = ['#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA'],
    } = options;

    return this.createParticles(count, x, y, index => {
      const angle = Math.random() * Math.PI - Math.PI / 2; // Mostly horizontal
      const speed = baseVelocity * (0.5 + Math.random() * 0.5);
      const size = baseSize * (0.5 + Math.random() * 0.5);
      const lifetime = 1000 + Math.random() * 2000;
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        size,
        opacity: 0.5 + Math.random() * 0.5,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5, // Slower rotation for water
        lifetime,
        color,
      };
    });
  }
}

export const particleSystem = new ParticleSystem();
