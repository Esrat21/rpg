const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Configurações do jogo
const TILE_SIZE = 32;
const PLAYER_SPEED = 2;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

// World class
class World {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.map = [];
        this.obstacles = [];
        this.generate();
    }

    generate() {
        // Generate base map
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                // 20% chance of obstacle
                if (Math.random() < 0.2) {
                    this.map[y][x] = 1; // Obstacle
                    this.obstacles.push({
                        x: x * this.tileSize,
                        y: y * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize
                    });
                } else {
                    this.map[y][x] = 0; // Walkable
                }
            }
        }
    }

    isColliding(rect) {
        return this.obstacles.some(obstacle => {
            return rect.x < obstacle.x + obstacle.width &&
                   rect.x + rect.width > obstacle.x &&
                   rect.y < obstacle.y + obstacle.height &&
                   rect.y + rect.height > obstacle.y;
        });
    }

    draw(ctx) {
        // Draw map
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === 1) {
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
}

const world = new World(MAP_WIDTH, MAP_HEIGHT, TILE_SIZE);

// Configurações do canvas
canvas.width = 800;
canvas.height = 600;

// Jogador
const player = {
    x: 5 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
    color: 'blue',
    isAttacking: false,
    health: 30,
    maxHealth: 30,
    mana: 10,
    maxMana: 10,
    inventory: [],
    equipment: {
        weapon: null,
        armor: null
    },
    attributes: {
        strength: 15,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 8,
        charisma: 13
    },
    getAttackDamage() {
        const baseDamage = Math.floor(Math.random() * 6) + 1;
        const strBonus = Math.floor((this.attributes.strength - 10) / 2);
        const weaponBonus = this.equipment.weapon ? this.equipment.weapon.damage : 0;
        return baseDamage + strBonus + weaponBonus;
    },
    addItem(newItem) {
        // Verificar se o item é stackável e já existe no inventário
        if (newItem.stackable) {
            const existingItem = this.inventory.find(item => 
                item.id === newItem.id && item.quantity < item.maxStack
            );
            
            if (existingItem) {
                // Adicionar ao stack existente
                const availableSpace = existingItem.maxStack - existingItem.quantity;
                const quantityToAdd = Math.min(newItem.quantity, availableSpace);
                existingItem.quantity += quantityToAdd;
                
                // Se ainda sobrar quantidade, criar novo stack
                if (newItem.quantity > quantityToAdd) {
                    newItem.quantity -= quantityToAdd;
                    return this.addItem(newItem);
                }
                return true;
            }
        }
        
        // Adicionar novo item ao inventário
        if (this.inventory.length < 20) {
            this.inventory.push({
                ...newItem,
                quantity: newItem.quantity || 1
            });
            return true;
        }
        return false;
    },
    equipItem(item) {
        if (item.type === 'weapon') {
            if (this.equipment.weapon) {
                this.inventory.push(this.equipment.weapon);
            }
            this.equipment.weapon = item;
        } else if (item.type === 'armor') {
            if (this.equipment.armor) {
                this.inventory.push(this.equipment.armor);
            }
            this.equipment.armor = item;
        }
    }
};

// Carregar itens
let ITEMS = {};
fetch('rpg/items.json')
    .then(response => response.json())
    .then(data => ITEMS = data.items)
    .catch(error => console.error('Erro ao carregar itens:', error));

// Carregar drop pool
let DROP_POOL = {};
fetch('rpg/drop_pool.json')
    .then(response => response.json())
    .then(data => DROP_POOL = data.drops)
    .catch(error => console.error('Erro ao carregar drop pool:', error));

// Inimigos
const enemies = [
    {
        x: 10 * TILE_SIZE,
        y: 5 * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        color: 'red',
        health: 15,
        maxHealth: 15,
        mana: 5,
        maxMana: 5,
        attributes: {
            strength: 12,
            dexterity: 10,
            constitution: 13,
            intelligence: 6,
            wisdom: 8,
            charisma: 7
        },
        getAttackDamage() {
            return Math.floor(Math.random() * 4) + 1 + Math.floor((this.attributes.strength - 10) / 2);
        }
    }
];

// Controles
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    KeyI: false
};

// Eventos de teclado
window.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

let lastManaRegen = Date.now();
const MANA_REGEN_INTERVAL = 1000; // 1 segundo
const MANA_REGEN_AMOUNT = 1;

