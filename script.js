// ====== CONFIGURATION ======
const CONFIG = {
  whatsappNumber: "6288258182989", // No + or 0 prefix
  defaultMessage: "Halo INIHARA COLLECTION, saya ingin bertanya tentang koleksi baju Anda",
  productMessageTemplate: (product) => 
    `Halo INIHARA COLLECTION, saya ingin memesan:\n\n*${product.title}*\nHarga: ${product.price}\n\nApakah masih tersedia?`
};

// ====== GLOBAL VARIABLES ======
let currentIndex = 0;
let products = [];
const elements = {
  track: document.getElementById('carousel-track'),
  dotsContainer: document.getElementById('carousel-dots'),
  popup: document.getElementById('productPopup'),
  popupImage: document.getElementById('popupImage'),
  popupTitle: document.getElementById('popupTitle'),
  popupDesc: document.getElementById('popupDesc'),
  popupPrice: document.getElementById('popupPrice'),
  whatsappBtn: document.getElementById('whatsappBtn'),
  closePopup: document.querySelector('.close-popup'),
  waFloat: document.querySelector('.wa-float'),
  prevBtn: document.querySelector('.prev'),
  nextBtn: document.querySelector('.next')
};

// ====== UTILITY FUNCTIONS ======
const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const generateWhatsAppLink = (message) => {
  const baseUrl = isMobileDevice() 
    ? 'https://wa.me' 
    : 'https://web.whatsapp.com/send';
  return `${baseUrl}?phone=${CONFIG.whatsappNumber}&text=${encodeURIComponent(message)}`;
};

// ====== PRODUCT HANDLING ======
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Failed to load products');
    products = await response.json();
    renderCarousel();
  } catch (error) {
    console.error('Error loading products:', error);
    products = [{
      image: "dress-1.jpg",
      title: "Contoh Produk",
      desc: "Produk contoh karena gagal load data",
      price: "Rp 0"
    }];
    renderCarousel();
  }
}

// ====== CAROUSEL CONTROLS ======
function renderCarousel() {
  elements.track.innerHTML = '';
  elements.dotsContainer.innerHTML = '';

  products.forEach((product, index) => {
    // Create slide
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = `
      <img src="images/${product.image}" alt="${product.title}" loading="lazy">
      <div class="slide-overlay"></div>
    `;
    slide.addEventListener('click', () => openPopup(index));
    elements.track.appendChild(slide);

    // Create dot
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    elements.dotsContainer.appendChild(dot);
  });

  updateCarousel();
}

function goToSlide(index) {
  currentIndex = index;
  updateCarousel();
}

function moveSlide(direction) {
  currentIndex = (currentIndex + direction + products.length) % products.length;
  updateCarousel();
}

function updateCarousel() {
  elements.track.style.transform = `translateX(-${currentIndex * 100}%)`;
  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });
}

// ====== POPUP HANDLING ======
function openPopup(index) {
  const product = products[index];
  
  elements.popupImage.src = `images/${product.image}`;
  elements.popupTitle.textContent = product.title;
  elements.popupDesc.textContent = product.desc;
  elements.popupPrice.textContent = product.price;

  elements.whatsappBtn.href = generateWhatsAppLink(CONFIG.productMessageTemplate(product));
  elements.whatsappBtn.setAttribute('target', '_blank');
  elements.whatsappBtn.setAttribute('rel', 'noopener noreferrer');
  
  elements.popup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  elements.popup.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// ====== TOUCH HANDLING ======
let touchStartX = 0;

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].clientX;
  elements.track.style.transition = 'none';
}

function handleTouchEnd(e) {
  const touchEndX = e.changedTouches[0].clientX;
  elements.track.style.transition = '';
  
  const threshold = 50;
  const difference = touchStartX - touchEndX;
  
  if (difference > threshold) moveSlide(1); // Swipe left
  if (difference < -threshold) moveSlide(-1); // Swipe right
}

// ====== EVENT LISTENERS ======
function initEventListeners() {
  // Navigation buttons
  elements.prevBtn.addEventListener('click', () => moveSlide(-1));
  elements.nextBtn.addEventListener('click', () => moveSlide(1));
  
  // Touch events
  elements.track.addEventListener('touchstart', handleTouchStart, { passive: true });
  elements.track.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // Popup handling
  elements.closePopup.addEventListener('click', closePopup);
  elements.popup.addEventListener('click', (e) => e.target === elements.popup && closePopup());
  
  // Global WhatsApp button
  elements.waFloat.href = generateWhatsAppLink(CONFIG.defaultMessage);
  elements.waFloat.setAttribute('target', '_blank');
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  // Hide preloader
  setTimeout(() => {
    document.querySelector('.preloader').style.opacity = '0';
    setTimeout(() => {
      document.querySelector('.preloader').style.display = 'none';
    }, 500);
  }, 1500);

  // Initialize
  loadProducts();
  initEventListeners();
});

// Auto-refresh products every 5 minutes
setInterval(loadProducts, 300000);