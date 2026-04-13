import { useEffect, useRef, useState } from 'react';
import './App.css';

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

  // Workers data
  const workersRef = useRef([
    { x: 250, dir: 1, speed: 0.6, legPhase: 0, armPhase: 0 },
    { x: 550, dir: -1, speed: 0.5, legPhase: 1.2, armPhase: 0.8 },
    { x: 780, dir: 1, speed: 0.7, legPhase: 2.1, armPhase: 1.5 },
    { x: 450, dir: -1, speed: 0.55, legPhase: 3.0, armPhase: 2.2 }
  ]);

  const BUILD_DURATION = 6500;
  const BASE_W = 1100;
  const BASE_H = 680;

  // typing effect
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
    const ctx = canvas.getContext("2d");

    let width, height;
    let animationId;

    const updateCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      scaleRef.current = { x: width / BASE_W, y: height / BASE_H };
    };

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    updateCanvasSize();
    startTimeRef.current = performance.now();

    // drawing helpers
    const drawSky = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#02021a");
      grad.addColorStop(1, "#13002d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawStars = () => {
      const { stars } = baseDataRef.current;
      const { x: sx, y: sy } = scaleRef.current;
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x * sx, s.y * sy, s.r * Math.min(sx, sy), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${s.a})`;
        ctx.fill();
      });
    };

    const drawSnow = (time) => {
      const { snowflakes } = baseDataRef.current;
      const { x: sx, y: sy } = scaleRef.current;
      snowflakes.forEach(f => {
        f.y += f.speedY * (sy / 1.5);
        if (f.y * sy > height + 10) {
          f.y = -10 / sy;
          f.x = Math.random() * BASE_W;
        }
        const driftX = Math.sin(time * 0.001 + f.phase) * f.drift;
        ctx.beginPath();
        ctx.arc((f.x + driftX) * sx, f.y * sy, f.size * Math.min(sx, sy), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
      });
    };

    const drawBuildings = (progress, time) => {
      const { buildings } = baseDataRef.current;
      const { x: sx, y: sy } = scaleRef.current;
      buildings.forEach(b => {
        const exact = progress * b.floors;
        const full = Math.floor(exact);
        const floorH = 12 * sy;
        const totalH = exact * floorH;
        const baseGroundY = (BASE_H - 70) * sy;
        const y = baseGroundY - totalH;
        const grad = ctx.createLinearGradient(b.x * sx, y, b.x * sx, baseGroundY);
        grad.addColorStop(0, `hsl(${b.tone},40%,40%)`);
        grad.addColorStop(1, `hsl(${b.tone},40%,20%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(b.x * sx, y, b.width * sx, totalH);
        for (let f = 0; f < full; f++) {
          for (let w = 0; w < 3; w++) {
            ctx.fillStyle = `rgba(255,220,140,${0.7 + Math.sin(time * 0.003 + f) * 0.2})`;
            ctx.fillRect(
              (b.x + 7 + w * 14) * sx,
              baseGroundY - (f + 1) * floorH + 3 * sy,
              7 * sx,
              6 * sy
            );
          }
        }
        if (b.crane && progress > 0.2) {
          b.angle += b.angleSpeed;
          const baseX = (b.x + b.width / 2) * sx;
          const baseY = y - 5 * sy;
          ctx.fillStyle = "#999";
          ctx.fillRect(baseX - 2 * sx, baseY, 4 * sx, 18 * sy);
          const armX = baseX + Math.cos(b.angle) * 28 * sx;
          const armY = baseY - 15 * sy + Math.sin(b.angle) * 5 * sy;
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.lineTo(armX, armY);
          ctx.strokeStyle = "#d2a45e";
          ctx.lineWidth = 3 * Math.min(sx, sy);
          ctx.stroke();
        }
      });
    };

    const drawGround = () => {
      const { x: sx, y: sy } = scaleRef.current;
      ctx.fillStyle = "#2a2418";
      ctx.fillRect(0, (BASE_H - 55) * sy, width, 55 * sy);
      ctx.fillStyle = "#4a3a2a";
      ctx.fillRect(0, (BASE_H - 48) * sy, width, 6 * sy);
    };

    const drawCake = (progress) => {
      const { tiers, cakeX, cakeY } = baseDataRef.current;
      const { x: sx, y: sy } = scaleRef.current;
      const cakeProgress = Math.min(Math.max((progress - 0.15) / 0.85, 0), 1);
      let builtH = 0;
      tiers.forEach((t, i) => {
        const tierStart = i * 0.22;
        const tierEnd = tierStart + 0.25;
        let local = (cakeProgress - tierStart) / (tierEnd - tierStart);
        local = Math.min(Math.max(local, 0), 1);
        const curH = t.h * sy * local;
        if (curH <= 0) return;
        const y = cakeY * sy - builtH - curH;
        const x = cakeX * sx - (t.w * sx) / 2;
        const grad = ctx.createLinearGradient(x, y, x, y + curH);
        grad.addColorStop(0, t.c);
        grad.addColorStop(1, "#de7ca3");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, t.w * sx, curH);
        ctx.fillStyle = t.i;
        ctx.fillRect(x - 2 * sx, y - 5 * sy, (t.w + 4) * sx, 7 * sy);
        builtH += curH;
      });
      if (progress >= 1) {
        const top = cakeY * sy - 162 * sy;
        ctx.fillStyle = "#fff";
        ctx.fillRect(cakeX * sx - 4 * sx, top - 30 * sy, 8 * sx, 28 * sy);
        ctx.fillStyle = "#aa7733";
        ctx.fillRect(cakeX * sx - 1 * sx, top - 34 * sy, 2 * sx, 8 * sy);
        ctx.beginPath();
        ctx.moveTo(cakeX * sx, top - 42 * sy);
        ctx.lineTo(cakeX * sx - 5 * sx, top - 36 * sy);
        ctx.lineTo(cakeX * sx + 5 * sx, top - 36 * sy);
        ctx.fillStyle = "#ffaa33";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cakeX * sx, top - 38 * sy, 6 * Math.min(sx, sy), 0, Math.PI * 2);
        ctx.fillStyle = "#ff6600";
        ctx.fill();
      }
    };

    // Worker drawing – stops moving when cakeComplete, and shows "Happy Birthday" text above
    const drawWorker = (worker, time, isComplete) => {
      const { x: sx, y: sy } = scaleRef.current;
      // update position only if cake not complete
      if (!isComplete) {
        worker.x += worker.speed * worker.dir;
        if (worker.x > 950) worker.dir = -1;
        if (worker.x < 150) worker.dir = 1;
        // update leg/arm phases only when moving
        worker.legPhase += 0.03;
        worker.armPhase += 0.035;
      }
      const legOffset = Math.sin(time * 0.006 + worker.legPhase) * 0.6;
      const armOffset = Math.sin(time * 0.007 + worker.armPhase) * 0.8;
      
      const xPos = worker.x * sx;
      const yPos = (BASE_H - 80) * sy;
      
      // Helmet
      ctx.fillStyle = "#ff9900";
      ctx.beginPath();
      ctx.ellipse(xPos + 8 * sx, yPos - 12 * sy, 8 * sx, 6 * sy, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.fillStyle = "#f5cba0";
      ctx.beginPath();
      ctx.arc(xPos + 8 * sx, yPos - 6 * sy, 6 * sx, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = "#3366cc";
      ctx.fillRect(xPos + 3 * sx, yPos - 2 * sy, 10 * sx, 12 * sy);
      // Legs
      ctx.fillStyle = "#2255aa";
      const leftLegX = xPos + 3 * sx + legOffset * 2 * sx;
      const rightLegX = xPos + 9 * sx - legOffset * 2 * sx;
      ctx.fillRect(leftLegX, yPos + 8 * sy, 4 * sx, 8 * sy);
      ctx.fillRect(rightLegX, yPos + 8 * sy, 4 * sx, 8 * sy);
      // Arms
      ctx.beginPath();
      ctx.moveTo(xPos + 13 * sx, yPos);
      ctx.lineTo(xPos + 18 * sx + armOffset * 5 * sx, yPos + 5 * sy + Math.abs(armOffset) * 3 * sy);
      ctx.lineWidth = 3 * sx;
      ctx.strokeStyle = "#3366cc";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xPos + 3 * sx, yPos);
      ctx.lineTo(xPos - 2 * sx - armOffset * 5 * sx, yPos + 5 * sy + Math.abs(armOffset) * 3 * sy);
      ctx.stroke();

      // If cake complete, show "Happy Birthday" text above worker
      if (isComplete) {
        ctx.font = `bold ${14 * Math.min(sx, sy)}px 'Segoe UI', 'Dancing Script', cursive`;
        ctx.fillStyle = "#ffdd99";
        ctx.shadowBlur = 4;
        ctx.textAlign = "center";
        ctx.fillText("🎂 Happy Birthday 🎂", xPos + 8 * sx, yPos - 22 * sy);
        ctx.textAlign = "left";
        ctx.shadowBlur = 0;
      }
    };

    const drawCementMixer = (time) => {
      const { x: sx, y: sy } = scaleRef.current;
      const mx = 850 * sx;
      const my = (BASE_H - 75) * sy;
      ctx.fillStyle = "#888";
      ctx.fillRect(mx, my, 50 * sx, 20 * sy);
      ctx.fillStyle = "#555";
      ctx.fillRect(mx + 10 * sx, my - 15 * sy, 30 * sx, 15 * sy);
      const angle = time * 0.005;
      ctx.save();
      ctx.translate(mx + 25 * sx, my - 8 * sy);
      ctx.rotate(angle);
      ctx.fillStyle = "#cc8844";
      ctx.beginPath();
      ctx.ellipse(0, 0, 15 * sx, 10 * sy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#aa6633";
      ctx.fillRect(-12 * sx, -6 * sy, 24 * sx, 12 * sy);
      ctx.restore();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(mx + 10 * sx, my + 18 * sy, 6 * sx, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + 40 * sx, my + 18 * sy, 6 * sx, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawWarningLight = (time) => {
      const { x: sx, y: sy } = scaleRef.current;
      const flash = Math.sin(time * 0.01) > 0;
      ctx.fillStyle = flash ? "#ff0000" : "#ff8888";
      ctx.beginPath();
      ctx.arc(100 * sx, (BASE_H - 100) * sy, 8 * sx, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffff00";
      ctx.font = `bold ${12 * Math.min(sx, sy)}px monospace`;
      ctx.fillText("⚠️", 92 * sx, (BASE_H - 95) * sy);
    };

    const drawBlueprint = () => {
      const { x: sx, y: sy } = scaleRef.current;
      const bx = 180 * sx, by = (BASE_H - 35) * sy;
      ctx.fillStyle = "#cfe7ff";
      ctx.fillRect(bx, by, 45 * sx, 18 * sy);
      ctx.fillStyle = "#2266aa";
      ctx.font = `bold ${8 * Math.min(sx, sy)}px monospace`;
      ctx.fillText("📐 PLAN", bx + 5 * sx, by + 12 * sy);
    };

    const handleCanvasClick = (e) => {
      if (!cakeComplete) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      const { cakeX, cakeY } = baseDataRef.current;
      const { x: sx, y: sy } = scaleRef.current;
      const cakeLeft = (cakeX - 85) * sx;
      const cakeRight = (cakeX + 85) * sx;
      const cakeTop = (cakeY - 170) * sy;
      const cakeBottom = cakeY * sy;
      if (mouseX > cakeLeft && mouseX < cakeRight && mouseY > cakeTop && mouseY < cakeBottom) {
        window.open('cake-interactive.html', '_blank');
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

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

      // Draw extra elements (workers etc.)
      if (animationStarted) {
        // Pass cakeComplete flag to workers – they will stop moving and show text
        workersRef.current.forEach(worker => drawWorker(worker, now, cakeComplete));
        drawCementMixer(now);
        drawWarningLight(now);
        drawBlueprint();
      }

      if (progress < 1) {
        ctx.font = `bold ${14 * Math.min(scaleRef.current.x, scaleRef.current.y)}px monospace`;
        ctx.fillStyle = "#aaffdd";
        ctx.fillText(`🏗️ constructing ${Math.floor(progress * 100)}%`, width - 180 * scaleRef.current.x, height - 20 * scaleRef.current.y);
      } else {
        ctx.font = `italic ${16 * Math.min(scaleRef.current.x, scaleRef.current.y)}px 'Segoe UI'`;
        ctx.fillStyle = "#ffdd99";
        ctx.shadowBlur = 6;
      }
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      initializedRef.current = false;
    };
  }, [animationStarted, cakeComplete]);

  const startExperience = () => {
    setAnimationStarted(true);
    const textDiv = document.getElementById('text');
    if (textDiv) textDiv.style.opacity = '1';
    // audio with 2s delay
    setTimeout(() => {
      audioRef.current?.play().catch(() => {});
    }, 0);
  };

  return (
  <div className="wrap">
    <div id="text">
      <div id="code"></div>
    </div>

    <div id="clock-box">
      <span id="clock">🎂✨ Creating your world ✨🎂</span>
    </div>

    <canvas ref={canvasRef}></canvas>

    <div className="cake-hint">
      💖 Click The Cake With Your Own Risk 💖
    </div>

    {!animationStarted && (
      <div className="start-modal">
        <div className="start-card" onClick={startExperience}>
          <p className="main-line">✨💌 OPEN THE BOX, DEAR 💌✨</p>

          <p className="sub-line">
            Sending love from my cyber heart   
            to your civil soul 🏗️✨
          </p>

          <div className="click-hint">
            💫👉 Touch here and unlock magic 👈💫
          </div>
        </div>
      </div>
    )}

    <audio ref={audioRef} src="/aud.mp3" preload="auto" />
  </div>
);
}

export default App;