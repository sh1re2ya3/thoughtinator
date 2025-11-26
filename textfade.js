document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('.input-container > textarea');
  const display = document.querySelector('.display');
  if (!input || !display) return;

  const chars = []; // [{ el, timeoutId }]


  input.addEventListener('input', onInput);

  input.addEventListener('blur', () => {
  input.focus();
});

  function onInput() {
    const value = input.value;

    // create/update spans to match input.value
    for (let i = 0; i < value.length; i++) {
      const ch = value[i];
      const existing = chars[i];
      if (existing) {
        if (existing.el.textContent !== ch) {
          clearTimeout(existing.timeoutId);
          existing.el.remove();
          chars.splice(i, 1);
          createCharAt(ch, i);
        }
      } else {
        createCharAt(ch, i);
      }
    }

    // remove extra spans when user backspaces
    while (chars.length > value.length) {
      const obj = chars.pop();
      clearTimeout(obj.timeoutId);
      if (obj.el.parentNode) obj.el.parentNode.removeChild(obj.el);
    }
  }

  function createCharAt(ch, index) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    const ref = display.childNodes[index] || null;
    display.insertBefore(span, ref);

    const timeoutId = setTimeout(() => {
      span.classList.add('smoke');
      span.addEventListener('animationend', () => {
        if (span.parentNode) span.parentNode.removeChild(span);
        // input.value = input.value.slice(0, index) + input.value.slice(index + 1);
        input.value = input.value.slice(1);
      }, { once: true });
    }, 2000);

    chars.splice(index, 0, { el: span, timeoutId });
  }
});


// canvas bg

document.addEventListener('DOMContentLoaded', () => {
  // --- background spiral particles ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, cx, cy, DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = w / 2; cy = h / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  const particleCount = 320;
  const particles = [];
  const maxRadius = Math.hypot(w, h) * 0.7;

  function spawnParticle(init) {
    return {
      angle: Math.random() * Math.PI * 2,
      radius: init ? (Math.random() * (maxRadius * 0.6) + maxRadius * 0.4) : maxRadius * (0.9 + Math.random()*0.2),
      angularSpeed: (0.0008 + Math.random()*0.0016) * (Math.random() < 0.5 ? 1 : -1),
      radialSpeed: - (0.02 + Math.random()*0.06),
      size: 0.6 + Math.random()*2.2,
      hue: 200 + Math.random()*60 | 0
    };
  }

  for (let i = 0; i < particleCount; i++) particles.push(spawnParticle(true));

  let last = performance.now();
  function updateRender(now) {
    const dt = now - last;
    last = now;

    // light alpha fill for trailing effect
    ctx.fillStyle = 'rgba(13,49,89,0.08)';
    ctx.fillRect(0,0,w,h);

    for (let p of particles) {
      const rFactor = 1 - Math.min(1, p.radius / maxRadius);
      p.angle += p.angularSpeed * (1 + rFactor*3) * dt;
      p.radius += p.radialSpeed * dt * (0.6 + Math.random()*0.8);

      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size*3);
      grad.addColorStop(0, `hsla(${p.hue},60%,65%,0.9)`);
      grad.addColorStop(0.6, `hsla(${p.hue},60%,45%,0.25)`);
      grad.addColorStop(1, `hsla(${p.hue},60%,30%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, p.size*2, 0, Math.PI*2);
      ctx.fill();

      if (p.radius < 6 || x < -50 || x > w+50 || y < -50 || y > h+50) {
        Object.assign(p, spawnParticle(false));
      }
    }

    requestAnimationFrame(updateRender);
  }

  requestAnimationFrame(updateRender);
  // --- end background spiral particles ---

  // ...existing code (input/display logic) continues here...
});