// Showroom page — reads from Supabase
async function renderShowroom() {
  const grid = document.getElementById('carsGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align:center;padding:3rem;color:#888;font-size:14px;">⏳ Memuat koleksi...</div>';

  try {
    const cars = await dbGetCars();
    const brandSel = document.getElementById('filterBrand');
    if (brandSel) {
      const brands = [...new Set(cars.map(c => c.brand))].sort();
      brandSel.innerHTML = '<option value="">Semua Merek</option>' +
        brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }
    window._allCars = cars;
    filterCars();
  } catch(e) {
    grid.innerHTML = '<div style="text-align:center;padding:3rem;color:#e74c3c;">Gagal memuat data. Coba refresh.</div>';
  }
}

function filterCars() {
  const cars = window._allCars || [];
  const brand = document.getElementById('filterBrand')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const search = document.getElementById('searchCar')?.value?.toLowerCase() || '';

  const filtered = cars.filter(c =>
    (!brand || c.brand === brand) &&
    (!status || c.status === status) &&
    (!search || c.name.toLowerCase().includes(search) || c.brand.toLowerCase().includes(search))
  );

  const grid = document.getElementById('carsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('carCount');
  if (count) count.textContent = `${filtered.length} unit ditemukan`;

  if (!filtered.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = filtered.map((c, i) => `
    <div class="car-card card-stagger" style="animation-delay:${i * 0.07}s">
      <div class="car-img">
        ${c.photo ? `<img src="${c.photo}" alt="${c.name}">` : `<div class="car-img-placeholder">🚗</div>`}
        <span class="status-badge ${c.status === 'available' ? 'badge-available' : 'badge-sold'}">
          ${c.status === 'available' ? 'Tersedia' : 'Terjual'}
        </span>
        <div class="img-overlay"></div>
      </div>
      <div class="car-info">
        <div class="car-brand">${c.brand} · ${c.year}</div>
        <div class="car-name">${c.name}</div>
        ${c.description ? `<div class="car-desc">${c.description}</div>` : ''}
        <div class="car-price">${formatPrice(c.price)}</div>
        ${c.status === 'available'
          ? `<button class="btn-hubungi ripple-btn" onclick="hubungi('${c.name}')">Hubungi Kami</button>`
          : `<button class="btn-hubungi sold" disabled>Sudah Terjual</button>`}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = this.getBoundingClientRect();
      const rpl = document.createElement('span');
      rpl.className = 'ripple';
      rpl.style.left = (e.clientX - r.left) + 'px';
      rpl.style.top = (e.clientY - r.top) + 'px';
      this.appendChild(rpl);
      setTimeout(() => rpl.remove(), 600);
    });
  });
}

function hubungi(name) {
  const msg = encodeURIComponent(`Halo, saya tertarik dengan ${name} di Pratama Mandiri. Apakah masih tersedia?`);
  window.open(`https://wa.me/6285711154211?text=${msg}`, '_blank');
}
