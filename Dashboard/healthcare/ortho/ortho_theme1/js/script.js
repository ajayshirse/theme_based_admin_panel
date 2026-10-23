/*
 * SmileCraft Orthodontics - interactive behavior
 * Vanilla JavaScript, no dependencies.
 * 0. Configuration | 1. Setup | 2. Mobile menu | 3. Smooth scroll
 * 4. Header/back-to-top/nav | 5. FAQ | 6. Treatment pre-select
 * 7. Form validation + WhatsApp/Email | 8. Reveal | 9. Image fallback
 * 10. Footer year | 11. CTA pulse | 12. Staggered reveal
 */
(function(){
'use strict';

/* ============================================================
 * 0. CONFIGURATION — EDIT THESE VALUES FOR YOUR CLINIC
 * ============================================================
 * CLINIC_WHATSAPP: international format, digits only (no +, spaces, dashes).
 *   Example (India): "919665781350"  ->  +91 9665781350
 *   Leave "" to disable WhatsApp booking.
 * CLINIC_EMAIL: your clinic's booking inbox. Leave "" to disable email booking.
 * APPOINTMENT_API_ENDPOINT (optional): if set, the form POSTs JSON here
 *   BEFORE opening WhatsApp/email. NEVER put API keys or SMTP secrets here.
 * ============================================================ */
const CONFIG={
  CLINIC_WHATSAPP:'9665781350',                    // e.g. "919665781350"
  CLINIC_EMAIL:'ajayshirse@gmail.com',                       // e.g. "bookings@yourclinic.com"
  APPOINTMENT_API_ENDPOINT:''            // e.g. "https://api.yourclinic.com/appointments"
};

/* ---------- 1. Setup helpers ---------- */
document.documentElement.classList.add('js-enabled');
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=document.getElementById('site-header');

function getHeaderOffset(){return header?header.offsetHeight:0;}

/* ---------- 2. Mobile navigation menu ---------- */
const menuToggle=document.getElementById('menu-toggle');
const mobileMenu=document.getElementById('mobile-menu');
const iconMenu=document.getElementById('icon-menu');
const iconClose=document.getElementById('icon-close');

function setMobileMenu(open){
  mobileMenu.classList.toggle('hidden',!open);
  iconMenu.classList.toggle('hidden',open);
  iconClose.classList.toggle('hidden',!open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
}

menuToggle.addEventListener('click',function(){
  setMobileMenu(menuToggle.getAttribute('aria-expanded')!=='true');
});

document.addEventListener('keydown',function(event){
  if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){
    setMobileMenu(false);
    menuToggle.focus();
  }
});

window.matchMedia('(min-width: 1024px)').addEventListener('change',function(event){
  if(event.matches){setMobileMenu(false);}
});

/* ---------- 3. Smooth scrolling ---------- */
function scrollToSection(hash){
  const target=document.querySelector(hash);
  if(!target){return;}
  const top=target.getBoundingClientRect().top+window.scrollY-getHeaderOffset()+1;
  window.scrollTo({top:top,behavior:prefersReducedMotion?'auto':'smooth'});
  target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
}

document.querySelectorAll('a[href^="#"]').forEach(function(link){
  link.addEventListener('click',function(event){
    const hash=link.getAttribute('href');
    if(hash.length<2||!document.querySelector(hash)){return;}
    event.preventDefault();
    setMobileMenu(false);
    scrollToSection(hash);
    history.replaceState(null,'',hash);
  });
});

/* ---------- 4. Header shadow, back-to-top, active nav link ---------- */
const backToTop=document.getElementById('back-to-top');

function handleScroll(){
  const scrolled=window.scrollY>10;
  header.classList.toggle('shadow-md',scrolled);
  header.classList.toggle('border-slate-100',scrolled);
  header.classList.toggle('border-transparent',!scrolled);

  const showButton=window.scrollY>500;
  backToTop.classList.toggle('invisible',!showButton);
  backToTop.classList.toggle('opacity-0',!showButton);
  backToTop.classList.toggle('translate-y-4',!showButton);
}

window.addEventListener('scroll',handleScroll,{passive:true});
handleScroll();

backToTop.addEventListener('click',function(){
  window.scrollTo({top:0,behavior:prefersReducedMotion?'auto':'smooth'});
});

const navLinks=Array.from(document.querySelectorAll('.nav-link'));
const sectionsForNav=navLinks
  .map(function(link){return document.querySelector(link.getAttribute('href'));})
  .filter(Boolean);

if('IntersectionObserver' in window){
  const navObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        navLinks.forEach(function(link){
          link.classList.toggle('is-active',link.getAttribute('href')==='#'+entry.target.id);
        });
      }
    });
  },{rootMargin:'-45% 0px -50% 0px'});

  sectionsForNav.forEach(function(section){navObserver.observe(section);});
}

