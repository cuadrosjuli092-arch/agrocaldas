/**
 * AgroCaldas - Módulo de Visualizaciones Gráficas Nativas (SVG)
 * 100% autónomo y funcional sin conexión a internet
 */

// Formateador de moneda colombiana (COP)
export function formatCOP(monto) {
  const num = Number(monto) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(num);
}

// Formateador de fechas
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return `${day} ${months[month - 1]} ${year}`;
  }
  return dateStr;
}

// Renderizar Gráfica de Barras de Ingresos vs Gastos (Últimos 6 meses)
export function renderFinancialBarChart(containerId, finanzas) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Agrupar transacciones por mes
  const monthsData = {};
  const today = new Date();

  // Generar últimos 6 meses en orden cronológico
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    monthsData[key] = {
      label: monthNames[d.getMonth()],
      ingresos: 0,
      gastos: 0
    };
  }

  // Sumar montos
  finanzas.forEach(f => {
    if (!f.fecha) return;
    const key = f.fecha.slice(0, 7);
    if (monthsData[key]) {
      if (f.tipo === 'ingreso') {
        monthsData[key].ingresos += Number(f.monto || 0);
      } else if (f.tipo === 'gasto') {
        monthsData[key].gastos += Number(f.monto || 0);
      }
    }
  });

  const entries = Object.values(monthsData);
  let maxVal = 100000;
  entries.forEach(e => {
    if (e.ingresos > maxVal) maxVal = e.ingresos;
    if (e.gastos > maxVal) maxVal = e.gastos;
  });

  // Construir SVG responsivo
  const svgHeight = 220;
  const svgWidth = 560;
  const paddingLeft = 65;
  const paddingBottom = 40;
  const paddingTop = 25;
  const paddingRight = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const groupWidth = chartWidth / entries.length;
  const barWidth = Math.min(22, (groupWidth - 14) / 2);

  let barsSvg = '';

  // Líneas de cuadrícula horizontal
  const gridLines = 4;
  let gridSvg = '';
  for (let i = 0; i <= gridLines; i++) {
    const yVal = paddingTop + (chartHeight / gridLines) * i;
    const valLabel = maxVal * (1 - i / gridLines);
    gridSvg += `
      <line x1="${paddingLeft}" y1="${yVal}" x2="${svgWidth - paddingRight}" y2="${yVal}" stroke="#e2e8f0" stroke-dasharray="3,3" />
      <text x="${paddingLeft - 8}" y="${yVal + 4}" font-size="10" fill="#64748b" text-anchor="end">${formatCompact(valLabel)}</text>
    `;
  }

  entries.forEach((item, idx) => {
    const groupX = paddingLeft + idx * groupWidth;
    const centerX = groupX + groupWidth / 2;

    const hIng = (item.ingresos / maxVal) * chartHeight;
    const hGas = (item.gastos / maxVal) * chartHeight;

    const yIng = paddingTop + (chartHeight - hIng);
    const yGas = paddingTop + (chartHeight - hGas);

    const xIng = centerX - barWidth - 2;
    const xGas = centerX + 2;

    barsSvg += `
      <g class="chart-group-col">
        <!-- Barra Ingreso -->
        <rect x="${xIng}" y="${yIng}" width="${barWidth}" height="${Math.max(2, hIng)}" rx="3" fill="#16a34a">
          <title>${item.label} - Ingresos: ${formatCOP(item.ingresos)}</title>
        </rect>
        <!-- Barra Gasto -->
        <rect x="${xGas}" y="${yGas}" width="${barWidth}" height="${Math.max(2, hGas)}" rx="3" fill="#dc2626">
          <title>${item.label} - Gastos: ${formatCOP(item.gastos)}</title>
        </rect>
        <!-- Etiqueta Mes -->
        <text x="${centerX}" y="${svgHeight - 15}" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">${item.label}</text>
      </g>
    `;
  });

  const svgHtml = `
    <div style="width: 100%; overflow-x: auto;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; min-width: 380px; height: auto; display: block; font-family: inherit;">
        ${gridSvg}
        ${barsSvg}
      </svg>
      <div style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600;">
        <span style="display: flex; align-items: center; gap: 0.35rem; color: #16a34a;">
          <span style="width: 12px; height: 12px; background: #16a34a; border-radius: 3px; display: inline-block;"></span> Ingresos
        </span>
        <span style="display: flex; align-items: center; gap: 0.35rem; color: #dc2626;">
          <span style="width: 12px; height: 12px; background: #dc2626; border-radius: 3px; display: inline-block;"></span> Gastos
        </span>
      </div>
    </div>
  `;

  container.innerHTML = svgHtml;
}

// Renderizar Gráfica Circular (Donut) de distribución de cultivos por área
export function renderCropsDonutChart(containerId, lotes) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cropTotals = {};
  let totalArea = 0;

  lotes.forEach(l => {
    const crop = l.cultivoPrincipal || 'Sin sembrar';
    const area = Number(l.area) || 0;
    cropTotals[crop] = (cropTotals[crop] || 0) + area;
    totalArea += area;
  });

  const crops = Object.keys(cropTotals);
  if (crops.length === 0 || totalArea === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.88rem;">
        No hay lotes con cultivos registrados para graficar.
      </div>
    `;
    return;
  }

  const palette = [
    '#15803d', // Verde café
    '#22c55e', // Verde claro
    '#0284c7', // Azul cielo
    '#eab308', // Amarillo plátano
    '#f97316', // Naranja cítricos
    '#a855f7', // Morado
    '#64748b'  // Gris
  ];

  const size = 180;
  const center = size / 2;
  const radius = 65;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  let circlesSvg = '';
  let legendHtml = '';

  crops.forEach((crop, idx) => {
    const area = cropTotals[crop];
    const pct = (area / totalArea) * 100;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const color = palette[idx % palette.length];

    circlesSvg += `
      <circle cx="${center}" cy="${center}" r="${radius}"
        fill="transparent"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${-currentOffset}"
        transform="rotate(-90 ${center} ${center})"
        style="transition: stroke-dashoffset 0.5s ease;">
        <title>${crop}: ${area.toFixed(1)} Ha (${pct.toFixed(0)}%)</title>
      </circle>
    `;

    currentOffset += (pct / 100) * circumference;

    legendHtml += `
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
        <span style="display: flex; align-items: center; gap: 0.45rem;">
          <span style="width: 10px; height: 10px; border-radius: 2px; background: ${color};"></span>
          <span style="font-weight: 500; color: #334155;">${crop}</span>
        </span>
        <span style="font-weight: 700; color: #1e293b;">${area.toFixed(1)} Ha (${pct.toFixed(0)}%)</span>
      </div>
    `;
  });

  const donutHtml = `
    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1.5rem; padding: 0.5rem;">
      <div style="position: relative; width: ${size}px; height: ${size}px; flex-shrink: 0;">
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          ${circlesSvg}
        </svg>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
          <span style="font-size: 1.25rem; font-weight: 800; color: #14532d; display: block; line-height: 1;">${totalArea.toFixed(1)}</span>
          <span style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Ha Totales</span>
        </div>
      </div>
      <div style="flex: 1; min-width: 170px;">
        ${legendHtml}
      </div>
    </div>
  `;

  container.innerHTML = donutHtml;
}

// Auxiliar para formateo de números grandes en etiquetas de gráficos
function formatCompact(num) {
  if (num >= 1000000) {
    return '$' + (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return '$' + (num / 1000).toFixed(0) + 'K';
  }
  return '$' + Math.round(num);
}
