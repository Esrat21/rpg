import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { Item, WeaponItem, ArmorItem, ConsumableItem } from '../entities/Item';

export class InventoryScene extends Scene {
  private player!: Player;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private equipmentContainer!: Phaser.GameObjects.Container;
  private closeKey!: Phaser.Input.Keyboard.Key;
  private itemDetailsText: Phaser.GameObjects.Text | null = null;
  private statusContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'InventoryScene' });
  }

  init(data: { player: Player }): void {
    this.player = data.player;
  }

  create(): void {
    // Configurar tecla de fechar
    if (this.input.keyboard) {
      this.closeKey = this.input.keyboard.addKey('ESC');
    }

    // Criar fundo semi-transparente
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    // Criar containers centralizados
    this.inventoryContainer = this.add.container(250, 300);
    this.equipmentContainer = this.add.container(550, 300);

    // Criar títulos com estilo melhorado
    const titleStyle = {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      fontFamily: 'Arial',
    };

    this.add.text(250, 100, 'Inventário', titleStyle);
    this.add.text(550, 100, 'Equipamentos', titleStyle);

    // Criar slots de inventário
    this.createInventorySlots();

    // Criar slots de equipamento
    this.createEquipmentSlots();

    // Criar display de status
    this.createStatusDisplay();

    // Adicionar texto de ajuda
    const helpText = this.add.text(400, 550, 'Pressione ESC para fechar', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    helpText.setOrigin(0.5);
  }

  update(): void {
    if (this.closeKey.isDown) {
      this.scene.stop();
      this.scene.resume('MainScene');
    }
  }

  private createInventorySlots(): void {
    const slotSize = 45;
    const padding = 8;
    const rows = 3;
    const cols = 8;
    const totalSlots = rows * cols;

    // Calcular posição inicial para centralizar o grid
    const startX = -((cols - 1) * (slotSize + padding)) / 2;
    const startY = -((rows - 1) * (slotSize + padding)) / 2;

    for (let i = 0; i < totalSlots; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (slotSize + padding);
      const y = startY + row * (slotSize + padding);

      // Criar slot com borda mais suave
      const slot = this.add.rectangle(x, y, slotSize, slotSize, 0x333333);
      slot.setStrokeStyle(2, 0x666666);
      slot.setInteractive();

      // Adicionar item se existir no inventário
      const item = this.player.inventory[i];
      if (item) {
        // Adicionar nome do item com estilo melhorado
        const itemText = this.add.text(x, y - 5, item.name, {
          fontSize: '9px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          wordWrap: { width: slotSize - 8 },
        });
        itemText.setOrigin(0.5);
        this.inventoryContainer.add(itemText);

        // Adicionar quantidade se maior que 1
        if (item.quantity > 1) {
          const quantityText = this.add.text(
            x + slotSize / 2 - 4,
            y + slotSize / 2 - 4,
            item.quantity.toString(),
            {
              fontSize: '11px',
              color: '#ffff00',
              stroke: '#000000',
              strokeThickness: 2,
            }
          );
          quantityText.setOrigin(1, 1);
          this.inventoryContainer.add(quantityText);
        }

        // Adicionar indicador de equipável
        if (item.equipable) {
          const equipableText = this.add.text(x, y + slotSize / 2 - 4, '⚔️', {
            fontSize: '11px',
          });
          equipableText.setOrigin(0.5, 1);
          this.inventoryContainer.add(equipableText);
        }

        // Adicionar interatividade para mostrar detalhes
        slot.on('pointerover', () => this.showItemDetails(item, x, y));
        slot.on('pointerout', () => this.hideItemDetails());
      }

      slot.on('pointerdown', () => this.handleItemClick(item));
      this.inventoryContainer.add(slot);
    }
  }

  private createEquipmentSlots(): void {
    const slotSize = 45;
    const padding = 8;
    const slots = [
      { name: 'Capacete', key: 'helmet', icon: '🪖' },
      { name: 'Armadura', key: 'armor', icon: '🛡️' },
      { name: 'Luvas', key: 'gloves', icon: '🧤' },
      { name: 'Botas', key: 'boots', icon: '👢' },
      { name: 'Anel 1', key: 'ring1', icon: '💍' },
      { name: 'Anel 2', key: 'ring2', icon: '💍' },
      { name: 'Amuleto', key: 'amulet', icon: '📿' },
      { name: 'Mão Principal', key: 'mainHand', icon: '⚔️' },
      { name: 'Mão Secundária', key: 'offHand', icon: '🛡️' },
    ];

    slots.forEach((slot, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = col * (slotSize + padding) - (slotSize + padding) / 2;
      const y =
        row * (slotSize + padding) - ((Math.ceil(slots.length / 2) - 1) * (slotSize + padding)) / 2;

      const slotRect = this.add.rectangle(x, y, slotSize, slotSize, 0x333333);
      slotRect.setStrokeStyle(2, 0x666666);
      slotRect.setInteractive();

      const slotIcon = this.add.text(x, y - 5, slot.icon, {
        fontSize: '18px',
        stroke: '#000000',
        strokeThickness: 2,
      });
      slotIcon.setOrigin(0.5);
      this.equipmentContainer.add(slotIcon);

      const slotText = this.add.text(x, y + slotSize / 2 - 4, slot.name, {
        fontSize: '9px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      });
      slotText.setOrigin(0.5, 1);
      this.equipmentContainer.add(slotText);

      const equippedItem = this.player.equipment[slot.key as keyof typeof this.player.equipment];
      if (equippedItem) {
        const itemText = this.add.text(x, y, equippedItem.name, {
          fontSize: '9px',
          color: '#00ff00',
          stroke: '#000000',
          strokeThickness: 2,
          wordWrap: { width: slotSize - 8 },
        });
        itemText.setOrigin(0.5);
        this.equipmentContainer.add(itemText);

        slotRect.on('pointerover', () => this.showItemDetails(equippedItem, x, y));
        slotRect.on('pointerout', () => this.hideItemDetails());
      }

      slotRect.on('pointerdown', () => this.handleEquipmentSlotClick(slot.key));
      this.equipmentContainer.add(slotRect);
    });
  }

  private updateInventoryView(): void {
    // Limpar containers
    this.inventoryContainer.removeAll(true);
    this.equipmentContainer.removeAll(true);

    // Recriar slots
    this.createInventorySlots();
    this.createEquipmentSlots();

    // Atualizar display de status
    this.createStatusDisplay();
  }

  private showFeedback(message: string): void {
    const feedback = this.add.text(400, 50, message, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    feedback.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      feedback.destroy();
    });
  }

  private updateHealthBar(): void {
    if (!this.statusContainer) return;

    const healthFill = this.statusContainer.list.find(
      obj => obj instanceof Phaser.GameObjects.Rectangle && obj.fillColor === 0xff0000
    ) as Phaser.GameObjects.Rectangle;
    const healthText = this.statusContainer.list.find(
      obj => obj instanceof Phaser.GameObjects.Text && obj.text.includes('HP')
    ) as Phaser.GameObjects.Text;

    if (healthFill && healthText) {
      healthFill.width = 200 * (this.player.attributes.hp / this.player.attributes.maxHp);
      healthText.text = `${this.player.attributes.hp}/${this.player.attributes.maxHp} HP`;
    }
  }

  private showHealAnimation(): void {
    const healText = this.add.text(400, 200, '+50 PV', {
      fontSize: '24px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    healText.setOrigin(0.5);

    this.tweens.add({
      targets: healText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        healText.destroy();
      },
    });
  }

  private showBuffAnimation(): void {
    const buffText = this.add.text(400, 200, 'BUFF!', {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    buffText.setOrigin(0.5);

    this.tweens.add({
      targets: buffText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        buffText.destroy();
      },
    });
  }

  private showDamageAnimation(amount: number): void {
    const damageText = this.add.text(400, 200, `-${amount} PV`, {
      fontSize: '24px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4,
    });
    damageText.setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      },
    });
  }

  public takeDamage(amount: number): void {
    this.player.attributes.hp = Math.max(0, this.player.attributes.hp - amount);
    this.updateHealthBar();
    this.showDamageAnimation(amount);
  }

  private handleItemClick(item: Item | null): void {
    if (!item) return;

    // Se o item for equipável, tenta equipá-lo
    if (item.equipable) {
      const slotIndex = this.player.inventory.indexOf(item);
      if (slotIndex !== -1) {
        if (this.player.canEquipItem(item)) {
          if (this.player.equipItem(slotIndex)) {
            // Atualizar a visualização do inventário
            this.updateInventoryView();
            this.showFeedback(`${item.name} equipado!`);
          }
        } else {
          this.showFeedback('Inventário cheio! Desequipe um item primeiro.');
        }
      }
    }
    // Se o item for consumível, tenta usá-lo
    else if (item.type === 'consumable') {
      if (this.player.canUseConsumable(item.id)) {
        if (this.player.useConsumable(item.id)) {
          // Atualizar a visualização do inventário e a barra de vida
          this.updateInventoryView();
          this.updateHealthBar();

          // Mostrar animação apropriada baseada no efeito do item
          const consumable = item as ConsumableItem;
          if (consumable.effect === 'heal') {
            this.showHealAnimation();
          } else if (consumable.effect === 'buff') {
            this.showBuffAnimation();
          }

          this.showFeedback(`${item.name} usado!`);
        }
      } else {
        this.showFeedback('Você não pode usar este item agora.');
      }
    }
  }

  private handleEquipmentSlotClick(slot: string): void {
    const equipmentSlot = slot as keyof typeof this.player.equipment;
    if (this.player.equipment[equipmentSlot]) {
      const item = this.player.equipment[equipmentSlot];
      if (this.player.canUnequipItem(equipmentSlot)) {
        if (this.player.unequipItem(equipmentSlot)) {
          // Atualizar a visualização do inventário
          this.updateInventoryView();
          if (item) {
            this.showFeedback(`${item.name} desequipado!`);
          }
        }
      } else {
        this.showFeedback('Inventário cheio! Remova um item primeiro.');
      }
    }
  }

  private showItemDetails(item: Item, x: number, y: number): void {
    let details = `${item.name}\n`;
    details += `${item.description}\n`;
    details += `Quantidade: ${item.quantity}\n`;

    if (item.equipable) {
      details += `Equipável: ${item.equipSlot}\n`;
    }

    switch (item.type) {
      case 'weapon':
        const weapon = item as WeaponItem;
        details += `Dano: ${weapon.damage}\n`;
        details += `Alcance: ${weapon.range}\n`;
        details += `Velocidade: ${weapon.attackSpeed}`;
        break;
      case 'armor':
        const armor = item as ArmorItem;
        details += `Defesa: ${armor.defense}`;
        break;
      case 'consumable':
        const consumable = item as ConsumableItem;
        details += `Efeito: ${consumable.effect}\n`;
        details += `Duração: ${consumable.duration}s`;
        break;
    }

    this.itemDetailsText = this.add.text(x + 60, y, details, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
  }

  private hideItemDetails(): void {
    if (this.itemDetailsText) {
      this.itemDetailsText.destroy();
      this.itemDetailsText = null;
    }
  }

  private createStatusDisplay(): void {
    if (this.statusContainer) {
      this.statusContainer.destroy();
    }

    this.statusContainer = this.add.container(1000, 50);

    // Nível do jogador
    const levelText = this.add.text(0, -30, `Nível ${this.player.level}`, {
      fontSize: '16px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    levelText.setOrigin(0.5);

    // Barra de experiência
    const expNeeded = this.player.level * 100;
    const expBar = this.add.rectangle(0, -10, 200, 10, 0x333333);
    const expFill = this.add.rectangle(
      0,
      -10,
      200 * (this.player.experience / expNeeded),
      10,
      0xffff00
    );
    expFill.setOrigin(0, 0.5);
    expBar.setOrigin(0, 0.5);

    // Texto de experiência
    const expText = this.add.text(0, -10, `${this.player.experience}/${expNeeded} EXP`, {
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    expText.setOrigin(0.5);

    // Barra de vida
    const healthBar = this.add.rectangle(0, 20, 200, 20, 0x333333);
    const healthFill = this.add.rectangle(
      0,
      20,
      200 * (this.player.attributes.hp / this.player.attributes.maxHp),
      20,
      0xff0000
    );
    healthFill.setOrigin(0, 0.5);
    healthBar.setOrigin(0, 0.5);

    // Texto de vida
    const healthText = this.add.text(
      0,
      20,
      `${this.player.attributes.hp}/${this.player.attributes.maxHp} PV`,
      {
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    healthText.setOrigin(0.5);

    // Atributos
    const attributes = [
      { name: 'strength', value: this.player.attributes.strength, color: '#ff0000' },
      { name: 'dexterity', value: this.player.attributes.dexterity, color: '#00ff00' },
      { name: 'constitution', value: this.player.attributes.constitution, color: '#ffff00' },
      { name: 'intelligence', value: this.player.attributes.intelligence, color: '#00ffff' },
      { name: 'wisdom', value: this.player.attributes.wisdom, color: '#ff00ff' },
      { name: 'charisma', value: this.player.attributes.charisma, color: '#ffffff' },
    ];

    const attributesText = attributes.map((attr, index) => {
      return this.add.text(
        0,
        50 + index * 20,
        `${this.getAttributeName(attr.name)}: ${attr.value}`,
        {
          fontSize: '12px',
          color: attr.color,
          stroke: '#000000',
          strokeThickness: 2,
        }
      );
    });

    this.statusContainer.add([
      levelText,
      expBar,
      expFill,
      expText,
      healthBar,
      healthFill,
      healthText,
      ...attributesText,
    ]);
  }

  private showLevelUpAnimation(): void {
    const levelUpText = this.add.text(400, 200, 'NÍVEL UP!', {
      fontSize: '32px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    levelUpText.setOrigin(0.5);

    this.tweens.add({
      targets: levelUpText,
      scale: 1.5,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.tweens.add({
          targets: levelUpText,
          y: 150,
          alpha: 0,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            levelUpText.destroy();
          },
        });
      },
    });
  }

  private getAttributeName(attribute: string): string {
    const attributeNames: { [key: string]: string } = {
      strength: 'Força',
      dexterity: 'Destreza',
      constitution: 'Constituição',
      intelligence: 'Inteligência',
      wisdom: 'Sabedoria',
      charisma: 'Carisma',
    };
    return attributeNames[attribute] || attribute;
  }

  private showAttributeAnimation(attribute: string, value: number): void {
    const attributeName = this.getAttributeName(attribute);
    const attributeText = this.add.text(400, 200, `${attributeName}: +1`, {
      fontSize: '24px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    attributeText.setOrigin(0.5);

    this.tweens.add({
      targets: attributeText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        attributeText.destroy();
      },
    });
  }

  public levelUp(): void {
    this.player.level += 1;
    this.player.attributes.maxHp += 10;
    this.player.attributes.hp = this.player.attributes.maxHp;

    // Aumentar atributos aleatoriamente
    const attributes = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ] as const;
    const randomAttribute = attributes[Math.floor(Math.random() * attributes.length)];
    this.player.attributes[randomAttribute] += 1;

    this.updateHealthBar();
    this.updateExperienceBar();
    this.showLevelUpAnimation();
    this.showAttributeAnimation(randomAttribute, this.player.attributes[randomAttribute]);
  }

  private updateExperienceBar(): void {
    if (!this.statusContainer) return;

    const expNeeded = this.player.level * 100;
    const expFill = this.statusContainer.list.find(
      obj => obj instanceof Phaser.GameObjects.Rectangle && obj.fillColor === 0xffff00
    ) as Phaser.GameObjects.Rectangle;
    const expText = this.statusContainer.list.find(
      obj => obj instanceof Phaser.GameObjects.Text && obj.text.includes('EXP')
    ) as Phaser.GameObjects.Text;

    if (expFill && expText) {
      expFill.width = 200 * (this.player.experience / expNeeded);
      expText.text = `${this.player.experience}/${expNeeded} EXP`;
    }
  }

  public gainExperience(amount: number): void {
    this.player.experience += amount;
    this.updateExperienceBar();
    this.showExperienceAnimation(amount);

    // Verificar se subiu de nível
    const expNeeded = this.player.level * 100;
    if (this.player.experience >= expNeeded) {
      this.player.experience -= expNeeded;
      this.levelUp();
    }
  }

  private showExperienceAnimation(amount: number): void {
    const expText = this.add.text(400, 200, `+${amount} EXP`, {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    expText.setOrigin(0.5);

    this.tweens.add({
      targets: expText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        expText.destroy();
      },
    });
  }

  shutdown(): void {
    this.hideItemDetails();
    if (this.statusContainer) {
      this.statusContainer.destroy();
      this.statusContainer = null;
    }
  }
}