/* ---------- 5. FAQ accordion ---------- */
const faqTriggers=document.querySelectorAll('.faq-trigger');

function setFaqState(trigger,open){
  const panel=document.getElementById(trigger.getAttribute('aria-controls'));
  trigger.setAttribute('aria-expanded',String(open));
  panel.setAttribute('data-open',String(open));
}

faqTriggers.forEach(function(trigger){
  trigger.addEventListener('click',function(){
    const willOpen=trigger.getAttribute('aria-expanded')!=='true';
    faqTriggers.forEach(function(other){setFaqState(other,false);});
    setFaqState(trigger,willOpen);
  });
});

/* ---------- 6. Treatment buttons pre-select the appointment form ---------- */
const treatmentSelect=document.getElementById('treatment-select');

document.querySelectorAll('.book-treatment').forEach(function(link){
  link.addEventListener('click',function(){
    treatmentSelect.value=link.getAttribute('data-treatment');
    clearError(treatmentSelect);
  });
});

/* ---------- 7. Appointment form validation + WhatsApp / Email booking ---------- */
const form=document.getElementById('appointment-form');
const successBox=document.getElementById('appointment-success');
const successText=document.getElementById('success-message');
const newRequestButton=document.getElementById('new-request-button');
const nameInput=document.getElementById('patient-name');
const phoneInput=document.getElementById('patient-phone');
const emailInput=document.getElementById('patient-email');
const dateInput=document.getElementById('preferred-date');
const timeInput=document.getElementById('preferred-time');
const messageInput=document.getElementById('additional-message');
const sendWhatsappBtn=document.getElementById('send-whatsapp');
const sendEmailBtn=document.getElementById('send-email');

const EMAIL_PATTERN=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN=/^\+?[0-9\s\-().]+$/;

function getTodayString(){
  const now=new Date();
  const month=String(now.getMonth()+1).padStart(2,'0');
  const day=String(now.getDate()).padStart(2,'0');
  return now.getFullYear()+'-'+month+'-'+day;
}

dateInput.min=getTodayString();

function showError(input,message){
  const error=document.getElementById(input.id+'-error');
  if(!error)return;
  error.textContent=message;
  error.classList.remove('hidden');
  input.setAttribute('aria-invalid','true');
  input.classList.add('border-rose-500');
  input.classList.remove('border-slate-300');
}

function clearError(input){
  const error=document.getElementById(input.id+'-error');
  if(error){error.textContent='';error.classList.add('hidden');}
  input.removeAttribute('aria-invalid');
  input.classList.remove('border-rose-500');
  input.classList.add('border-slate-300');
}

function validateField(input){
  const value=input.value.trim();
  switch(input.id){
    case 'patient-name':
      if(!value)return 'Please enter your full name.';
      if(value.length<2)return 'Your name must be at least 2 characters.';
      return '';
    case 'patient-phone':{
      if(!value)return 'Please enter your phone number.';
      const digits=value.replace(/\D/g,'');
      if(!PHONE_PATTERN.test(value)||digits.length<10||digits.length>15){
        return 'Enter a valid phone number with 10 to 15 digits.';
      }
      return '';
    }
    case 'patient-email':
      if(!value)return 'Please enter your email address.';
      if(!EMAIL_PATTERN.test(value))return 'Enter a valid email address, for example you@example.com.';
      return '';
    case 'treatment-select':
      return value?'':'Please choose a treatment.';
    case 'preferred-date':
      if(!value)return 'Please choose a preferred date.';
      if(value<getTodayString())return 'Please choose today or a future date.';
      return '';
    case 'preferred-time':
      return value?'':'Please choose a preferred time.';
    default:
      return '';
  }
}

