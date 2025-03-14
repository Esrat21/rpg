import { Item, WeaponItem, ArmorItem, ConsumableItem } from '../entities/Item';

describe('Item', () => {
    describe('WeaponItem', () => {
        it('deve criar uma arma válida', () => {
            const weapon: WeaponItem = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 1
            };

            expect(weapon.type).toBe('weapon');
            expect(weapon.damage).toBe(10);
        });

        it('deve permitir empilhamento de armas', () => {
            const weapon: WeaponItem = {
                id: 1,
                name: 'Espada',
                type: 'weapon',
                damage: 10,
                quantity: 2
            };

            expect(weapon.quantity).toBe(2);
        });
    });

    describe('ArmorItem', () => {
        it('deve criar uma armadura válida', () => {
            const armor: ArmorItem = {
                id: 1,
                name: 'Armadura de Couro',
                type: 'armor',
                slot: 'armor',
                defense: 5,
                quantity: 1
            };

            expect(armor.type).toBe('armor');
            expect(armor.slot).toBe('armor');
            expect(armor.defense).toBe(5);
        });

        it('deve permitir diferentes slots de armadura', () => {
            const slots = ['helmet', 'armor', 'gloves', 'bracers', 'boots', 'ring', 'amulet'] as const;

            slots.forEach(slot => {
                const armor: ArmorItem = {
                    id: 1,
                    name: `Armadura ${slot}`,
                    type: 'armor',
                    slot,
                    defense: 5,
                    quantity: 1
                };

                expect(armor.slot).toBe(slot);
            });
        });
    });

    describe('ConsumableItem', () => {
        it('deve criar um item consumível válido', () => {
            const potion: ConsumableItem = {
                id: 1,
                name: 'Poção de Cura',
                type: 'consumable',
                effect: 'heal',
                value: 20,
                quantity: 1
            };

            expect(potion.type).toBe('consumable');
            expect(potion.effect).toBe('heal');
            expect(potion.value).toBe(20);
        });

        it('deve permitir diferentes tipos de efeitos', () => {
            const effects = ['heal', 'buff'] as const;

            effects.forEach(effect => {
                const consumable: ConsumableItem = {
                    id: 1,
                    name: `Item ${effect}`,
                    type: 'consumable',
                    effect,
                    value: 20,
                    quantity: 1
                };

                expect(consumable.effect).toBe(effect);
            });
        });

        it('deve permitir empilhamento de consumíveis', () => {
            const potion: ConsumableItem = {
                id: 1,
                name: 'Poção de Cura',
                type: 'consumable',
                effect: 'heal',
                value: 20,
                quantity: 3
            };

            expect(potion.quantity).toBe(3);
        });
    });
});
