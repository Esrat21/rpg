import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ItemSprite } from '../entities/Item';

export class MainScene extends Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: ItemSprite[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private inventoryKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    // Carregar assets
    this.load.spritesheet('player', 'assets/sprites/characters/player.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 8,
      spacing: 16,
    });

    this.load.spritesheet('enemy', 'assets/sprites/characters/slime.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 8,
      spacing: 16,
    });
    this.load.image('item', 'assets/item.png');
  }

  create(): void {
    // Configurar controles
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.inventoryKey = this.input.keyboard.addKey('I');
    }

    // Configurar animações do jogador
    this.anims.create({
      key: 'player_idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'player_walk',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    // Configurar animações do slime
    this.anims.create({
      key: 'slime_idle',
      frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'slime_move',
      frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }),
      frameRate: 6,
      repeat: -1,
    });

    // Criar jogador
    this.player = new Player(this, 400, 300);
    this.player.play('player_idle');

    // Criar inimigos
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemyStats = {
        health: 100,
        maxHealth: 100,
        damage: 10,
        defense: 5,
        speed: 2,
      };
      const enemy = new Enemy(this, x, y, enemyStats, []);
      enemy.play('slime_idle');
      this.enemies.push(enemy);
    }

    // Configurar colisões
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.overlap(
      this.player,
      this.items,
      (object1, object2) => {
        if (object1 instanceof Player && object2 instanceof ItemSprite) {
          this.collectItem(object1, object2);
        }
      },
      undefined,
      this
    );

    // Inicia o spawn de itens
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true,
    });
  }

  update(): void {
    // Atualiza o estado do jogo
    if (this.inventoryKey.isDown) {
      this.scene.pause();
      this.scene.launch('InventoryScene', { player: this.player });
    }

    this.player.update(this.cursors);
    this.enemies.forEach(enemy => enemy.update(this.player));
  }

  private collectItem(player: Player, item: ItemSprite): void {
    if (player.addItem(item.itemData)) {
      item.destroy();
      this.items = this.items.filter(i => i !== item);
    }
  }

  private spawnItem(): void {
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    const itemData = {
      id: this.items.length + 1,
      name: 'Item ' + (this.items.length + 1),
      type: 'weapon' as const,
      damage: Phaser.Math.Between(5, 15),
      quantity: 1,
    };
    const item = new ItemSprite(this, x, y, itemData);
    this.items.push(item);
  }
}
