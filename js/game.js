// Main Game Controller for Super Ceiling Fan Bros
class SuperFanGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.previewCanvas = document.getElementById('previewCanvas');
    this.previewCtx = this.previewCanvas.getContext('2d');

    this.physics = new PhysicsEngine();
    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      turbo: false
    };

    this.state = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'
    this.score = 0;
    this.watts = 0;
    this.lives = 3;
    this.timeLeft = 300;
    this.timeTimer = 0;
    this.cameraX = 0;

    this.player = null;
    this.map = null;

    this.initPlayer();
    this.initDOM();
    this.initEvents();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  initPlayer() {
    this.player = {
      isPlayer: true,
      x: 3 * 32,
      y: 13 * 32,
      width: 32,
      height: 32,
      vx: 0,
      vy: 0,
      isGrounded: false,
      isDead: false,
      isWinning: false,
      isSuper: false,
      facing: 1,
      bladeAngle: 0,
      chainAngle: 0,
      rpm: 1.0,
      flutterTimer: 1.6,
      isFluttering: false,
      invulnTimer: 0,

      upgradeToSuper: () => {
        this.player.isSuper = true;
      },

      takeDamage: () => {
        if (this.player.invulnTimer > 0) return;
        if (this.player.isSuper) {
          this.player.isSuper = false;
          this.player.invulnTimer = 60; // 1 second invulnerability
          if (window.retroAudio) window.retroAudio.playDeath();
        } else {
          this.player.die("Touched by a Dust Bunny!");
        }
      },

      die: (reason) => {
        if (this.player.isDead) return;
        this.player.isDead = true;
        this.player.vy = -10;
        this.lives--;
        if (window.retroAudio) window.retroAudio.playDeath();

        setTimeout(() => {
          if (this.lives > 0) {
            this.restartLevel();
          } else {
            this.triggerGameOver(reason);
          }
        }, 2000);
      }
    };
  }

  initDOM() {
    this.hudScore = document.getElementById('hud-score');
    this.hudWatts = document.getElementById('hud-watts');
    this.hudTime = document.getElementById('hud-time');
    this.hudLives = document.getElementById('hud-lives');
    this.hudRpmFill = document.getElementById('hud-rpm-fill');

    this.startScreen = document.getElementById('startScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.victoryScreen = document.getElementById('victoryScreen');

    this.startBtn = document.getElementById('startBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.playAgainBtn = document.getElementById('playAgainBtn');
    this.soundToggle = document.getElementById('soundToggle');

    this.startBtn.addEventListener('click', () => this.startGame());
    this.restartBtn.addEventListener('click', () => this.resetGameFull());
    this.playAgainBtn.addEventListener('click', () => this.resetGameFull());

    this.soundToggle.addEventListener('click', () => {
      window.retroAudio.init();
      const unmuted = window.retroAudio.toggleMute();
      this.soundToggle.textContent = unmuted ? '🔊 ON' : '🔇 OFF';
    });
  }

  initEvents() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      window.retroAudio.init();
      if (this.state === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
        this.startGame();
        return;
      }
      this.handleKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKey(e.code, false);
    });

    // Touch / Mobile Onscreen Buttons
    const bindTouchBtn = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const setVal = (pressed) => {
        window.retroAudio.init();
        if (this.state === 'START') this.startGame();
        this.input[keyName] = pressed;
        if (pressed) btn.classList.add('pressed');
        else btn.classList.remove('pressed');
      };
      btn.addEventListener('mousedown', (e) => { e.preventDefault(); setVal(true); });
      btn.addEventListener('mouseup', (e) => { e.preventDefault(); setVal(false); });
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); setVal(true); }, { passive: false });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); setVal(false); }, { passive: false });
    };

    bindTouchBtn('btnLeft', 'left');
    bindTouchBtn('btnRight', 'right');
    bindTouchBtn('btnDown', 'down');
    bindTouchBtn('btnJump', 'jump');
    bindTouchBtn('btnTurbo', 'turbo');
  }

  handleKey(code, isPressed) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.input.left = isPressed;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.input.right = isPressed;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.input.jump = isPressed;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.input.down = isPressed;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyX':
        this.input.turbo = isPressed;
        break;
    }
  }

  startGame() {
    window.retroAudio.init();
    this.startScreen.classList.remove('active');
    this.gameOverScreen.classList.remove('active');
    this.victoryScreen.classList.remove('active');
    this.state = 'PLAYING';
    this.restartLevel();
  }

  restartLevel() {
    this.initPlayer();
    this.map = new LevelMap(this);
    this.cameraX = 0;
  }

  resetGameFull() {
    this.score = 0;
    this.watts = 0;
    this.lives = 3;
    this.timeLeft = 300;
    this.startGame();
  }

  addScore(pts) {
    this.score += pts;
  }

  addWatt() {
    this.watts++;
    if (this.watts >= 100) {
      this.watts -= 100;
      this.lives++;
      if (window.retroAudio) window.retroAudio.playPowerUp();
    }
  }

  triggerGameOver(reason) {
    this.state = 'GAMEOVER';
    document.getElementById('gameOverMsg').textContent = reason || "Motor burnt out!";
    this.gameOverScreen.classList.add('active');
  }

  onLevelComplete() {
    if (this.state === 'VICTORY') return;
    this.state = 'VICTORY';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalWatts').textContent = this.watts;
    this.victoryScreen.classList.add('active');
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (this.state === 'START') {
      this.renderTitlePreview();
    } else if (this.state === 'PLAYING') {
      this.update(dt);
      this.render();
    } else if (this.state === 'VICTORY' || this.state === 'GAMEOVER') {
      // Still render game background
      this.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. Time management
    this.timeTimer += dt;
    if (this.timeTimer >= 1.0) {
      this.timeTimer -= 1.0;
      if (!this.player.isWinning) {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.player.die("Time ran out!");
        }
      }
    }

    // 2. Invulnerability countdown
    if (this.player.invulnTimer > 0) {
      this.player.invulnTimer--;
    }

    // 3. Physics & Map updates
    this.physics.updatePlayer(this.player, this.input, this.map, dt);
    this.map.update(dt);

    // 4. Smooth Camera Following
    const targetCamX = this.player.x - this.canvas.width * 0.35;
    const maxCamX = this.map.width * this.map.tileSize - this.canvas.width;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;

    // 5. Update HUD elements
    this.updateHUD();
  }

  updateHUD() {
    this.hudScore.textContent = String(this.score).padStart(6, '0');
    this.hudWatts.textContent = `⚡x${String(this.watts).padStart(2, '0')}`;
    this.hudTime.textContent = Math.max(0, this.timeLeft);
    this.hudLives.textContent = `♥ x ${this.lives}`;

    const rpmPercent = Math.min(100, (this.player.rpm / 4.0) * 100);
    this.hudRpmFill.style.width = `${rpmPercent}%`;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Parallax Sky & Attic Background
    this.renderParallaxBackground();

    // 2. Render Level Tiles & Objects
    if (this.map) {
      this.map.render(this.ctx, this.cameraX);
    }

    // 3. Render Hero (Ceiling Fan)
    if (this.player) {
      // Flickering if invulnerable
      if (this.player.invulnTimer % 4 < 2) {
        Sprites.drawFan(
          this.ctx,
          this.player.x - this.cameraX,
          this.player.y,
          this.player.width,
          this.player.height,
          this.player
        );
      }
    }
  }

  renderParallaxBackground() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Sky Gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#5c94fc');
    skyGrad.addColorStop(0.7, '#92c3f8');
    skyGrad.addColorStop(1, '#c8e2ff');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Distant Attic Rafters / Joists (slow parallax)
    this.ctx.fillStyle = 'rgba(74, 52, 38, 0.25)';
    const beamSpacing = 160;
    const beamOffset = -(this.cameraX * 0.15) % beamSpacing;
    for (let bx = beamOffset - beamSpacing; bx < w + beamSpacing; bx += beamSpacing) {
      this.ctx.fillRect(bx, 0, 18, h * 0.45);
    }

    // Floating Clouds (medium parallax)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const cloudOffset = -(this.cameraX * 0.3) % 400;
    for (let cx = cloudOffset - 400; cx < w + 400; cx += 400) {
      this.drawCloud(this.ctx, cx + 50, 70, 70);
      this.drawCloud(this.ctx, cx + 240, 110, 50);
    }
  }

  drawCloud(ctx, x, y, scale) {
    ctx.beginPath();
    ctx.arc(x, y, scale * 0.35, 0, Math.PI * 2);
    ctx.arc(x + scale * 0.3, y - scale * 0.15, scale * 0.4, 0, Math.PI * 2);
    ctx.arc(x + scale * 0.65, y, scale * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  renderTitlePreview() {
    this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    const time = performance.now() * 0.003;
    Sprites.drawFan(
      this.previewCtx,
      35,
      35,
      50,
      50,
      {
        isSuper: true,
        bladeAngle: time * 4,
        chainAngle: Math.sin(time * 2) * 0.25,
        isFluttering: true,
        facing: 1,
        rpm: 3.5,
        vx: Math.sin(time) * 2
      }
    );
  }
}

// Start game when page loads
window.addEventListener('load', () => {
  window.game = new SuperFanGame();
});
