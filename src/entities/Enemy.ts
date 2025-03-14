import { Scene } from 'phaser';
import { Item } from './Item';

export interface EnemyStats {
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  speed: number;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public stats: EnemyStats;
  public inventory: Item[] = [];

  constructor(scene: Scene, x: number, y: number, stats: EnemyStats, inventory: Item[] = []) {
    super(scene, x, y, 'enemy');
    this.stats = stats;
    this.inventory = inventory;
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public takeDamage(amount: number): number {
    const actualDamage = Math.max(1, amount - this.stats.defense);
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
    return actualDamage;
  }

  public heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  public isDead(): boolean {
    return this.stats.health <= 0;
  }

  public dropLoot(): Item[] {
    return this.inventory;
  }

  public update(player: Phaser.Physics.Arcade.Sprite): void {
    // Calcular direção para o jogador
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Mover em direção ao jogador se estiver longe
    if (distance > 100) {
      const angle = Math.atan2(dy, dx);
      this.setVelocityX(Math.cos(angle) * this.stats.speed);
      this.setVelocityY(Math.sin(angle) * this.stats.speed);
    } else {
      this.setVelocity(0, 0);
    }
  }
}
