import { Scene } from 'phaser';

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest';
export type ArmorSlot = 'helmet' | 'armor' | 'gloves' | 'bracers' | 'boots' | 'ring' | 'amulet';
export type EquipmentSlot =
  | 'helmet'
  | 'armor'
  | 'gloves'
  | 'boots'
  | 'ring'
  | 'amulet'
  | 'mainHand'
  | 'offHand';
export type ConsumableEffect = 'heal' | 'buff';

export interface Item {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  quantity: number;
  equipable: boolean;
  equipSlot?: EquipmentSlot;
}

export interface WeaponItem extends Item {
  type: 'weapon';
  damage: number;
  range: number;
  attackSpeed: number;
}

export interface ArmorItem extends Item {
  type: 'armor';
  defense: number;
  slot: EquipmentSlot;
}

export interface ConsumableItem extends Item {
  type: 'consumable';
  effect: string;
  duration: number;
}

export interface QuestItem extends Item {
  type: 'quest';
  questId: number;
}

export type Item = WeaponItem | ArmorItem | ConsumableItem | QuestItem;

export class ItemSprite extends Phaser.Physics.Arcade.Sprite {
  public itemData: Item;

  constructor(scene: Scene, x: number, y: number, itemData: Item) {
    super(scene, x, y, 'item');
    this.itemData = itemData;
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}
