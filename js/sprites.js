// Sprite & Graphic Renderers for Super Ceiling Fan Bros
const Sprites = {
  // Draw the Hero: Sir Spins-a-Lot (Ceiling Fan)
  drawFan(ctx, x, y, width, height, state) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    const isSuper = state.isSuper;
    const bladeAngle = state.bladeAngle || 0;
    const chainAngle = state.chainAngle || 0;
    const isFluttering = state.isFluttering;
    const facing = state.facing || 1; // 1 for right, -1 for left
    const rpm = state.rpm || 1;

    // Tilting based on velocity
    const tilt = (state.vx || 0) * 0.04;
    ctx.rotate(tilt);

    // Draw Updraft / Wind Gust particles beneath the fan if hovering
    if (isFluttering || rpm > 2.5) {
      this.drawWindGusts(ctx, 0, height * 0.35, isFluttering);
    }

    // 1. Suspension Rod & Ceiling Mount / Canopy (top)
    ctx.fillStyle = '#4a4d52';
    ctx.fillRect(-3, -height * 0.48, 6, height * 0.22);
    // Canopy cap
    ctx.fillStyle = '#2d3036';
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.46, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Dangling Pull Chain (sways with momentum)
    ctx.save();
    ctx.translate(6 * facing, 2);
    ctx.rotate(chainAngle);
    ctx.strokeStyle = '#c0a060';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 16);
    ctx.stroke();
    // Brass knob bead
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, 18, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Rotating Fan Blades (Pseudo-3D Elliptical Projection)
    const bladeCount = isSuper ? 5 : 4;
    const bladeLength = width * 0.48;
    const bladeWidth = isSuper ? 9 : 7;
    const ySquish = 0.35; // Perspective flattening

    // Draw back blades first
    for (let i = 0; i < bladeCount; i++) {
      const angle = bladeAngle + (i * (Math.PI * 2) / bladeCount);
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      // Back half of rotation
      if (sinA < 0) {
        this.renderBlade(ctx, cosA * bladeLength, sinA * bladeLength * ySquish, angle, bladeWidth, isSuper);
      }
    }

    // 4. Central Motor Housing
    // Super fan gets golden housing, regular gets Mario Red
    const motorGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
    if (isSuper) {
      motorGrad.addColorStop(0, '#fff490');
      motorGrad.addColorStop(0.5, '#e6b800');
      motorGrad.addColorStop(1, '#997300');
    } else {
      motorGrad.addColorStop(0, '#ff6666');
      motorGrad.addColorStop(0.5, '#d62828');
      motorGrad.addColorStop(1, '#780000');
    }

    ctx.fillStyle = motorGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2b0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Front Blades
    for (let i = 0; i < bladeCount; i++) {
      const angle = bladeAngle + (i * (Math.PI * 2) / bladeCount);
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      // Front half of rotation
      if (sinA >= 0) {
        this.renderBlade(ctx, cosA * bladeLength, sinA * bladeLength * ySquish, angle, bladeWidth, isSuper);
      }
    }

    // 5. Hero Features: Eyes & Mario-Style Mustache!
    ctx.save();
    ctx.scale(facing, 1);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(3, -4, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(9, -4, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pupils (looking forward)
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.arc(4.5, -4, 2, 0, Math.PI * 2);
    ctx.arc(10.5, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mustache!
    ctx.fillStyle = '#1a0d00';
    ctx.beginPath();
    ctx.ellipse(6, 3, 7, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Mustache curls
    ctx.beginPath();
    ctx.arc(12, 2.5, 2.5, 0, Math.PI * 2);
    ctx.arc(0, 2.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Chrome center badge / nut
    ctx.fillStyle = '#d0d7de';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  renderBlade(ctx, xEnd, yEnd, angle, bladeWidth, isSuper) {
    ctx.save();
    // Blade gradient: wooden finish for standard, chrome electric for super
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const perpX = -Math.sin(angle) * (bladeWidth / 2);
    const perpY = Math.cos(angle) * (bladeWidth / 2) * 0.35;

    ctx.lineTo(xEnd * 0.3 + perpX * 0.7, yEnd * 0.3 + perpY * 0.7);
    ctx.lineTo(xEnd + perpX, yEnd + perpY);
    ctx.lineTo(xEnd - perpX, yEnd - perpY);
    ctx.lineTo(xEnd * 0.3 - perpX * 0.7, yEnd * 0.3 - perpY * 0.7);
    ctx.closePath();

    if (isSuper) {
      ctx.fillStyle = '#ffdd44';
      ctx.strokeStyle = '#b8860b';
    } else {
      ctx.fillStyle = '#8b5a2b';
      ctx.strokeStyle = '#5c3a1e';
    }
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Rivet mount
    ctx.fillStyle = '#d0d7de';
    ctx.beginPath();
    ctx.arc(xEnd * 0.25, yEnd * 0.25, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawWindGusts(ctx, x, y, isFluttering) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    const time = Date.now() * 0.02;
    for (let i = -2; i <= 2; i++) {
      const offsetX = i * 8 + Math.sin(time + i) * 3;
      const offsetY = y + (Math.cos(time + i) * 4) + 4;
      ctx.beginPath();
      ctx.moveTo(offsetX - 5, offsetY);
      ctx.quadraticCurveTo(offsetX, offsetY + 8, offsetX + 5, offsetY);
      ctx.stroke();
    }
    ctx.restore();
  },

  // Draw Goomba equivalent: The Dust Bunny
  drawDustBunny(ctx, x, y, width, height, state) {
    ctx.save();
    ctx.translate(x + width / 2, y + height);

    if (state.isSquished) {
      // Squished pancake state
      ctx.scale(1.3, 0.25);
      ctx.fillStyle = '#8c829e';
      ctx.beginPath();
      ctx.arc(0, -height / 2, width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const walkCycle = Math.sin((state.animTimer || 0) * 8);
    const squishY = 1 + walkCycle * 0.08;
    const squishX = 1 - walkCycle * 0.08;
    ctx.scale(squishX, squishY);

    // Fluffy body lobes
    ctx.fillStyle = '#9b8ea9';
    ctx.beginPath();
    ctx.arc(-8, -14, 10, 0, Math.PI * 2);
    ctx.arc(8, -14, 10, 0, Math.PI * 2);
    ctx.arc(0, -22, 11, 0, Math.PI * 2);
    ctx.arc(0, -12, 13, 0, Math.PI * 2);
    ctx.fill();

    // Darker outline details
    ctx.fillStyle = '#6e617d';
    ctx.beginPath();
    ctx.arc(-11, -12, 3, 0, Math.PI * 2);
    ctx.arc(11, -12, 3, 0, Math.PI * 2);
    ctx.arc(0, -28, 3, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -16, 4, 0, Math.PI * 2);
    ctx.arc(5, -16, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#b30000';
    const dir = state.vx > 0 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(-5 + dir, -16, 2, 0, Math.PI * 2);
    ctx.arc(5 + dir, -16, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#2b1b3d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -21);
    ctx.lineTo(-2, -18);
    ctx.moveTo(9, -21);
    ctx.lineTo(2, -18);
    ctx.stroke();

    // Little static-electricity feet
    ctx.fillStyle = '#4a3b5a';
    const footWobble = walkCycle * 3;
    ctx.fillRect(-10, -3 + footWobble, 6, 4);
    ctx.fillRect(4, -3 - footWobble, 6, 4);

    ctx.restore();
  },

  // Draw Flying Fly / Mosquito (Koopa Paratroopa equivalent)
  drawFly(ctx, x, y, width, height, state) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    const flap = Math.sin((state.animTimer || 0) * 20);
    const dir = state.vx > 0 ? 1 : -1;
    ctx.scale(dir, 1);

    // Translucent wings
    ctx.fillStyle = 'rgba(200, 240, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-2, -10 + flap * 4, 10, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fly body (segmented)
    ctx.fillStyle = '#2d5a27';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#143010';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stripes
    ctx.strokeStyle = '#f3e03b';
    ctx.beginPath();
    ctx.moveTo(-2, -6); ctx.lineTo(-2, 6);
    ctx.moveTo(3, -6); ctx.lineTo(3, 6);
    ctx.stroke();

    // Big red compound eyes
    ctx.fillStyle = '#e60000';
    ctx.beginPath();
    ctx.arc(8, -2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, -3, 2, 2);

    // Stinger / proboscis
    ctx.strokeStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(11, 1);
    ctx.lineTo(16, 3);
    ctx.stroke();

    ctx.restore();
  },

  // Draw Mystery [?] Block
  drawMysteryBlock(ctx, x, y, size, isUsed, bounceOffset = 0) {
    ctx.save();
    ctx.translate(x, y + bounceOffset);

    if (isUsed) {
      // Empty used block
      ctx.fillStyle = '#8b6946';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#5c4028';
      ctx.fillRect(2, 2, size - 4, size - 4);
      // Rivets
      ctx.fillStyle = '#3a2514';
      ctx.fillRect(4, 4, 3, 3);
      ctx.fillRect(size - 7, 4, 3, 3);
      ctx.fillRect(4, size - 7, 3, 3);
      ctx.fillRect(size - 7, size - 7, 3, 3);
    } else {
      // Shimmering Golden [?] Block
      const pulse = Math.sin(Date.now() * 0.006) * 0.15;
      ctx.fillStyle = '#fcb017';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#e58f00';
      ctx.fillRect(3, 3, size - 6, size - 6);

      // Bevel highlights
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(0, 0, size, 3);
      ctx.fillRect(0, 0, 3, size);

      ctx.fillStyle = '#8a4b00';
      ctx.fillRect(0, size - 3, size, 3);
      ctx.fillRect(size - 3, 0, 3, size);

      // Question mark '?'
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 2;
      ctx.fillText('?', size / 2, size / 2 + 1);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, size, size);
    ctx.restore();
  },

  // Draw Brick Block
  drawBrickBlock(ctx, x, y, size, bounceOffset = 0) {
    ctx.save();
    ctx.translate(x, y + bounceOffset);

    ctx.fillStyle = '#b3391b';
    ctx.fillRect(0, 0, size, size);

    // Brick mortar lines
    ctx.fillStyle = '#541505';
    ctx.fillRect(0, 0, size, 2);
    ctx.fillRect(0, size / 2, size, 2);
    ctx.fillRect(0, size - 2, size, 2);

    ctx.fillRect(size / 2, 0, 2, size / 2);
    ctx.fillRect(size / 4, size / 2, 2, size / 2);
    ctx.fillRect(size * 3 / 4, size / 2, 2, size / 2);

    // Highlights
    ctx.fillStyle = '#df5a38';
    ctx.fillRect(2, 2, size / 2 - 4, 3);
    ctx.fillRect(size / 2 + 2, 2, size / 2 - 4, 3);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(0, 0, size, size);

    ctx.restore();
  },

  // Draw Ventilation Duct (Warp Pipe equivalent)
  drawAirVent(ctx, x, y, width, height) {
    ctx.save();
    // Metal air vent shaft
    const grad = ctx.createLinearGradient(x, y, x + width, y);
    grad.addColorStop(0, '#586069');
    grad.addColorStop(0.3, '#8b949e');
    grad.addColorStop(0.7, '#c9d1d9');
    grad.addColorStop(1, '#30363d');

    // Vent rim on top
    const rimHeight = 16;
    ctx.fillStyle = grad;
    ctx.fillRect(x - 3, y, width + 6, rimHeight);
    ctx.strokeStyle = '#1b1f24';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 3, y, width + 6, rimHeight);

    // Vent body
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + rimHeight, width, height - rimHeight);
    ctx.strokeRect(x, y + rimHeight, width, height - rimHeight);

    // Air grill slats
    ctx.fillStyle = '#161b22';
    const slatGap = 8;
    for (let sy = y + rimHeight + 6; sy < y + height - 6; sy += slatGap) {
      ctx.fillRect(x + 4, sy, width - 8, 3);
    }

    ctx.restore();
  },

  // Draw Watt / Electric Spark (Coin equivalent)
  drawWatt(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    const spin = (Date.now() * 0.005) % (Math.PI * 2);
    const scaleX = Math.cos(spin);
    ctx.scale(scaleX, 1);

    // Golden electric diamond / lightning
    ctx.fillStyle = '#ffea00';
    ctx.strokeStyle = '#e69900';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, -size * 0.45);
    ctx.lineTo(size * 0.35, 0);
    ctx.lineTo(0, size * 0.45);
    ctx.lineTo(-size * 0.35, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center spark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -size * 0.25, 4, size * 0.5);

    ctx.restore();
  },

  // Draw Speed Regulator Power-Up (Super Mushroom equivalent)
  drawRegulator(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    // Copper motor speed dial box
    ctx.fillStyle = '#cd7f32';
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeStyle = '#4a2c00';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // Circular gauge
    ctx.fillStyle = '#fff8dc';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gauge markings & red indicator needle
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const needleAngle = -Math.PI * 0.75 + (Date.now() * 0.008 % Math.PI * 1.5);
    ctx.lineTo(Math.cos(needleAngle) * size * 0.3, Math.sin(needleAngle) * size * 0.3);
    ctx.stroke();

    // Shiny spark overlay
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // Draw Master Switch Flagpole (Finish Line)
  drawMasterSwitch(ctx, x, y, height, switchY, isActivated) {
    ctx.save();
    // 1. Tall conduit pole
    ctx.fillStyle = '#7a8288';
    ctx.fillRect(x + 12, y, 6, height);
    ctx.strokeStyle = '#2b3035';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 12, y, 6, height);

    // High voltage hazard stripes on pole base
    const baseH = 26;
    ctx.fillStyle = '#f3e03b';
    ctx.fillRect(x, y + height - baseH, 30, baseH);
    ctx.fillStyle = '#161b22';
    ctx.beginPath();
    ctx.moveTo(x, y + height - baseH);
    ctx.lineTo(x + 10, y + height - baseH);
    ctx.lineTo(x, y + height - baseH + 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 15, y + height - baseH);
    ctx.lineTo(x + 25, y + height - baseH);
    ctx.lineTo(x + 5, y + height);
    ctx.lineTo(x, y + height);
    ctx.fill();

    // Top insulator / orb
    ctx.fillStyle = isActivated ? '#3fb950' : '#f85149';
    ctx.beginPath();
    ctx.arc(x + 15, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // 2. Sliding Knife Switch / Lever
    const leverY = y + switchY;
    ctx.fillStyle = '#d73a49';
    ctx.fillRect(x + 18, leverY - 6, 26, 12);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x + 18, leverY - 6, 26, 12);

    // Lever arm
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 18, leverY);
    if (isActivated) {
      // Switched Down (ON)
      ctx.lineTo(x + 40, leverY + 8);
    } else {
      // Switched Up (OFF)
      ctx.lineTo(x + 38, leverY - 14);
    }
    ctx.stroke();

    // Sparkles if activated
    if (isActivated) {
      const time = Date.now() * 0.01;
      ctx.fillStyle = '#58a6ff';
      for (let i = 0; i < 4; i++) {
        const sx = x + 15 + Math.cos(time + i * 1.5) * 16;
        const sy = y + height - 20 + Math.sin(time + i * 1.5) * 16;
        ctx.fillRect(sx, sy, 3, 3);
      }
    }

    ctx.restore();
  }
};

window.Sprites = Sprites;
