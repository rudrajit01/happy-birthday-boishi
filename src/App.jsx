import { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [cakeComplete, setCakeComplete] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const initializedRef = useRef(false);
  const baseDataRef = useRef(null);
  const scaleRef = useRef({ x: 1, y: 1 });

  // Fixed canvas size (you can adjust, but this ensures visibility)
  const CANVAS_WIDTH = 1100;
  const CANVAS_HEIGHT = 680;
  const BUILD_DURATION = 6500;
  const BASE_W = 1100;
  const BASE_H = 680;

  const workersRef = useRef([
    { x: 250, dir: 1, speed: 0.6, legPhase: 0, armPhase: 0 },
    { x: 550, dir: -1, speed: 0.5, legPhase: 1.2, armPhase: 0.8 },
    { x: 780, dir: 1, speed: 0.7, legPhase: 2.1, armPhase: 1.5 },
    { x: 450, dir: -1, speed: 0.55, legPhase: 3.0, armPhase: 2.2 }
  ]);

  // Typing effect
  useEffect(() => {
    if (!typingStarted) return;
    const elements = baseDataRef.current?.sayElements;
    const codeDiv = document.getElementById("code");
    if (!codeDiv || !elements) return;
    codeDiv.innerHTML = "";
    let i = 0, c = 0;
    function type() {
      if (i >= elements.length) return;
      if (c === 0) {
        const span = document.createElement("span");
        span.className = elements[i].className;
        span.style.display = "block";
        span.style.margin = "8px 0";
        span.style.textAlign = "center";
        span.style.transform = "scale(0.8)";
        span.style.opacity = "0";
        span.style.transition = "all 0.2s ease";
        codeDiv.appendChild(span);
        requestAnimationFrame(() => {
          span.style.transform = "scale(1)";
          span.style.opacity = "1";
          span.style.textShadow = "0 0 5px #ff88aa";
        });
      }
      const span = codeDiv.lastChild;
      if (c < elements[i].text.length) {
        span.textContent += elements[i].text[c];
        span.style.textShadow = "0 0 8px #ffaaee";
        setTimeout(() => { span.style.textShadow = "0 0 2px #ff88aa"; }, 100);
        c++;
        setTimeout(type, 50);
      } else {
        i++;
        c = 0;
        setTimeout(type, 200);
      }
    }
    type();
  }, [typingStarted]);

  const generateBaseData = () => {
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * BASE_W,
      y: Math.random() * BASE_H,
      r: Math.random() * 2,
      a: 0.3 + Math.random() * 0.7
    }));

    const snowflakes = Array.from({ length: 220 }, () => ({
      x: Math.random() * BASE_W,
      y: Math.random() * BASE_H,
      size: 1 + Math.random() * 4,
      speedY: 0.4 + Math.random() * 1.1,
      drift: Math.random() * 2,
      phase: Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.7
    }));

    const basePositions = [40,100,160,220,280,340,400,680,740,800,860,920,980];
    const buildings = basePositions.map((x, idx) => ({
      x,
      width: 45 + Math.random() * 28,
      floors: 4 + Math.floor(Math.random() * 8),
      crane: idx % 2 === 0,
      tone: 200 + Math.random() * 40,
      angle: Math.random() * Math.PI,
      angleSpeed: 0.01
    }));

    const tiers = [
      { w: 160, h: 48, c: "#f7b7d7", i: "#ff9ccf" },
      { w: 130, h: 42, c: "#f4a1c8", i: "#ff8bbf" },
      { w: 95, h: 38, c: "#ef88b2", i: "#ff72ac" },
      { w: 72, h: 34, c: "#ff7ba6", i: "#ff5b95" }
    ];

    const cakeX = BASE_W / 2 + 5;
    const cakeY = BASE_H - 70;

    const sayElements = [
      { className: "say", text: "Hey you 🌙" },
      { className: "say", text: "Happy Birthday ✨" },
      { className: "say", text: "May your days shine softly ☀️" },
      { className: "say", text: "May your nights hold stars 🌌" },
      { className: "say", text: "Stay smiling forever 😊" },
      { className: "say", text: "Happy Birthday Boishi 🎂" }
    ];

    return { stars, snowflakes, buildings, tiers, cakeX, cakeY, sayElements };
  };

  useEffect(() => {
    if (!animationStarted) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    baseDataRef.current = generateBaseData();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Fixed canvas size (no window dependency)
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    scaleRef.current = { x: 1, y: 1 }; // No scaling needed because we use fixed size

    startTimeRef.current = performance.now();

    // Drawing functions (same as before, but with fixed dimensions)
    const drawSky = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, "#02021a");
      grad.addColorStop(1, "#13002d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    const drawStars = () => {
      const { stars } = baseDataRef.current;
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${s.a})`;
        ctx.fill();
      });
    };

    const drawSnow = (time) => {
      const { snowflakes } = baseDataRef.current;
      snowflakes.forEach(f => {
        f.y += f.speedY;
        if (f.y > CANVAS_HEIGHT + 10) {
          f.y = -10;
          f.x = Math.random() * CANVAS_WIDTH;
        }
        const driftX = Math.sin(time * 0.001 + f.phase) * f.drift;
        ctx.beginPath();
        ctx.arc(f.x + driftX, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
      });
    };

    const drawBuildings = (progress, time) => {
      const { buildings } = baseDataRef.current;
      buildings.forEach(b => {
        const exact = progress * b.floors;
        const full = Math.floor(exact);
        const floorH = 12;
        const totalH = exact * floorH;
        const baseGroundY = BASE_H - 70;
        const y = baseGroundY - totalH;
        const grad = ctx.createLinearGradient(b.x, y, b.x, baseGroundY);
        grad.addColorStop(0, `hsl(${b.tone},40%,40%)`);
        grad.addColorStop(1, `hsl(${b.tone},40%,20%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(b.x, y, b.width, totalH);
        for (let f = 0; f < full; f++) {
          for (let w = 0; w < 3; w++) {
            ctx.fillStyle = `rgba(255,220,140,${0.7 + Math.sin(time * 0.003 + f) * 0.2})`;
            ctx.fillRect(b.x + 7 + w * 14, baseGroundY - (f + 1) * floorH + 3, 7, 6);
          }
        }
        if (b.crane && progress > 0.2) {
          b.angle += b.angleSpeed;
          const baseX = b.x + b.width / 2;
          const baseY = y - 5;
          ctx.fillStyle = "#999";
          ctx.fillRect(baseX - 2, baseY, 4, 18);
          const armX = baseX + Math.cos(b.angle) * 28;
          const armY = baseY - 15 + Math.sin(b.angle) * 5;
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.lineTo(armX, armY);
          ctx.strokeStyle = "#d2a45e";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    };

    const drawGround = () => {
      ctx.fillStyle = "#2a2418";
      ctx.fillRect(0, BASE_H - 55, CANVAS_WIDTH, 55);
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(0, BASE_H - 48, CANVAS_WIDTH, 6);
    };

    const drawCake = (progress) => {
      const { tiers, cakeX, cakeY } = baseDataRef.current;
      const cakeProgress = Math.min(Math.max((progress - 0.15) / 0.85, 0), 1);
      let builtH = 0;
      tiers.forEach((t, i) => {
        const tierStart = i * 0.22;
        const tierEnd = tierStart + 0.25;
        let local = (cakeProgress - tierStart) / (tierEnd - tierStart);
        local = Math.min(Math.max(local, 0), 1);
        const curH = t.h * local;
        if (curH <= 0) return;
        const y = cakeY - builtH - curH;
        const x = cakeX - t.w / 2;
        const grad = ctx.createLinearGradient(x, y, x, y + curH);
        grad.addColorStop(0, t.c);
        grad.addColorStop(1, "#de7ca3");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, t.w, curH);
        ctx.fillStyle = t.i;
        ctx.fillRect(x - 2, y - 5, t.w + 4, 7);
        builtH += curH;
      });
      if (progress >= 1) {
        const top = cakeY - 162;
        ctx.fillStyle = "#fff";
        ctx.fillRect(cakeX - 4, top - 30, 8, 28);
        ctx.fillStyle = "#aa7733";
        ctx.fillRect(cakeX - 1, top - 34, 2, 8);
        ctx.beginPath();
        ctx.moveTo(cakeX, top - 42);
        ctx.lineTo(cakeX - 5, top - 36);
        ctx.lineTo(cakeX + 5, top - 36);
        ctx.fillStyle = "#ffaa33";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cakeX, top - 38, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ff6600";
        ctx.fill();
      }
    };

    const drawWorker = (worker, time, isComplete) => {
      if (!isComplete) {
        worker.x += worker.speed * worker.dir;
        if (worker.x > 950) worker.dir = -1;
        if (worker.x < 150) worker.dir = 1;
        worker.legPhase += 0.03;
        worker.armPhase += 0.035;
      }
      const legOffset = Math.sin(time * 0.006 + worker.legPhase) * 0.6;
      const armOffset = Math.sin(time * 0.007 + worker.armPhase) * 0.8;
      
      const xPos = worker.x;
      const yPos = BASE_H - 80;
      
      ctx.fillStyle = "#ff9900";
      ctx.beginPath();
      ctx.ellipse(xPos + 8, yPos - 12, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f5cba0";
      ctx.beginPath();
      ctx.arc(xPos + 8, yPos - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3366cc";
      ctx.fillRect(xPos + 3, yPos - 2, 10, 12);
      ctx.fillStyle = "#2255aa";
      const leftLegX = xPos + 3 + legOffset * 2;
      const rightLegX = xPos + 9 - legOffset * 2;
      ctx.fillRect(leftLegX, yPos + 8, 4, 8);
      ctx.fillRect(rightLegX, yPos + 8, 4, 8);
      ctx.beginPath();
      ctx.moveTo(xPos + 13, yPos);
      ctx.lineTo(xPos + 18 + armOffset * 5, yPos + 5 + Math.abs(armOffset) * 3);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#3366cc";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xPos + 3, yPos);
      ctx.lineTo(xPos - 2 - armOffset * 5, yPos + 5 + Math.abs(armOffset) * 3);
      ctx.stroke();

      if (isComplete) {
        ctx.font = `bold 14px 'Segoe UI', 'Dancing Script', cursive`;
        ctx.fillStyle = "#ffdd99";
        ctx.shadowBlur = 4;
        ctx.textAlign = "center";
        ctx.fillText("🎂 Happy Birthday 🎂", xPos + 8, yPos - 22);
        ctx.textAlign = "left";
        ctx.shadowBlur = 0;
      }
    };

    const drawCementMixer = (time) => {
      const mx = 850, my = BASE_H - 75;
      ctx.fillStyle = "#888";
      ctx.fillRect(mx, my, 50, 20);
      ctx.fillStyle = "#555";
      ctx.fillRect(mx + 10, my - 15, 30, 15);
      const angle = time * 0.005;
      ctx.save();
      ctx.translate(mx + 25, my - 8);
      ctx.rotate(angle);
      ctx.fillStyle = "#cc8844";
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#aa6633";
      ctx.fillRect(-12, -6, 24, 12);
      ctx.restore();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(mx + 10, my + 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + 40, my + 18, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawWarningLight = (time) => {
      const flash = Math.sin(time * 0.01) > 0;
      ctx.fillStyle = flash ? "#ff0000" : "#ff8888";
      ctx.beginPath();
      ctx.arc(100, BASE_H - 100, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffff00";
      ctx.font = `bold 12px monospace`;
      ctx.fillText("⚠️", 92, BASE_H - 95);
    };

    const drawBlueprint = () => {
      const bx = 180, by = BASE_H - 35;
      ctx.fillStyle = "#cfe7ff";
      ctx.fillRect(bx, by, 45, 18);
      ctx.fillStyle = "#2266aa";
      ctx.font = `bold 8px monospace`;
      ctx.fillText("📐 PLAN", bx + 5, by + 12);
    };

    const handleCanvasClick = (e) => {
      if (!cakeComplete) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      const { cakeX, cakeY, tiers } = baseDataRef.current;
      const maxTierWidth = Math.max(...tiers.map(t => t.w));
      const totalCakeHeight = tiers.reduce((sum, t) => sum + t.h, 0);
      
      const cakeLeft = cakeX - maxTierWidth / 2;
      const cakeRight = cakeX + maxTierWidth / 2;
      const cakeTop = cakeY - totalCakeHeight;
      const cakeBottom = cakeY;
      
      if (mouseX > cakeLeft && mouseX < cakeRight && mouseY > cakeTop && mouseY < cakeBottom) {
        setTimeout(() => {
          window.open('cake-interactive.html', '_blank');
        }, 50);
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

    let animationId;
    function animate(now) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / BUILD_DURATION, 1);
      if (progress >= 1 && !cakeComplete) {
        setCakeComplete(true);
        setTypingStarted(true);
        const clockSpan = document.getElementById('clock');
        if (clockSpan) clockSpan.innerText = "🎉🎂 Birthday Cake Ready! 🎂🎉";
      }
      drawSky();
      drawStars();
      drawBuildings(progress, now);
      drawGround();
      drawCake(progress);
      drawSnow(now);

      if (animationStarted) {
        workersRef.current.forEach(worker => drawWorker(worker, now, cakeComplete));
        drawCementMixer(now);
        drawWarningLight(now);
        drawBlueprint();
      }

      // Debug red rectangle around cake when complete
      if (cakeComplete) {
        const { cakeX, cakeY, tiers } = baseDataRef.current;
        const maxTierWidth = Math.max(...tiers.map(t => t.w));
        const totalCakeHeight = tiers.reduce((sum, t) => sum + t.h, 0);
        const left = cakeX - maxTierWidth/2;
        const right = cakeX + maxTierWidth/2;
        const top = cakeY - totalCakeHeight;
        const bottom = cakeY;
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(left, top, right - left, bottom - top);
        ctx.restore();
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, right - left, bottom - top);
      }

      if (progress < 1) {
        ctx.font = `bold 14px monospace`;
        ctx.fillStyle = "#aaffdd";
        ctx.fillText(`🏗️ constructing ${Math.floor(progress * 100)}%`, CANVAS_WIDTH - 180, CANVAS_HEIGHT - 20);
      }
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleCanvasClick);
      initializedRef.current = false;
    };
  }, [animationStarted, cakeComplete]);

  const startExperience = () => {
    setAnimationStarted(true);
    const textDiv = document.getElementById('text');
    if (textDiv) textDiv.style.opacity = '1';
    setTimeout(() => {
      audioRef.current?.play().catch(() => {});
    }, 0);
  };

  // Inline styles to ensure everything is visible
  const styles = {
    container: {
      background: 'radial-gradient(circle at 30% 10%, #010118, #000000)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
      position: 'relative'
    },
    wrap: {
      position: 'relative',
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      borderRadius: '32px',
      boxShadow: '0 0 40px rgba(0,255,255,0.2)',
      margin: '20px auto'
    },
    textContainer: {
      position: 'absolute',
      left: '50%',
      top: '20px',
      transform: 'translateX(-50%)',
      background: 'transparent',
      padding: '12px 20px',
      zIndex: 20,
      textAlign: 'center',
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity 0.8s ease'
    },
    codeDiv: {
      color: '#fff5e6',
      fontSize: '1.35rem',
      textShadow: '0 0 12px #ff66aa',
      fontFamily: "'Dancing Script', 'Pacifico', cursive"
    },
    clockBox: {
      position: 'absolute',
      bottom: '60px',
      right: '20px',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(12px)',
      padding: '8px 22px',
      borderRadius: '60px',
      fontFamily: 'monospace',
      fontSize: '0.95rem',
      border: '1px solid cyan',
      color: 'cyan'
    },
    canvas: {
      display: 'block',
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      borderRadius: '28px',
      cursor: 'pointer'
    },
    cakeHint: {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      padding: '8px 20px',
      borderRadius: '60px',
      zIndex: 25,
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#ffdd99',
      border: '1px solid #ffaa66',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      fontFamily: "'Dancing Script', cursive"
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalCard: {
      background: 'linear-gradient(145deg, #1e1a2f, #0a0718)',
      borderRadius: '70px',
      padding: '50px 60px',
      textAlign: 'center',
      border: '2px solid #ff88aa',
      boxShadow: '0 0 80px rgba(255,100,150,0.5)',
      cursor: 'pointer',
      animation: 'gentlePulse 2.2s infinite alternate'
    },
    modalText: {
      fontSize: '1.3rem',
      color: '#ffe0e7',
      margin: '20px 0'
    },
    modalSubText: {
      fontSize: '1rem',
      color: '#ffccdd',
      marginBottom: '20px'
    },
    modalClickHint: {
      fontSize: '0.9rem',
      color: '#ffaacc',
      marginTop: '10px'
    }
  };

  // Inject keyframes for modal animation
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes gentlePulse {
        0% { transform: scale(1); box-shadow: 0 0 40px rgba(255,100,150,0.3); }
        100% { transform: scale(1.01); box-shadow: 0 0 90px rgba(255,100,150,0.7); }
      }
      .cake-hint::before { content: "🎂 "; font-size: 1.3rem; }
      .cake-hint::after { content: " ✨"; }
      #code .say { display: inline-block; margin: 0 6px 4px 0; }
      #code .say::after { content: " ✦ "; color: #ffbbee; }
      #code .say:last-child::after { content: ""; }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.wrap}>
        <div id="text" style={styles.textContainer}>
          <div id="code" style={styles.codeDiv}></div>
        </div>
        <div id="clock-box" style={styles.clockBox}>
          <span id="clock">🎂✨ Creating your world ✨🎂</span>
        </div>
        <canvas ref={canvasRef} style={styles.canvas}></canvas>
        <div className="cake-hint" style={styles.cakeHint}>
          💖 Click The Cake With Your Own Risk 💖
        </div>
      </div>

      <audio ref={audioRef} src="/aud.mp3" preload="auto" />

      {!animationStarted && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard} onClick={startExperience}>
            <p style={styles.modalText}>✨💌 OPEN THE BOX, DEAR 💌✨</p>
            <p style={styles.modalSubText}>
              Sending love from my cyber heart to your civil soul 🏗️✨
            </p>
            <div style={styles.modalClickHint}>
              💫👉 Touch here and unlock magic 👈💫
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
