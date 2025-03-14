import { Player } from '../entities/Player';
import { Item } from '../entities/Item';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player();
    });

    describe('addItem', () => {
        it('deve adicionar um item ao inventário', () => {
            const item: Item = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 1
            };

            const result = player.addItem(item);
            expect(result).toBe(true);
            expect(player.inventory).toContainEqual(item);
        });

        it('deve empilhar itens idênticos', () => {
            const item: Item = {
                id: 1,
                name: 'Poção',
                type: 'consumable',
                effect: 'heal',
                value: 20,
                quantity: 2
            };

            player.addItem(item);
            player.addItem(item);

            expect(player.inventory.length).toBe(1);
            expect(player.inventory[0].quantity).toBe(4);
        });

        it('não deve adicionar item quando o inventário está cheio', () => {
            // Encher o inventário
            for (let i = 0; i < 24; i++) {
                player.addItem({
                    id: i,
                    name: `Item ${i}`,
                    type: 'weapon',
                    damage: 1,
                    quantity: 1
                });
            }

            const item: Item = {
                id: 25,
                name: 'Item Extra',
                type: 'weapon',
                damage: 1,
                quantity: 1
            };

            const result = player.addItem(item);
            expect(result).toBe(false);
            expect(player.inventory.length).toBe(24);
        });
    });

    describe('removeItem', () => {
        it('deve remover um item do inventário', () => {
            const item: Item = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 1
            };

            player.addItem(item);
            const result = player.removeItem(1);
            expect(result).toBe(true);
            expect(player.inventory).not.toContainEqual(item);
        });

        it('deve reduzir a quantidade de itens empilhados', () => {
            const item: Item = {
                id: 1,
                name: 'Poção',
                type: 'consumable',
                effect: 'heal',
                value: 20,
                quantity: 3
            };

            player.addItem(item);
            const result = player.removeItem(1, 2);
            expect(result).toBe(true);
            expect(player.inventory[0].quantity).toBe(1);
        });
    });

    describe('equipItem', () => {
        it('deve equipar uma arma', () => {
            const weapon: Item = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 1
            };

            player.addItem(weapon);
            const result = player.equipItem(weapon);
            expect(result).toBe(true);
            expect(player.equipment.mainHand).toEqual(weapon);
        });

        it('deve equipar uma armadura', () => {
            const armor: Item = {
                id: 1,
                name: 'Armadura',
                type: 'armor',
                slot: 'armor',
                defense: 5,
                quantity: 1
            };

            player.addItem(armor);
            const result = player.equipItem(armor);
            expect(result).toBe(true);
            expect(player.equipment.armor).toEqual(armor);
        });

        it('não deve equipar um item consumível', () => {
            const consumable: Item = {
                id: 1,
                name: 'Poção',
                type: 'consumable',
                effect: 'heal',
                value: 20,
                quantity: 1
            };

            player.addItem(consumable);
            const result = player.equipItem(consumable);
            expect(result).toBe(false);
        });
    });

    describe('unequipItem', () => {
        it('deve desequipar um item e adicionar ao inventário', () => {
            const weapon: Item = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 1
            };

            player.addItem(weapon);
            player.equipItem(weapon);
            const result = player.unequipItem('mainHand');
            expect(result).toBe(true);
            expect(player.equipment.mainHand).toBeUndefined();
            expect(player.inventory).toContainEqual(weapon);
        });

        it('não deve desequipar um slot vazio', () => {
            const result = player.unequipItem('mainHand');
            expect(result).toBe(false);
        });
    });

    describe('useConsumable', () => {
        it('deve usar um item consumível', () => {
            const potion: Item = {
                id: 1,
                name: 'Poção de Cura',
                type: 'consumable',
                effect: 'heal',
                value: 20,
                quantity: 1
            };

            player.addItem(potion);
            const result = player.useConsumable(1);
            expect(result).toBe(true);
            expect(player.inventory).not.toContainEqual(potion);
        });

        it('não deve usar um item que não é consumível', () => {
            const weapon: Item = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 1
            };

            player.addItem(weapon);
            const result = player.useConsumable(1);
            expect(result).toBe(false);
            expect(player.inventory).toContainEqual(weapon);
        });
    });
});
