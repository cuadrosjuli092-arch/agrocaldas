/**
 * AgroCaldas - Controlador Principal de la Aplicación
 * Gestión de vistas, modales, formularios, filtros y reactividad
 * Ubicación: Anserma, Caldas, Colombia
 */

import { agroStore, VEREDAS_ANSERMA } from './store.js';
import { ANSERMA_GEO, getAnsermaWeather, getMoonPhase, RECOMENDACIONES_CALDAS } from './weather.js';
import { formatCOP, formatDate, renderFinancialBarChart, renderCropsDonutChart } from './charts.js';

class AgroApp {
  constructor() {
    this.currentView = 'dashboard';
    this.searchTerm = '';
    this.filterCategory = 'todas';
    this.weatherData = null;

    this.init();
  }

  async init() {
    this.bindGlobalEvents();
    this.populateFarmSelector();
    this.renderCurrentView();
    this.updateAlertBadge();

    // Suscribirse a cambios en la base de datos
    agroStore.subscribe(() => {
      this.populateFarmSelector();
      this.renderCurrentView();
      this.updateAlertBadge();
    });

    // Cargar clima de Anserma
    this.loadWeather();
  }

  // Carga de clima
  async loadWeather() {
    try {
      this.weatherData = await getAnsermaWeather();
      this.updateWeatherUI();
    } catch (e) {
      console.warn('Error cargando clima:', e);
    }
  }

  updateWeatherUI() {
    const chip = document.getElementById('header-weather-chip');
    if (!chip || !this.weatherData) return;

    chip.innerHTML = `
      <span class="weather-icon">${this.weatherData.icono}</span>
      <span class="weather-label"><strong>${this.weatherData.temperatura}°C</strong> Anserma</span>
    `;
    chip.title = `${this.weatherData.descripcion} - Humedad: ${this.weatherData.humedad}% - Altitud: ${ANSERMA_GEO.altitud} msnm`;

    // Si estamos en la vista de dashboard, refrescar la tarjeta de clima
    if (this.currentView === 'dashboard') {
      const widget = document.getElementById('dashboard-weather-widget');
      if (widget) {
        const moon = getMoonPhase();
        widget.innerHTML = this.renderWeatherCardContent(this.weatherData, moon);
      }
    }
  }

