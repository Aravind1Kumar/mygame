// Level 1-1 Layout, Tile Management, and Entity Spawners
class LevelMap {
  constructor(game) {
    this.game = game;
    this.tileSize = 32;
    this.width = 220; // 220 tiles wide (~7000px)
    this.height = 17;
    this.grid = [];
    this.blockStates = new Map(); // Store bounce & used state: 'c,r' => { bounce, isUsed, type }
    this.particles = [];
    this.watts = [];
    this.powerups = [];
    this.enemies = [];
    this.masterSwitch = null;

    this.initLevel();
  }

  initLevel() {
    // Fill empty sky
    for (let r = 0; r < this.height; r++) {
      this.grid[r] = new Array(this.width).fill(0);
    }

    const T_GROUND = 1;
    const T_BRICK = 2;
    const T_MYSTERY = 3;
    const T_VENT_TOP = 4;
    const T_VENT_BODY = 5;
    const T_STEP = 6;

    // Helper to paint ground
    const makeGround = (startC, endC) => {
      for (let c = startC; c < endC; c++) {
        this.grid[15][c] = T_GROUND;
        this.grid[16][c] = T_GROUND;
      }
    };

    // Helper to paint vents (pipes)
    const makeVent = (c, heightTiles) => {
      const topR = 15 - heightTiles;
      this.grid[topR][c] = T_VENT_TOP;
      this.grid[topR][c + 1] = T_VENT_TOP;
      for (let r = topR + 1; r < 15; r++) {
        this.grid[r][c] = T_VENT_BODY;
        this.grid[r][c + 1] = T_VENT_BODY;
      }
    };

    // Helper for stairs/pyramids
    const makeStairs = (startC, height, dir = 1) => {
      for (let step = 0; step < height; step++) {
        const c = dir === 1 ? startC + step : startC + (height - 1 - step);
        for (let r = 15 - (step + 1); r < 15; r++) {
          this.grid[r][c] = T_STEP;
        }
      }
    };

    // 1. Build Ground with Classic Gaps (Pits)
    makeGround(0, 68);
    // Pit: 68 - 72 (Hover challenge #1)
    makeGround(72, 86);
    // Pit: 86 - 89
    makeGround(89, 150);
    // Pit: 150 - 153
    makeGround(153, 218);

    // 2. Early Section (Warmup & First Mystery Blocks)
    // [?] Watt
    this.setTile(16, 11, T_MYSTERY, { content: 'watt' });
    // Brick, [?] Regulator, Brick, [?] Watt, Brick
    this.setTile(20, 11, T_BRICK);
    this.setTile(21, 11, T_MYSTERY, { content: 'regulator' }); // Super Mushroom equivalent!
    this.setTile(22, 11, T_BRICK);
    this.setTile(23, 11, T_MYSTERY, { content: 'watt' });
    this.setTile(24, 11, T_BRICK);

    // High floating [?] Watt
    this.setTile(22, 7, T_MYSTERY, { content: 'watt' });

    // Early Dust Bunnies
    this.enemies.push(new DustBunny(22 * 32, 14 * 32));
    this.enemies.push(new DustBunny(40 * 32, 14 * 32));
    this.enemies.push(new DustBunny(50 * 32, 14 * 32));

    // 3. Ventilation Ducts (Pipes)
    makeVent(28, 2); // Small vent
    makeVent(38, 3); // Medium vent
    makeVent(46, 4); // Tall vent
    makeVent(57, 4);

    // High canopy bricks over vents
    for (let c = 62; c <= 66; c++) {
      this.setTile(c, 11, T_BRICK);
    }
    this.setTile(64, 11, T_MYSTERY, { content: 'watt' });

    // 4. The First Chasm (Glide/Flutter Showcase)
    // Floating air-current watts to guide the player's flutter jump
    for (let i = 0; i < 4; i++) {
      this.watts.push(new FloatingWatt((68.5 + i) * 32, 11 * 32));
    }

    // Flying Mosquito over the gap
    this.enemies.push(new FlyingFly(70 * 32, 9 * 32, 2.5));

    // 5. Mid-Stage Brick Formations & Hidden Secrets
    this.setTile(77, 11, T_BRICK);
    this.setTile(78, 11, T_MYSTERY, { content: 'regulator' });
    this.setTile(79, 11, T_BRICK);

    this.enemies.push(new DustBunny(78 * 32, 14 * 32));
    this.enemies.push(new DustBunny(83 * 32, 14 * 32));

    // Floating double-decker platform (Attic beams)
    for (let c = 80; c <= 85; c++) {
      this.setTile(c, 7, T_BRICK);
      if (c % 2 === 0) {
        this.watts.push(new FloatingWatt(c * 32, 5 * 32));
      }
    }

    // 6. Flying Pests & Stepped Pyramids
    makeVent(94, 2);
    makeVent(102, 3);

    this.enemies.push(new FlyingFly(106 * 32, 10 * 32, 3.0));
    this.enemies.push(new DustBunny(110 * 32, 14 * 32));
    this.enemies.push(new DustBunny(113 * 32, 14 * 32));

    // Pyramid 1 (Ascending and Descending)
    makeStairs(120, 4, 1);
    makeStairs(125, 4, -1);

    // Pyramid 2 over second gap
    makeStairs(134, 5, 1);
    makeStairs(140, 5, -1);

    // Multi-coin mystery block
    this.setTile(148, 11, T_MYSTERY, { content: 'multiwatt', count: 5 });

    // 7. Grand Finale Staircase to Master Switch Flagpole
    makeStairs(180, 8, 1);

    // 8. The Master Power Switch (Flagpole) at col 198
    this.masterSwitch = {
      x: 198 * 32,
      y: 7 * 32,
      height: 8 * 32,
      switchY: 0,
      isActivated: false
    };

    // Substation / Attic Junction Power Box at the end (Castle equivalent)
    for (let c = 205; c <= 212; c++) {
      for (let r = 10; r < 15; r++) {
        this.grid[r][c] = T_STEP;
      }
    }
  }

