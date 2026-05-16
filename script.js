// ============================================================
// TULUM NAIL STUDIO — SCORING SYSTEM
// ============================================================

const SCORES = {};

function calcScore() {
  let total = 0;
  const breakdown = {};

  // 1. ESTABILIDAD Y LOGÍSTICA (max 20)
  let logistics = 0;
  const commute = val('commute');
  if (commute === '0') logistics += 6;
  else if (commute === '1') logistics += 4;
  else if (commute === '2') logistics += 2;
  else logistics += 0;

  const jobChanges = val('job_changes');
  if (jobChanges === '0') logistics += 8;
  else if (jobChanges === '1') logistics += 6;
  else if (jobChanges === '2') logistics += 3;
  else logistics += 0;

  const childcare = val('childcare');
  if (childcare === 'yes' || childcare === 'na') logistics += 6;
  else if (childcare === 'no') logistics += 2;
  breakdown['Estabilidad y Logística'] = { score: logistics, max: 20 };
  total += logistics;

  // 2. EXPERIENCIA TÉCNICA (max 20)
  let experience = 0;
  const yrsExp = val('years_exp');
  if (yrsExp === '4') experience += 10;
  else if (yrsExp === '3') experience += 8;
  else if (yrsExp === '2') experience += 5;
  else if (yrsExp === '1') experience += 3;
  else experience += 1;

  const confLevel = parseInt(val('confidence_level')) || 5;
  experience += Math.round((confLevel / 10) * 10);
  breakdown['Experiencia Técnica'] = { score: experience, max: 20 };
  total += experience;

  // 3. DISPONIBILIDAD (max 15)
  let availability = 0;
  const schedule = val('schedule_type');
  if (schedule === 'full') availability += 8;
  else if (schedule === 'part_am' || schedule === 'part_pm') availability += 5;
  else availability += 2;

  const weekends = val('weekend_availability');
  if (weekends === 'both') availability += 7;
  else if (weekends === 'saturday' || weekends === 'sunday') availability += 4;
  else availability += 1;
  breakdown['Disponibilidad'] = { score: availability, max: 15 };
  total += availability;

  // 4. SERVICIO AL CLIENTE (max 15)
  let service = 0;
  const complaint = val('complaint_response');
  if (complaint === 'listen') service += 8;
  else if (complaint === 'solution') service += 7;
  else if (complaint === 'supervisor') service += 4;
  else if (complaint === 'explain') service += 3;
  else service += 1;

  const serviceVals = checked('service_values');
  const premium = ['punctuality','cleanliness','detail','listen'];
  premium.forEach(p => { if (serviceVals.includes(p)) service += 1.75; });
  service = Math.min(15, Math.round(service));
  breakdown['Orientación al Servicio'] = { score: service, max: 15 };
  total += service;

  // 5. PERSONALIDAD Y VALORES (max 15)
  let personality = 0;
  const scales = ['punctuality_scale','responsibility_scale','organization_scale','patience_scale','detail_scale','feedback_scale','learning_scale'];
  let scaleSum = 0;
  scales.forEach(s => { scaleSum += parseInt(val(s)) || 5; });
  personality = Math.round((scaleSum / (scales.length * 10)) * 15);
  breakdown['Personalidad y Valores'] = { score: personality, max: 15 };
  total += personality;

  // 6. MOTIVACIÓN Y COMPATIBILIDAD (max 15)
  let motivation = 0;
  const motivations = checked('motivations');
  const goodMotivations = ['grow','goals','proud','learn'];
  goodMotivations.forEach(m => { if (motivations.includes(m)) motivation += 2; });

  const tuluMatch = val('tulum_aspect');
  if (tuluMatch === 'detail' || tuluMatch === 'training') motivation += 5;
  else if (tuluMatch === 'premium' || tuluMatch === 'wellness') motivation += 4;
  else motivation += 2;

  const protocols = val('protocols_importance');
  if (protocols === '4') motivation += 4;
  else if (protocols === '3') motivation += 3;
  else if (protocols === '2') motivation += 1;
  motivation = Math.min(15, motivation);
  breakdown['Motivación y Compatibilidad'] = { score: motivation, max: 15 };
  total += motivation;

  return { total: Math.min(100, Math.round(total)), breakdown };
}