const formFields=[nameInput,phoneInput,emailInput,treatmentSelect,dateInput,timeInput];

formFields.forEach(function(field){
  field.addEventListener('blur',function(){
    const message=validateField(field);
    if(message){showError(field,message);}else{clearError(field);}
  });
  field.addEventListener('input',function(){
    if(field.getAttribute('aria-invalid')==='true'&&!validateField(field)){clearError(field);}
  });
});

function formatDateReadable(isoDate){
  return new Date(isoDate+'T00:00:00').toLocaleDateString(undefined,{
    weekday:'long',year:'numeric',month:'long',day:'numeric'
  });
}

function collectFormData(){
  return {
    name:nameInput.value.trim(),
    phone:phoneInput.value.trim(),
    email:emailInput.value.trim(),
    treatment:treatmentSelect.value,
    date:dateInput.value,
    dateReadable:formatDateReadable(dateInput.value),
    time:timeInput.value,
    message:messageInput?messageInput.value.trim():''
  };
}

function buildAppointmentText(data){
  const lines=[
    'New Appointment Request - SmileCraft Orthodontics',
    '',
    'Name: '+data.name,
    'Phone: '+data.phone,
    'Email: '+data.email,
    'Treatment: '+data.treatment,
    'Preferred Date: '+data.dateReadable,
    'Preferred Time: '+data.time
  ];
  if(data.message){lines.push('Message: '+data.message);}
  lines.push('');
  lines.push('(This is an appointment request, not a confirmed booking.)');
  return lines.join('\n');
}

function postToBackendIfConfigured(data){
  if(!CONFIG.APPOINTMENT_API_ENDPOINT){return Promise.resolve();}
  return fetch(CONFIG.APPOINTMENT_API_ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(function(response){
    if(!response.ok){throw new Error('Backend responded with '+response.status);}
    return response;
  });
}

function openWhatsApp(data){
  if(!CONFIG.CLINIC_WHATSAPP){return false;}
  const text=buildAppointmentText(data);
  const url='https://wa.me/'+CONFIG.CLINIC_WHATSAPP+'?text='+encodeURIComponent(text);
  window.open(url,'_blank','noopener');
  return true;
}

function openEmail(data){
  if(!CONFIG.CLINIC_EMAIL){return false;}
  const subject='Appointment Request - '+data.name+' ('+data.treatment+')';
  const body=buildAppointmentText(data);
  const url='mailto:'+CONFIG.CLINIC_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  window.location.href=url;
  return true;
}

function showNotConfiguredAlert(channel){
  if(channel==='whatsapp'){
    window.alert(
      'WhatsApp booking is not configured yet.\n\n'+
      'Please set CONFIG.CLINIC_WHATSAPP in js/script.js to your clinic\'s '+
      'WhatsApp number in international format (digits only), e.g. "919665781350".'
    );
  }else{
    window.alert(
      'Email booking is not configured yet.\n\n'+
      'Please set CONFIG.CLINIC_EMAIL in js/script.js to your clinic\'s '+
      'booking inbox, e.g. "bookings@yourclinic.com".'
    );
  }
}

let isSubmitting=false;

function validateForm(){
  let firstInvalid=null;
  formFields.forEach(function(field){
    const message=validateField(field);
    if(message){
      showError(field,message);
      if(!firstInvalid){firstInvalid=field;}
    }else{
      clearError(field);
    }
  });
  if(firstInvalid){firstInvalid.focus();return false;}
  return true;
}

function handleBooking(channel){
  if(isSubmitting){return;}
  if(!validateForm()){return;}

  const data=collectFormData();

  if(channel==='whatsapp'&&!CONFIG.CLINIC_WHATSAPP){showNotConfiguredAlert('whatsapp');return;}
  if(channel==='email'&&!CONFIG.CLINIC_EMAIL){showNotConfiguredAlert('email');return;}

  isSubmitting=true;
  sendWhatsappBtn.disabled=true;
  sendEmailBtn.disabled=true;

  postToBackendIfConfigured(data)
    .catch(function(error){console.warn('Appointment backend failed:',error);})
    .then(function(){
      let opened=false;
      if(channel==='whatsapp'){opened=openWhatsApp(data);}
      else{opened=openEmail(data);}

      if(!opened){
        isSubmitting=false;
        sendWhatsappBtn.disabled=false;
        sendEmailBtn.disabled=false;
        showNotConfiguredAlert(channel);
        return;
      }

      const channelLabel=channel==='whatsapp'?'WhatsApp':'email';
      successText.textContent=
        'Thank you, '+data.name+'. Your appointment request for '+
        data.treatment+' on '+data.dateReadable+' ('+data.time+
        ') has been prepared in '+channelLabel+'. Please review and send the '+
        'message to complete your request. We will reply to confirm your appointment.';

      form.classList.add('hidden');
      successBox.classList.remove('hidden');
      successBox.focus();
    })
    .finally(function(){
      isSubmitting=false;
      sendWhatsappBtn.disabled=false;
      sendEmailBtn.disabled=false;
    });
}

let lastSubmitter=null;
[sendWhatsappBtn,sendEmailBtn].forEach(function(button){
  button.addEventListener('click',function(){lastSubmitter=button;});
});

form.addEventListener('submit',function(event){
  event.preventDefault();
  const submitter=event.submitter||lastSubmitter;
  const channel=submitter&&submitter.value==='email'?'email':'whatsapp';
  lastSubmitter=null;
  handleBooking(channel);
});

newRequestButton.addEventListener('click',function(){
  form.reset();
  formFields.forEach(clearError);
  if(messageInput){messageInput.value='';}
  successBox.classList.add('hidden');
  form.classList.remove('hidden');
  nameInput.focus();
});

/* ---------- 8. Scroll reveal animation (with stagger) ---------- */
const revealItems=document.querySelectorAll('.reveal');

/* Assign a stagger delay to siblings inside the same grid/list parent
   so items animate in sequence rather than all at once. */
revealItems.forEach(function(item){
  const parent=item.parentElement;
  if(!parent)return;
  const siblings=Array.from(parent.children).filter(function(c){return c.classList.contains('reveal');});
  const index=siblings.indexOf(item);
  if(index>0&&siblings.length>1){
    item.setAttribute('data-stagger','');
    item.style.setProperty('--reveal-delay',(index*70)+'ms');
  }
});

if('IntersectionObserver' in window&&!prefersReducedMotion){
  const revealObserver=new IntersectionObserver(function(entries,observer){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        const item=entry.target;
        item.classList.add('is-visible');
        observer.unobserve(item);
        window.setTimeout(function(){item.classList.remove('reveal','is-visible');},1000);
      }
    });
  },{threshold:0.12});

  revealItems.forEach(function(item){revealObserver.observe(item);});
}else{
  revealItems.forEach(function(item){item.classList.add('is-visible');});
}

