/**
 * SmetaLite - Professional In-Browser Estimate Generator
 * Local-First Architecture: 100% of data is stored client-side in localStorage.
 * Zero tracking, zero server personal data collection (152-FZ & GDPR compliant).
 */

const STORAGE_KEY = 'smetalite_current_estimate_v2';

// Unified Telemetry Dispatcher
function recordEcosystemEvent(siteId, eventType, details) {
  if (window.EcosystemTelemetry && typeof window.EcosystemTelemetry.record === 'function') {
    return window.EcosystemTelemetry.record(siteId, eventType, details);
  }
}

// Pre-built professional templates with explicit sample disclaimers
const PRESET_TEMPLATES = {
  studio_renovation: {
    title: "Смета на ремонт квартиры-студии (Образец расчета)",
    contractor: {
      name: "[Образец: Укажите ваше ФИО / Организацию]",
      phone: "+7 (___) ___-__-__",
      email: "contact@example.com",
      inn: "[Укажите ваш ИНН]"
    },
    client: {
      name: "[Укажите ФИО заказчика]",
      address: "г. Москва, ул. Примерная, д. 10",
      phone: "+7 (___) ___-__-__",
      number: "СМ-2026/01",
      date: new Date().toISOString().split('T')[0]
    },
    discountPercent: 5,
    taxType: "none",
    prepayment: 30000,
    notes: "Срок выполнения работ: 35 календарных дней с момента внесения аванса. Гарантия на все выполненные работы — 24 месяца.",
    sections: [
      {
        id: "sec_1",
        title: "1. Демонтажные и подготовительные работы",
        items: [
          { id: "i_1", name: "Демонтаж временных перегородок", unit: "м²", qty: 14, price: 350 },
          { id: "i_2", name: "Очистка стен от старых покрытий и обеспыливание", unit: "м²", qty: 65, price: 180 },
          { id: "i_3", name: "Вынос и утилизация строительного мусора (контейнер 8 м³)", unit: "компл", qty: 1, price: 9500 }
        ]
      },
      {
        id: "sec_2",
        title: "2. Электромонтажные работы",
        items: [
          { id: "i_4", name: "Штробление стен под кабель (пеноблок/бетон)", unit: "пог.м", qty: 45, price: 420 },
          { id: "i_5", name: "Прокладка кабеля ВВГнг-LS 3x2.5 в гофре", unit: "пог.м", qty: 90, price: 130 },
          { id: "i_6", name: "Сборка и монтаж распределительного щита (18 модулей)", unit: "компл", qty: 1, price: 7500 },
          { id: "i_7", name: "Монтаж подрозетников и механизмов розеток/выключателей", unit: "шт", qty: 22, price: 380 }
        ]
      },
      {
        id: "sec_3",
        title: "3. Отделочные работы (Чистовой этап)",
        items: [
          { id: "i_8", name: "Грунтовка и высококачественная шпаклевка стен под покраску", unit: "м²", qty: 65, price: 550 },
          { id: "i_9", name: "Покраска стен в 2 слоя влагостойкой краской", unit: "м²", qty: 65, price: 380 },
          { id: "i_10", name: "Укладка кварцвинила с подложкой", unit: "м²", qty: 24, price: 650 },
          { id: "i_11", name: "Укладка керамогранита в зоне санузла и фартука", unit: "м²", qty: 18, price: 1400 }
        ]
      }
    ]
  },

  electrical_works: {
    title: "Смета на электромонтажные работы (Образец)",
    contractor: {
      name: "[Образец: Инженер-электрик / ИП]",
      phone: "+7 (___) ___-__-__",
      email: "electro@example.com",
      inn: "[Укажите ваш ИНН]"
    },
    client: {
      name: "[Укажите ФИО заказчика]",
      address: "Московская обл., объект №1",
      phone: "+7 (___) ___-__-__",
      number: "ЭЛ-2026/02",
      date: new Date().toISOString().split('T')[0]
    },
    discountPercent: 0,
    taxType: "npd_4",
    prepayment: 20000,
    notes: "Все работы выполняются строго по ПУЭ 7 издания. Используется негорючий кабель ГОСТ. Акт скрытых работ прилагается.",
    sections: [
      {
        id: "sec_e1",
        title: "1. Силовая сеть и распределительный щит",
        items: [
          { id: "e_1", name: "Сборка щита (УЗО, дифавтоматы, реле напряжения)", unit: "компл", qty: 1, price: 12000 },
          { id: "e_2", name: "Прокладка вводного кабеля 3х6 мм²", unit: "пог.м", qty: 15, price: 250 },
          { id: "e_3", name: "Бурение отверстий для подрозетников (коронка 68 мм)", unit: "шт", qty: 38, price: 450 }
        ]
      },
      {
        id: "sec_e2",
        title: "2. Кабельные линии и слаботочка",
        items: [
          { id: "e_4", name: "Монтаж силового кабеля в гофре по потолку", unit: "пог.м", qty: 180, price: 110 },
          { id: "e_5", name: "Прокладка витой пары UTP Cat5e к ТВ и роутеру", unit: "пог.м", qty: 45, price: 90 },
          { id: "e_6", name: "Подключение теплого пола с терморегулятором", unit: "компл", qty: 2, price: 2200 }
        ]
      }
    ]
  },

  web_development: {
    title: "Смета на разработку веб-сайта (Образец договора)",
    contractor: {
      name: "[Образец: IT-специалист / Веб-студия]",
      phone: "+7 (___) ___-__-__",
      email: "dev@example.com",
      inn: "[Укажите ваш ИНН]"
    },
    client: {
      name: "[Укажите наименование заказчика]",
      address: "г. Санкт-Петербург",
      phone: "+7 (___) ___-__-__",
      number: "ИТ-2026/03",
      date: new Date().toISOString().split('T')[0]
    },
    discountPercent: 10,
    taxType: "npd_6",
    prepayment: 50000,
    notes: "Оплата по безналичному расчету. Исходный код передается по акту приема-передачи с отчуждением исключительных прав (ст. 1296 ГК РФ).",
    sections: [
      {
        id: "sec_w1",
        title: "1. Проектирование и UI/UX дизайн",
        items: [
          { id: "w_1", name: "Анализ целевой аудитории и конкурентов", unit: "час", qty: 12, price: 2500 },
          { id: "w_2", name: "Прототипирование и интерактивный макет в Figma", unit: "компл", qty: 1, price: 45000 },
          { id: "w_3", name: "Адаптивный дизайн для мобильных устройств", unit: "компл", qty: 1, price: 20000 }
        ]
      },
      {
        id: "sec_w2",
        title: "2. Фронтенд и Бэкенд разработка",
        items: [
          { id: "w_4", name: "Семантическая верстка HTML5/CSS3/Vanilla JS (Pixel-Perfect)", unit: "компл", qty: 1, price: 38000 },
          { id: "w_5", name: "Интеграция каталога услуг и калькулятора", unit: "компл", qty: 1, price: 32000 },
          { id: "w_6", name: "Настройка SEO-параметров (OpenGraph, Schema.org)", unit: "компл", qty: 1, price: 12000 }
        ]
      }
    ]
  },

  commercial_cleaning: {
    title: "Смета на клининговые услуги (Образец расчета)",
    contractor: {
      name: "[Образец: Клининговая служба / Самозанятый]",
      phone: "+7 (___) ___-__-__",
      email: "cleaning@example.com",
      inn: "[Укажите ваш ИНН]"
    },
    client: {
      name: "[Укажите организацию заказчика]",
      address: "г. Москва",
      phone: "+7 (___) ___-__-__",
      number: "КЛ-2026/04",
      date: new Date().toISOString().split('T')[0]
    },
    discountPercent: 0,
    taxType: "none",
    prepayment: 0,
    notes: "Применяются сертифицированные гипоаллергенные моющие средства. Работы производятся в согласованное время.",
    sections: [
      {
        id: "sec_c1",
        title: "1. Основные клининговые операции",
        items: [
          { id: "c_1", name: "Глубокая роторная чистка твердых полов", unit: "м²", qty: 160, price: 140 },
          { id: "c_2", name: "Химчистка коврового покрытия экстрактором", unit: "м²", qty: 80, price: 180 },
          { id: "c_3", name: "Мойка фасадного и внутреннего остекления", unit: "м²", qty: 45, price: 220 },
          { id: "c_4", name: "Дезинфекция санитарных узлов и кухонной зоны", unit: "компл", qty: 2, price: 4500 }
        ]
      }
    ]
  }
};