function val(id) {
  const el = document.querySelector(`[name="${id}"]:checked`) ||
             document.getElementById(id);
  if (!el) return '';
  if (el.tagName === 'SELECT' || el.tagName === 'INPUT') return el.value;
  return el.value || '';
}

function checked(name) {
  return [...document.querySelectorAll(`[name="${name}"]:checked`)].map(e => e.value);
}

// ============================================================
// PROGRESS BAR
// ============================================================
function updateProgress() {
  const required = document.querySelectorAll('[required]');
  const total = required.length;
  let filled = 0;
  required.forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') {
      const group = document.querySelectorAll(`[name="${el.name}"]:checked`);
      if (group.length > 0) filled++;
    } else if (el.value && el.value.trim() !== '') filled++;
  });
  const pct = Math.min(100, Math.round((filled / total) * 100));
  document.querySelector('.progress-fill').style.width = pct + '%';
  document.querySelector('.progress-pct').textContent = pct + '%';
}

// Scale value display
function initScales() {
  document.querySelectorAll('.scale-input').forEach(input => {
    const display = document.getElementById(input.id + '_display');
    if (display) {
      display.textContent = input.value;
      input.addEventListener('input', () => {
        display.textContent = input.value;
        updateProgress();
      });
    }
  });
}

// ============================================================
// SUBMIT & RESULT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScales();
  document.addEventListener('change', updateProgress);
  document.addEventListener('input', updateProgress);

  const form = document.getElementById('tuluForm');
  form.addEventListener('submit', e => {
    e.preventDefault();

    const { total, breakdown } = calcScore();

    let emoji, badge, badgeClass, title, message;
    if (total >= 80) {
      emoji = '⭐'; badge = 'EXCELENTE CANDIDATA'; badgeClass = 'badge-excellent';
      title = '¡Una candidata excepcional!';
      message = 'Su perfil destaca por su compromiso, vocación de servicio y alineación con los valores de TULUM. Recomendamos continuar con el proceso de selección prioritariamente.';
    } else if (total >= 60) {
      emoji = '✅'; badge = 'BUENA CANDIDATA'; badgeClass = 'badge-good';
      title = 'Perfil prometedor';
      message = 'Muestra buenas aptitudes y motivación. Recomendamos una entrevista para profundizar en algunos aspectos de su perfil.';
    } else if (total >= 40) {
      emoji = '⚠️'; badge = 'EVALUACIÓN ADICIONAL'; badgeClass = 'badge-review';
      title = 'Requiere evaluación adicional';
      message = 'El perfil presenta áreas a reforzar. Se sugiere una conversación directa antes de avanzar en el proceso.';
    } else {
      emoji = '❌'; badge = 'NO PRIORITARIA'; badgeClass = 'badge-low';
      title = 'Perfil no prioritario';
      message = 'En este momento su perfil no se alinea con las necesidades inmediatas de TULUM Nail Studio.';
    }

    document.querySelector('.result-emoji').textContent = emoji;
    const badgeEl = document.querySelector('.result-badge');
    badgeEl.textContent = badge;
    badgeEl.className = 'result-badge ' + badgeClass;
    document.querySelector('.result-score').textContent = total;
    document.querySelector('.result-title').textContent = title;
    document.querySelector('.result-message').textContent = message;

    const breakdownEl = document.querySelector('.score-breakdown-items');
    breakdownEl.innerHTML = '';
    Object.entries(breakdown).forEach(([key, val]) => {
      const div = document.createElement('div');
      div.className = 'score-item';
      div.innerHTML = `<span>${key}</span><span>${val.score}/${val.max}</span>`;
      breakdownEl.appendChild(div);
    });

    document.querySelector('.result-overlay').classList.add('active');
  });

  document.querySelector('.btn-close').addEventListener('click', () => {
    document.querySelector('.result-overlay').classList.remove('active');
  });
});
