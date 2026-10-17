// ===================================================================
//  Silk Way Logistics — скрипты сайта
// ===================================================================

const WA_MAIN = '77012205546';

// ===== Мобильное меню =====
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const header = document.getElementById('header');

function toggleMenu(open) {
  burger.classList.toggle('is-open', open);
  nav.classList.toggle('is-open', open);
  header.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : ''; // блокируем прокрутку под меню
}

burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));

// ===== Фон шапки при прокрутке =====
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 40);
});

// ===== Если фото нет — убираем "битую" картинку, остаётся градиент =====
document.querySelectorAll('img').forEach(img => {
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) img.remove();
  else img.addEventListener('error', () => img.remove());
});


// ===================================================================
//  WhatsApp без промежуточной страницы
//  wa.me сначала показывает свою страницу «Перейти в чат».
//  На телефоне открываем приложение (whatsapp://), на компьютере — WhatsApp Web.
// ===================================================================
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function waUrl(phone, text = '') {
  const t = text ? `&text=${encodeURIComponent(text)}` : '';
  return isMobile
    ? `whatsapp://send?phone=${phone}${t}`
    : `https://web.whatsapp.com/send?phone=${phone}${t}`;
}

function openWhatsApp(phone, text) {
  if (isMobile) window.location.href = waUrl(phone, text);
  else window.open(waUrl(phone, text), '_blank', 'noopener');
}

// все ссылки wa.me/номер?text=... перехватываем
document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const url = new URL(link.href);
    openWhatsApp(url.pathname.replace('/', ''), url.searchParams.get('text') || '');
  });
});


// ===================================================================
//  Фильтр автопарка по количеству пассажиров
//  Машина видна, если её диапазон мест пересекается с диапазоном группы:
//  машина.max >= группа.min  И  машина.min <= группа.max
// ===================================================================
const filterBtns = document.querySelectorAll('.filter__btn');
const cars = document.querySelectorAll('.car');
const filterEmpty = document.querySelector('.filter__empty');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));

    const min = Number(btn.dataset.min);
    const max = Number(btn.dataset.max);
    let visible = 0;

    cars.forEach(car => {
      const carMin = Number(car.dataset.seatsMin);
      const carMax = Number(car.dataset.seatsMax);
      const fits = carMax >= min && carMin <= max;
      car.classList.toggle('is-hidden', !fits);
      if (fits) visible++;
    });

    filterEmpty.hidden = visible > 0;
  });
});


// ===================================================================
//  Галерея фото в <dialog>
// ===================================================================
const gallery = document.getElementById('gallery');
const galleryImg = document.getElementById('galleryImg');
const galleryCount = document.getElementById('galleryCount');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
let photos = [];
let current = 0;

function showPhoto(i) {
  current = (i + photos.length) % photos.length; // по кругу: после последнего — первое
  galleryImg.src = photos[current];
  galleryCount.textContent = `${current + 1} / ${photos.length}`;
}

document.querySelectorAll('.car__media').forEach(btn => {
  btn.addEventListener('click', () => {
    photos = btn.dataset.photos.split(',');
    galleryImg.alt = btn.querySelector('img')?.alt || '';
    const single = photos.length < 2;
    galleryPrev.hidden = single;
    galleryNext.hidden = single;
    galleryCount.hidden = single;
    showPhoto(0);
    gallery.showModal();
  });
});

galleryPrev.addEventListener('click', () => showPhoto(current - 1));
galleryNext.addEventListener('click', () => showPhoto(current + 1));
document.getElementById('galleryClose').addEventListener('click', () => gallery.close());

// клик по затемнению вокруг фото — закрыть
gallery.addEventListener('click', (e) => { if (e.target === gallery) gallery.close(); });

// стрелки на клавиатуре
gallery.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});

// свайп на телефоне: запоминаем, где палец коснулся, и сравниваем, где отпустил
let touchX = 0;
gallery.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
gallery.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showPhoto(current + (dx < 0 ? 1 : -1));
});


// ===================================================================
//  Калькулятор стоимости
// ===================================================================
const calcForm = document.getElementById('calcForm');
const calcCar = document.getElementById('calcCar');
const calcHours = document.getElementById('calcHours');
const calcHoursOut = document.getElementById('calcHoursOut');
const calcTotal = document.getElementById('calcTotal');
const calcExtra = document.getElementById('calcExtra');

const formatKZT = (n) => n.toLocaleString('ru-RU') + ' ₸'; // 39000 → "39 000 ₸"