function update() {
    const now = Date.now();
    
    // Alternar inventário
    if (keys.KeyI) {
        showInventory = !showInventory;
        keys.KeyI = false; // Resetar o estado da tecla
    }
    
    if (showInventory) return; // Pausar o jogo enquanto o inventário está aberto
    
    // Regeneração de mana
    if (now - lastManaRegen > MANA_REGEN_INTERVAL) {
        player.mana = Math.min(player.maxMana, player.mana + MANA_REGEN_AMOUNT);
        lastManaRegen = now;
    }

    // Movimentação do jogador
    let moveX = 0;
    let moveY = 0;
    const diagonalSpeed = PLAYER_SPEED * Math.SQRT1_2;

    // Verificar teclas pressionadas
    if (keys.ArrowUp) moveY -= 1;
    if (keys.ArrowDown) moveY += 1;
    if (keys.ArrowLeft) moveX -= 1;
    if (keys.ArrowRight) moveX += 1;

    // Normalizar movimento diagonal
    if (moveX !== 0 && moveY !== 0) {
        moveX *= diagonalSpeed;
        moveY *= diagonalSpeed;
    } else {
        moveX *= PLAYER_SPEED;
        moveY *= PLAYER_SPEED;
    }

    // Calcular nova posição
    let newX = player.x + moveX;
    let newY = player.y + moveY;

    // Verificar colisões com obstáculos
    const tempRect = {
        x: newX,
        y: newY,
        width: player.width,
        height: player.height
    };

    if (!world.isColliding(tempRect)) {
        player.x = newX;
        player.y = newY;
    } else {
        // Tentar mover apenas no eixo X
        const tempRectX = {
            x: newX,
            y: player.y,
            width: player.width,
            height: player.height
        };
        
        if (!world.isColliding(tempRectX)) {
            player.x = newX;
        }

        // Tentar mover apenas no eixo Y
        const tempRectY = {
            x: player.x,
            y: newY,
            width: player.width,
            height: player.height
        };
        
        if (!world.isColliding(tempRectY)) {
            player.y = newY;
        }
    }

    // Ataque do jogador
    if (keys.Space && !player.isAttacking) {
        player.isAttacking = true;
        attack();
        setTimeout(() => player.isAttacking = false, 200);
    }

    // Atualizar inimigos
    updateEnemies();

    // Verificar colisões
    checkCollisions();
}

function updateEnemies() {
    enemies.forEach(enemy => {
        // Movimentação em direção ao jogador
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > TILE_SIZE) {
            const speed = 1;
            enemy.x += (dx / distance) * speed;
            enemy.y += (dy / distance) * speed;
        }

        // Ataque do inimigo
        if (distance <= TILE_SIZE * 1.5 && !enemy.isAttacking) {
            enemy.isAttacking = true;
            enemyAttack(enemy);
            setTimeout(() => enemy.isAttacking = false, 1000);
        }
    });
}

function enemyAttack(enemy) {
    if (enemy.mana < 1) return;
    enemy.mana -= 1;
    
    const damage = enemy.getAttackDamage();
    player.health -= damage;
    
    if (player.health <= 0) {
        alert('Você foi derrotado!');
        player.health = player.maxHealth;
    }
}

function dropItem(enemy) {
    const enemyType = 'goblin'; // Podemos expandir para outros tipos de inimigos
    const dropPool = DROP_POOL[enemyType];
    
    if (!dropPool) return;
    
    const roll = Math.random();
    
    // Verificar chance de não dropar nada
    if (roll < dropPool.noDropChance) return;
    
    // Calcular qual item será dropado
    let accumulatedChance = dropPool.noDropChance;
    for (const drop of dropPool.items) {
        if (roll < accumulatedChance + drop.chance) {
            const itemData = ITEMS[drop.id];
            if (itemData) {
                const quantity = drop.quantity ? 
                    Math.floor(Math.random() * (drop.quantity.max - drop.quantity.min + 1)) + drop.quantity.min :
                    1;
                    
                items.push({
                    ...itemData,
                    id: drop.id,
                    name: itemData.name,
                    type: itemData.type,
                    quantity: quantity,
                    x: enemy.x,
                    y: enemy.y
                });
            }
            break;
        }
        accumulatedChance += drop.chance;
    }
}

let attackAnimation = {
    active: false,
    x: 0,
    y: 0,
    radius: TILE_SIZE * 1.5,
    duration: 200,
    startTime: 0
};

