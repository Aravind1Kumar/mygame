// Physics & Collision Engine for Super Ceiling Fan Bros
class PhysicsEngine {
  constructor() {
    this.gravity = 0.58;
    this.maxFallSpeed = 10;
    this.flutterFallSpeed = 1.6; // Gentle glide when holding Jump
    this.groundFriction = 0.85;
    this.airFriction = 0.94;
    this.walkAccel = 0.55;
    this.runAccel = 0.90;
    this.maxWalkSpeed = 4.2;
    this.maxRunSpeed = 7.0;
    this.jumpForce = -11.5;
  }

  updatePlayer(player, input, map, dt) {
    if (player.isDead) {
      player.vy += 0.4;
      player.y += player.vy;
      player.bladeAngle += 0.05;
      return;
    }

    if (player.isWinning) {
      // Victory sequence: glide down flagpole and walk toward attic socket
      player.bladeAngle += 0.15;
      return;
    }

    const accel = input.turbo ? this.runAccel : this.walkAccel;
    const maxSpeed = input.turbo ? this.maxRunSpeed : this.maxWalkSpeed;

    // 1. Horizontal Movement
    if (input.left) {
      player.vx -= accel;
      player.facing = -1;
    } else if (input.right) {
      player.vx += accel;
      player.facing = 1;
    } else {
      player.vx *= player.isGrounded ? this.groundFriction : this.airFriction;
      if (Math.abs(player.vx) < 0.08) player.vx = 0;
    }

    // Clamp horizontal speed
    if (player.vx > maxSpeed) player.vx = maxSpeed;
    if (player.vx < -maxSpeed) player.vx = -maxSpeed;

    // 2. Vertical Movement & Jump / Flutter
    if (input.jump && player.isGrounded && !player.jumpHeld) {
      // Fresh jump initiated
      player.vy = this.jumpForce;
      player.isGrounded = false;
      player.jumpHeld = true;
      player.flutterTimer = 1.6; // Seconds of hover time
      if (window.retroAudio) window.retroAudio.playJump();
    }

    if (!input.jump) {
      player.jumpHeld = false;
      player.isFluttering = false;
    }

    // Flutter Hover mechanic (when in air, holding jump, and timer has gas)
    if (!player.isGrounded && input.jump && player.vy > -2 && player.flutterTimer > 0) {
      player.isFluttering = true;
      player.flutterTimer -= (dt || 0.016);
      player.rpm = Math.min(player.rpm + 0.25, 4.0);

      // Defy gravity: gentle flutter or slight upward lift
      if (player.vy > this.flutterFallSpeed) {
        player.vy = this.flutterFallSpeed;
      } else {
        player.vy += 0.12; // Very slow acceleration
      }

      if (Math.random() < 0.25 && window.retroAudio) {
        window.retroAudio.playFlutter();
      }
    } else {
      player.isFluttering = false;
      // Normal Gravity
      player.vy += this.gravity;
      if (player.vy > this.maxFallSpeed) player.vy = this.maxFallSpeed;
    }

    // Down-Gust (Ground Pound)
    if (!player.isGrounded && input.down) {
      player.vy = Math.max(player.vy, 11);
      player.rpm = 3.5;
    }

    // RPM decay/acceleration
    if (player.isFluttering || input.turbo) {
      player.rpm = Math.min(player.rpm + 0.12, 4.0);
    } else {
      const targetRpm = Math.max(1.0, Math.abs(player.vx) * 0.45);
      player.rpm += (targetRpm - player.rpm) * 0.1;
    }
    player.bladeAngle += player.rpm * 0.18;

    // Pendulum chain swaying based on acceleration
    const targetChainAngle = -(player.vx * 0.08);
    player.chainAngle += (targetChainAngle - player.chainAngle) * 0.15;

    // 3. Collision Resolution against Map Blocks
    this.resolveMapCollisions(player, map);

    // Audio hum update
    if (window.retroAudio) {
      window.retroAudio.updateMotorHum(player.rpm / 4.0, player.isFluttering);
    }
  }

  resolveMapCollisions(entity, map) {
    const tileSize = map.tileSize;

    // Move X first
    entity.x += entity.vx;
    let hitTilesX = this.getOverlappingTiles(entity, map);
    for (const t of hitTilesX) {
      if (t.solid) {
        if (entity.vx > 0) {
          entity.x = t.c * tileSize - entity.width;
          entity.vx = 0;
        } else if (entity.vx < 0) {
          entity.x = (t.c + 1) * tileSize;
          entity.vx = 0;
        }
      }
    }

    // Move Y next
    entity.y += entity.vy;
    entity.isGrounded = false;
    let hitTilesY = this.getOverlappingTiles(entity, map);
    for (const t of hitTilesY) {
      if (t.solid) {
        if (entity.vy > 0) {
          // Landing on floor
          entity.y = t.r * tileSize - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
        } else if (entity.vy < 0) {
          // Bumping ceiling block from below
          entity.y = (t.r + 1) * tileSize;
          entity.vy = 0;

          // Trigger block action if it's the player
          if (entity.isPlayer && map.onHitBlock) {
            map.onHitBlock(t.c, t.r, entity);
          }
        }
      }
    }

    // Death pit check
    if (entity.y > map.height * tileSize + 100) {
      if (entity.isPlayer && !entity.isDead) {
        entity.die("Fell into the floor vent!");
      } else {
        entity.alive = false;
      }
    }
  }

  getOverlappingTiles(entity, map) {
    const tiles = [];
    const ts = map.tileSize;
    const startCol = Math.floor(entity.x / ts);
    const endCol = Math.floor((entity.x + entity.width - 0.01) / ts);
    const startRow = Math.floor(entity.y / ts);
    const endRow = Math.floor((entity.y + entity.height - 0.01) / ts);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (c >= 0 && c < map.width && r >= 0 && r < map.height) {
          const tile = map.getTile(c, r);
          if (tile && tile.solid) {
            tiles.push({ c, r, ...tile });
          }
        }
      }
    }
    return tiles;
  }

  // AABB check between two bounding boxes
  checkOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}

window.PhysicsEngine = PhysicsEngine;