function calcPrice() {
  const option = calcCar.selectedOptions[0];
  const price = Number(option.value);
  const hours = Number(calcHours.value);
  const extra = Number(option.dataset.extra || 0); // +1 час подачи у Higer

  calcHoursOut.textContent = hours;
  calcExtra.hidden = extra === 0;
  const total = price * (hours + extra);
  calcTotal.textContent = formatKZT(total);
  return { car: option.textContent, hours, total };
}

// 'input' срабатывает сразу при движении ползунка, 'change' — только когда отпустил
calcCar.addEventListener('change', calcPrice);
calcHours.addEventListener('input', calcPrice);
calcPrice();

calcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const { car, hours, total } = calcPrice();
  openWhatsApp(WA_MAIN,
    `Здравствуйте! Хочу забронировать: ${car}, ${hours} ч. ` +
    `По калькулятору на сайте — ${formatKZT(total)}.`);
});


// ===================================================================
//  Форма заказа → WhatsApp с готовым текстом
// ===================================================================
const form = document.getElementById('orderForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const message =
    `Здравствуйте! Хочу заказать транспорт.\n` +
    `Имя: ${data.get('name')}\n` +
    `Транспорт: ${data.get('car')}\n` +
    `Дата: ${data.get('date')}\n` +
    `Пассажиров: ${data.get('people')}\n` +
    `Маршрут: ${data.get('route')}`;
  openWhatsApp(WA_MAIN, message);
});


// ===================================================================
//  Языки RU / KZ / EN
//  Русский текст берём прямо из HTML (сохраняем при загрузке),
//  в словаре — только казахский и английский.
// ===================================================================
const i18n = {
  kz: {
    'nav.fleet': 'Автопарк', 'nav.price': 'Бағалар', 'nav.services': 'Қызметтер', 'nav.tours': 'Турлар',
    'nav.special': 'Арнайы техника', 'nav.faq': 'Сұрақтар', 'nav.contacts': 'Байланыс',
    'hero.eyebrow': 'Астана · Алматы · бүкіл Қазақстан',
    'hero.title': 'Жүргізушісі бар<br>көлік жалдау',
    'hero.text': 'VIP-трансферлер, әуежай, қалааралық сапарлар және іс-шаралар. Mercedes Sprinter, V-Class және 4-тен 50 орынға дейінгі автобустар.',
    'hero.btn': 'Сапарды есептеу',
    'fact.seats': 'орын', 'fact.support': 'қолдау', 'fact.years': '10+ жыл', 'fact.market': 'нарықта',
    'fact.langs': '3 тіл', 'fact.from': '9 000 ₸-ден', 'fact.hour': '/ сағат',
    'why.eyebrow': 'Тасымалдан да көп', 'why.title': 'Silk Way-ді таңдаудың 5 себебі',
    'fleet.eyebrow': 'Автопарк', 'fleet.title': 'Кез келген сапарға ыңғайлы көлік',
    'filter.label': 'Сіздер нешеусіз?', 'filter.all': 'Барлығы',
    'transfer.eyebrow': 'Жеке трансфер', 'transfer.title': 'Сапарды жайлы ететін егжей-тегжейлер',
    'price.eyebrow': 'Баға', 'price.title': '1 сағаттың құны',
    'calc.eyebrow': 'Калькулятор', 'calc.title': 'Сапар қанша тұрады',
    'calc.lead': 'Көлік пен уақытты таңдаңыз — баға бірден есептеледі.',
    'calc.hours': 'Сағат', 'calc.total': 'Барлығы',
    'calc.note': 'Алдын ала есеп. Нақты бағаны менеджер растайды.', 'calc.btn': 'WhatsApp арқылы брондау',
    'services.eyebrow': 'Қызметтер', 'services.title': 'Сапар форматын бағытыңызға қарай таңдаймыз',
    'routes.eyebrow': 'Танымал бағыттар', 'routes.title': 'Ең жиі баратын бағыттар', 'routes.btn': 'Бағасын білу',
    'tours.eyebrow': 'Турлар мен іс-шаралар · Kompas Asia-мен бірге',
    'tours.title': 'Аптаның кез келген күні тапсырыс бойынша турлар', 'tours.map': 'Қайда барамыз',
    'special.eyebrow': 'Арнайы техника', 'special.title': '37-ден 80 метрге дейінгі автобетонсорғылар',
    'faq.eyebrow': 'Сұрақтар', 'faq.title': 'Жиі қойылатын сұрақтар',
    'order.eyebrow': 'Тапсырыс', 'order.title': 'Құнын білу',
    'order.text': 'Форманы толтырыңыз — WhatsApp дайын хабарламамен ашылады.',
    'form.name': 'Атыңыз', 'form.car': 'Көлік', 'form.date': 'Күні', 'form.people': 'Жолаушылар',
    'form.route': 'Бағыт', 'form.submit': 'WhatsApp-қа жіберу',
    'footer.slogan': 'Адамдарды маңыздыға жақындатамыз',
  },
  en: {
    'nav.fleet': 'Fleet', 'nav.price': 'Prices', 'nav.services': 'Services', 'nav.tours': 'Tours',
    'nav.special': 'Machinery', 'nav.faq': 'FAQ', 'nav.contacts': 'Contacts',
    'hero.eyebrow': 'Astana · Almaty · all of Kazakhstan',
    'hero.title': 'Chauffeur<br>service',
    'hero.text': 'VIP transfers, airport, intercity trips and events. Mercedes Sprinter, V-Class and buses from 4 to 50 seats.',
    'hero.btn': 'Calculate a trip',
    'fact.seats': 'seats', 'fact.support': 'support', 'fact.years': '10+ years', 'fact.market': 'in business',
    'fact.langs': '3 languages', 'fact.from': 'from 9 000 ₸', 'fact.hour': '/ hour',
    'why.eyebrow': 'More than transport', 'why.title': '5 reasons to choose Silk Way',
    'fleet.eyebrow': 'Fleet', 'fleet.title': 'Comfortable transport for any trip',
    'filter.label': 'How many passengers?', 'filter.all': 'All',
    'transfer.eyebrow': 'Private transfer', 'transfer.title': 'Details that make the trip comfortable',
    'price.eyebrow': 'Prices', 'price.title': 'Cost per hour',
    'calc.eyebrow': 'Calculator', 'calc.title': 'How much will the trip cost',
    'calc.lead': 'Choose a vehicle and time — the price updates instantly.',
    'calc.hours': 'Hours', 'calc.total': 'Total',
    'calc.note': 'Estimate only. The manager will confirm the final price.', 'calc.btn': 'Book via WhatsApp',
    'services.eyebrow': 'Services', 'services.title': 'We match the trip format to your route',
    'routes.eyebrow': 'Popular routes', 'routes.title': 'Where people go most often', 'routes.btn': 'Get a price',
    'tours.eyebrow': 'Tours & events · with Kompas Asia',
    'tours.title': 'Custom tours any day of the week', 'tours.map': 'Where we go',
    'special.eyebrow': 'Machinery', 'special.title': 'Concrete pump trucks from 37 to 80 m',
    'faq.eyebrow': 'FAQ', 'faq.title': 'Frequently asked questions',
    'order.eyebrow': 'Booking', 'order.title': 'Get a quote',
    'order.text': 'Fill in the form — WhatsApp will open with a ready message.',
    'form.name': 'Your name', 'form.car': 'Vehicle', 'form.date': 'Date', 'form.people': 'Passengers',
    'form.route': 'Route', 'form.submit': 'Send to WhatsApp',
    'footer.slogan': 'Moving people closer to what matters',
  },
};