function attack() {
    if (player.mana < 2) return;
    player.mana -= 2;
    
    attackAnimation.active = true;
    attackAnimation.x = player.x + player.width/2;
    attackAnimation.y = player.y + player.height/2;
    attackAnimation.startTime = Date.now();

    enemies.forEach(enemy => {
        const dx = enemy.x + enemy.width/2 - attackAnimation.x;
        const dy = enemy.y + enemy.height/2 - attackAnimation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= attackAnimation.radius) {
            const damage = player.getAttackDamage();
            enemy.health -= damage;
            if (enemy.health <= 0) {
                dropItem(enemy);
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        }
    });
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCollisions() {
    // Verificar colisão com inimigos
    enemies.forEach(enemy => {
        if (isColliding(player, enemy)) {
            // Lógica de colisão com inimigos
        }
    });
}

let showInventory = false;

function drawInventory() {
    // Fundo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configurações do inventário ajustadas para a câmera
    const slotSize = 48; // Reduzido para caber na tela
    const padding = 5;  // Reduzido o espaçamento
    const startX = 20;  // Margem esquerda
    const startY = 20;  // Margem superior
    
    // Calcula o espaço necessário
    const inventoryWidth = 8 * (slotSize + padding) - padding;
    const inventoryHeight = 3 * (slotSize + padding) - padding;
    
    // Desenhar slots do inventário
    ctx.fillStyle = '#333';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            const x = startX + col * (slotSize + padding);
            const y = startY + row * (slotSize + padding);
            ctx.fillRect(x, y, slotSize, slotSize);
        }
    }
    
    // Desenhar itens do inventário
    player.inventory.forEach((item, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const x = startX + col * (slotSize + padding);
        const y = startY + row * (slotSize + padding);
        
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 5, y + 5, slotSize - 10, slotSize - 10);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        const itemName = item.name || ITEMS[item.id]?.name || 'Item Desconhecido';
        ctx.fillText(itemName, x + 10, y + 20);
    });
    
    // Desenhar slots de equipamentos
    const equipStartX = startX + inventoryWidth + 20;
    ctx.fillStyle = '#333';
    ctx.fillRect(equipStartX, startY, slotSize, slotSize); // Arma
    ctx.fillRect(equipStartX, startY + slotSize + padding, slotSize, slotSize); // Armadura
    
    // Desenhar itens equipados
    if (player.equipment.weapon) {
        ctx.fillStyle = '#666';
        ctx.fillRect(equipStartX + 5, startY + 5, slotSize - 10, slotSize - 10);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(player.equipment.weapon.name, equipStartX + 10, startY + 20);
    }
    
    if (player.equipment.armor) {
        ctx.fillStyle = '#666';
        ctx.fillRect(equipStartX + 5, startY + slotSize + padding + 5, slotSize - 10, slotSize - 10);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(player.equipment.armor.name, equipStartX + 10, startY + slotSize + padding + 20);
    }
}

function draw() {
    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showInventory) {
        drawInventory();
        return;
    }

    // Aplicar transformação da câmera
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Desenhar mapa
    world.draw(ctx);

    // Desenhar jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Desenhar barra de vida e mana do jogador
    drawHealthBar(player, player.x, player.y - 10);
    drawManaBar(player, player.x, player.y - 5);

    // Desenhar inimigos
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        drawHealthBar(enemy, enemy.x, enemy.y - 10);
        drawManaBar(enemy, enemy.x, enemy.y - 5);
    });

    // Desenhar itens
    items.forEach(item => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(item.x, item.y, TILE_SIZE, TILE_SIZE);
    });

    // Desenhar animação de ataque
    if (attackAnimation.active) {
        const elapsed = Date.now() - attackAnimation.startTime;
        const alpha = 1 - (elapsed / attackAnimation.duration);
        ctx.beginPath();
        ctx.arc(attackAnimation.x, attackAnimation.y, attackAnimation.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        if (elapsed >= attackAnimation.duration) {
            attackAnimation.active = false;
        }
    }

    // Restaurar transformação da câmera
    ctx.restore();

    // Mostrar coordenadas do jogador
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    const coordText = `X: ${Math.floor(player.x / TILE_SIZE)} Y: ${Math.floor(player.y / TILE_SIZE)}`;
    const textWidth = ctx.measureText(coordText).width;
    ctx.fillText(coordText, canvas.width - textWidth - 10, 20);
}

function drawHealthBar(character, x, y) {
    const width = TILE_SIZE;
    const height = 3;
    const healthPercent = character.health / character.maxHealth;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = healthPercent > 0.5 ? 'green' : healthPercent > 0.25 ? 'orange' : 'red';
    ctx.fillRect(x, y, width * healthPercent, height);
}

function drawManaBar(character, x, y) {
    const width = TILE_SIZE;
    const height = 3;
    const manaPercent = character.mana / character.maxMana;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, width * manaPercent, height);
}

// Câmera
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    follow(target) {
        this.x = target.x - this.width / 2;
        this.y = target.y - this.height / 2;
    }
};

// Itens no chão
const items = [];

function dropItem(enemy) {
    const dropChance = Math.random();
    if (dropChance < 0.3) {
        const item = ITEMS[Math.random() < 0.5 ? 'sword' : 'potion'];
        items.push({
            ...item,
            x: enemy.x,
            y: enemy.y
        });
    }
}

function checkItemPickups() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (isColliding(player, {
            x: item.x,
            y: item.y,
            width: TILE_SIZE,
            height: TILE_SIZE
        })) {
            if (player.addItem(item)) {
                items.splice(i, 1);
            }
        }
    }
}

function gameLoop() {
    update();
    camera.follow(player);
    checkItemPickups();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar o jogo
gameLoop();