  setTile(c, r, type, meta = null) {
    if (r >= 0 && r < this.height && c >= 0 && c < this.width) {
      this.grid[r][c] = type;
      if (meta) {
        this.blockStates.set(`${c},${r}`, {
          bounce: 0,
          isUsed: false,
          ...meta
        });
      }
    }
  }

  getTile(c, r) {
    if (c < 0 || c >= this.width || r < 0 || r >= this.height) return null;
    const type = this.grid[r][c];
    if (type === 0) return null;

    return {
      type,
      solid: true
    };
  }

  onHitBlock(c, r, player) {
    const key = `${c},${r}`;
    const type = this.grid[r][c];
    let state = this.blockStates.get(key) || { bounce: 0, isUsed: false };

    // 1. Mystery Block Hit
    if (type === 3) {
      if (!state.isUsed) {
        state.bounce = -9;
        if (state.content === 'watt') {
          state.isUsed = true;
          this.game.addScore(200);
          this.game.addWatt();
          this.spawnWattPopup(c * 32 + 8, (r - 1) * 32);
          if (window.retroAudio) window.retroAudio.playWatt();
        } else if (state.content === 'multiwatt') {
          state.count = (state.count || 5) - 1;
          this.game.addScore(200);
          this.game.addWatt();
          this.spawnWattPopup(c * 32 + 8, (r - 1) * 32);
          if (window.retroAudio) window.retroAudio.playWatt();
          if (state.count <= 0) state.isUsed = true;
        } else if (state.content === 'regulator') {
          state.isUsed = true;
          this.powerups.push(new PowerupRegulator(c * 32, (r - 1) * 32));
          if (window.retroAudio) window.retroAudio.playBlockHit();
        }
        this.blockStates.set(key, state);
      } else {
        if (window.retroAudio) window.retroAudio.playBlockHit();
      }
    }

    // 2. Brick Block Hit
    else if (type === 2) {
      if (player.isSuper) {
        // Shatter brick block!
        this.grid[r][c] = 0;
        this.spawnBrickDebris(c * 32, r * 32);
        this.game.addScore(50);
        if (window.retroAudio) window.retroAudio.playBlockBreak();
      } else {
        // Just bounce brick
        state.bounce = -6;
        this.blockStates.set(key, state);
        if (window.retroAudio) window.retroAudio.playBlockHit();
      }
    }
  }

  spawnWattPopup(x, y) {
    this.particles.push({
      type: 'watt_spark',
      x, y,
      vy: -4.5,
      life: 25
    });
  }

  spawnBrickDebris(x, y) {
    const pieces = [
      { vx: -2.5, vy: -6 },
      { vx: 2.5, vy: -6 },
      { vx: -3.5, vy: -3 },
      { vx: 3.5, vy: -3 }
    ];
    pieces.forEach(p => {
      this.particles.push({
        type: 'debris',
        x: x + 10,
        y: y + 10,
        vx: p.vx,
        vy: p.vy,
        rot: 0,
        vrot: (Math.random() - 0.5) * 0.4,
        life: 50
      });
    });
  }

