/* Home hero banner carousel: autoplay, arrows, dots, swipe and reduced-motion support */
(function(){'use strict';
 var root=document.querySelector('.hero-carousel');if(!root)return;
 var slides=Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
 var dots=Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
 var prev=root.querySelector('[data-hero-prev]'),next=root.querySelector('[data-hero-next]'),count=root.querySelector('[data-hero-count]');
 var index=0,timer=null,paused=false,reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,startX=0;
 function show(n){index=(n+slides.length)%slides.length;slides.forEach(function(slide,i){var active=i===index;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));});dots.forEach(function(dot,i){var active=i===index;dot.classList.toggle('is-active',active);if(active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});if(count)count.textContent=String(index+1).padStart(2,'0');}
 function stop(){if(timer){window.clearInterval(timer);timer=null;}}
 function start(){stop();if(!reduce&&!paused)timer=window.setInterval(function(){show(index+1);},6500);}
 prev.addEventListener('click',function(){show(index-1);start();});next.addEventListener('click',function(){show(index+1);start();});dots.forEach(function(dot){dot.addEventListener('click',function(){show(Number(dot.getAttribute('data-hero-dot')));start();});});
 root.addEventListener('mouseenter',function(){paused=true;stop();});root.addEventListener('mouseleave',function(){paused=false;start();});root.addEventListener('focusin',stop);root.addEventListener('focusout',function(){start();});
 root.addEventListener('touchstart',function(e){startX=e.changedTouches[0].clientX;},{passive:true});root.addEventListener('touchend',function(e){var delta=e.changedTouches[0].clientX-startX;if(Math.abs(delta)>45){show(index+(delta<0?1:-1));start();}},{passive:true});
 root.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){show(index-1);start();}if(e.key==='ArrowRight'){show(index+1);start();}});
 show(0);start();
})();
