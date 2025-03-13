class SaveSystem {
    static save(world, player) {
        const data = {
            world: world.map,
            player: {
                x: player.x,
                y: player.y,
                inventory: player.inventory,
                equipment: player.equipment,
                attributes: player.attributes,
                health: player.health,
                mana: player.mana
            }
        };
        localStorage.setItem('rpg_save', JSON.stringify(data));
    }

    static load(world, player) {
        const data = JSON.parse(localStorage.getItem('rpg_save'));
        if (data) {
            world.map = data.world;
            player.x = data.player.x;
            player.y = data.player.y;
            player.inventory = data.player.inventory;
            player.equipment = data.player.equipment;
            player.attributes = data.player.attributes;
            player.health = data.player.health;
            player.mana = data.player.mana;
            return true;
        }
        return false;
    }
}