  update(dt) {
    // 1. Update block bounce recovery
    this.blockStates.forEach((state, key) => {
      if (state.bounce < 0) {
        state.bounce += 1.2;
        if (state.bounce > 0) state.bounce = 0;
      }
    });

    // 2. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      if (p.type === 'debris') {
        p.vy += 0.35;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
      } else if (p.type === 'watt_spark') {
        p.y += p.vy;
        p.vy += 0.25;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Update Floating Watts
    for (let i = this.watts.length - 1; i >= 0; i--) {
      const w = this.watts[i];
      if (this.game.physics.checkOverlap(this.game.player, w)) {
        this.game.addScore(200);
        this.game.addWatt();
        if (window.retroAudio) window.retroAudio.playWatt();
        this.spawnWattPopup(w.x, w.y);
        this.watts.splice(i, 1);
      }
    }

    // 4. Update Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.update(this, dt);
      if (this.game.physics.checkOverlap(this.game.player, p)) {
        this.game.player.upgradeToSuper();
        this.game.addScore(1000);
        if (window.retroAudio) window.retroAudio.playPowerUp();
        this.powerups.splice(i, 1);
      }
    }

    // 5. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.alive) {
        this.enemies.splice(i, 1);
        continue;
      }
      e.update(this, dt);

      // Check collision with Player
      const player = this.game.player;
      if (!player.isDead && !player.isWinning && this.game.physics.checkOverlap(player, e)) {
        // Player jumps or spins on top of enemy!
        const isLandingOnTop = (player.vy > 0 && player.y + player.height - player.vy <= e.y + 14);
        if (isLandingOnTop || player.isFluttering) {
          e.stomp(this.game);
          player.vy = -7.5; // Bounce player up
          player.flutterTimer = 1.0;
          this.game.addScore(200);
          if (window.retroAudio) window.retroAudio.playStomp();
        } else {
          // Player hit from side
          player.takeDamage();
        }
      }
    }

    // 6. Master Switch Check
    if (this.masterSwitch && !this.masterSwitch.isActivated) {
      const p = this.game.player;
      const ms = this.masterSwitch;
      if (p.x + p.width >= ms.x && p.x <= ms.x + 30 && p.y + p.height >= ms.y) {
        this.triggerVictory(ms);
      }
    } else if (this.masterSwitch && this.masterSwitch.isActivated) {
      if (this.masterSwitch.switchY < this.masterSwitch.height - 30) {
        this.masterSwitch.switchY += 3.5;
        this.game.player.y = this.masterSwitch.y + this.masterSwitch.switchY;
      } else {
        // Completed switch down
        this.game.onLevelComplete();
      }
    }
  }

  triggerVictory(ms) {
    ms.isActivated = true;
    const p = this.game.player;
    p.isWinning = true;
    p.vx = 0;
    p.vy = 0;
    p.x = ms.x - 10;
    this.game.addScore(5000);
    if (window.retroAudio) window.retroAudio.playWin();
  }

  render(ctx, cameraX) {
    const ts = this.tileSize;
    const startCol = Math.max(0, Math.floor(cameraX / ts));
    const endCol = Math.min(this.width, Math.ceil((cameraX + ctx.canvas.width) / ts) + 1);

    // 1. Draw Tiles
    for (let r = 0; r < this.height; r++) {
      for (let c = startCol; c < endCol; c++) {
        const type = this.grid[r][c];
        if (type === 0) continue;

        const screenX = c * ts - cameraX;
        const screenY = r * ts;
        const blockState = this.blockStates.get(`${c},${r}`);
        const bounce = blockState ? blockState.bounce : 0;

        switch (type) {
          case 1: // Ground
            ctx.fillStyle = '#107c41'; // Grass top
            ctx.fillRect(screenX, screenY, ts, 6);
            ctx.fillStyle = '#613c1c'; // Soil base
            ctx.fillRect(screenX, screenY + 6, ts, ts - 6);
            ctx.strokeStyle = '#2b1705';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, ts, ts);
            break;
          case 2: // Brick
            Sprites.drawBrickBlock(ctx, screenX, screenY, ts, bounce);
            break;
          case 3: // Mystery
            Sprites.drawMysteryBlock(ctx, screenX, screenY, ts, blockState && blockState.isUsed, bounce);
            break;
          case 4: // Vent Top
            // Rendered combined with vent body
            break;
          case 5: // Vent Body
            // Drawn by standalone vent helper if left tile
            break;
          case 6: // Step/Stair Block
            ctx.fillStyle = '#8b949e';
            ctx.fillRect(screenX, screenY, ts, ts);
            ctx.fillStyle = '#586069';
            ctx.fillRect(screenX + 2, screenY + 2, ts - 4, ts - 4);
            ctx.strokeStyle = '#24292e';
            ctx.strokeRect(screenX, screenY, ts, ts);
            break;
        }
      }
    }

    // Draw Vents properly in pairs
    for (let c = startCol; c < endCol; c++) {
      if (this.grid[15][c] === 1 || this.grid[15][c] === 0) {
        for (let r = 0; r < 15; r++) {
          if (this.grid[r][c] === 4 && this.grid[r][c + 1] === 4) {
            // Found vent head pair
            let ventHeight = 0;
            for (let vr = r; vr < 15; vr++) {
              if (this.grid[vr][c] === 4 || this.grid[vr][c] === 5) ventHeight += ts;
            }
            Sprites.drawAirVent(ctx, c * ts - cameraX, r * ts, ts * 2, ventHeight);
          }
        }
      }
    }

    // 2. Draw Master Switch
    if (this.masterSwitch) {
      Sprites.drawMasterSwitch(
        ctx,
        this.masterSwitch.x - cameraX,
        this.masterSwitch.y,
        this.masterSwitch.height,
        this.masterSwitch.switchY,
        this.masterSwitch.isActivated
      );
    }

    // 3. Draw Watts
    for (const w of this.watts) {
      Sprites.drawWatt(ctx, w.x - cameraX, w.y, w.width);
    }

    // 4. Draw Powerups
    for (const p of this.powerups) {
      Sprites.drawRegulator(ctx, p.x - cameraX, p.y, p.width);
    }

    // 5. Draw Enemies
    for (const e of this.enemies) {
      e.render(ctx, cameraX);
    }

    // 6. Draw Particles
    for (const p of this.particles) {
      if (p.type === 'debris') {
        ctx.save();
        ctx.translate(p.x - cameraX, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = '#b3391b';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();
      } else if (p.type === 'watt_spark') {
        Sprites.drawWatt(ctx, p.x - cameraX, p.y, 18);
      }
    }
  }
}