const i18nEls = document.querySelectorAll('[data-i18n]');
i18nEls.forEach(el => { el.dataset.ru = el.innerHTML; }); // запоминаем русский оригинал

function setLang(lang) {
  i18nEls.forEach(el => {
    const key = el.dataset.i18n;
    el.innerHTML = lang === 'ru' ? el.dataset.ru : (i18n[lang][key] ?? el.dataset.ru);
  });
  document.documentElement.lang = lang === 'kz' ? 'kk' : lang; // код казахского языка — kk
  document.querySelectorAll('.lang__btn').forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
  try { localStorage.setItem('lang', lang); } catch (e) { /* приватный режим — просто не запоминаем */ }
}

document.querySelectorAll('.lang__btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

try {
  const saved = localStorage.getItem('lang');
  if (saved && saved !== 'ru' && i18n[saved]) setLang(saved);
} catch (e) { /* нет доступа к localStorage */ }


// ===================================================================
//  Появление блоков при прокрутке (IntersectionObserver)
//  Браузер сам сообщает, когда элемент вошёл в экран — без слушателя scroll.
// ===================================================================
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal');
  const targets = document.querySelectorAll(
    '.section__title, .feature, .car, .route, .service, .price__group, .faq__item, .calc__box, .tours__card, .trust, .map'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // анимируем один раз
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
}


// ===== Текущий год в футере =====
document.getElementById('year').textContent = new Date().getFullYear();