/* ---------- 9. Image fallback ---------- */
const FALLBACK_LOGO='assets/icons/logo.svg';

function useFallback(img){
  const fallback=img.getAttribute('data-fallback')||FALLBACK_LOGO;
  if(img.getAttribute('src')===fallback){return;}
  img.setAttribute('src',fallback);
  if(fallback===FALLBACK_LOGO){
    img.classList.add('object-contain','bg-brand-50','p-2');
  }
}

document.querySelectorAll('img').forEach(function(img){
  img.addEventListener('error',function(){useFallback(img);});
  if(img.complete&&img.naturalWidth===0&&img.getAttribute('src')){useFallback(img);}
});

/* ---------- 10. Footer year ---------- */
const footerYear=document.getElementById('footer-year');
if(footerYear){footerYear.textContent=String(new Date().getFullYear());}

/* ---------- 11. Booking button animation ---------- */
const bookingButtons=document.querySelectorAll('.nav-cta');

function pulse(button){
  button.classList.remove('is-pulsing');
  void button.offsetWidth;
  button.classList.add('is-pulsing');
}

function pulseBookingCta(){
  if(prefersReducedMotion){return;}
  bookingButtons.forEach(pulse);
}

bookingButtons.forEach(function(button){
  button.addEventListener('animationend',function(event){
    if(event.target===button&&event.animationName==='cta-ring'){
      button.classList.remove('is-pulsing');
    }
  });
});

document.querySelectorAll('a[href="#appointment"]').forEach(function(link){
  link.addEventListener('click',pulseBookingCta);
});
})();