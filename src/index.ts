import 'phaser';
import './styles/main.css';
import { MainScene } from './scenes/MainScene';
import { InventoryScene } from './scenes/InventoryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1366,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [MainScene, InventoryScene],
  parent: 'game',
};

new Phaser.Game(config);
