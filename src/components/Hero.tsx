import { motion, useAnimationFrame } from 'motion/react';
import React, { useRef, useEffect, useState } from 'react';

import img1 from '../assets/images/illustration_1_1779928638813.png';
import img2 from '../assets/images/illustration_2_1779928654976.png';
import img3 from '../assets/images/illustration_3_1779928674193.png';
import img4 from '../assets/images/illustration_4_1779928691590.png';

export default function Hero() {
  const cards = useRef([
    { id: 0, src: img1, el: null as HTMLDivElement | null, state: { x: 0, y: 0, vx: 0, vy: 0, svx: 0, svy: 0, tx: 0, ty: 0, cx: 0, cy: 0 }, baseRot: 2, baseY: 5 },
    { id: 1, src: img2, el: null as HTMLDivElement | null, state: { x: 0, y: 0, vx: 0, vy: 0, svx: 0, svy: 0, tx: 0, ty: 0, cx: 0, cy: 0 }, baseRot: -3, baseY: -6 },
    { id: 2, src: img3, el: null as HTMLDivElement | null, state: { x: 0, y: 0, vx: 0, vy: 0, svx: 0, svy: 0, tx: 0, ty: 0, cx: 0, cy: 0 }, baseRot: 6, baseY: 5 },
    { id: 3, src: img4, el: null as HTMLDivElement | null, state: { x: 0, y: 0, vx: 0, vy: 0, svx: 0, svy: 0, tx: 0, ty: 0, cx: 0, cy: 0 }, baseRot: -2, baseY: -4 },
  ]);

  const mouse = useRef({ x: 0, y: 0, lx: 0, ly: 0, active: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initial random spawn to trigger the spring return 
    cards.current.forEach(c => {
      const rx = Math.random() * 200 - 100;
      const ry = Math.random() * 200 - 100;
      c.state.x = rx;
      c.state.y = ry;
      c.state.tx = rx;
      c.state.ty = ry; // hold them there temporarily
    });

    const timeout = setTimeout(() => {
      cards.current.forEach(c => {
        c.state.tx = 0;
        c.state.ty = 0;
      });
      setMounted(true);
    }, 100);

    const updateCenters = () => {
      cards.current.forEach(c => {
        if (c.el) {
          // get parent container center
          const rect = c.el.getBoundingClientRect();
          c.state.cx = rect.left + rect.width / 2;
          c.state.cy = rect.top + window.scrollY + rect.height / 2;
        }
      });
    };

    // Delay center calculation to ensure layout is ready
    const t2 = setTimeout(updateCenters, 800);

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!mouse.current.active) {
          mouse.current.lx = e.clientX;
          mouse.current.ly = e.clientY;
          mouse.current.active = true;
      }
    };

    window.addEventListener('resize', updateCenters);
    window.addEventListener('scroll', updateCenters);
    window.addEventListener('mousemove', onMove);
    return () => {
      clearTimeout(timeout);
      clearTimeout(t2);
      window.removeEventListener('resize', updateCenters);
      window.removeEventListener('scroll', updateCenters);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  useAnimationFrame(() => {
    const mx = mouse.current.x;
    const my = mouse.current.y;
    
    let mvX = mouse.current.active ? (mx - mouse.current.lx) : 0;
    let mvY = mouse.current.active ? (my - mouse.current.ly) : 0;
    
    mouse.current.lx = mx;
    mouse.current.ly = my;

    cards.current.forEach(c => {
      const s = c.state;

      // 1-to-1 exact translation: 
      // Decaying direct mouse-infused momentum
      s.vx *= 0.9;
      s.vy *= 0.9;
      
      // Injecting mouse momentum into target coordinates
      s.x += s.vx;
      s.y += s.vy;
      
      // The harmonic spring handling the pop-in and auto-return
      const stiffness = 0.08;
      const damping = 0.70;
      
      const springForceX = (s.tx - s.x) * stiffness;
      const springForceY = (s.ty - s.y) * stiffness;
      
      s.svx = (s.svx + springForceX) * damping;
      s.svy = (s.svy + springForceY) * damping;
      
      s.x += s.svx;
      s.y += s.svy;

      // Mouse Proximity Repulsion Math (1-to-1 from the original bundle)
      if (s.cx !== 0 && s.cy !== 0 && mouse.current.active) {
        const u = (mx - s.cx) / window.innerWidth * 2;
        const o = (my + window.scrollY - s.cy) / window.innerHeight * 2;
        const b = Math.sqrt(u * u + o * o);
        
        if (b < 1) {
          const k = Math.pow(1 - b, 6) * 0.4;
          s.vx += mvX * k;
          s.vy += mvY * k;
        }
      }
      
      // DOM Updates (No React state triggers, runs extremely fast at 120fps)
      if (c.el) {
        const velDelta = s.vx - s.vy; 
        const rot = c.baseRot - (velDelta * 0.25);
        // Use translate3d to force hardware acceleration
        const transform = `translate3d(calc(${s.x}px), calc(${s.y}px + ${c.baseY}%), 0) rotate(${rot}deg)`;
        
        const shadow = c.el.querySelector('.shadow-el') as HTMLElement;
        const img = c.el.querySelector('.img-el') as HTMLElement;
        
        if (shadow) shadow.style.transform = transform;
        if (img) img.style.transform = transform;
      }
    });
  });

  const words1 = ["Ahmed".split(""), "Ben".split(""), "Abdallah".split("")];

  return (
    <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center bg-[#f3f1eb] text-[#111] overflow-hidden px-4 md:px-0">
      
      {/* Absolute Header Content */}
      <div className="absolute top-[8vh] md:top-[10vh] flex flex-col items-center gap-4 md:gap-6 z-20 pointer-events-none w-full px-4">
        {/* Animated Title */}
        <h1 className="font-display font-black text-center uppercase flex flex-col gap-2 md:block md:space-x-8" style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', lineHeight: '0.85', letterSpacing: '-0.02em' }}>
          {words1.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.map((char, cIdx) => (
                <motion.span
                  key={cIdx}
                  className="inline-block origin-bottom will-change-transform uppercase"
                  initial={{ scale: 1, y: "1ch", opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ 
                    delay: wIdx * 0.1 + (cIdx * 0.02) + 0.1, 
                    duration: 0.8, 
                    ease: [0.25, 0.46, 0.45, 0.94] // smooth snap
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.h2 
          className="uppercase font-sans font-semibold tracking-[0.2em] text-[0.75rem] md:text-[1rem] opacity-70 mx-auto text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          A Web Dev & Game Dev
        </motion.h2>
      </div>

      {/* 1-to-1 Copied Flex Image Group Grid - CENTERED */}
      <div className="flex justify-center items-center pointer-events-none relative z-10 w-full touch-none mt-[12vh] md:mt-[5vh]">
        {cards.current.map((card, i) => (
           <div 
             key={card.id} 
             ref={el => { card.el = el; }}
             className={`relative aspect-square w-[clamp(6rem,100%,15vw)] md:w-[clamp(8rem,100%,15vw)] flex-shrink-0 grid place-items-center rounded-[1rem] md:rounded-[1.3rem] ${i !== 3 ? 'mr-[-4%] md:mr-[-6%]' : ''}`}
             style={{ 
               opacity: mounted ? 1 : 0, 
               transform: mounted ? 'scale(1)' : 'scale(0)',
               transition: `transform 1s cubic-bezier(.175,.885,.32,1.275) ${i * 0.08 + 0.4}s, opacity 0.3s ease-out ${i * 0.08 + 0.4}s`
             }}
           >
              <div 
                className="shadow-el shadow-[0_20px_40px_rgba(0,0,0,0.3)] md:shadow-[0_25px_50px_rgba(0,0,0,0.35)] absolute inset-0 pointer-events-none rounded-[inherit] will-change-transform"
                style={{ gridArea: '1/1' }}
              />
              <img 
                src={card.src} 
                className="img-el w-full h-full object-cover relative z-10 pointer-events-auto rounded-[inherit] will-change-transform bg-[#f3f1eb]" 
                style={{ gridArea: '1/1' }}
                alt="Illustration" 
                draggable="false"
              />
           </div>
        ))}
      </div>
      
      {/* Scroll indicator or absolute bottom stuff (optional) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}} />
    </section>
  );
}