class SmetaApp {
  constructor() {
    this.state = this.loadState();
    this.initDOM();
    this.render();
    this.bindEvents();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    // Default fallback to studio renovation template
    return JSON.parse(JSON.stringify(PRESET_TEMPLATES.studio_renovation));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }

  initDOM() {
    this.dom = {
      estimateTitle: document.getElementById('estimateTitle'),
      contractorName: document.getElementById('contractorName'),
      contractorPhone: document.getElementById('contractorPhone'),
      contractorEmail: document.getElementById('contractorEmail'),
      contractorInn: document.getElementById('contractorInn'),
      clientName: document.getElementById('clientName'),
      clientAddress: document.getElementById('clientAddress'),
      clientPhone: document.getElementById('clientPhone'),
      estimateNumber: document.getElementById('estimateNumber'),
      estimateDate: document.getElementById('estimateDate'),
      sectionsContainer: document.getElementById('sectionsContainer'),
      discountPercent: document.getElementById('discountPercent'),
      taxType: document.getElementById('taxType'),
      prepayment: document.getElementById('prepayment'),
      estimateNotes: document.getElementById('estimateNotes'),
      // Totals elements
      subtotalAmount: document.getElementById('subtotalAmount'),
      discountAmount: document.getElementById('discountAmount'),
      taxAmount: document.getElementById('taxAmount'),
      totalAmount: document.getElementById('totalAmount'),
      prepaymentAmount: document.getElementById('prepaymentAmount'),
      dueAmount: document.getElementById('dueAmount')
    };
  }

