/**
 * FOR KING'S — Script de Interação & Motion
 * GSAP 3 + ScrollTrigger + Three.js Ambient Dust
 * Loop único, pausando fora de visibilidade, seguro contra ausência de JS
 */

(function () {
  'use strict';

  // Verifica preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. THREE.JS — ATMOSFERA VIVA DE POEIRA DOURADA (STARDUST AMBIENCE)
  // --------------------------------------------------------------------------
  function initThreeAmbience() {
    if (prefersReducedMotion || typeof THREE === 'undefined') return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    let renderer, scene, camera, points;
    let animId = null;
    let isVisible = true;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 400;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // Partículas leves (80 em telas pequenas, 130 em telas grandes)
      const particleCount = window.innerWidth < 768 ? 80 : 130;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
        speeds[i] = 0.2 + Math.random() * 0.4;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Criação de textura suave de partícula dourada via canvas 2D
      const particleCanvas = document.createElement('canvas');
      particleCanvas.width = 32;
      particleCanvas.height = 32;
      const ctx = particleCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(224, 196, 157, 1)');
      grad.addColorStop(0.35, 'rgba(181, 149, 107, 0.7)');
      grad.addColorStop(1, 'rgba(8, 7, 6, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);

      const texture = new THREE.CanvasTexture(particleCanvas);

      const material = new THREE.PointsMaterial({
        size: window.innerWidth < 768 ? 14 : 18,
        map: texture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      // Loop único de animação
      function render() {
        if (!isVisible) return;

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3 + 1] += speeds[i];
          if (pos[i * 3 + 1] > 400) {
            pos[i * 3 + 1] = -400;
            pos[i * 3] = (Math.random() - 0.5) * 600;
          }
        }
        geometry.attributes.position.needsUpdate = true;
        points.rotation.y += 0.0004;

        renderer.render(scene, camera);
        animId = requestAnimationFrame(render);
      }

      animId = requestAnimationFrame(render);

      // Otimização: Pausar fora da aba para economizar bateria e CPU
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          isVisible = false;
          if (animId) cancelAnimationFrame(animId);
        } else {
          isVisible = true;
          animId = requestAnimationFrame(render);
        }
      });

      // Redimensionamento com debounce suave
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (!renderer || !camera) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }, 150);
      });

    } catch (e) {
      console.warn('WebGL não disponível, mantendo fallback de iluminação CSS:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 2. GSAP — ANIMAÇÕES DE ENTRADA & INTERAÇÃO COM ESTADO INICIAL SEGURO
  // --------------------------------------------------------------------------
  function initGSAPAnimations() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    try {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Timeline de Entrada Suave (sem esconder conteúdo se o script falhar)
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.brand-watermark-layer', {
        opacity: 0,
        scale: 0.94,
        duration: 1.2,
        ease: 'power2.out',
        clearProps: 'opacity,scale'
      })
      .from('.location-tag', {
        opacity: 0,
        y: -12,
        duration: 0.6,
        delay: 0.1
      }, '-=1.0')
      .from('.logo-frame', {
        opacity: 0,
        scale: 0.88,
        duration: 0.8
      }, '-=0.4')
      .from('.brand-title', {
        opacity: 0,
        y: 16,
        duration: 0.7
      }, '-=0.5')
      .from('.brand-signature', {
        opacity: 0,
        y: 12,
        duration: 0.6
      }, '-=0.4')
      .from('.brand-segment', {
        opacity: 0,
        duration: 0.5
      }, '-=0.3')
      .from('.cta-primary', {
        opacity: 0,
        scale: 0.96,
        y: 18,
        duration: 0.8,
        clearProps: 'all'
      }, '-=0.2')
      .from('.action-card', {
        opacity: 0,
        y: 16,
        stagger: 0.12,
        duration: 0.6,
        clearProps: 'all'
      }, '-=0.4')
      .from('.editorial-section', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        clearProps: 'all'
      }, '-=0.2')
      .from('.page-footer', {
        opacity: 0,
        duration: 0.8,
        clearProps: 'all'
      }, '-=0.3');

    } catch (err) {
      console.warn('GSAP animation fallback:', err);
    }
  }

  // --------------------------------------------------------------------------
  // INICIALIZAÇÃO
  // --------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initThreeAmbience();
      initGSAPAnimations();
    });
  } else {
    initThreeAmbience();
    initGSAPAnimations();
  }

})();
