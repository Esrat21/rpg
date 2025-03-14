import { Scene } from 'phaser';
import { Enemy } from './Enemy';
import { Item, WeaponItem, ArmorItem, ConsumableItem } from './Item';

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  maxHp: number;
}

export interface Equipment {
  helmet?: Item;
  armor?: Item;
  gloves?: Item;
  bracers?: Item;
  boots?: Item;
  ring1?: Item;
  ring2?: Item;
  amulet?: Item;
  mainHand?: Item;
  offHand?: Item;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 160;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public level: number = 1;
  public experience: number = 0;
  public inventory: (Item | null)[] = Array(24).fill(null);
  public equipment: {
    helmet: Item | null;
    armor: Item | null;
    gloves: Item | null;
    boots: Item | null;
    ring1: Item | null;
    ring2: Item | null;
    amulet: Item | null;
    mainHand: Item | null;
    offHand: Item | null;
  } = {
    helmet: null,
    armor: null,
    gloves: null,
    boots: null,
    ring1: null,
    ring2: null,
    amulet: null,
    mainHand: null,
    offHand: null,
  };
  public attributes: Attributes = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    hp: 100,
    maxHp: 100,
  };

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setDrag(300);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
    }

    // Inicializar com alguns itens básicos
    const sword: WeaponItem = {
      id: 1,
      name: 'Espada Básica',
      description: 'Uma espada simples',
      type: 'weapon',
      quantity: 1,
      equipable: true,
      equipSlot: 'mainHand',
      damage: 10,
      range: 1,
      attackSpeed: 1.0,
    };

    const armor: ArmorItem = {
      id: 2,
      name: 'Armadura Básica',
      description: 'Uma armadura simples',
      type: 'armor',
      quantity: 1,
      equipable: true,
      equipSlot: 'armor',
      defense: 5,
      slot: 'armor',
    };

    const potion: ConsumableItem = {
      id: 3,
      name: 'Poção de Cura',
      description: 'Restaura 50 HP',
      type: 'consumable',
      quantity: 5,
      equipable: false,
      effect: 'heal',
      duration: 0,
    };

    this.addItem(sword);
    this.addItem(armor);
    this.addItem(potion);
  }

  update(): void {
    if (!this.cursors) return;

    let isMoving = false;

    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
      isMoving = true;
    } else {
      this.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.setVelocityY(-this.speed);
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(this.speed);
      isMoving = true;
    } else {
      this.setVelocityY(0);
    }

    // Play appropriate animation based on movement state
    if (isMoving && this.anims.currentAnim?.key !== 'player_walk') {
      this.play('player_walk');
    } else if (!isMoving && this.anims.currentAnim?.key !== 'player_idle') {
      this.play('player_idle');
    }
  }

  public isInventoryFull(): boolean {
    return !this.inventory.some(slot => slot === null);
  }

  public addItem(item: Item): boolean {
    if (this.isInventoryFull()) {
      return false;
    }

    const emptySlot = this.inventory.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
      this.inventory[emptySlot] = item;
      return true;
    }
    return false;
  }

  public removeItem(slotIndex: number): Item | null {
    if (slotIndex >= 0 && slotIndex < this.inventory.length) {
      const item = this.inventory[slotIndex];
      this.inventory[slotIndex] = null;
      return item;
    }
    return null;
  }

  public canEquipItem(item: Item): boolean {
    if (!item.equipable || !item.equipSlot) return false;

    const slot = item.equipSlot as keyof typeof this.equipment;
    if (!this.equipment[slot]) return true;

    // Se já houver um item equipado, verifica se há espaço no inventário
    return !this.isInventoryFull();
  }

  public equipItem(slotIndex: number): boolean {
    const item = this.inventory[slotIndex];
    if (!item || !item.equipable) return false;

    const slot = item.equipSlot as keyof typeof this.equipment;
    if (slot && this.equipment[slot] !== undefined) {
      // Se já houver um item equipado, coloca-o no inventário
      if (this.equipment[slot]) {
        const oldItem = this.equipment[slot];
        if (oldItem) {
          const emptySlot = this.inventory.findIndex(s => s === null);
          if (emptySlot !== -1) {
            this.inventory[emptySlot] = oldItem;
          } else {
            return false; // Não há espaço no inventário
          }
        }
      }

      this.equipment[slot] = item;
      this.inventory[slotIndex] = null;
      return true;
    }

    return false;
  }

  public canUnequipItem(slot: keyof typeof this.equipment): boolean {
    if (!this.equipment[slot]) return false;
    return !this.isInventoryFull();
  }

  public unequipItem(slot: keyof typeof this.equipment): boolean {
    const item = this.equipment[slot];
    if (!item) return false;

    if (this.isInventoryFull()) {
      return false;
    }

    const emptySlot = this.inventory.findIndex(s => s === null);
    if (emptySlot !== -1) {
      this.inventory[emptySlot] = item;
      this.equipment[slot] = null;
      return true;
    }

    return false;
  }

  public canUseConsumable(itemId: number): boolean {
    const item = this.inventory.find(i => i?.id === itemId);
    if (!item || item.type !== 'consumable') return false;

    const consumable = item as ConsumableItem;
    switch (consumable.effect) {
      case 'heal':
        return this.attributes.hp < this.attributes.maxHp;
      case 'buff':
        return true; // Implementar lógica de buff quando necessário
      default:
        return false;
    }
  }

  private attackCooldown: number = 0;
  private attackGraphics!: Phaser.GameObjects.Graphics;
  private currentWeaponRange: number = 100;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setDrag(300);
    this.setOffset(16, 16);

    // Create attack visualization
    this.attackGraphics = scene.add.graphics();
    this.attackGraphics.setVisible(false);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
    }
  }

  public attack(): void {
    if (this.attackCooldown > 0) return;

    // Show attack area
    this.showAttackArea();

    // Get enemies in attack range
    const enemies = this.scene.physics.overlapRect(
      this.x - this.currentWeaponRange,
      this.y - this.currentWeaponRange,
      this.currentWeaponRange * 2,
      this.currentWeaponRange * 2
    ) as Phaser.Physics.Arcade.Body[];

    // Damage enemies in cone area
    const attackAngle = this.flipX ? Math.PI : 0;
    const coneAngle = Math.PI / 3; // 60 degrees

    enemies.forEach(enemy => {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const angle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(angle - attackAngle);

      if (angleDiff < coneAngle / 2) {
        const enemyInstance = enemy.gameObject as Enemy;
        enemyInstance.takeDamage(this.attributes.strength);
      }
    });

    // Set attack cooldown
    this.attackCooldown = 30;
  }

  private showAttackArea(): void {
    this.attackGraphics.clear();
    this.attackGraphics.setVisible(true);

    // Draw cone shape
    const coneAngle = Math.PI / 3;
    const startAngle = this.flipX ? Math.PI - coneAngle / 2 : -coneAngle / 2;
    const endAngle = this.flipX ? Math.PI + coneAngle / 2 : coneAngle / 2;

    this.attackGraphics.fillStyle(0xff0000, 0.3);
    this.attackGraphics.beginPath();
    this.attackGraphics.moveTo(this.x, this.y);
    this.attackGraphics.arc(this.x, this.y, this.currentWeaponRange, startAngle, endAngle);
    this.attackGraphics.closePath();
    this.attackGraphics.fillPath();

    // Hide after short delay
    this.scene.time.delayedCall(200, () => {
      this.attackGraphics.setVisible(false);
    });
  }

  public useConsumable(itemId: number): boolean {
    const item = this.inventory.find(i => i?.id === itemId);
    if (!item || item.type !== 'consumable') return false;

    const consumable = item as ConsumableItem;
    if (!this.canUseConsumable(itemId)) return false;

    // Aplicar efeito do item
    switch (consumable.effect) {
      case 'heal':
        this.attributes.hp = Math.min(this.attributes.maxHp, this.attributes.hp + 50);
        break;
      case 'buff':
        // Implementar lógica de buff
        break;
    }

    // Remover item usado
    const slotIndex = this.inventory.indexOf(item);
    if (slotIndex !== -1) {
      this.removeItem(slotIndex);
      return true;
    }
    return false;
  }
}