  renderWeatherCardContent(w, moon) {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: #166534; letter-spacing: 0.5px;">
            Anserma, Caldas (${ANSERMA_GEO.altitud} msnm)
          </span>
          <h4 style="font-size: 1.15rem; font-weight: 800; color: #14532d; margin-top: 0.1rem;">
            ${w.icono} ${w.temperatura}°C <span style="font-size: 0.82rem; font-weight: 500; color: #64748b;">(Sensación ${w.sensacionTermica}°C)</span>
          </h4>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 1.4rem;">${moon.icon}</span>
          <div style="font-size: 0.72rem; font-weight: 700; color: #334155;">${moon.name}</div>
        </div>
      </div>
      <p style="font-size: 0.84rem; color: #334155; margin-bottom: 0.65rem;">
        <strong>Estado:</strong> ${w.descripcion}. Humedad del <strong>${w.humedad}%</strong> y viento a <strong>${w.vientoKmH} km/h</strong>.
      </p>
      <div style="background: #ffffff; padding: 0.65rem 0.85rem; border-radius: 8px; border-left: 3px solid #16a34a; font-size: 0.78rem; color: #166534; margin-bottom: 0.5rem;">
        <strong>Fase Lunar (${moon.name}):</strong> ${moon.laborRecomendada}
      </div>
      <div style="background: #fffbeb; padding: 0.65rem 0.85rem; border-radius: 8px; border-left: 3px solid #d97706; font-size: 0.78rem; color: #92400e;">
        <strong>Recomendación Fitosanitaria:</strong> ${w.alertaFitosanitaria.mensaje}
      </div>
    `;
  }

  // Vincular eventos globales y de navegación
  bindGlobalEvents() {
    // Selector de Finca Global
    const farmSelect = document.getElementById('global-farm-select');
    if (farmSelect) {
      farmSelect.addEventListener('change', (e) => {
        agroStore.setActiveFarmId(e.target.value);
        this.showToast(`Filtro cambiado a: ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    // Navegación Sidebar de escritorio
    document.querySelectorAll('[data-view-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.viewTarget;
        this.switchView(target);
      });
    });

    // Menú móvil (Hamburguesa)
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('mobile-drawer-overlay');

    if (toggleBtn && sidebar && overlay) {
      const closeMenu = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      };

      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });

      overlay.addEventListener('click', closeMenu);
    }

    // Botón de Alertas en Header
    const alertBtn = document.getElementById('header-alert-btn');
    if (alertBtn) {
      alertBtn.addEventListener('click', () => {
        this.switchView('alertas');
      });
    }

    // Botón de Quick Action (+)
    const quickActionBtn = document.getElementById('quick-action-btn');
    if (quickActionBtn) {
      quickActionBtn.addEventListener('click', () => {
        this.showQuickActionMenu();
      });
    }

    // Botón clima en header
    const weatherChip = document.getElementById('header-weather-chip');
    if (weatherChip) {
      weatherChip.addEventListener('click', () => {
        this.openWeatherModal();
      });
    }
  }

  // Cambio de Vista
  switchView(viewName) {
    this.currentView = viewName;
    this.searchTerm = '';
    this.filterCategory = 'todas';

    // Actualizar estados visuales de los botones de navegación
    document.querySelectorAll('[data-view-target]').forEach(b => {
      if (b.dataset.viewTarget === viewName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Cerrar menú móvil si está abierto
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('mobile-drawer-overlay');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      overlay?.classList.remove('active');
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Llenar selector de finca activa
  populateFarmSelector() {
    const select = document.getElementById('global-farm-select');
    if (!select) return;

    const currentFid = agroStore.getActiveFarmId();
    const fincas = agroStore.getFincas();

    let html = `<option value="todas" ${currentFid === 'todas' ? 'selected' : ''}>Todas las Fincas</option>`;
    fincas.forEach(f => {
      html += `<option value="${f.id}" ${currentFid === f.id ? 'selected' : ''}>${f.nombre} (${f.vereda})</option>`;
    });

    select.innerHTML = html;
  }

  // Actualizar badge de alertas
  updateAlertBadge() {
    const badge = document.getElementById('header-alert-badge');
    const sidebarBadge = document.getElementById('sidebar-alert-badge');
    const alertas = agroStore.getAlertas();
    const noLeidas = alertas.filter(a => !a.leida).length;

    if (badge) {
      if (noLeidas > 0) {
        badge.textContent = noLeidas > 9 ? '9+' : noLeidas;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (sidebarBadge) {
      if (noLeidas > 0) {
        sidebarBadge.textContent = noLeidas;
        sidebarBadge.style.display = 'inline-block';
      } else {
        sidebarBadge.style.display = 'none';
      }
    }
  }

  // Renderizar la vista actual
  renderCurrentView() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard(container);
        break;
      case 'fincas':
        this.renderFincas(container);
        break;
      case 'cultivos':
        this.renderCultivos(container);
        break;
      case 'cosechas':
        this.renderCosechas(container);
        break;
      case 'inventario':
        this.renderInventario(container);
        break;
      case 'finanzas':
        this.renderFinanzas(container);
        break;
      case 'calendario':
        this.renderCalendario(container);
        break;
      case 'alertas':
        this.renderAlertas(container);
        break;
      case 'configuracion':
        this.renderConfiguracion(container);
        break;
      default:
        this.renderDashboard(container);
    }
  }

  // =========================================================================
  // 1. DASHBOARD
  // =========================================================================
  renderDashboard(container) {
    const stats = agroStore.getStats();
    const activeFarmId = agroStore.getActiveFarmId();
    const activeFarm = activeFarmId !== 'todas' ? agroStore.getFinca(activeFarmId) : null;
    const moon = getMoonPhase();
    const finanzas = agroStore.getFinanzas();
    const lotes = agroStore.getLotes();
    const alertas = agroStore.getAlertas().slice(0, 3);
    const tareasProximas = agroStore.getCalendario()
      .filter(t => t.estado !== 'completada')
      .slice(0, 3);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Panel de Control Agrícola</h2>
          <p>
            ${activeFarm ? `Administrando: <strong>${activeFarm.nombre}</strong> (Vereda ${activeFarm.vereda})` : 'Visión integral de todas las fincas en Anserma, Caldas'}
          </p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-quick-cosecha">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Nueva Cosecha
          </button>
          <button class="btn btn-secondary" id="btn-quick-gasto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            Registrar Gasto / Ingreso
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas Clave (KPIs) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrapper">🌱</div>
          <div class="kpi-content">
            <div class="kpi-label">Hectáreas en Producción</div>
            <div class="kpi-value">${stats.hectareasTotal.toFixed(1)} Ha</div>
            <div class="kpi-subtext">${stats.fincasCount} Fincas • ${stats.lotesCount} Lotes</div>
          </div>
        </div>

        <div class="kpi-card amber">
          <div class="kpi-icon-wrapper">☕</div>
          <div class="kpi-content">
            <div class="kpi-label">Café Cosechado</div>
            <div class="kpi-value">${stats.cosechasCafeArrobas} @</div>
            <div class="kpi-subtext">Equivalente a ${(stats.cosechasCafeArrobas * 12.5).toLocaleString()} Kg CPS</div>
          </div>
        </div>

        <div class="kpi-card ${stats.balanceNeto >= 0 ? '' : 'red'}">
          <div class="kpi-icon-wrapper">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Balance Financiero Neto</div>
            <div class="kpi-value" style="font-size: 1.35rem; color: ${stats.balanceNeto >= 0 ? '#15803d' : '#dc2626'};">
              ${formatCOP(stats.balanceNeto)}
            </div>
            <div class="kpi-subtext">Ingresos: ${formatCOP(stats.totalIngresos)}</div>
          </div>
        </div>

        <div class="kpi-card ${stats.stockCriticoCount > 0 ? 'red' : 'blue'}">
          <div class="kpi-icon-wrapper">⚠️</div>
          <div class="kpi-content">
            <div class="kpi-label">Alertas y Tareas</div>
            <div class="kpi-value">${stats.alertasNoLeidas} / ${stats.tareasPendientes}</div>
            <div class="kpi-subtext">${stats.stockCriticoCount} insumos en stock crítico</div>
          </div>
        </div>
      </div>

      <!-- Grillas Principales -->
      <div class="dashboard-grid">
        <!-- Gráfica de Finanzas -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Flujo de Caja Mensual (COP)
            </h3>
            <button class="btn btn-outline btn-sm" id="btn-ver-todas-finanzas">Ver Detalle</button>
          </div>
          <div class="card-body">
            <div id="dashboard-financial-chart"></div>
          </div>
        </div>

        <!-- Clima y Recomendaciones de Anserma -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              Clima Agrícola de Anserma
            </h3>
            <button class="btn btn-outline btn-sm" id="btn-actualizar-clima">Actualizar</button>
          </div>
          <div class="card-body" id="dashboard-weather-widget">
            ${this.weatherData ? this.renderWeatherCardContent(this.weatherData, moon) : '<p style="color:#64748b;">Cargando estación climática de Anserma...</p>'}
          </div>
        </div>
      </div>

      <!-- Segunda Fila del Dashboard -->
      <div class="dashboard-grid">
        <!-- Distribución de Cultivos -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              Distribución de Cultivos por Hectárea
            </h3>
            <button class="btn btn-outline btn-sm" id="btn-ver-cultivos">Gestionar</button>
          </div>
          <div class="card-body">
            <div id="dashboard-crops-donut"></div>
          </div>
        </div>

        <!-- Alertas Activas y Próximas Labores -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Alertas y Próximas Labores
            </h3>
            <button class="btn btn-outline btn-sm" id="btn-ver-todas-alertas">Ver Todas</button>
          </div>
          <div class="card-body">
            <div class="agro-alerts-list">
              ${alertas.length > 0 ? alertas.map(a => `
                <div class="agro-alert-item ${a.nivel}">
                  <div class="agro-alert-icon">${a.nivel === 'danger' ? '🔴' : a.nivel === 'warning' ? '⚠️' : 'ℹ️'}</div>
                  <div class="agro-alert-content">
                    <div class="agro-alert-title">${a.titulo}</div>
                    <div class="agro-alert-desc">${a.mensaje}</div>
                    <div class="agro-alert-time">${formatDate(a.fecha)}</div>
                  </div>
                </div>
              `).join('') : '<p style="color:#64748b; font-size:0.88rem;">No hay alertas activas en este momento.</p>'}
            </div>

            <div style="margin-top: 1.25rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
              <h4 style="font-size: 0.88rem; font-weight: 700; color: #1e293b; margin-bottom: 0.65rem;">
                Labores programadas en el calendario:
              </h4>
              ${tareasProximas.length > 0 ? tareasProximas.map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.65rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.4rem; font-size: 0.82rem;">
                  <div>
                    <strong>${t.titulo}</strong>
                    <div style="color: #64748b; font-size: 0.74rem;">Fecha: ${formatDate(t.fechaProgramada)} • ${t.labor}</div>
                  </div>
                  <button class="btn btn-secondary btn-sm" data-action="toggle-task" data-id="${t.id}">
                    ${t.estado === 'pendiente' ? 'Iniciar' : 'Finalizar'}
                  </button>
                </div>
              `).join('') : '<p style="color:#64748b; font-size:0.8rem;">No hay labores pendientes para los próximos días.</p>'}
            </div>
          </div>
        </div>
      </div>
    `;

    // Renderizar gráficos nativos
    renderFinancialBarChart('dashboard-financial-chart', finanzas);
    renderCropsDonutChart('dashboard-crops-donut', lotes);

    // Eventos de botones rápidos del Dashboard
    document.getElementById('btn-quick-cosecha')?.addEventListener('click', () => this.openCosechaModal());
    document.getElementById('btn-quick-gasto')?.addEventListener('click', () => this.openFinanzaModal());
    document.getElementById('btn-ver-todas-finanzas')?.addEventListener('click', () => this.switchView('finanzas'));
    document.getElementById('btn-ver-cultivos')?.addEventListener('click', () => this.switchView('cultivos'));
    document.getElementById('btn-ver-todas-alertas')?.addEventListener('click', () => this.switchView('alertas'));
    document.getElementById('btn-actualizar-clima')?.addEventListener('click', () => {
      this.showToast('Actualizando pronóstico para Anserma...', 'info');
      this.loadWeather();
    });

    // Eventos de tareas en dashboard
    container.querySelectorAll('[data-action="toggle-task"]').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = b.dataset.id;
        agroStore.toggleLaborStatus(id);
        this.showToast('Estado de la labor actualizado', 'success');
      });
    });
  }

  // =========================================================================
  // 2. FINCAS Y LOTES
  // =========================================================================
  renderFincas(container) {
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Fincas y Lotes de Anserma</h2>
          <p>Administración predial, georreferenciación en veredas y caracterización de lotes</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-secondary" id="btn-nuevo-lote">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
            Nuevo Lote
          </button>
          <button class="btn btn-primary" id="btn-nueva-finca">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Nueva Finca
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="search-fincas-input" placeholder="Buscar finca por nombre, vereda o propietario..." value="${this.searchTerm}">
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        ${fincas.length === 0 ? `
          <div class="card" style="text-align: center; padding: 3rem;">
            <p style="color: #64748b; font-size: 1rem; margin-bottom: 1rem;">No hay fincas registradas aún.</p>
            <button class="btn btn-primary" id="btn-empty-finca">Registrar Primera Finca</button>
          </div>
        ` : fincas.filter(f => {
          if (!this.searchTerm) return true;
          const q = this.searchTerm.toLowerCase();
          return f.nombre.toLowerCase().includes(q) ||
                 f.vereda.toLowerCase().includes(q) ||
                 (f.propietario && f.propietario.toLowerCase().includes(q));
        }).map(f => {
          const lotesDeFinca = lotes.filter(l => l.fincaId === f.id);
          const areaCultivada = lotesDeFinca.reduce((a, b) => a + Number(b.area || 0), 0);

          return `
            <div class="card">
              <div class="card-header" style="background: #fafcfb;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.2rem;">
                    <h3 style="font-size: 1.25rem;">🏡 ${f.nombre}</h3>
                    <span class="badge badge-success">Vereda ${f.vereda}</span>
                    <span class="badge badge-neutral">${f.altitud || 1780} msnm</span>
                  </div>
                  <p style="font-size: 0.84rem; color: #64748b;">
                    Propietario: <strong>${f.propietario || 'No especificado'}</strong> • Teléfono: ${f.telefono || 'Sin teléfono'} • Área Total: <strong>${f.areaTotal} Ha</strong> (Cultivada: ${areaCultivada.toFixed(1)} Ha)
                  </p>
                </div>
                <div style="display: flex; gap: 0.45rem;">
                  <button class="btn btn-secondary btn-sm" data-action="edit-finca" data-id="${f.id}">Editar</button>
                  <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-finca" data-id="${f.id}">Eliminar</button>
                </div>
              </div>

              <div class="card-body">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                  <h4 style="font-size: 0.92rem; font-weight: 700; color: #166534;">
                    Lotes de ${f.nombre} (${lotesDeFinca.length})
                  </h4>
                  <button class="btn btn-secondary btn-sm" data-action="add-lote-to-finca" data-finca="${f.id}">
                    + Añadir Lote a esta Finca
                  </button>
                </div>

                ${lotesDeFinca.length === 0 ? `
                  <p style="font-size: 0.85rem; color: #94a3b8; font-style: italic;">Esta finca aún no tiene lotes definidos.</p>
                ` : `
                  <div class="table-responsive">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Nombre Lote</th>
                          <th>Área (Ha)</th>
                          <th>Cultivo Principal</th>
                          <th>Topografía</th>
                          <th>Tipo de Suelo</th>
                          <th>Estado</th>
                          <th style="text-align: right;">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${lotesDeFinca.map(l => `
                          <tr>
                            <td><strong>${l.nombre}</strong></td>
                            <td>${l.area} Ha</td>
                            <td><span class="badge badge-info">${l.cultivoPrincipal || 'Sin sembrar'}</span></td>
                            <td>${l.topografia || 'Media'}</td>
                            <td>${l.tipoSuelo || 'Franco'}</td>
                            <td>
                              <span class="badge ${l.estado === 'Productivo' ? 'badge-success' : 'badge-warning'}">
                                ${l.estado}
                              </span>
                            </td>
                            <td style="text-align: right;">
                              <button class="btn btn-outline btn-sm" data-action="edit-lote" data-id="${l.id}">Editar</button>
                              <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-lote" data-id="${l.id}">Eliminar</button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Eventos
    document.getElementById('btn-nueva-finca')?.addEventListener('click', () => this.openFincaModal());
    document.getElementById('btn-empty-finca')?.addEventListener('click', () => this.openFincaModal());
    document.getElementById('btn-nuevo-lote')?.addEventListener('click', () => this.openLoteModal());

    const searchInput = document.getElementById('search-fincas-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.renderFincas(container);
    });

    container.querySelectorAll('[data-action="edit-finca"]').forEach(b => {
      b.addEventListener('click', () => this.openFincaModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-finca"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Está seguro de eliminar esta finca y todos sus lotes asociados?')) {
          agroStore.deleteFinca(b.dataset.id);
          this.showToast('Finca eliminada correctamente', 'info');
        }
      });
    });

    container.querySelectorAll('[data-action="add-lote-to-finca"]').forEach(b => {
      b.addEventListener('click', () => this.openLoteModal(null, b.dataset.finca));
    });

    container.querySelectorAll('[data-action="edit-lote"]').forEach(b => {
      b.addEventListener('click', () => this.openLoteModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-lote"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Eliminar este lote?')) {
          agroStore.deleteLote(b.dataset.id);
          this.showToast('Lote eliminado', 'info');
        }
      });
    });
  }

  // =========================================================================
  // 3. SIEMBRAS Y CULTIVOS
  // =========================================================================
  renderCultivos(container) {
    const activeFarmId = agroStore.getActiveFarmId();
    const cultivos = agroStore.getCultivos(activeFarmId);
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Registro de Cultivos y Siembras</h2>
          <p>Control de variedades, densidad de siembra, estado fenológico y ciclos de producción</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-nuevo-cultivo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Registrar Nueva Siembra
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="search-cultivos-input" placeholder="Buscar por cultivo, variedad o lote..." value="${this.searchTerm}">
        </div>
      </div>

      ${cultivos.length === 0 ? `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: #64748b; margin-bottom: 1rem;">No hay registros de cultivos para la finca seleccionada.</p>
          <button class="btn btn-primary" id="btn-empty-cultivo">Registrar Primera Siembra</button>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cultivo / Variedad</th>
                <th>Finca y Lote</th>
                <th>Fecha Siembra</th>
                <th>Plantas Sembradas</th>
                <th>Densidad (Pl/Ha)</th>
                <th>Estado Fenológico</th>
                <th>Cosecha Estimada</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${cultivos.filter(c => {
                if (!this.searchTerm) return true;
                const q = this.searchTerm.toLowerCase();
                const f = fincas.find(x => x.id === c.fincaId);
                const l = lotes.find(x => x.id === c.loteId);
                return c.tipo.toLowerCase().includes(q) ||
                       c.variedad.toLowerCase().includes(q) ||
                       (f && f.nombre.toLowerCase().includes(q)) ||
                       (l && l.nombre.toLowerCase().includes(q));
              }).map(c => {
                const finca = fincas.find(f => f.id === c.fincaId);
                const lote = lotes.find(l => l.id === c.loteId);
                return `
                  <tr>
                    <td>
                      <strong>${c.tipo}</strong>
                      <div style="font-size: 0.78rem; color: #15803d; font-weight: 600;">${c.variedad}</div>
                    </td>
                    <td>
                      <div>${finca ? finca.nombre : 'N/A'}</div>
                      <div style="font-size: 0.75rem; color: #64748b;">${lote ? lote.nombre : 'Lote General'}</div>
                    </td>
                    <td>${formatDate(c.fechaSiembra)}</td>
                    <td><strong>${Number(c.plantasSembradas || 0).toLocaleString()}</strong></td>
                    <td>${c.densidad ? c.densidad.toLocaleString() + ' pl/Ha' : 'N/A'}</td>
                    <td>
                      <span class="badge ${c.estado === 'Producción activa' ? 'badge-success' : 'badge-warning'}">
                        ${c.estado}
                      </span>
                    </td>
                    <td><span style="font-size: 0.8rem; color: #334155;">${c.estimadoCosecha || 'Por determinar'}</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm" data-action="edit-cultivo" data-id="${c.id}">Editar</button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-cultivo" data-id="${c.id}">Eliminar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    document.getElementById('btn-nuevo-cultivo')?.addEventListener('click', () => this.openCultivoModal());
    document.getElementById('btn-empty-cultivo')?.addEventListener('click', () => this.openCultivoModal());

    const searchInput = document.getElementById('search-cultivos-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.renderCultivos(container);
    });

    container.querySelectorAll('[data-action="edit-cultivo"]').forEach(b => {
      b.addEventListener('click', () => this.openCultivoModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-cultivo"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Eliminar este registro de siembra?')) {
          agroStore.deleteCultivo(b.dataset.id);
          this.showToast('Siembra eliminada', 'info');
        }
      });
    });
  }

  // =========================================================================
  // 4. COSECHAS
  // =========================================================================
  renderCosechas(container) {
    const activeFarmId = agroStore.getActiveFarmId();
    const cosechas = agroStore.getCosechas(activeFarmId);
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    // Cálculos de resumen
    const totalArrobas = cosechas
      .filter(c => c.unidad.includes('@') || c.unidad.includes('Arroba'))
      .reduce((a, b) => a + Number(b.cantidad || 0), 0);

    const totalKilos = cosechas
      .filter(c => c.unidad.includes('Kg'))
      .reduce((a, b) => a + Number(b.cantidad || 0), 0);

    const totalVentas = cosechas.reduce((a, b) => a + Number(b.precioVentaTotal || 0), 0);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Registro de Cosechas y Rendimientos</h2>
          <p>Control de recolección de café en arrobas (@), plátano, aguacate y ventas en Anserma</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-outline" id="btn-export-cosechas-csv">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
          <button class="btn btn-primary" id="btn-nueva-cosecha">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Registrar Cosecha
          </button>
        </div>
      </div>

      <!-- Resumen de Cosechas -->
      <div class="kpi-grid">
        <div class="kpi-card amber">
          <div class="kpi-icon-wrapper">☕</div>
          <div class="kpi-content">
            <div class="kpi-label">Café Pergamino Recolectado</div>
            <div class="kpi-value">${totalArrobas.toLocaleString()} @</div>
            <div class="kpi-subtext">Equivalente a ${(totalArrobas * 12.5).toLocaleString()} Kg CPS</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrapper">🍌</div>
          <div class="kpi-content">
            <div class="kpi-label">Frutales y Plátano</div>
            <div class="kpi-value">${totalKilos.toLocaleString()} Kg</div>
            <div class="kpi-subtext">Producción para abastos y comercio local</div>
          </div>
        </div>

        <div class="kpi-card blue">
          <div class="kpi-icon-wrapper">💵</div>
          <div class="kpi-content">
            <div class="kpi-label">Ingreso Bruto de Cosechas</div>
            <div class="kpi-value">${formatCOP(totalVentas)}</div>
            <div class="kpi-subtext">${cosechas.length} entregas liquidadas</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="search-cosechas-input" placeholder="Buscar cosecha por comprador, calidad o lote..." value="${this.searchTerm}">
        </div>
      </div>

      ${cosechas.length === 0 ? `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: #64748b; margin-bottom: 1rem;">No hay registros de cosechas en esta selección.</p>
          <button class="btn btn-primary" id="btn-empty-cosecha">Registrar Primera Cosecha</button>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Finca / Lote</th>
                <th>Cantidad Recolectada</th>
                <th>Calidad / Clasificación</th>
                <th>Precio Unitario</th>
                <th>Total Liquidado</th>
                <th>Comprador / Destino</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${cosechas.filter(c => {
                if (!this.searchTerm) return true;
                const q = this.searchTerm.toLowerCase();
                return (c.comprador && c.comprador.toLowerCase().includes(q)) ||
                       (c.calidad && c.calidad.toLowerCase().includes(q)) ||
                       (c.notas && c.notas.toLowerCase().includes(q));
              }).map(c => {
                const finca = fincas.find(f => f.id === c.fincaId);
                const lote = lotes.find(l => l.id === c.loteId);
                return `
                  <tr>
                    <td><strong>${formatDate(c.fecha)}</strong></td>
                    <td>
                      <div>${finca ? finca.nombre : 'N/A'}</div>
                      <div style="font-size: 0.74rem; color: #64748b;">${lote ? lote.nombre : 'Lote'}</div>
                    </td>
                    <td>
                      <span style="font-size: 1rem; font-weight: 700; color: #166534;">
                        ${c.cantidad} ${c.unidad}
                      </span>
                    </td>
                    <td><span class="badge badge-info">${c.calidad || 'Estándar'}</span></td>
                    <td>${formatCOP(c.precioUnitario)}</td>
                    <td><strong style="color: #15803d;">${formatCOP(c.precioVentaTotal)}</strong></td>
                    <td><span style="font-size: 0.82rem;">${c.comprador || 'Comercio local'}</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm" data-action="edit-cosecha" data-id="${c.id}">Editar</button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-cosecha" data-id="${c.id}">Eliminar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    document.getElementById('btn-nueva-cosecha')?.addEventListener('click', () => this.openCosechaModal());
    document.getElementById('btn-empty-cosecha')?.addEventListener('click', () => this.openCosechaModal());
    document.getElementById('btn-export-cosechas-csv')?.addEventListener('click', () => {
      agroStore.exportModuleToCSV('cosechas');
      this.showToast('Archivo CSV de cosechas descargado', 'success');
    });

    const searchInput = document.getElementById('search-cosechas-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.renderCosechas(container);
    });

    container.querySelectorAll('[data-action="edit-cosecha"]').forEach(b => {
      b.addEventListener('click', () => this.openCosechaModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-cosecha"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Eliminar este registro de cosecha?')) {
          agroStore.deleteCosecha(b.dataset.id);
          this.showToast('Cosecha eliminada', 'info');
        }
      });
    });
  }

  // =========================================================================
  // 5. INVENTARIO DE INSUMOS
  // =========================================================================
  renderInventario(container) {
    const activeFarmId = agroStore.getActiveFarmId();
    const inventario = agroStore.getInventario(activeFarmId);
    const fincas = agroStore.getFincas();

    const stockCritico = inventario.filter(i => Number(i.stockActual) <= Number(i.stockMinimo));
    const valorTotalBodega = inventario.reduce((a, b) => a + (Number(b.stockActual || 0) * Number(b.costoUnitario || 0)), 0);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Inventario de Insumos y Herramientas</h2>
          <p>Control de existencias de fertilizantes, agroquímicos, empaques y herramientas</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-secondary" id="btn-movimiento-stock">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            Entrada / Salida de Stock
          </button>
          <button class="btn btn-primary" id="btn-nuevo-insumo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo Insumo
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrapper">📦</div>
          <div class="kpi-content">
            <div class="kpi-label">Insumos Registrados</div>
            <div class="kpi-value">${inventario.length}</div>
            <div class="kpi-subtext">En bodega de la finca</div>
          </div>
        </div>

        <div class="kpi-card ${stockCritico.length > 0 ? 'red' : ''}">
          <div class="kpi-icon-wrapper">⚠️</div>
          <div class="kpi-content">
            <div class="kpi-label">Stock en Nivel Crítico</div>
            <div class="kpi-value" style="color: ${stockCritico.length > 0 ? '#dc2626' : '#15803d'};">
              ${stockCritico.length}
            </div>
            <div class="kpi-subtext">Por debajo del mínimo</div>
          </div>
        </div>

        <div class="kpi-card blue">
          <div class="kpi-icon-wrapper">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Valor en Bodega (COP)</div>
            <div class="kpi-value">${formatCOP(valorTotalBodega)}</div>
            <div class="kpi-subtext">Costo total inventariado</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="search-inv-input" placeholder="Buscar por insumo, categoría o bodega..." value="${this.searchTerm}">
        </div>
        <select class="filter-select" id="filter-inv-category">
          <option value="todas">Todas las Categorías</option>
          <option value="Fertilizante edáfico">Fertilizantes Edáficos</option>
          <option value="Fertilizante foliar">Fertilizantes Foliares</option>
          <option value="Plaguicida / Fungicida">Plaguicidas / Fungicidas</option>
          <option value="Herramienta">Herramientas / Maquinaria</option>
          <option value="Empaques">Empaques / Costales</option>
        </select>
      </div>

      ${inventario.length === 0 ? `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: #64748b; margin-bottom: 1rem;">No hay insumos registrados en inventario.</p>
          <button class="btn btn-primary" id="btn-empty-inv">Añadir Primer Insumo</button>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Costo Unitario</th>
                <th>Valor Total</th>
                <th>Ubicación / Bodega</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${inventario.filter(i => {
                if (this.filterCategory !== 'todas' && !i.categoria.includes(this.filterCategory)) return false;
                if (!this.searchTerm) return true;
                const q = this.searchTerm.toLowerCase();
                return i.nombre.toLowerCase().includes(q) ||
                       i.categoria.toLowerCase().includes(q) ||
                       (i.ubicacionBodega && i.ubicacionBodega.toLowerCase().includes(q));
              }).map(i => {
                const esBajo = Number(i.stockActual) <= Number(i.stockMinimo);
                const valorItem = Number(i.stockActual || 0) * Number(i.costoUnitario || 0);

                return `
                  <tr style="${esBajo ? 'background-color: #fffaf0;' : ''}">
                    <td>
                      <strong>${i.nombre}</strong>
                    </td>
                    <td><span class="badge badge-neutral">${i.categoria}</span></td>
                    <td>
                      <span style="font-size: 1.05rem; font-weight: 700; color: ${esBajo ? '#dc2626' : '#1e293b'};">
                        ${i.stockActual} ${i.unidad}
                      </span>
                    </td>
                    <td>${i.stockMinimo} ${i.unidad}</td>
                    <td>
                      <span class="badge ${esBajo ? 'badge-danger' : 'badge-success'}">
                        ${esBajo ? 'Stock Bajo' : 'Adecuado'}
                      </span>
                    </td>
                    <td>${formatCOP(i.costoUnitario)}</td>
                    <td><strong>${formatCOP(valorItem)}</strong></td>
                    <td><span style="font-size: 0.8rem; color: #64748b;">${i.ubicacionBodega || 'Bodega General'}</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm" data-action="quick-stock-mov" data-id="${i.id}">Movimiento</button>
                      <button class="btn btn-outline btn-sm" data-action="edit-inv" data-id="${i.id}">Editar</button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-inv" data-id="${i.id}">Eliminar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    document.getElementById('btn-nuevo-insumo')?.addEventListener('click', () => this.openInventarioModal());
    document.getElementById('btn-empty-inv')?.addEventListener('click', () => this.openInventarioModal());
    document.getElementById('btn-movimiento-stock')?.addEventListener('click', () => this.openStockMovementModal());

    const searchInput = document.getElementById('search-inv-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.renderInventario(container);
    });

    const categorySelect = document.getElementById('filter-inv-category');
    if (categorySelect) {
      categorySelect.value = this.filterCategory;
      categorySelect.addEventListener('change', (e) => {
        this.filterCategory = e.target.value;
        this.renderInventario(container);
      });
    }

    container.querySelectorAll('[data-action="quick-stock-mov"]').forEach(b => {
      b.addEventListener('click', () => this.openStockMovementModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="edit-inv"]').forEach(b => {
      b.addEventListener('click', () => this.openInventarioModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-inv"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Eliminar este insumo del inventario?')) {
          agroStore.deleteInventario(b.dataset.id);
          this.showToast('Insumo eliminado', 'info');
        }
      });
    });
  }

  // =========================================================================
  // 6. GASTOS E INGRESOS (FINANZAS)
  // =========================================================================
  renderFinanzas(container) {
    const activeFarmId = agroStore.getActiveFarmId();
    const finanzas = agroStore.getFinanzas(activeFarmId);
    const fincas = agroStore.getFincas();

    const totalIngresos = finanzas
      .filter(f => f.tipo === 'ingreso')
      .reduce((a, b) => a + Number(b.monto || 0), 0);

    const totalGastos = finanzas
      .filter(f => f.tipo === 'gasto')
      .reduce((a, b) => a + Number(b.monto || 0), 0);

    const utilidadNeta = totalIngresos - totalGastos;
    const margen = totalIngresos > 0 ? ((utilidadNeta / totalIngresos) * 100).toFixed(1) : 0;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Finanzas Agrícolas: Gastos e Ingresos</h2>
          <p>Control de flujos de caja, mano de obra (jornales), insumos y rentabilidad en Anserma</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-outline" id="btn-export-finanzas-csv">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
          <button class="btn btn-primary" id="btn-nueva-transaccion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Registrar Movimiento
          </button>
        </div>
      </div>

      <!-- Resumen Financiero -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrapper">📈</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Ingresos</div>
            <div class="kpi-value" style="color: #15803d;">${formatCOP(totalIngresos)}</div>
            <div class="kpi-subtext">Por venta de cosechas y derivados</div>
          </div>
        </div>

        <div class="kpi-card red">
          <div class="kpi-icon-wrapper">📉</div>
          <div class="kpi-content">
            <div class="kpi-label">Total Gastos Operativos</div>
            <div class="kpi-value" style="color: #dc2626;">${formatCOP(totalGastos)}</div>
            <div class="kpi-subtext">Jornales, insumos, fletes y mantenimiento</div>
          </div>
        </div>

        <div class="kpi-card ${utilidadNeta >= 0 ? 'blue' : 'red'}">
          <div class="kpi-icon-wrapper">💵</div>
          <div class="kpi-content">
            <div class="kpi-label">Utilidad Neta del Ejercicio</div>
            <div class="kpi-value" style="color: ${utilidadNeta >= 0 ? '#15803d' : '#dc2626'};">
              ${formatCOP(utilidadNeta)}
            </div>
            <div class="kpi-subtext">Margen de ganancia: ${margen}%</div>
          </div>
        </div>
      </div>

      <!-- Gráfico de balance mensual -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Balance Mensual Comparativo (Últimos 6 Meses)
          </h3>
        </div>
        <div class="card-body">
          <div id="finanzas-bar-chart"></div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filter-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="search-fin-input" placeholder="Buscar por concepto, categoría o comprobante..." value="${this.searchTerm}">
        </div>
        <select class="filter-select" id="filter-fin-tipo">
          <option value="todas">Todos los Movimientos</option>
          <option value="ingreso">Solo Ingresos</option>
          <option value="gasto">Solo Gastos</option>
        </select>
      </div>

      ${finanzas.length === 0 ? `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: #64748b; margin-bottom: 1rem;">No hay movimientos financieros registrados.</p>
          <button class="btn btn-primary" id="btn-empty-fin">Registrar Primer Movimiento</button>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción / Concepto</th>
                <th>Finca</th>
                <th>Comprobante</th>
                <th>Monto</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${finanzas.filter(f => {
                if (this.filterCategory !== 'todas' && f.tipo !== this.filterCategory) return false;
                if (!this.searchTerm) return true;
                const q = this.searchTerm.toLowerCase();
                return f.descripcion.toLowerCase().includes(q) ||
                       f.categoria.toLowerCase().includes(q) ||
                       (f.comprobante && f.comprobante.toLowerCase().includes(q));
              }).map(f => {
                const finca = fincas.find(x => x.id === f.fincaId);
                const isIngreso = f.tipo === 'ingreso';

                return `
                  <tr>
                    <td><strong>${formatDate(f.fecha)}</strong></td>
                    <td>
                      <span class="badge ${isIngreso ? 'badge-success' : 'badge-danger'}">
                        ${isIngreso ? 'INGRESO' : 'GASTO'}
                      </span>
                    </td>
                    <td><strong>${f.categoria}</strong></td>
                    <td>${f.descripcion}</td>
                    <td><span style="font-size: 0.8rem; color: #64748b;">${finca ? finca.nombre : 'General'}</span></td>
                    <td><span style="font-size: 0.76rem; font-family: monospace;">${f.comprobante || '-'}</span></td>
                    <td>
                      <strong style="font-size: 0.95rem; color: ${isIngreso ? '#15803d' : '#dc2626'};">
                        ${isIngreso ? '+' : '-'} ${formatCOP(f.monto)}
                      </strong>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-outline btn-sm" data-action="edit-fin" data-id="${f.id}">Editar</button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-fin" data-id="${f.id}">Eliminar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    // Renderizar gráfica de finanzas
    renderFinancialBarChart('finanzas-bar-chart', finanzas);

    document.getElementById('btn-nueva-transaccion')?.addEventListener('click', () => this.openFinanzaModal());
    document.getElementById('btn-empty-fin')?.addEventListener('click', () => this.openFinanzaModal());
    document.getElementById('btn-export-finanzas-csv')?.addEventListener('click', () => {
      agroStore.exportModuleToCSV('finanzas');
      this.showToast('Archivo CSV de finanzas descargado', 'success');
    });

    const searchInput = document.getElementById('search-fin-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.renderFinanzas(container);
    });

    const typeSelect = document.getElementById('filter-fin-tipo');
    if (typeSelect) {
      typeSelect.value = this.filterCategory;
      typeSelect.addEventListener('change', (e) => {
        this.filterCategory = e.target.value;
        this.renderFinanzas(container);
      });
    }

    container.querySelectorAll('[data-action="edit-fin"]').forEach(b => {
      b.addEventListener('click', () => this.openFinanzaModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-fin"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Eliminar esta transacción financiera?')) {
          agroStore.deleteFinanza(b.dataset.id);
          this.showToast('Transacción eliminada', 'info');
        }
      });
    });
  }

  // =========================================================================
  // 7. CALENDARIO AGRÍCOLA Y PLANIFICADOR DE LABORES
  // =========================================================================
  renderCalendario(container) {
    const activeFarmId = agroStore.getActiveFarmId();
    const labores = agroStore.getCalendario(activeFarmId);
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    // Construcción de días del mes actual para la cuadrícula
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 a 11
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Días de la semana en español empezando por Lunes
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Ajustar a Lunes como primer día

    let calendarCellsHtml = '';

    // Celdas vacías del mes anterior
    for (let i = 0; i < offset; i++) {
      calendarCellsHtml += `<div class="calendar-day-cell other-month"></div>`;
    }

    // Celdas del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

      // Labores de este día
      const laboresDia = labores.filter(l => l.fechaProgramada === dateString);

      calendarCellsHtml += `
        <div class="calendar-day-cell ${isToday ? 'today' : ''}" data-day="${dateString}">
          <span class="day-number">${day}</span>
          <div class="calendar-events-list">
            ${laboresDia.map(l => {
              let colorClass = 'cal-event-fertilizacion';
              if (l.labor.includes('Fumig')) colorClass = 'cal-event-fumigacion';
              else if (l.labor.includes('Deshierbe') || l.labor.includes('Plateo')) colorClass = 'cal-event-deshierbe';
              else if (l.labor.includes('Cosecha')) colorClass = 'cal-event-cosecha';
              else if (l.labor.includes('Siembra')) colorClass = 'cal-event-siembra';
              else if (l.labor.includes('Poda')) colorClass = 'cal-event-poda';

              return `
                <div class="cal-event-pill ${colorClass}" title="${l.titulo} - ${l.labor} (${l.responsable || ''})" data-action="edit-labor" data-id="${l.id}">
                  ${l.titulo}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Calendario Agrícola y Planificador de Labores</h2>
          <p>Programación de fertilizaciones, deshierbes, podas, fitosanitarios y cosechas en Anserma</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-nueva-labor">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Programar Nueva Labor
          </button>
        </div>
      </div>

      <!-- Cuadrícula de Calendario Mensual -->
      <div class="calendar-wrapper" style="margin-bottom: 2rem;">
        <div class="calendar-header-bar">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #166534;">
            📅 ${monthNames[currentMonth]} ${currentYear}
          </h3>
          <span class="badge badge-success">Zona Cafetera de Caldas</span>
        </div>

        <div class="calendar-grid-header">
          ${daysOfWeek.map(d => `<div>${d}</div>`).join('')}
        </div>

        <div class="calendar-days-grid">
          ${calendarCellsHtml}
        </div>
      </div>

      <!-- Listado de Labores Programadas -->
      <div class="card">
        <div class="card-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Listado de Actividades y Tareas Agrícolas
          </h3>
          <span class="badge badge-info">${labores.length} labores programadas</span>
        </div>
        <div class="card-body">
          ${labores.length === 0 ? `
            <p style="color: #64748b; text-align: center; padding: 2rem;">No hay labores programadas en este momento.</p>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Fecha Programada</th>
                    <th>Labor / Título</th>
                    <th>Finca y Lote</th>
                    <th>Responsable</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th style="text-align: right;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${labores.map(l => {
                    const finca = fincas.find(f => f.id === l.fincaId);
                    const lote = lotes.find(x => x.id === l.loteId);

                    return `
                      <tr>
                        <td><strong>${formatDate(l.fechaProgramada)}</strong></td>
                        <td>
                          <div style="font-weight: 700;">${l.titulo}</div>
                          <div style="font-size: 0.75rem; color: #15803d;">${l.labor}</div>
                        </td>
                        <td>
                          <div>${finca ? finca.nombre : 'General'}</div>
                          <div style="font-size: 0.74rem; color: #64748b;">${lote ? lote.nombre : 'Todo el predio'}</div>
                        </td>
                        <td>${l.responsable || 'Sin asignar'}</td>
                        <td>
                          <span class="badge ${l.prioridad === 'Alta' ? 'badge-danger' : l.prioridad === 'Media' ? 'badge-warning' : 'badge-neutral'}">
                            ${l.prioridad}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm ${l.estado === 'completada' ? 'btn-secondary' : 'btn-outline'}" data-action="toggle-status" data-id="${l.id}">
                            ${l.estado === 'completada' ? '✅ Completada' : l.estado === 'en_progreso' ? '⏳ En curso' : '⏹ Pendiente'}
                          </button>
                        </td>
                        <td style="text-align: right;">
                          <button class="btn btn-outline btn-sm" data-action="edit-labor" data-id="${l.id}">Editar</button>
                          <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="delete-labor" data-id="${l.id}">Eliminar</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    document.getElementById('btn-nueva-labor')?.addEventListener('click', () => this.openLaborModal());

    container.querySelectorAll('[data-action="toggle-status"]').forEach(b => {
      b.addEventListener('click', () => {
        agroStore.toggleLaborStatus(b.dataset.id);
        this.showToast('Estado de la labor actualizado', 'success');
      });
    });

    container.querySelectorAll('[data-action="edit-labor"]').forEach(b => {
      b.addEventListener('click', () => this.openLaborModal(b.dataset.id));
    });

    container.querySelectorAll('[data-action="delete-labor"]').forEach(b => {
      b.addEventListener('click', () => {
        if (confirm('¿Eliminar esta labor del calendario?')) {
          agroStore.deleteLabor(b.dataset.id);
          this.showToast('Labor eliminada', 'info');
        }
      });
    });
  }

  // =========================================================================
  // 8. ALERTAS Y ASISTENTE FITOCLIMÁTICO
  // =========================================================================
  renderAlertas(container) {
    const activeFarmId = agroStore.getActiveFarmId();
    const alertas = agroStore.getAlertas(activeFarmId);
    const recomendaciones = RECOMENDACIONES_CALDAS;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Centro de Alertas y Asistente Fitosanitario</h2>
          <p>Avisos preventivos de inventario, labores vencidas y recomendaciones técnicas para Anserma</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-nueva-alerta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            Crear Alerta Personalizada
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Lista de Alertas -->
        <div>
          <div class="card">
            <div class="card-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Alertas Activas del Sistema (${alertas.length})
              </h3>
            </div>
            <div class="card-body">
              ${alertas.length === 0 ? `
                <p style="color: #64748b; text-align: center; padding: 2.5rem;">
                  🎉 ¡No hay alertas pendientes! Todo el sistema se encuentra al día.
                </p>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                  ${alertas.map(a => `
                    <div class="agro-alert-item ${a.nivel}" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem;">
                      <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
                        <span style="font-size: 1.4rem;">${a.nivel === 'danger' ? '🔴' : a.nivel === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <div>
                          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.2rem;">${a.titulo}</h4>
                          <p style="font-size: 0.84rem; line-height: 1.4;">${a.mensaje}</p>
                          <div style="font-size: 0.72rem; opacity: 0.8; margin-top: 0.4rem;">Fecha: ${formatDate(a.fecha)}</div>
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.4rem;">
                        ${!a.leida ? `
                          <button class="btn btn-secondary btn-sm" data-action="read-alert" data-id="${a.id}">
                            Leída
                          </button>
                        ` : ''}
                        <button class="btn btn-outline btn-sm" style="color: #dc2626;" data-action="dismiss-alert" data-id="${a.id}">
                          Descartar
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Guía Técnica y Calendario Fitosanitario Cenicafé / Caldas -->
        <div>
          <div class="card">
            <div class="card-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                Guía Agronómica de Temporada (Anserma)
              </h3>
            </div>
            <div class="card-body">
              ${recomendaciones.map(r => `
                <div style="margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
                  <h4 style="font-size: 0.95rem; font-weight: 800; color: #166534; margin-bottom: 0.25rem;">
                    ${r.titulo}
                  </h4>
                  <div style="font-size: 0.76rem; font-weight: 600; color: #d97706; margin-bottom: 0.5rem;">
                    ${r.temporada}
                  </div>
                  <ul style="padding-left: 1.2rem; font-size: 0.82rem; color: #334155; line-height: 1.5;">
                    ${r.practicas.map(p => `<li style="margin-bottom: 0.35rem;">${p}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-nueva-alerta')?.addEventListener('click', () => this.openAlertaModal());

    container.querySelectorAll('[data-action="read-alert"]').forEach(b => {
      b.addEventListener('click', () => {
        agroStore.markAlertRead(b.dataset.id);
        this.showToast('Alerta marcada como atendida', 'info');
      });
    });

    container.querySelectorAll('[data-action="dismiss-alert"]').forEach(b => {
      b.addEventListener('click', () => {
        agroStore.dismissAlert(b.dataset.id);
        this.showToast('Alerta descartada', 'info');
      });
    });
  }

  // =========================================================================
  // 9. CONFIGURACIÓN Y RESPALDO
  // =========================================================================
  renderConfiguracion(container) {
    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h2>Configuración y Copia de Respaldo</h2>
          <p>Exportación de seguridad en JSON, exportación a Excel y parámetros del sistema</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Copias de Seguridad (Backup)
            </h3>
          </div>
          <div class="card-body">
            <p style="font-size: 0.88rem; color: #475569; margin-bottom: 1.25rem;">
              Sus datos se guardan de forma persistente en su navegador. Puede descargar una copia de seguridad completa para resguardar la información de sus fincas o transferirla a otro equipo.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <button class="btn btn-primary" id="btn-backup-download">
                📥 Descargar Copia de Seguridad (.json)
              </button>

              <div style="margin-top: 0.5rem;">
                <label class="form-label">Restaurar Copia de Seguridad:</label>
                <input type="file" id="input-backup-file" accept=".json" class="form-control">
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Mantenimiento y Demostración
            </h3>
          </div>
          <div class="card-body">
            <p style="font-size: 0.88rem; color: #475569; margin-bottom: 1.25rem;">
              Restablecer los datos modelo de las fincas de demostración en Anserma Caldas o limpiar todos los registros.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <button class="btn btn-secondary" id="btn-reset-demo">
                🔄 Cargar Fincas Modelo de Anserma, Caldas
              </button>
              <button class="btn btn-outline" style="color: #dc2626; border-color: #fca5a5;" id="btn-clear-all">
                🗑️ Borrar Todos los Registros
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-backup-download')?.addEventListener('click', () => {
      agroStore.exportDataJSON();
      this.showToast('Copia de seguridad descargada', 'success');
    });

    const fileInput = document.getElementById('input-backup-file');
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const res = agroStore.importDataJSON(event.target.result);
        if (res.success) {
          this.showToast('Datos restaurados correctamente', 'success');
        } else {
          this.showToast('Error al importar: ' + res.error, 'error');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('¿Restablecer datos modelo de demostración en Anserma Caldas?')) {
        agroStore.resetToDemo();
        this.showToast('Datos de Anserma restablecidos', 'success');
      }
    });

    document.getElementById('btn-clear-all')?.addEventListener('click', () => {
      if (confirm('¡ATENCIÓN! Esto eliminará todas las fincas, cosechas y finanzas. ¿Desea continuar?')) {
        agroStore.clearAll();
        this.showToast('Todos los datos han sido eliminados', 'info');
      }
    });
  }

  // =========================================================================
  // SISTEMA DE MODALES Y FORMULARIOS
  // =========================================================================

  openModal(title, bodyHtml, onSave) {
    const modal = document.getElementById('global-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const saveBtn = document.getElementById('modal-save-btn');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    if (!modal) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modal.classList.add('active');

    const closeModal = () => {
      modal.classList.remove('active');
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    saveBtn.onclick = () => {
      if (onSave()) {
        closeModal();
      }
    };
  }

  // 1. Modal Finca
  openFincaModal(fincaId = null) {
    const finca = fincaId ? agroStore.getFinca(fincaId) : null;
    const isEdit = !!finca;

    const bodyHtml = `
      <form id="form-finca">
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Nombre de la Finca / Predio *</label>
            <input type="text" id="finca-nombre" class="form-control" placeholder="Ej: Finca La Esmeralda" value="${finca?.nombre || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Vereda de Anserma, Caldas *</label>
            <select id="finca-vereda" class="form-control" required>
              ${VEREDAS_ANSERMA.map(v => `
                <option value="${v}" ${finca?.vereda === v ? 'selected' : ''}>${v}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Área Total (Hectáreas) *</label>
            <input type="number" step="0.1" id="finca-area" class="form-control" placeholder="Ej: 8.5" value="${finca?.areaTotal || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Nombre del Propietario / Administrador</label>
            <input type="text" id="finca-propietario" class="form-control" placeholder="Ej: Don Gonzalo Ramírez" value="${finca?.propietario || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono de Contacto</label>
            <input type="text" id="finca-telefono" class="form-control" placeholder="Ej: 312 458 9210" value="${finca?.telefono || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Altitud (m.s.n.m.)</label>
            <input type="number" id="finca-altitud" class="form-control" placeholder="1780" value="${finca?.altitud || 1780}">
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Notas o Descripción del Predio</label>
            <textarea id="finca-notas" class="form-control" placeholder="Detalles de topografía, acceso, fuentes hídricas...">${finca?.notas || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Finca' : 'Nueva Finca en Anserma', bodyHtml, () => {
      const nombre = document.getElementById('finca-nombre').value.trim();
      const vereda = document.getElementById('finca-vereda').value;
      const areaTotal = parseFloat(document.getElementById('finca-area').value);
      const propietario = document.getElementById('finca-propietario').value.trim();
      const telefono = document.getElementById('finca-telefono').value.trim();
      const altitud = parseInt(document.getElementById('finca-altitud').value, 10) || 1780;
      const notas = document.getElementById('finca-notas').value.trim();

      if (!nombre || isNaN(areaTotal) || areaTotal <= 0) {
        alert('Por favor ingrese un nombre y área válidos.');
        return false;
      }

      agroStore.saveFinca({
        id: finca?.id,
        nombre,
        vereda,
        areaTotal,
        propietario,
        telefono,
        altitud,
        notas
      });

      this.showToast(isEdit ? 'Finca actualizada con éxito' : 'Nueva finca registrada en Anserma', 'success');
      return true;
    });
  }

  // 2. Modal Lote
  openLoteModal(loteId = null, preselectedFincaId = null) {
    const lote = loteId ? agroStore.getLote(loteId) : null;
    const isEdit = !!lote;
    const fincas = agroStore.getFincas();

    if (fincas.length === 0) {
      alert('Debe crear primero al menos una finca antes de agregar lotes.');
      return;
    }

    const defaultFincaId = lote?.fincaId || preselectedFincaId || agroStore.getActiveFarmId();

    const bodyHtml = `
      <form id="form-lote">
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Finca a la que pertenece *</label>
            <select id="lote-finca" class="form-control" required>
              ${fincas.map(f => `
                <option value="${f.id}" ${f.id === defaultFincaId ? 'selected' : ''}>${f.nombre} (${f.vereda})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Nombre / Código del Lote *</label>
            <input type="text" id="lote-nombre" class="form-control" placeholder="Ej: Lote El Mirador" value="${lote?.nombre || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Área del Lote (Ha) *</label>
            <input type="number" step="0.1" id="lote-area" class="form-control" placeholder="Ej: 3.5" value="${lote?.area || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Cultivo Principal</label>
            <input type="text" id="lote-cultivo" class="form-control" placeholder="Ej: Café Castillo, Aguacate Hass..." value="${lote?.cultivoPrincipal || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Topografía Predominante</label>
            <select id="lote-topografia" class="form-control">
              <option value="Pendiente suave" ${lote?.topografia === 'Pendiente suave' ? 'selected' : ''}>Pendiente suave (0 - 15%)</option>
              <option value="Pendiente media" ${lote?.topografia === 'Pendiente media' ? 'selected' : ''}>Pendiente media (15 - 35%)</option>
              <option value="Ladera quebrada" ${lote?.topografia === 'Ladera quebrada' ? 'selected' : ''}>Ladera quebrada / Típica de Caldas (>35%)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de Suelo</label>
            <input type="text" id="lote-suelo" class="form-control" placeholder="Ej: Franco-arenoso volcánico" value="${lote?.tipoSuelo || 'Franco-arenoso volcánico'}">
          </div>

          <div class="form-group">
            <label class="form-label">Estado Actual</label>
            <select id="lote-estado" class="form-control">
              <option value="Productivo" ${lote?.estado === 'Productivo' ? 'selected' : ''}>Productivo</option>
              <option value="En crecimiento" ${lote?.estado === 'En crecimiento' ? 'selected' : ''}>En crecimiento / Almácigo</option>
              <option value="Zoqueo / Poda" ${lote?.estado === 'Zoqueo / Poda' ? 'selected' : ''}>Zoqueo / Renovación</option>
              <option value="En descanso" ${lote?.estado === 'En descanso' ? 'selected' : ''}>En descanso / Barbecho</option>
            </select>
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Lote' : 'Nuevo Lote de Terreno', bodyHtml, () => {
      const fincaId = document.getElementById('lote-finca').value;
      const nombre = document.getElementById('lote-nombre').value.trim();
      const area = parseFloat(document.getElementById('lote-area').value);
      const cultivoPrincipal = document.getElementById('lote-cultivo').value.trim();
      const topografia = document.getElementById('lote-topografia').value;
      const tipoSuelo = document.getElementById('lote-suelo').value.trim();
      const estado = document.getElementById('lote-estado').value;

      if (!nombre || isNaN(area) || area <= 0) {
        alert('Por favor ingrese el nombre y área del lote.');
        return false;
      }

      agroStore.saveLote({
        id: lote?.id,
        fincaId,
        nombre,
        area,
        cultivoPrincipal,
        topografia,
        tipoSuelo,
        estado
      });

      this.showToast(isEdit ? 'Lote actualizado' : 'Lote creado con éxito', 'success');
      return true;
    });
  }

  // 3. Modal Cultivo / Siembra
  openCultivoModal(cultivoId = null) {
    const cultivo = cultivoId ? agroStore.getCultivos().find(c => c.id === cultivoId) : null;
    const isEdit = !!cultivo;
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    if (fincas.length === 0) {
      alert('Debe crear primero una finca antes de registrar siembras.');
      return;
    }

    const defaultFincaId = cultivo?.fincaId || agroStore.getActiveFarmId();
    const today = new Date().toISOString().slice(0, 10);

    const bodyHtml = `
      <form id="form-cultivo">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Finca *</label>
            <select id="cultivo-finca" class="form-control" required>
              ${fincas.map(f => `
                <option value="${f.id}" ${f.id === defaultFincaId ? 'selected' : ''}>${f.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Lote *</label>
            <select id="cultivo-lote" class="form-control" required>
              ${lotes.map(l => `
                <option value="${l.id}" ${l.id === cultivo?.loteId ? 'selected' : ''}>${l.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de Cultivo *</label>
            <select id="cultivo-tipo" class="form-control" required>
              <option value="Café" ${cultivo?.tipo === 'Café' ? 'selected' : ''}>Café</option>
              <option value="Plátano" ${cultivo?.tipo === 'Plátano' ? 'selected' : ''}>Plátano</option>
              <option value="Aguacate" ${cultivo?.tipo === 'Aguacate' ? 'selected' : ''}>Aguacate</option>
              <option value="Caña Panelera" ${cultivo?.tipo === 'Caña Panelera' ? 'selected' : ''}>Caña Panelera</option>
              <option value="Cítricos" ${cultivo?.tipo === 'Cítricos' ? 'selected' : ''}>Cítricos (Naranja / Mandarina)</option>
              <option value="Maíz / Frijol" ${cultivo?.tipo === 'Maíz / Frijol' ? 'selected' : ''}>Maíz / Fríjol</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Variedad / Híbrido *</label>
            <input type="text" id="cultivo-variedad" class="form-control" placeholder="Ej: Castillo, Cenicafé 1, Hass, Dominico..." value="${cultivo?.variedad || 'Castillo'}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Siembra *</label>
            <input type="date" id="cultivo-fecha" class="form-control" value="${cultivo?.fechaSiembra || today}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Número de Plantas Sembradas</label>
            <input type="number" id="cultivo-plantas" class="form-control" placeholder="Ej: 5000" value="${cultivo?.plantasSembradas || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Densidad (Plantas / Hectárea)</label>
            <input type="number" id="cultivo-densidad" class="form-control" placeholder="Ej: 5000" value="${cultivo?.densidad || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Estado Fenológico</label>
            <select id="cultivo-estado" class="form-control">
              <option value="Almácigo / Vivero" ${cultivo?.estado === 'Almácigo / Vivero' ? 'selected' : ''}>Almácigo / Vivero</option>
              <option value="En crecimiento vegetativo" ${cultivo?.estado === 'En crecimiento vegetativo' ? 'selected' : ''}>En crecimiento vegetativo</option>
              <option value="Floración" ${cultivo?.estado === 'Floración' ? 'selected' : ''}>Floración</option>
              <option value="Producción activa" ${cultivo?.estado === 'Producción activa' || !cultivo ? 'selected' : ''}>Producción activa</option>
              <option value="Zoqueo / Renovación" ${cultivo?.estado === 'Zoqueo / Renovación' ? 'selected' : ''}>Zoqueo / Renovación</option>
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Estimación de Cosecha / Ciclo</label>
            <input type="text" id="cultivo-estimado" class="form-control" placeholder="Ej: Octubre - Diciembre (Cosecha principal)" value="${cultivo?.estimadoCosecha || ''}">
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Notas Adicionales</label>
            <textarea id="cultivo-notas" class="form-control" placeholder="Distancia de siembra, fertilización de fondo...">${cultivo?.notas || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Cultivo' : 'Registrar Nueva Siembra', bodyHtml, () => {
      const fincaId = document.getElementById('cultivo-finca').value;
      const loteId = document.getElementById('cultivo-lote').value;
      const tipo = document.getElementById('cultivo-tipo').value;
      const variedad = document.getElementById('cultivo-variedad').value.trim();
      const fechaSiembra = document.getElementById('cultivo-fecha').value;
      const plantasSembradas = parseInt(document.getElementById('cultivo-plantas').value, 10) || 0;
      const densidad = parseInt(document.getElementById('cultivo-densidad').value, 10) || 0;
      const estado = document.getElementById('cultivo-estado').value;
      const estimadoCosecha = document.getElementById('cultivo-estimado').value.trim();
      const notas = document.getElementById('cultivo-notas').value.trim();

      if (!variedad || !fechaSiembra) {
        alert('Por favor complete la variedad y fecha de siembra.');
        return false;
      }

      agroStore.saveCultivo({
        id: cultivo?.id,
        fincaId,
        loteId,
        tipo,
        variedad,
        fechaSiembra,
        plantasSembradas,
        densidad,
        estado,
        estimadoCosecha,
        notas
      });

      this.showToast(isEdit ? 'Cultivo actualizado' : 'Siembra registrada con éxito', 'success');
      return true;
    });
  }

  // 4. Modal Cosecha
  openCosechaModal(cosechaId = null) {
    const cosecha = cosechaId ? agroStore.getCosechas().find(c => c.id === cosechaId) : null;
    const isEdit = !!cosecha;
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    if (fincas.length === 0) {
      alert('Debe crear primero una finca.');
      return;
    }

    const defaultFincaId = cosecha?.fincaId || agroStore.getActiveFarmId();
    const today = new Date().toISOString().slice(0, 10);

    const bodyHtml = `
      <form id="form-cosecha">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Finca Recolectada *</label>
            <select id="cosecha-finca" class="form-control" required>
              ${fincas.map(f => `
                <option value="${f.id}" ${f.id === defaultFincaId ? 'selected' : ''}>${f.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Lote Cosechado</label>
            <select id="cosecha-lote" class="form-control">
              <option value="">Lote General / Toda la finca</option>
              ${lotes.map(l => `
                <option value="${l.id}" ${l.id === cosecha?.loteId ? 'selected' : ''}>${l.nombre} (${l.cultivoPrincipal || 'Lote'})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Recolección *</label>
            <input type="date" id="cosecha-fecha" class="form-control" value="${cosecha?.fecha || today}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Unidad de Medida *</label>
            <select id="cosecha-unidad" class="form-control" required>
              <option value="Arrobas (@)" ${cosecha?.unidad?.includes('@') ? 'selected' : ''}>Arrobas (@) - Café (12.5 Kg)</option>
              <option value="Kg" ${cosecha?.unidad === 'Kg' ? 'selected' : ''}>Kilogramos (Kg)</option>
              <option value="Bultos (50Kg)" ${cosecha?.unidad?.includes('Bulto') ? 'selected' : ''}>Bultos (50 Kg)</option>
              <option value="Canastillas" ${cosecha?.unidad === 'Canastillas' ? 'selected' : ''}>Canastillas</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Cantidad Recolectada *</label>
            <input type="number" step="0.5" id="cosecha-cantidad" class="form-control" placeholder="Ej: 80" value="${cosecha?.cantidad || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Precio de Venta Unitario (COP $) *</label>
            <input type="number" id="cosecha-precio-unit" class="form-control" placeholder="Ej: 195000" value="${cosecha?.precioUnitario || ''}" required>
            <div class="form-hint">Carga de café o precio por arroba/kilo</div>
          </div>

          <div class="form-group">
            <label class="form-label">Total Liquidado (COP $)</label>
            <input type="text" id="cosecha-total-display" class="form-control" readonly style="background: #f1f5f9; font-weight: 700; color: #166534;" value="${cosecha?.precioVentaTotal ? formatCOP(cosecha.precioVentaTotal) : '$0'}">
          </div>

          <div class="form-group">
            <label class="form-label">Calidad / Clasificación</label>
            <input type="text" id="cosecha-calidad" class="form-control" placeholder="Ej: Café Pergamino Extra, Pasilla..." value="${cosecha?.calidad || 'Café Pergamino Seco Extra'}">
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Comprador / Destino</label>
            <input type="text" id="cosecha-comprador" class="form-control" placeholder="Ej: Cooperativa de Caficultores de Anserma (Coopcafé)" value="${cosecha?.comprador || 'Cooperativa de Caficultores de Anserma'}">
          </div>

          ${!isEdit ? `
            <div class="form-group col-span-2" style="background: #f0fdf4; padding: 0.75rem; border-radius: 8px; border: 1px solid #bbf7d0;">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.88rem; font-weight: 600; color: #166534;">
                <input type="checkbox" id="cosecha-sync-finanzas" checked style="width: 18px; height: 18px;">
                Registrar automáticamente este valor como ingreso en el módulo de Finanzas
              </label>
            </div>
          ` : ''}

          <div class="form-group col-span-2">
            <label class="form-label">Observaciones (Factor de rendimiento, humedad...)</label>
            <textarea id="cosecha-notas" class="form-control">${cosecha?.notas || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Cosecha' : 'Registrar Nueva Cosecha', bodyHtml, () => {
      const fincaId = document.getElementById('cosecha-finca').value;
      const loteId = document.getElementById('cosecha-lote').value || null;
      const fecha = document.getElementById('cosecha-fecha').value;
      const unidad = document.getElementById('cosecha-unidad').value;
      const cantidad = parseFloat(document.getElementById('cosecha-cantidad').value);
      const precioUnitario = parseFloat(document.getElementById('cosecha-precio-unit').value) || 0;
      const calidad = document.getElementById('cosecha-calidad').value.trim();
      const comprador = document.getElementById('cosecha-comprador').value.trim();
      const notas = document.getElementById('cosecha-notas').value.trim();
      const syncFinanzas = document.getElementById('cosecha-sync-finanzas')?.checked ?? false;

      if (isNaN(cantidad) || cantidad <= 0 || !fecha) {
        alert('Por favor ingrese una cantidad y fecha válidas.');
        return false;
      }

      const precioVentaTotal = cantidad * precioUnitario;

      agroStore.saveCosecha({
        id: cosecha?.id,
        fincaId,
        loteId,
        fecha,
        unidad,
        cantidad,
        precioUnitario,
        precioVentaTotal,
        calidad,
        comprador,
        notas
      }, syncFinanzas);

      this.showToast(isEdit ? 'Cosecha actualizada' : 'Cosecha e ingreso registrados correctamente', 'success');
      return true;
    });

    // Auto-cálculo reactivo del total
    const cantInput = document.getElementById('cosecha-cantidad');
    const priceInput = document.getElementById('cosecha-precio-unit');
    const totalDisplay = document.getElementById('cosecha-total-display');

    const updateDisplay = () => {
      const c = parseFloat(cantInput.value) || 0;
      const p = parseFloat(priceInput.value) || 0;
      totalDisplay.value = formatCOP(c * p);
    };

    cantInput?.addEventListener('input', updateDisplay);
    priceInput?.addEventListener('input', updateDisplay);
  }

  // 5. Modal Inventario (Insumo)
  openInventarioModal(invId = null) {
    const inv = invId ? agroStore.getInventario().find(i => i.id === invId) : null;
    const isEdit = !!inv;
    const fincas = agroStore.getFincas();

    if (fincas.length === 0) {
      alert('Debe crear primero una finca.');
      return;
    }

    const defaultFincaId = inv?.fincaId || agroStore.getActiveFarmId();

    const bodyHtml = `
      <form id="form-inv">
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Finca / Bodega *</label>
            <select id="inv-finca" class="form-control" required>
              ${fincas.map(f => `
                <option value="${f.id}" ${f.id === defaultFincaId ? 'selected' : ''}>${f.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Nombre del Insumo / Herramienta *</label>
            <input type="text" id="inv-nombre" class="form-control" placeholder="Ej: Fertilizante Cafetero 17-6-18-2" value="${inv?.nombre || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Categoría *</label>
            <select id="inv-categoria" class="form-control" required>
              <option value="Fertilizante edáfico" ${inv?.categoria === 'Fertilizante edáfico' ? 'selected' : ''}>Fertilizante Edáfico</option>
              <option value="Fertilizante foliar" ${inv?.categoria === 'Fertilizante foliar' ? 'selected' : ''}>Fertilizante Foliar</option>
              <option value="Plaguicida / Fungicida" ${inv?.categoria === 'Plaguicida / Fungicida' ? 'selected' : ''}>Plaguicida / Fungicida</option>
              <option value="Herramienta / Trampas" ${inv?.categoria === 'Herramienta / Trampas' ? 'selected' : ''}>Herramienta / Trampas</option>
              <option value="Semilla / Chapola" ${inv?.categoria === 'Semilla / Chapola' ? 'selected' : ''}>Semilla / Almácigo</option>
              <option value="Empaques" ${inv?.categoria === 'Empaques' ? 'selected' : ''}>Costales / Empaques</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Unidad de Medida *</label>
            <input type="text" id="inv-unidad" class="form-control" placeholder="Ej: Bultos (50Kg), Kg, Litros..." value="${inv?.unidad || 'Bultos (50Kg)'}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Stock Actual *</label>
            <input type="number" step="0.5" id="inv-stock-act" class="form-control" placeholder="Ej: 20" value="${inv?.stockActual ?? ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Stock Mínimo de Alerta *</label>
            <input type="number" step="0.5" id="inv-stock-min" class="form-control" placeholder="Ej: 5" value="${inv?.stockMinimo ?? 5}" required>
            <div class="form-hint">Dispara alerta automática si el stock baja de esta cifra</div>
          </div>

          <div class="form-group">
            <label class="form-label">Costo Unitario (COP $)</label>
            <input type="number" id="inv-costo" class="form-control" placeholder="Ej: 180000" value="${inv?.costoUnitario || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Ubicación en Bodega</label>
            <input type="text" id="inv-bodega" class="form-control" placeholder="Ej: Bodega principal Bellavista" value="${inv?.ubicacionBodega || ''}">
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Insumo' : 'Nuevo Insumo en Inventario', bodyHtml, () => {
      const fincaId = document.getElementById('inv-finca').value;
      const nombre = document.getElementById('inv-nombre').value.trim();
      const categoria = document.getElementById('inv-categoria').value;
      const unidad = document.getElementById('inv-unidad').value.trim();
      const stockActual = parseFloat(document.getElementById('inv-stock-act').value);
      const stockMinimo = parseFloat(document.getElementById('inv-stock-min').value);
      const costoUnitario = parseFloat(document.getElementById('inv-costo').value) || 0;
      const ubicacionBodega = document.getElementById('inv-bodega').value.trim();

      if (!nombre || isNaN(stockActual) || isNaN(stockMinimo)) {
        alert('Por favor ingrese el nombre y las existencias.');
        return false;
      }

      agroStore.saveInventario({
        id: inv?.id,
        fincaId,
        nombre,
        categoria,
        unidad,
        stockActual,
        stockMinimo,
        costoUnitario,
        ubicacionBodega
      });

      this.showToast(isEdit ? 'Insumo actualizado' : 'Insumo agregado al inventario', 'success');
      return true;
    });
  }

  // 6. Modal Movimiento de Inventario (Entrada / Salida)
  openStockMovementModal(selectedInvId = null) {
    const inventario = agroStore.getInventario();
    const lotes = agroStore.getLotes('todas');

    if (inventario.length === 0) {
      alert('No hay insumos registrados para mover.');
      return;
    }

    const defaultInvId = selectedInvId || inventario[0].id;
    const today = new Date().toISOString().slice(0, 10);

    const bodyHtml = `
      <form id="form-stock-mov">
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Tipo de Movimiento *</label>
            <select id="mov-tipo" class="form-control" required>
              <option value="Entrada / Compra">Entrada (Compra o reposición de stock)</option>
              <option value="Salida / Aplicación">Salida (Aplicación en lote o uso en campo)</option>
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Insumo a Mover *</label>
            <select id="mov-insumo" class="form-control" required>
              ${inventario.map(i => `
                <option value="${i.id}" ${i.id === defaultInvId ? 'selected' : ''}>
                  ${i.nombre} (Stock actual: ${i.stockActual} ${i.unidad})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Cantidad a Mover *</label>
            <input type="number" step="0.5" id="mov-cantidad" class="form-control" placeholder="Ej: 5" required>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha del Movimiento *</label>
            <input type="date" id="mov-fecha" class="form-control" value="${today}" required>
          </div>

          <div class="form-group" id="group-mov-lote">
            <label class="form-label">Lote Destino (Si es aplicación)</label>
            <select id="mov-lote" class="form-control">
              <option value="">Aplicación General</option>
              ${lotes.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" id="group-mov-costo">
            <label class="form-label">Costo Total Compra (COP $)</label>
            <input type="number" id="mov-costo-total" class="form-control" placeholder="Ej: 890000">
          </div>

          <div class="form-group col-span-2" id="group-mov-gasto-check" style="background: #fef2f2; padding: 0.75rem; border-radius: 8px; border: 1px solid #fecaca;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.88rem; font-weight: 600; color: #991b1b;">
              <input type="checkbox" id="mov-sync-gasto" checked style="width: 18px; height: 18px;">
              Registrar automáticamente este costo como GASTO en finanzas
            </label>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Motivo o Justificación</label>
            <input type="text" id="mov-motivo" class="form-control" placeholder="Ej: Primera dosis fertilización en lote El Mirador">
          </div>
        </div>
      </form>
    `;

    this.openModal('Entrada / Salida de Insumos', bodyHtml, () => {
      const tipo = document.getElementById('mov-tipo').value;
      const inventarioId = document.getElementById('mov-insumo').value;
      const cantidad = parseFloat(document.getElementById('mov-cantidad').value);
      const fecha = document.getElementById('mov-fecha').value;
      const loteId = document.getElementById('mov-lote').value || null;
      const costoTotal = parseFloat(document.getElementById('mov-costo-total').value) || 0;
      const registrarGasto = document.getElementById('mov-sync-gasto')?.checked ?? false;
      const motivo = document.getElementById('mov-motivo').value.trim();

      if (isNaN(cantidad) || cantidad <= 0) {
        alert('Ingrese una cantidad válida.');
        return false;
      }

      agroStore.recordStockMovement({
        tipo,
        inventarioId,
        cantidad,
        fecha,
        loteId,
        costoTotal,
        registrarGasto,
        motivo
      });

      this.showToast(`Movimiento de ${tipo} registrado correctamente`, 'success');
      return true;
    });

    // Ocultar o mostrar campos de gasto según entrada o salida
    const tipoSelect = document.getElementById('mov-tipo');
    const gastoGroup = document.getElementById('group-mov-gasto-check');
    const costoGroup = document.getElementById('group-mov-costo');

    tipoSelect?.addEventListener('change', () => {
      if (tipoSelect.value.includes('Entrada')) {
        gastoGroup.style.display = 'block';
        costoGroup.style.display = 'block';
      } else {
        gastoGroup.style.display = 'none';
        costoGroup.style.display = 'none';
      }
    });
  }

  // 7. Modal Finanzas (Gasto o Ingreso)
  openFinanzaModal(finId = null) {
    const fin = finId ? agroStore.getFinanzas().find(f => f.id === finId) : null;
    const isEdit = !!fin;
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    const defaultFincaId = fin?.fincaId || agroStore.getActiveFarmId();
    const today = new Date().toISOString().slice(0, 10);

    const bodyHtml = `
      <form id="form-fin">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de Transacción *</label>
            <select id="fin-tipo" class="form-control" required>
              <option value="gasto" ${fin?.tipo === 'gasto' || !fin ? 'selected' : ''}>GASTO (Egreso / Pago)</option>
              <option value="ingreso" ${fin?.tipo === 'ingreso' ? 'selected' : ''}>INGRESO (Venta / Entrada)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha *</label>
            <input type="date" id="fin-fecha" class="form-control" value="${fin?.fecha || today}" required>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Categoría *</label>
            <select id="fin-categoria" class="form-control" required>
              <optgroup label="Gastos Comunes en Fincas de Caldas">
                <option value="Jornales de Recolección" ${fin?.categoria === 'Jornales de Recolección' ? 'selected' : ''}>Jornales de Recolección de Café</option>
                <option value="Jornales de Limpia / Plateo" ${fin?.categoria === 'Jornales de Limpia / Plateo' ? 'selected' : ''}>Jornales de Limpia / Plateo</option>
                <option value="Jornales de Fumigación" ${fin?.categoria === 'Jornales de Fumigación' ? 'selected' : ''}>Jornales de Fumigación</option>
                <option value="Insumos y Fertilizantes" ${fin?.categoria === 'Insumos y Fertilizantes' ? 'selected' : ''}>Compra de Insumos y Fertilizantes</option>
                <option value="Transporte y Fletes" ${fin?.categoria === 'Transporte y Fletes' ? 'selected' : ''}>Transporte y Fletes (Willys / Camión)</option>
                <option value="Mantenimiento de Maquinaria" ${fin?.categoria === 'Mantenimiento de Maquinaria' ? 'selected' : ''}>Mantenimiento Despulpadora / Guadaña</option>
                <option value="Alimentación de Trabajadores" ${fin?.categoria === 'Alimentación de Trabajadores' ? 'selected' : ''}>Alimentación / Casino de Trabajadores</option>
              </optgroup>
              <optgroup label="Ingresos">
                <option value="Venta de Café" ${fin?.categoria === 'Venta de Café' ? 'selected' : ''}>Venta de Café Pergamino Seco</option>
                <option value="Venta de Plátano" ${fin?.categoria === 'Venta de Plátano' ? 'selected' : ''}>Venta de Plátano Dominico</option>
                <option value="Venta de Aguacate" ${fin?.categoria === 'Venta de Aguacate' ? 'selected' : ''}>Venta de Aguacate Hass</option>
                <option value="Subsidio / Incentivo Cafetero" ${fin?.categoria === 'Subsidio / Incentivo Cafetero' ? 'selected' : ''}>Incentivos / Apoyos Estatales</option>
                <option value="Otros Ingresos" ${fin?.categoria === 'Otros Ingresos' ? 'selected' : ''}>Otros Ingresos Agrícolas</option>
              </optgroup>
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Monto en Pesos Colombianos (COP $) *</label>
            <input type="number" id="fin-monto" class="form-control" placeholder="Ej: 1500000" value="${fin?.monto || ''}" required style="font-size: 1.1rem; font-weight: 700;">
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Concepto o Descripción Detallada *</label>
            <input type="text" id="fin-desc" class="form-control" placeholder="Ej: Pago de 5 jornales para deshierbe lote La Vega" value="${fin?.descripcion || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Finca Implicada</label>
            <select id="fin-finca" class="form-control">
              <option value="">Finca General</option>
              ${fincas.map(f => `
                <option value="${f.id}" ${f.id === defaultFincaId ? 'selected' : ''}>${f.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Comprobante / Factura / Recibo</label>
            <input type="text" id="fin-comp" class="form-control" placeholder="Ej: FAC-102 ó PLAN-05" value="${fin?.comprobante || ''}">
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Transacción' : 'Registrar Gasto o Ingreso', bodyHtml, () => {
      const tipo = document.getElementById('fin-tipo').value;
      const fecha = document.getElementById('fin-fecha').value;
      const categoria = document.getElementById('fin-categoria').value;
      const monto = parseFloat(document.getElementById('fin-monto').value);
      const descripcion = document.getElementById('fin-desc').value.trim();
      const fincaId = document.getElementById('fin-finca').value || null;
      const comprobante = document.getElementById('fin-comp').value.trim();

      if (isNaN(monto) || monto <= 0 || !descripcion) {
        alert('Por favor ingrese un monto y descripción válidos.');
        return false;
      }

      agroStore.saveFinanza({
        id: fin?.id,
        tipo,
        fecha,
        categoria,
        monto,
        descripcion,
        fincaId,
        comprobante
      });

      this.showToast(isEdit ? 'Movimiento actualizado' : 'Transacción registrada con éxito', 'success');
      return true;
    });
  }

  // 8. Modal Calendario de Labores
  openLaborModal(laborId = null) {
    const labor = laborId ? agroStore.getCalendario().find(c => c.id === laborId) : null;
    const isEdit = !!labor;
    const fincas = agroStore.getFincas();
    const lotes = agroStore.getLotes('todas');

    const defaultFincaId = labor?.fincaId || agroStore.getActiveFarmId();
    const today = new Date().toISOString().slice(0, 10);

    const bodyHtml = `
      <form id="form-labor">
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Título de la Labor *</label>
            <input type="text" id="labor-titulo" class="form-control" placeholder="Ej: Segunda dosis de fertilización 17-6-18-2" value="${labor?.titulo || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de Labor *</label>
            <select id="labor-tipo" class="form-control" required>
              <option value="Fertilización" ${labor?.labor === 'Fertilización' ? 'selected' : ''}>Fertilización (Edáfica / Foliar)</option>
              <option value="Fumigación" ${labor?.labor === 'Fumigación' ? 'selected' : ''}>Fumigación / Control Fitosanitario</option>
              <option value="Plateo / Deshierbe" ${labor?.labor === 'Plateo / Deshierbe' ? 'selected' : ''}>Plateo / Deshierbe (Limpia)</option>
              <option value="Poda / Zoqueo" ${labor?.labor === 'Poda / Zoqueo' ? 'selected' : ''}>Poda / Deschuponado / Zoqueo</option>
              <option value="Cosecha" ${labor?.labor === 'Cosecha' ? 'selected' : ''}>Pase de Cosecha / Recolección</option>
              <option value="Siembra" ${labor?.labor === 'Siembra' ? 'selected' : ''}>Siembra o Resiembra</option>
              <option value="Mantenimiento beneficio" ${labor?.labor === 'Mantenimiento beneficio' ? 'selected' : ''}>Mantenimiento Tanque Tina / Despulpadora</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha Programada *</label>
            <input type="date" id="labor-fecha" class="form-control" value="${labor?.fechaProgramada || today}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Finca *</label>
            <select id="labor-finca" class="form-control" required>
              ${fincas.map(f => `
                <option value="${f.id}" ${f.id === defaultFincaId ? 'selected' : ''}>${f.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Lote Destino</label>
            <select id="labor-lote" class="form-control">
              <option value="">Lote General</option>
              ${lotes.map(l => `
                <option value="${l.id}" ${l.id === labor?.loteId ? 'selected' : ''}>${l.nombre}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Responsable / Trabajador</label>
            <input type="text" id="labor-responsable" class="form-control" placeholder="Ej: Pedro Gómez" value="${labor?.responsable || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">Nivel de Prioridad</label>
            <select id="labor-prioridad" class="form-control">
              <option value="Alta" ${labor?.prioridad === 'Alta' ? 'selected' : ''}>Alta</option>
              <option value="Media" ${labor?.prioridad === 'Media' || !labor ? 'selected' : ''}>Media</option>
              <option value="Baja" ${labor?.prioridad === 'Baja' ? 'selected' : ''}>Baja</option>
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Instrucciones o Notas Técnicas</label>
            <textarea id="labor-notas" class="form-control" placeholder="Dosis recomendada, tipo de boquilla, medidas de seguridad...">${labor?.notas || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    this.openModal(isEdit ? 'Editar Labor Agrícola' : 'Programar Nueva Labor', bodyHtml, () => {
      const titulo = document.getElementById('labor-titulo').value.trim();
      const laborTipo = document.getElementById('labor-tipo').value;
      const fechaProgramada = document.getElementById('labor-fecha').value;
      const fincaId = document.getElementById('labor-finca').value;
      const loteId = document.getElementById('labor-lote').value || null;
      const responsable = document.getElementById('labor-responsable').value.trim();
      const prioridad = document.getElementById('labor-prioridad').value;
      const notas = document.getElementById('labor-notas').value.trim();

      if (!titulo || !fechaProgramada) {
        alert('Por favor ingrese el título y la fecha programada.');
        return false;
      }

      agroStore.saveLabor({
        id: labor?.id,
        titulo,
        labor: laborTipo,
        fechaProgramada,
        fincaId,
        loteId,
        responsable,
        prioridad,
        notas
      });

      this.showToast(isEdit ? 'Labor actualizada' : 'Labor programada en el calendario', 'success');
      return true;
    });
  }

  // 9. Modal Alerta Personalizada
  openAlertaModal() {
    const fincas = agroStore.getFincas();

    const bodyHtml = `
      <form id="form-custom-alert">
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">Título de la Alerta *</label>
            <input type="text" id="alert-titulo" class="form-control" placeholder="Ej: Alerta de Roya en Lote El Mirador" required>
          </div>

          <div class="form-group">
            <label class="form-label">Nivel de Gravedad *</label>
            <select id="alert-nivel" class="form-control" required>
              <option value="warning">Advertencia (Ámbar)</option>
              <option value="danger">Crítico / Urgente (Rojo)</option>
              <option value="info">Informativo (Verde / Azul)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Finca Asociada</label>
            <select id="alert-finca" class="form-control">
              <option value="all">Todas las Fincas</option>
              ${fincas.map(f => `<option value="${f.id}">${f.nombre}</option>`).join('')}
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Mensaje o Detalle Preventivo *</label>
            <textarea id="alert-mensaje" class="form-control" placeholder="Detalle qué situación se presenta y qué medidas tomar..." required></textarea>
          </div>
        </div>
      </form>
    `;

    this.openModal('Crear Alerta Personalizada', bodyHtml, () => {
      const titulo = document.getElementById('alert-titulo').value.trim();
      const nivel = document.getElementById('alert-nivel').value;
      const fincaId = document.getElementById('alert-finca').value;
      const mensaje = document.getElementById('alert-mensaje').value.trim();

      if (!titulo || !mensaje) {
        alert('Por favor complete título y mensaje.');
        return false;
      }

      agroStore.addCustomAlert({
        titulo,
        nivel,
        fincaId,
        mensaje,
        tipo: 'personalizada',
        modulo: 'alertas'
      });

      this.showToast('Alerta creada con éxito', 'success');
      return true;
    });
  }

  // 10. Modal de Detalles Agroclimáticos de Anserma
  openWeatherModal() {
    if (!this.weatherData) return;
    const moon = getMoonPhase();

    const bodyHtml = `
      <div style="font-size: 0.9rem; line-height: 1.6;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <h4 style="font-weight: 800; color: #166534; font-size: 1.1rem; margin-bottom: 0.25rem;">
            Municipio de Anserma, Caldas ("La Abuela de Caldas")
          </h4>
          <p style="color: #14532d; font-size: 0.84rem;">
            Ubicación en la vertiente occidental de la Cordillera Central/Occidental de Caldas.
            Altitud oficial: <strong>${ANSERMA_GEO.altitud} m.s.n.m.</strong>
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 0.74rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Temperatura</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #1e293b;">${this.weatherData.temperatura}°C</div>
          </div>
          <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 0.74rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Humedad Relativa</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #1e293b;">${this.weatherData.humedad}%</div>
          </div>
          <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 0.74rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Precipitación</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #1e293b;">${this.weatherData.precipitacion} mm</div>
          </div>
          <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 0.74rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Fase Lunar Actual</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #1e293b;">${moon.icon} ${moon.name}</div>
          </div>
        </div>

        <div style="background: #fffbeb; padding: 0.85rem; border-radius: 8px; border-left: 4px solid #d97706; margin-bottom: 0.75rem;">
          <strong style="color: #92400e; display: block; margin-bottom: 0.2rem;">Alerta Fitosanitaria Local:</strong>
          <p style="color: #78350f; font-size: 0.84rem;">${this.weatherData.alertaFitosanitaria.mensaje}</p>
        </div>

        <div style="background: #f0fdf4; padding: 0.85rem; border-radius: 8px; border-left: 4px solid #16a34a;">
          <strong style="color: #166534; display: block; margin-bottom: 0.2rem;">Recomendación Tradicional de Luna:</strong>
          <p style="color: #14532d; font-size: 0.84rem;">${moon.laborRecomendada}</p>
        </div>
      </div>
    `;

    this.openModal('Condiciones Agroclimáticas de Anserma', bodyHtml, () => true);
  }

  // 11. Menú Flotante de Acciones Rápidas
  showQuickActionMenu() {
    const bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; padding: 0.5rem 0;">
        <button class="btn btn-secondary" id="qa-cosecha" style="padding: 1.25rem 0.5rem; flex-direction: column; gap: 0.45rem;">
          <span style="font-size: 1.75rem;">☕</span>
          <strong>Nueva Cosecha</strong>
          <span style="font-size: 0.74rem; color: #64748b;">Café, plátano, aguacate</span>
        </button>

        <button class="btn btn-secondary" id="qa-finanza" style="padding: 1.25rem 0.5rem; flex-direction: column; gap: 0.45rem;">
          <span style="font-size: 1.75rem;">💰</span>
          <strong>Gasto / Ingreso</strong>
          <span style="font-size: 0.74rem; color: #64748b;">Jornales, insumos, fletes</span>
        </button>

        <button class="btn btn-secondary" id="qa-labor" style="padding: 1.25rem 0.5rem; flex-direction: column; gap: 0.45rem;">
          <span style="font-size: 1.75rem;">📅</span>
          <strong>Programar Labor</strong>
          <span style="font-size: 0.74rem; color: #64748b;">Fertilizar, fumigar, podar</span>
        </button>

        <button class="btn btn-secondary" id="qa-stock" style="padding: 1.25rem 0.5rem; flex-direction: column; gap: 0.45rem;">
          <span style="font-size: 1.75rem;">📦</span>
          <strong>Mover Inventario</strong>
          <span style="font-size: 0.74rem; color: #64748b;">Entrada o aplicación</span>
        </button>
      </div>
    `;

    this.openModal('Acciones Rápidas AgroCaldas', bodyHtml, () => true);

    document.getElementById('qa-cosecha')?.addEventListener('click', () => {
      document.getElementById('global-modal').classList.remove('active');
      this.openCosechaModal();
    });

    document.getElementById('qa-finanza')?.addEventListener('click', () => {
      document.getElementById('global-modal').classList.remove('active');
      this.openFinanzaModal();
    });

    document.getElementById('qa-labor')?.addEventListener('click', () => {
      document.getElementById('global-modal').classList.remove('active');
      this.openLaborModal();
    });

    document.getElementById('qa-stock')?.addEventListener('click', () => {
      document.getElementById('global-modal').classList.remove('active');
      this.openStockMovementModal();
    });
  }

  // Notificaciones Toast
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  window.agroCaldasApp = new AgroApp();
});