// Floating Watt Item
class FloatingWatt {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
  }
}

// Speed Regulator Powerup (Moves like Super Mushroom)
class PowerupRegulator {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 26;
    this.height = 26;
    this.vx = 1.8;
    this.vy = 0;
    this.isGrounded = false;
  }

  update(map, dt) {
    this.vy += 0.35;
    if (this.vy > 8) this.vy = 8;

    // Move X
    this.x += this.vx;
    const hitX = map.game.physics.getOverlappingTiles(this, map);
    for (const t of hitX) {
      if (t.solid) {
        this.vx *= -1; // Reverse direction on wall hit
        this.x += this.vx * 2;
        break;
      }
    }

    // Move Y
    this.y += this.vy;
    this.isGrounded = false;
    const hitY = map.game.physics.getOverlappingTiles(this, map);
    for (const t of hitY) {
      if (t.solid) {
        if (this.vy > 0) {
          this.y = t.r * map.tileSize - this.height;
          this.vy = 0;
          this.isGrounded = true;
        }
      }
    }
  }
}

// Dust Bunny Enemy
class DustBunny {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.vx = -1.2;
    this.vy = 0;
    this.alive = true;
    this.isSquished = false;
    this.squishTimer = 0;
    this.animTimer = Math.random() * 10;
  }

  stomp(game) {
    this.isSquished = true;
    this.vx = 0;
    this.squishTimer = 20; // Frames before deletion
  }

  update(map, dt) {
    this.animTimer += (dt || 0.016);
    if (this.isSquished) {
      this.squishTimer--;
      if (this.squishTimer <= 0) this.alive = false;
      return;
    }

    this.vy += 0.45;
    if (this.vy > 9) this.vy = 9;

    // Patrol movement
    this.x += this.vx;
    const hitX = map.game.physics.getOverlappingTiles(this, map);
    for (const t of hitX) {
      if (t.solid) {
        this.vx *= -1;
        this.x += this.vx * 2;
        break;
      }
    }

    this.y += this.vy;
    const hitY = map.game.physics.getOverlappingTiles(this, map);
    for (const t of hitY) {
      if (t.solid) {
        if (this.vy > 0) {
          this.y = t.r * map.tileSize - this.height;
          this.vy = 0;
        }
      }
    }
  }

  render(ctx, cameraX) {
    Sprites.drawDustBunny(ctx, this.x - cameraX, this.y, this.width, this.height, this);
  }
}

// Flying Mosquito Enemy
class FlyingFly {
  constructor(x, y, range = 3) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 22;
    this.vx = -1.2;
    this.alive = true;
    this.animTimer = 0;
    this.range = range * 32;
  }

  stomp(game) {
    this.alive = false;
  }

  update(map, dt) {
    this.animTimer += (dt || 0.016);
    this.x += this.vx;
    // Hover sine wave
    this.y = this.startY + Math.sin(this.animTimer * 4) * 25;

    if (Math.abs(this.x - this.startX) > this.range) {
      this.vx *= -1;
    }
  }

  render(ctx, cameraX) {
    Sprites.drawFly(ctx, this.x - cameraX, this.y, this.width, this.height, this);
  }
}

window.LevelMap = LevelMap;
