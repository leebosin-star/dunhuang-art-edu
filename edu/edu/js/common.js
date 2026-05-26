/* ============================================================
   DHP · Common JS — 全站共享（光标、粒子、加载屏）
   ============================================================ */
(function(){
var DHP = window.DHP = window.DHP || {};

// ============================================================
// LOADING SCREEN
// ============================================================
var loader, loaderDismissed = false;

DHP.initLoader = function(onEnter) {
  loader = document.getElementById('loader');
  if (!loader) return;

  var dots = loader.querySelectorAll('.loader-dots span');
  var title = loader.querySelector('.loader-title');
  var line = loader.querySelector('.loader-line');
  var hint = loader.querySelector('.loader-hint');

  // Animate dots
  dots.forEach(function(dot, i) {
    dot.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    dot.style.transform = 'scale(0)';
    dot.style.opacity = '0';
    setTimeout(function() {
      dot.style.transform = 'scale(1)';
      dot.style.opacity = '0.7';
    }, 300 + i * 120);
  });

  // Animate title
  setTimeout(function() {
    if (title) {
      title.style.transition = 'opacity 0.8s ease';
      title.style.opacity = '1';
    }
  }, 1100);

  // Animate line
  setTimeout(function() {
    if (line) {
      line.style.transition = 'width 0.8s ease, opacity 0.6s ease';
      line.style.width = '80px';
      line.style.opacity = '0.4';
    }
  }, 1500);

  // Show hint
  setTimeout(function() {
    if (hint) {
      hint.style.transition = 'opacity 0.6s ease';
      hint.style.opacity = '1';
    }
  }, 2000);

  function dismiss() {
    if (loaderDismissed) return;
    loaderDismissed = true;
    loader.classList.add('fade-out');
    setTimeout(function() {
      var nav = document.getElementById('nav');
      if (nav) nav.classList.add('visible');
      if (onEnter) onEnter();
    }, 400);
  }

  loader.addEventListener('click', dismiss);
  document.addEventListener('keydown', function(e) {
    if (!loaderDismissed && (e.key === 'Enter' || e.key === ' ')) {
      dismiss();
    }
  });
};

// ============================================================
// CUSTOM CURSOR
// ============================================================
var cursorDot, cursorRing, mx, my, rx, ry, cursorVisible;

DHP.initCursor = function() {
  cursorDot = document.getElementById('cursorDot');
  cursorRing = document.getElementById('cursorRing');
  if (!cursorDot || !cursorRing) return;

  mx = window.innerWidth / 2;
  my = window.innerHeight / 2;
  rx = mx;
  ry = my;
  cursorVisible = false;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top = my + 'px';
    if (!cursorVisible) {
      cursorVisible = true;
      cursorDot.classList.add('visible');
      cursorRing.classList.add('visible');
    }
    if (DHP.onMouseMove) DHP.onMouseMove(e);
  });

  document.addEventListener('mouseleave', function() {
    if (cursorDot) cursorDot.classList.remove('visible');
    if (cursorRing) cursorRing.classList.remove('visible');
    cursorVisible = false;
  });

  document.addEventListener('mousedown', function() {
    if (cursorDot) cursorDot.classList.add('clicking');
  });
  document.addEventListener('mouseup', function() {
    if (cursorDot) cursorDot.classList.remove('clicking');
  });

  document.addEventListener('mouseover', function(e) {
    var target = e.target.closest('a, button, .color-bar, .module-card, #loader');
    if (target && cursorRing) cursorRing.classList.add('hover');
  });
  document.addEventListener('mouseout', function(e) {
    var target = e.target.closest('a, button, .color-bar, .module-card, #loader');
    if (target && cursorRing) cursorRing.classList.remove('hover');
  });
};

// ============================================================
// GLOBAL PARTICLE SYSTEM
// ============================================================
var canvas, ctx, W, H, particles = [];
var particleColors = null;
var particlesReady = false;

DHP.initParticles = function() {
  canvas = document.getElementById('globalCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  if (!particleColors) {
    // Six main Dunhuang colors — saturated eduHex palette
    var six = ['#F9F5EB','#D7B072','#9E0507','#37312C','#7DC8B7','#5366C5'];
    particleColors = [];
    for (var i = 0; i < 34; i++) { particleColors = particleColors.concat(six); }
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (var i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      homeX: Math.random() * W,
      homeY: Math.random() * H,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      size: 0.6 + Math.random() * 2.2,
      alpha: 0.1 + Math.random() * 0.28
    });
  }
  particlesReady = true;
};

function updateParticles() {
  var repelRadius = 90, repelForce = 0.015;
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var dx = p.x - mx, dy = p.y - my;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < repelRadius && cursorVisible) {
      var force = (1 - dist / repelRadius) * repelForce;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
    p.vx += (p.homeX - p.x) * 0.00006;
    p.vy += (p.homeY - p.y) * 0.00006;
    p.vx *= 0.998;
    p.vy *= 0.998;
    var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 0.8) { p.vx *= 0.8 / speed; p.vy *= 0.8 / speed; }
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -30) p.x = W + 30;
    if (p.x > W + 30) p.x = -30;
    if (p.y < -30) p.y = H + 30;
    if (p.y > H + 30) p.y = -30;
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var dx = p.x - mx, dy = p.y - my;
    var distToMouse = Math.sqrt(dx * dx + dy * dy);
    var alphaBoost = distToMouse < 120 ? (1 - distToMouse / 120) * 0.2 : 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(0.6, p.alpha + alphaBoost);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// MAIN LOOP
// ============================================================
function mainLoop() {
  if (rx !== undefined && ry !== undefined) {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    if (cursorRing) {
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top = ry + 'px';
    }
  }

  if (particlesReady) {
    updateParticles();
    drawParticles();
  }

  requestAnimationFrame(mainLoop);
}

// ============================================================
// EXPORT
// ============================================================
DHP.getMouseX = function() { return mx; };
DHP.getMouseY = function() { return my; };
DHP.getW = function() { return W; };
DHP.getH = function() { return H; };

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
  var hamburger = document.getElementById('navHamburger');
  if (!hamburger) return;

  // Build mobile menu from nav links
  var navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  var items = navLinks.querySelectorAll('a');
  var menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobileMenu';
  items.forEach(function(a) {
    var link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent;
    if (a.style.color === '#fff' || a.style.color === 'rgb(255, 255, 255)') {
      link.classList.add('current');
    }
    menu.appendChild(link);
  });
  document.body.appendChild(menu);

  var open = false;
  function toggle() {
    open = !open;
    hamburger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
  }
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggle();
  });
  menu.addEventListener('click', function() {
    toggle();
  });
}
document.addEventListener('DOMContentLoaded', initMobileMenu);

// Auto-start: init cursor and particles immediately
document.addEventListener('DOMContentLoaded', function() {
  DHP.initCursor();
  DHP.initParticles();
  mainLoop();
});

})();