  formatCurrency(num) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2
    }).format(num || 0);
  }

  render() {
    // Fill general fields
    if (this.dom.estimateTitle) this.dom.estimateTitle.value = this.state.title || '';
    if (this.dom.contractorName) this.dom.contractorName.value = this.state.contractor?.name || '';
    if (this.dom.contractorPhone) this.dom.contractorPhone.value = this.state.contractor?.phone || '';
    if (this.dom.contractorEmail) this.dom.contractorEmail.value = this.state.contractor?.email || '';
    if (this.dom.contractorInn) this.dom.contractorInn.value = this.state.contractor?.inn || '';

    if (this.dom.clientName) this.dom.clientName.value = this.state.client?.name || '';
    if (this.dom.clientAddress) this.dom.clientAddress.value = this.state.client?.address || '';
    if (this.dom.clientPhone) this.dom.clientPhone.value = this.state.client?.phone || '';
    if (this.dom.estimateNumber) this.dom.estimateNumber.value = this.state.client?.number || '';
    if (this.dom.estimateDate) this.dom.estimateDate.value = this.state.client?.date || '';

    if (this.dom.discountPercent) this.dom.discountPercent.value = this.state.discountPercent || 0;
    if (this.dom.taxType) this.dom.taxType.value = this.state.taxType || 'none';
    if (this.dom.prepayment) this.dom.prepayment.value = this.state.prepayment || 0;
    if (this.dom.estimateNotes) this.dom.estimateNotes.value = this.state.notes || '';

    this.renderSections();
    this.recalculate();
  }

  renderSections() {
    this.dom.sectionsContainer.innerHTML = '';

    this.state.sections.forEach((sec, sIdx) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'section-block';
      sectionEl.dataset.sectionId = sec.id;

      const itemsHtml = sec.items.map((item, iIdx) => `
        <tr data-item-id="${item.id}">
          <td class="col-num">${iIdx + 1}</td>
          <td class="col-name">
            <input type="text" class="input-item-name" value="${this.escapeHtml(item.name)}" placeholder="Наименование работ или материала">
          </td>
          <td class="col-unit">
            <select class="select-item-unit">
              ${['м²', 'пог.м', 'шт', 'компл', 'час', 'смена', 'кг', 'т', 'л', 'услуга'].map(u => `
                <option value="${u}" ${item.unit === u ? 'selected' : ''}>${u}</option>
              `).join('')}
            </select>
          </td>
          <td class="col-qty">
            <input type="number" step="any" min="0" class="input-item-qty" value="${item.qty}">
          </td>
          <td class="col-price">
            <input type="number" step="any" min="0" class="input-item-price" value="${item.price}">
          </td>
          <td class="col-sum">${this.formatCurrency((item.qty || 0) * (item.price || 0))}</td>
          <td class="col-action">
            <button type="button" class="btn btn-sm btn-danger btn-delete-item" title="Удалить строку">&times;</button>
          </td>
        </tr>
      `).join('');

      const secSubtotal = sec.items.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0);

      sectionEl.innerHTML = `
        <div class="section-header">
          <input type="text" class="section-title-input" value="${this.escapeHtml(sec.title)}">
          <div class="header-tools">
            <button type="button" class="btn btn-sm btn-danger btn-delete-section">Удалить раздел</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="estimate-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-name">Наименование</th>
                <th class="col-unit">Ед. изм.</th>
                <th class="col-qty">Кол-во</th>
                <th class="col-price">Цена (₽)</th>
                <th class="col-sum">Сумма (₽)</th>
                <th class="col-action"></th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        <div class="section-footer">
          <button type="button" class="btn btn-sm btn-add-row">+ Добавить позицию</button>
          <div class="section-total">По разделу: <span class="sec-total-val">${this.formatCurrency(secSubtotal)}</span></div>
        </div>
      `;

      this.dom.sectionsContainer.appendChild(sectionEl);
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  recalculate() {
    let subtotal = 0;

    this.state.sections.forEach(sec => {
      let secTotal = 0;
      sec.items.forEach(item => {
        const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
        secTotal += lineTotal;
      });
      subtotal += secTotal;
    });

    const discPercent = parseFloat(this.dom.discountPercent.value) || 0;
    const discountAmount = subtotal * (discPercent / 100);
    const discountedSubtotal = subtotal - discountAmount;

    let taxAmount = 0;
    let totalAmount = discountedSubtotal;
    let taxLabel = 'Не облагается (НПД/УСН)';
    const taxType = this.dom.taxType.value;

    if (taxType === 'nds_22_incl') {
      // Стандартная ставка НДС 22% по налоговому законодательству РФ с 2026 г. (в том числе: расчетная ставка 22/122)
      taxAmount = Math.round((discountedSubtotal * 22 / 122) * 100) / 100;
      totalAmount = discountedSubtotal;
      taxLabel = `В т.ч. НДС 22% (РФ 2026): ${this.formatCurrency(taxAmount)}`;
    } else if (taxType === 'nds_22_plus') {
      // НДС 22% сверху: база * 0.22
      taxAmount = Math.round((discountedSubtotal * 0.22) * 100) / 100;
      totalAmount = discountedSubtotal + taxAmount;
      taxLabel = `НДС 22% сверху (РФ 2026): +${this.formatCurrency(taxAmount)}`;
    } else if (taxType === 'nds_20_incl' || taxType === 'nds_20') {
      // Ставка НДС 20% (в т.ч. 20/120 для переходных контрактов)
      taxAmount = Math.round((discountedSubtotal * 20 / 120) * 100) / 100;
      totalAmount = discountedSubtotal;
      taxLabel = `В т.ч. НДС 20%: ${this.formatCurrency(taxAmount)}`;
    } else if (taxType === 'nds_20_plus') {
      taxAmount = Math.round((discountedSubtotal * 0.20) * 100) / 100;
      totalAmount = discountedSubtotal + taxAmount;
      taxLabel = `НДС 20% сверху: +${this.formatCurrency(taxAmount)}`;
    } else if (taxType === 'nds_10_incl') {
      taxAmount = Math.round((discountedSubtotal * 10 / 110) * 100) / 100;
      totalAmount = discountedSubtotal;
      taxLabel = `В т.ч. НДС 10% (льготный): ${this.formatCurrency(taxAmount)}`;
    } else if (taxType === 'npd_4') {
      taxAmount = Math.round((discountedSubtotal * 0.04) * 100) / 100;
      totalAmount = discountedSubtotal;
      taxLabel = `НПД 4% (расчетный налог с физлиц: ${this.formatCurrency(taxAmount)})`;
    } else if (taxType === 'npd_6') {
      taxAmount = Math.round((discountedSubtotal * 0.06) * 100) / 100;
      totalAmount = discountedSubtotal;
      taxLabel = `НПД 6% (расчетный налог с ИП/юрлиц: ${this.formatCurrency(taxAmount)})`;
    } else if (taxType === 'usn_6') {
      taxAmount = Math.round((discountedSubtotal * 0.06) * 100) / 100;
      totalAmount = discountedSubtotal;
      taxLabel = `УСН 6% (расчетный налог 'Доходы': ${this.formatCurrency(taxAmount)})`;
    }

    const prepayment = parseFloat(this.dom.prepayment.value) || 0;
    const dueAmount = Math.max(0, totalAmount - prepayment);

    // Update state
    this.state.discountPercent = discPercent;
    this.state.taxType = taxType;
    this.state.taxAmount = taxAmount;
    this.state.totalAmount = totalAmount;
    this.state.prepayment = prepayment;
    this.state.notes = this.dom.estimateNotes ? this.dom.estimateNotes.value : '';

    // Update DOM safely
    if (this.dom.subtotalAmount) this.dom.subtotalAmount.textContent = this.formatCurrency(subtotal);
    if (this.dom.discountAmount) this.dom.discountAmount.textContent = `- ${this.formatCurrency(discountAmount)} (${discPercent}%)`;
    if (this.dom.taxAmount) this.dom.taxAmount.textContent = taxLabel;
    if (this.dom.totalAmount) this.dom.totalAmount.textContent = this.formatCurrency(totalAmount);
    if (this.dom.prepaymentAmount) this.dom.prepaymentAmount.textContent = this.formatCurrency(prepayment);
    if (this.dom.dueAmount) this.dom.dueAmount.textContent = this.formatCurrency(dueAmount);

    this.saveState();
  }

  exportCSV() {
    recordEcosystemEvent('smetalite', 'csv_export', { number: this.state.client.number });
    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += 'Раздел;Номер;Наименование;Ед. изм.;Количество;Цена (руб);Сумма (руб)\n';
    this.state.sections.forEach(sec => {
      sec.items.forEach((item, idx) => {
        const sum = (item.qty || 0) * (item.price || 0);
        csv += `"${sec.title}";"${idx + 1}";"${item.name.replace(/"/g, '""')}";"${item.unit}";"${item.qty}";"${item.price}";"${sum}"\n`;
      });
    });
    csv += `\n"ИТОГО ПО СМЕТЕ";"";"";"";"";"";"${this.state.totalAmount || 0}"\n`;
    csv += `"Налоговый режим";"";"${this.state.taxType || 'none'}";"";"Сумма налога/НДС:";"";"${this.state.taxAmount || 0}"\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smeta_${this.state.client.number || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.lastExportedCsv = csv;
    return csv;
  }

  bindEvents() {
    // Header Inputs
    const headerInputs = [
      ['estimateTitle', 'title'],
      ['contractorName', (v) => { this.state.contractor.name = v; }],
      ['contractorPhone', (v) => { this.state.contractor.phone = v; }],
      ['contractorEmail', (v) => { this.state.contractor.email = v; }],
      ['contractorInn', (v) => { this.state.contractor.inn = v; }],
      ['clientName', (v) => { this.state.client.name = v; }],
      ['clientAddress', (v) => { this.state.client.address = v; }],
      ['clientPhone', (v) => { this.state.client.phone = v; }],
      ['estimateNumber', (v) => { this.state.client.number = v; }],
      ['estimateDate', (v) => { this.state.client.date = v; }],
      ['estimateNotes', (v) => { this.state.notes = v; }]
    ];

    headerInputs.forEach(([id, handler]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          if (typeof handler === 'string') {
            this.state[handler] = e.target.value;
          } else {
            handler(e.target.value);
          }
          this.saveState();
        });
      }
    });

    // Discount, Tax, Prepayment changes
    ['discountPercent', 'taxType', 'prepayment'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.recalculate());
        el.addEventListener('change', () => this.recalculate());
      }
    });

    // Section Container Delegation
    this.dom.sectionsContainer.addEventListener('input', (e) => {
      const secBlock = e.target.closest('.section-block');
      if (!secBlock) return;
      const secId = secBlock.dataset.sectionId;
      const sec = this.state.sections.find(s => s.id === secId);
      if (!sec) return;

      if (e.target.classList.contains('section-title-input')) {
        sec.title = e.target.value;
        this.saveState();
        return;
      }

      const tr = e.target.closest('tr');
      if (tr) {
        const itemId = tr.dataset.itemId;
        const item = sec.items.find(i => i.id === itemId);
        if (!item) return;

        if (e.target.classList.contains('input-item-name')) {
          item.name = e.target.value;
        } else if (e.target.classList.contains('select-item-unit')) {
          item.unit = e.target.value;
        } else if (e.target.classList.contains('input-item-qty')) {
          item.qty = parseFloat(e.target.value) || 0;
        } else if (e.target.classList.contains('input-item-price')) {
          item.price = parseFloat(e.target.value) || 0;
        }

        // Update row total
        const rowTotal = (item.qty || 0) * (item.price || 0);
        const sumCell = tr.querySelector('.col-sum');
        if (sumCell) sumCell.textContent = this.formatCurrency(rowTotal);

        // Update section subtotal
        const secSubtotal = sec.items.reduce((s, it) => s + ((it.qty || 0) * (it.price || 0)), 0);
        const secTotalEl = secBlock.querySelector('.sec-total-val');
        if (secTotalEl) secTotalEl.textContent = this.formatCurrency(secSubtotal);

        this.recalculate();
      }
    });

    this.dom.sectionsContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('select-item-unit')) {
        const secBlock = e.target.closest('.section-block');
        const tr = e.target.closest('tr');
        if (secBlock && tr) {
          const sec = this.state.sections.find(s => s.id === secBlock.dataset.sectionId);
          const item = sec?.items.find(i => i.id === tr.dataset.itemId);
          if (item) {
            item.unit = e.target.value;
            this.saveState();
          }
        }
      }
    });

    this.dom.sectionsContainer.addEventListener('click', (e) => {
      // Add row
      if (e.target.classList.contains('btn-add-row')) {
        const secBlock = e.target.closest('.section-block');
        const sec = this.state.sections.find(s => s.id === secBlock.dataset.sectionId);
        if (sec) {
          const newItem = {
            id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: '',
            unit: 'шт',
            qty: 1,
            price: 0
          };
          sec.items.push(newItem);
          this.renderSections();
          this.recalculate();
        }
      }

      // Delete row
      if (e.target.classList.contains('btn-delete-item')) {
        const secBlock = e.target.closest('.section-block');
        const tr = e.target.closest('tr');
        if (secBlock && tr) {
          const sec = this.state.sections.find(s => s.id === secBlock.dataset.sectionId);
          if (sec) {
            sec.items = sec.items.filter(i => i.id !== tr.dataset.itemId);
            this.renderSections();
            this.recalculate();
          }
        }
      }

      // Delete section
      if (e.target.classList.contains('btn-delete-section')) {
        const secBlock = e.target.closest('.section-block');
        if (secBlock && confirm("Удалить этот раздел сметы?")) {
          this.state.sections = this.state.sections.filter(s => s.id !== secBlock.dataset.sectionId);
          this.renderSections();
          this.recalculate();
        }
      }
    });

    // Add new section
    const btnAddSection = document.getElementById('btnAddSection');
    if (btnAddSection) {
      btnAddSection.addEventListener('click', () => {
        const newSec = {
          id: 'sec_' + Date.now(),
          title: `Раздел ${this.state.sections.length + 1}`,
          items: [
            { id: 'item_' + Date.now(), name: 'Новая позиция', unit: 'шт', qty: 1, price: 1000 }
          ]
        };
        this.state.sections.push(newSec);
        this.renderSections();
        this.recalculate();
      });
    }

    // Template selection
    document.querySelectorAll('[data-template]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tName = e.target.dataset.template;
        if (PRESET_TEMPLATES[tName]) {
          if (confirm(`Загрузить готовый шаблон "${PRESET_TEMPLATES[tName].title}"? Текущие данные будут заменены.`)) {
            this.state = JSON.parse(JSON.stringify(PRESET_TEMPLATES[tName]));
            this.render();
            this.saveState();
          }
        }
      });
    });

    // Reset button
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm("Создать чистую смету?")) {
          this.state = {
            title: "Новая смета на выполнение работ",
            contractor: { name: "", phone: "", email: "", inn: "" },
            client: { name: "", address: "", phone: "", number: "СМ-" + Math.floor(1000 + Math.random() * 9000), date: new Date().toISOString().split('T')[0] },
            discountPercent: 0,
            taxType: "none",
            prepayment: 0,
            notes: "",
            sections: [
              {
                id: "sec_1",
                title: "1. Основные работы",
                items: [{ id: "i_1", name: "Наименование работы", unit: "м²", qty: 10, price: 1500 }]
              }
            ]
          };
          this.render();
          this.saveState();
        }
      });
    }

    // Print / PDF
    const btnPrint = document.getElementById('btnPrint');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        recordEcosystemEvent('smetalite', 'pdf_print', { number: this.state.client.number });
        window.print();
      });
    }

    // Export JSON
    const btnExportJson = document.getElementById('btnExportJson');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        recordEcosystemEvent('smetalite', 'json_export', { number: this.state.client.number });
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `Smeta_${this.state.client.number || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }

    // Import JSON
    const fileImportInput = document.getElementById('fileImportInput');
    const btnImportJson = document.getElementById('btnImportJson');
    if (btnImportJson && fileImportInput) {
      btnImportJson.addEventListener('click', () => fileImportInput.click());
      fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed.sections && Array.isArray(parsed.sections)) {
              this.state = parsed;
              this.render();
              this.saveState();
              recordEcosystemEvent('smetalite', 'json_import', { number: this.state.client.number });
              alert("Смета успешно загружена!");
            } else {
              alert("Некорректный формат файла сметы.");
            }
          } catch (err) {
            alert("Ошибка чтения JSON файла: " + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Export CSV
    const btnExportCsv = document.getElementById('btnExportCsv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        this.exportCSV();
      });
    }
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.smetaApp = new SmetaApp();
});
