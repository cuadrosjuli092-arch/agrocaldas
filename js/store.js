/**
 * AgroCaldas - Motor de Persistencia y Gestión de Datos
 * Almacenamiento local mediante localStorage y API reactiva
 * Contexto: Anserma, Caldas, Colombia
 */

const STORAGE_KEY = 'agrocaldas_database_v1';

// Veredas oficiales del municipio de Anserma, Caldas
export const VEREDAS_ANSERMA = [
  'Bellavista',
  'Chápata',
  'El Horro',
  'Tabla Roja',
  'Partidas',
  'La Nubia',
  'San Jerónimo',
  'Tamarvia',
  'Cauya',
  'Marapra',
  'El Pensil',
  'Alsacia',
  'Morro Azul',
  'San Pedro',
  'Lomitas',
  'La Loma',
  'Betania'
];

// Datos iniciales de demostración contextualizados en Anserma, Caldas
const SEED_DATA = {
  fincas: [
    {
      id: 'f-1',
      nombre: 'Finca La Esmeralda',
      vereda: 'Bellavista',
      propietario: 'Don Gonzalo Ramírez',
      telefono: '312 458 9210',
      areaTotal: 8.5,
      altitud: 1780,
      notas: 'Finca cafetera tradicional tecnificada con sombrío de plátano dominico hartón.',
      fechaRegistro: '2026-01-15'
    },
    {
      id: 'f-2',
      nombre: 'Finca El Porvenir',
      vereda: 'Chápata',
      propietario: 'María Elena Morales',
      telefono: '314 789 1234',
      areaTotal: 6.0,
      altitud: 1820,
      notas: 'Cultivo mixto de café variedad Cenicafé 1 y aguacate Hass.',
      fechaRegistro: '2026-02-10'
    },
    {
      id: 'f-3',
      nombre: 'Hacienda San Jerónimo',
      vereda: 'El Horro',
      propietario: 'Carlos Mario Jaramillo',
      telefono: '320 654 9870',
      areaTotal: 12.0,
      altitud: 1690,
      notas: 'Lotes en ladera con café Castillo y caña panelera para molienda artesanal.',
      fechaRegistro: '2026-03-01'
    }
  ],

  lotes: [
    {
      id: 'l-1',
      fincaId: 'f-1',
      nombre: 'Lote El Mirador',
      area: 3.5,
      cultivoPrincipal: 'Café Castillo',
      topografia: 'Pendiente media',
      tipoSuelo: 'Franco-arenoso volcánico',
      estado: 'Productivo'
    },
    {
      id: 'l-2',
      fincaId: 'f-1',
      nombre: 'Lote La Vega (Platanera)',
      area: 2.0,
      cultivoPrincipal: 'Plátano Dominico Hartón',
      topografia: 'Pendiente suave',
      tipoSuelo: 'Franco con abundante materia orgánica',
      estado: 'Productivo'
    },
    {
      id: 'l-3',
      fincaId: 'f-2',
      nombre: 'Lote El Guayabo',
      area: 3.0,
      cultivoPrincipal: 'Café Cenicafé 1',
      topografia: 'Ladera quebrada',
      tipoSuelo: 'Franco arcilloso',
      estado: 'Productivo'
    },
    {
      id: 'l-4',
      fincaId: 'f-2',
      nombre: 'Lote Alto de Hass',
      area: 2.5,
      cultivoPrincipal: 'Aguacate Hass',
      topografia: 'Pendiente media',
      tipoSuelo: 'Franco arenoso con buen drenaje',
      estado: 'En crecimiento'
    },
    {
      id: 'l-5',
      fincaId: 'f-3',
      nombre: 'Lote Trapiche Viejo',
      area: 5.0,
      cultivoPrincipal: 'Caña Panelera',
      topografia: 'Ladera media',
      tipoSuelo: 'Franco arcilloso',
      estado: 'Productivo'
    }
  ],

  cultivos: [
    {
      id: 'c-1',
      fincaId: 'f-1',
      loteId: 'l-1',
      tipo: 'Café',
      variedad: 'Castillo General',
      fechaSiembra: '2023-04-12',
      plantasSembradas: 17500,
      densidad: 5000,
      estado: 'Producción activa',
      estimadoCosecha: 'Septiembre - Diciembre',
      notas: 'Densidad a 2.0 x 1.0 m al sol con barreras vivas.'
    },
    {
      id: 'c-2',
      fincaId: 'f-1',
      loteId: 'l-2',
      tipo: 'Plátano',
      variedad: 'Dominico Hartón',
      fechaSiembra: '2024-05-10',
      plantasSembradas: 2400,
      densidad: 1200,
      estado: 'Producción activa',
      estimadoCosecha: 'Todo el año (escalonado)',
      notas: 'Excelente vigor, sirve de barrera contra vientos.'
    },
    {
      id: 'c-3',
      fincaId: 'f-2',
      loteId: 'l-3',
      tipo: 'Café',
      variedad: 'Cenicafé 1',
      fechaSiembra: '2023-10-20',
      plantasSembradas: 15000,
      densidad: 5000,
      estado: 'Producción activa',
      estimadoCosecha: 'Octubre - Diciembre',
      notas: 'Resistencia a roya y porte adecuado para recolección en pendiente.'
    },
    {
      id: 'c-4',
      fincaId: 'f-2',
      loteId: 'l-4',
      tipo: 'Aguacate',
      variedad: 'Hass Exportación',
      fechaSiembra: '2024-03-18',
      plantasSembradas: 550,
      densidad: 220,
      estado: 'En crecimiento',
      estimadoCosecha: 'Noviembre 2026',
      notas: 'Patrones criollos injertados, podas de formación iniciadas.'
    }
  ],

  cosechas: [
    {
      id: 'cos-1',
      fincaId: 'f-1',
      loteId: 'l-1',
      cultivoId: 'c-1',
      fecha: '2026-10-05',
      cantidad: 140,
      unidad: 'Arrobas (@)',
      calidad: 'Café Pergamino Seco Extra',
      precioUnitario: 195000,
      precioVentaTotal: 27300000,
      comprador: 'Cooperativa de Caficultores de Anserma (Coopcafé)',
      notas: 'Factor de rendimiento 88, humedad 11.5%.'
    },
    {
      id: 'cos-2',
      fincaId: 'f-1',
      loteId: 'l-2',
      cultivoId: 'c-2',
      fecha: '2026-09-28',
      cantidad: 1800,
      unidad: 'Kg',
      calidad: 'Plátano Primera Categoría',
      precioUnitario: 2200,
      precioVentaTotal: 3960000,
      comprador: 'Comerciantes plaza de mercado Anserma',
      notas: 'Racimos pesados sin daño mecánico.'
    },
    {
      id: 'cos-3',
      fincaId: 'f-2',
      loteId: 'l-3',
      cultivoId: 'c-3',
      fecha: '2026-10-09',
      cantidad: 95,
      unidad: 'Arrobas (@)',
      calidad: 'Café Pergamino Estándar',
      precioUnitario: 192000,
      precioVentaTotal: 18240000,
      comprador: 'Cooperativa de Caficultores de Anserma',
      notas: 'Cosecha de pases tempranos.'
    }
  ],

  inventario: [
    {
      id: 'inv-1',
      fincaId: 'f-1',
      nombre: 'Fertilizante Cafetero 17-6-18-2',
      categoria: 'Fertilizante edáfico',
      stockActual: 18,
      stockMinimo: 10,
      unidad: 'Bultos (50Kg)',
      costoUnitario: 178000,
      ubicacionBodega: 'Bodega Principal Bellavista'
    },
    {
      id: 'inv-2',
      fincaId: 'f-1',
      nombre: 'Urea 46%',
      categoria: 'Fertilizante edáfico',
      stockActual: 4,
      stockMinimo: 8, // Bajo stock para disparar alerta
      unidad: 'Bultos (50Kg)',
      costoUnitario: 145000,
      ubicacionBodega: 'Bodega Principal Bellavista'
    },
    {
      id: 'inv-3',
      fincaId: 'f-1',
      nombre: 'Oxicloruro de Cobre (Fungicida preventivo)',
      categoria: 'Plaguicida / Fungicida',
      stockActual: 2,
      stockMinimo: 5, // Bajo stock
      unidad: 'Kg',
      costoUnitario: 42000,
      ubicacionBodega: 'Armario de fitosanitarios'
    },
    {
      id: 'inv-4',
      fincaId: 'f-1',
      nombre: 'Costales de Fique Nuevos',
      categoria: 'Empaques',
      stockActual: 120,
      stockMinimo: 40,
      unidad: 'Unidades',
      costoUnitario: 8500,
      ubicacionBodega: 'Despensa de empaque'
    },
    {
      id: 'inv-5',
      fincaId: 'f-2',
      nombre: 'Abono Orgánico Compostado (Gallinaza tratada)',
      categoria: 'Fertilizante edáfico',
      stockActual: 45,
      stockMinimo: 20,
      unidad: 'Bultos (40Kg)',
      costoUnitario: 35000,
      ubicacionBodega: 'Caseta de insumos Chápata'
    },
    {
      id: 'inv-6',
      fincaId: 'f-2',
      nombre: 'Trampas Brocap para Broca del Café',
      categoria: 'Herramienta / Trampas',
      stockActual: 30,
      stockMinimo: 15,
      unidad: 'Unidades',
      costoUnitario: 16000,
      ubicacionBodega: 'Caseta de insumos Chápata'
    }
  ],

  movimientosInventario: [
    {
      id: 'mov-1',
      inventarioId: 'inv-1',
      fincaId: 'f-1',
      tipo: 'Entrada / Compra',
      cantidad: 25,
      fecha: '2026-09-15',
      motivo: 'Compra para fertilización segundo semestre',
      loteId: null,
      costoTotal: 4450000
    },
    {
      id: 'mov-2',
      inventarioId: 'inv-1',
      fincaId: 'f-1',
      tipo: 'Salida / Aplicación',
      cantidad: 7,
      fecha: '2026-10-01',
      motivo: 'Primera aplicación lote El Mirador',
      loteId: 'l-1',
      costoTotal: 1246000
    }
  ],

  finanzas: [
    {
      id: 'fin-1',
      fincaId: 'f-1',
      loteId: 'l-1',
      tipo: 'ingreso',
      categoria: 'Venta de Café',
      monto: 27300000,
      fecha: '2026-10-05',
      descripcion: 'Liquidación 140 @ Café pergamino seco en Cooperativa de Anserma',
      comprobante: 'FAC-ANS-8842'
    },
    {
      id: 'fin-2',
      fincaId: 'f-1',
      loteId: 'l-2',
      tipo: 'ingreso',
      categoria: 'Venta de Plátano',
      monto: 3960000,
      fecha: '2026-09-28',
      descripcion: 'Venta 1800 Kg plátano dominico hartón para mercado local',
      comprobante: 'REC-092'
    },
    {
      id: 'fin-3',
      fincaId: 'f-2',
      loteId: 'l-3',
      tipo: 'ingreso',
      categoria: 'Venta de Café',
      monto: 18240000,
      fecha: '2026-10-09',
      descripcion: 'Entrega 95 @ variedad Cenicafé 1 en Coopcafé Anserma',
      comprobante: 'FAC-ANS-8910'
    },
    {
      id: 'fin-4',
      fincaId: 'f-1',
      loteId: 'l-1',
      tipo: 'gasto',
      categoria: 'Jornales de Recolección',
      monto: 4900000,
      fecha: '2026-10-04',
      descripcion: 'Pago a 7 recolectores por kilos de café cereza recolectados',
      comprobante: 'PLAN-SEM-40'
    },
    {
      id: 'fin-5',
      fincaId: 'f-1',
      loteId: 'l-1',
      tipo: 'gasto',
      categoria: 'Insumos y Fertilizantes',
      monto: 4450000,
      fecha: '2026-09-15',
      descripcion: 'Compra bultos fertilizante 17-6-18-2 en almacén de café Anserma',
      comprobante: 'FAC-AGRO-3321'
    },
    {
      id: 'fin-6',
      fincaId: 'f-1',
      loteId: null,
      tipo: 'gasto',
      categoria: 'Transporte y Fletes',
      monto: 650000,
      fecha: '2026-10-05',
      descripcion: 'Flete de campero Willys de Vereda Bellavista al centro de Anserma',
      comprobante: 'VALE-FLETE-14'
    },
    {
      id: 'fin-7',
      fincaId: 'f-2',
      loteId: 'l-3',
      tipo: 'gasto',
      categoria: 'Jornales de Limpia / Plateo',
      monto: 1200000,
      fecha: '2026-09-20',
      descripcion: 'Limpia manual y deschuponado con machete en lote Chápata',
      comprobante: 'PLAN-SEM-38'
    }
  ],

  calendario: [
    {
      id: 'cal-1',
      fincaId: 'f-1',
      loteId: 'l-1',
      labor: 'Fertilización',
      titulo: 'Segunda dosis fertilización 17-6-18-2',
      fechaProgramada: '2026-10-18',
      responsable: 'Pedro Antonio Gómez',
      prioridad: 'Alta',
      estado: 'pendiente',
      notas: 'Aprovechar entrada de lluvias de octubre. Aplicar en corona o media luna.'
    },
    {
      id: 'cal-2',
      fincaId: 'f-1',
      loteId: 'l-1',
      labor: 'Fumigación',
      titulo: 'Monitoreo y trampeo de Broca del café',
      fechaProgramada: '2026-10-15',
      responsable: 'Gonzalo Ramírez',
      prioridad: 'Media',
      estado: 'en_progreso',
      notas: 'Instalar trampas Brocap en cafetal para evaluar porcentaje de infestación.'
    },
    {
      id: 'cal-3',
      fincaId: 'f-1',
      loteId: 'l-2',
      labor: 'Plateo / Deshierbe',
      titulo: 'Deshoje fitosanitario en platanera',
      fechaProgramada: '2026-10-22',
      responsable: 'Javier Suárez',
      prioridad: 'Media',
      estado: 'pendiente',
      notas: 'Eliminar hojas con síntomas de sigatoka negra y picar residuos en el suelo.'
    },
    {
      id: 'cal-4',
      fincaId: 'f-2',
      loteId: 'l-4',
      labor: 'Poda / Formación',
      titulo: 'Poda apical en árboles de Aguacate Hass',
      fechaProgramada: '2026-10-25',
      responsable: 'María Elena Morales',
      prioridad: 'Alta',
      estado: 'pendiente',
      notas: 'Desinfectar tijeras con alcohol entre cada árbol para evitar antracnosis.'
    },
    {
      id: 'cal-5',
      fincaId: 'f-1',
      loteId: 'l-1',
      labor: 'Cosecha',
      titulo: 'Pase principal de recolección de café',
      fechaProgramada: '2026-10-14',
      responsable: 'Cuadrilla de recolección',
      prioridad: 'Alta',
      estado: 'en_progreso',
      notas: 'Coger sólo grano maduro para mantener factor de rendimiento alto.'
    }
  ],

  alertas: [
    {
      id: 'alt-1',
      fincaId: 'f-1',
      tipo: 'inventario',
      nivel: 'danger',
      titulo: 'Stock Crítico de Urea 46%',
      mensaje: 'Quedan solo 4 bultos en bodega (mínimo requerido: 8 bultos). Requiere compra urgente para abonada de octubre.',
      fecha: '2026-10-14',
      leida: false,
      modulo: 'inventario'
    },
    {
      id: 'alt-2',
      fincaId: 'f-1',
      tipo: 'inventario',
      nivel: 'warning',
      titulo: 'Bajo Inventario de Oxicloruro de Cobre',
      mensaje: 'Quedan 2 Kg disponibles (mínimo: 5 Kg). Prever para ciclo de aspersión preventiva contra roya.',
      fecha: '2026-10-13',
      leida: false,
      modulo: 'inventario'
    },
    {
      id: 'alt-3',
      fincaId: 'f-1',
      tipo: 'calendario',
      nivel: 'warning',
      titulo: 'Pase de Cosecha Cafetera en Curso',
      mensaje: 'Hoy está programado el pase de recolección en Lote El Mirador (Finca La Esmeralda).',
      fecha: '2026-10-14',
      leida: false,
      modulo: 'calendario'
    },
    {
      id: 'alt-4',
      fincaId: 'all',
      tipo: 'fitosanitaria',
      nivel: 'info',
      titulo: 'Alerta Agroclimática Anserma: Lluvias de Octubre',
      mensaje: 'Época de mayor precipitación en la vertiente occidental de Caldas. Recomendado drenaje de zanjas y control de malezas noble.',
      fecha: '2026-10-12',
      leida: false,
      modulo: 'alertas'
    }
  ],

  config: {
    fincaActivaId: 'todas',
    moneda: 'COP',
    nombreUsuario: 'Caficultor de Caldas'
  }
};

class Store {
  constructor() {
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar integridad mínima
        if (parsed.fincas && parsed.lotes && parsed.cosechas && parsed.inventario && parsed.finanzas) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo localStorage, restableciendo a datos base:', e);
    }
    // Guardar semilla inicial si no existe
    this.saveToStorage(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  saveToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  save() {
    this.saveToStorage(this.data);
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.data);
      } catch (err) {
        console.error('Error en listener del store:', err);
      }
    });
  }

  // Reiniciar a datos por defecto
  resetToDemo() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.save();
  }

  // Limpiar todos los registros
  clearAll() {
    this.data = {
      fincas: [],
      lotes: [],
      cultivos: [],
      cosechas: [],
      inventario: [],
      movimientosInventario: [],
      finanzas: [],
      calendario: [],
      alertas: [],
      config: { fincaActivaId: 'todas', moneda: 'COP', nombreUsuario: 'Productor' }
    };
    this.save();
  }

  // Exportar toda la base de datos a archivo JSON
  exportDataJSON() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgroCaldas_CopiaSeguridad_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Importar desde archivo JSON
  importDataJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.fincas || !Array.isArray(parsed.fincas)) {
        throw new Error('El archivo no contiene un formato válido de AgroCaldas');
      }
      this.data = parsed;
      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Exportar módulo a CSV
  exportModuleToCSV(moduleName) {
    let rows = [];
    let filename = `AgroCaldas_${moduleName}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (moduleName === 'cosechas') {
      rows.push(['ID', 'Fecha', 'Finca', 'Lote', 'Cantidad', 'Unidad', 'Calidad', 'Precio Unitario (COP)', 'Total (COP)', 'Comprador', 'Notas']);
      this.data.cosechas.forEach(c => {
        const finca = this.getFinca(c.fincaId);
        const lote = this.getLote(c.loteId);
        rows.push([
          c.id,
          c.fecha,
          finca ? finca.nombre : 'N/A',
          lote ? lote.nombre : 'N/A',
          c.cantidad,
          c.unidad,
          c.calidad,
          c.precioUnitario,
          c.precioVentaTotal,
          c.comprador,
          `"${(c.notas || '').replace(/"/g, '""')}"`
        ]);
      });
    } else if (moduleName === 'finanzas') {
      rows.push(['ID', 'Fecha', 'Tipo', 'Finca', 'Categoría', 'Monto (COP)', 'Descripción', 'Comprobante']);
      this.data.finanzas.forEach(f => {
        const finca = this.getFinca(f.fincaId);
        rows.push([
          f.id,
          f.fecha,
          f.tipo.toUpperCase(),
          finca ? finca.nombre : 'General',
          f.categoria,
          f.monto,
          `"${(f.descripcion || '').replace(/"/g, '""')}"`,
          f.comprobante || ''
        ]);
      });
    } else if (moduleName === 'inventario') {
      rows.push(['ID', 'Finca', 'Insumo', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Unidad', 'Costo Unitario (COP)', 'Bodega']);
      this.data.inventario.forEach(i => {
        const finca = this.getFinca(i.fincaId);
        rows.push([
          i.id,
          finca ? finca.nombre : 'General',
          i.nombre,
          i.categoria,
          i.stockActual,
          i.stockMinimo,
          i.unidad,
          i.costoUnitario,
          i.ubicacionBodega || ''
        ]);
      });
    }

    if (rows.length === 0) return false;

    const csvContent = '\uFEFF' + rows.map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  // --- MÉTODOS DE CONSULTA Y FILTRADO ---

  getActiveFarmId() {
    return this.data.config?.fincaActivaId || 'todas';
  }

  setActiveFarmId(fincaId) {
    if (!this.data.config) this.data.config = {};
    this.data.config.fincaActivaId = fincaId;
    this.save();
  }

  getFincas() {
    return this.data.fincas || [];
  }

  getFinca(id) {
    return this.data.fincas.find(f => f.id === id);
  }

  getLotes(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.lotes.filter(l => l.fincaId === fid);
    }
    return this.data.lotes || [];
  }

  getLote(id) {
    return this.data.lotes.find(l => l.id === id);
  }

  getCultivos(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.cultivos.filter(c => c.fincaId === fid);
    }
    return this.data.cultivos || [];
  }

  getCosechas(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.cosechas.filter(c => c.fincaId === fid);
    }
    return this.data.cosechas || [];
  }

  getInventario(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.inventario.filter(i => i.fincaId === fid);
    }
    return this.data.inventario || [];
  }

  getFinanzas(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.finanzas.filter(f => f.fincaId === fid);
    }
    return this.data.finanzas || [];
  }

  getCalendario(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.calendario.filter(c => c.fincaId === fid);
    }
    return this.data.calendario || [];
  }

  getAlertas(fincaId = null) {
    // Regenerar alertas automáticas de inventario y labores antes de devolver
    this.recheckAutomaticAlerts();

    const fid = fincaId || this.getActiveFarmId();
    if (fid && fid !== 'todas') {
      return this.data.alertas.filter(a => a.fincaId === fid || a.fincaId === 'all');
    }
    return this.data.alertas || [];
  }

  // --- REVISIÓN AUTOMÁTICA DE ALERTAS ---
  recheckAutomaticAlerts() {
    let changed = false;
    const today = new Date().toISOString().slice(0, 10);

    // 1. Alertas por bajo stock de inventario
    this.data.inventario.forEach(inv => {
      const alertId = `auto-inv-${inv.id}`;
      const existing = this.data.alertas.find(a => a.id === alertId);

      if (Number(inv.stockActual) <= Number(inv.stockMinimo)) {
        if (!existing) {
          const finca = this.getFinca(inv.fincaId);
          this.data.alertas.unshift({
            id: alertId,
            fincaId: inv.fincaId,
            tipo: 'inventario',
            nivel: Number(inv.stockActual) === 0 ? 'danger' : 'warning',
            titulo: `Stock Bajo: ${inv.nombre}`,
            mensaje: `El insumo '${inv.nombre}' en ${finca ? finca.nombre : 'finca'} tiene ${inv.stockActual} ${inv.unidad} (mínimo: ${inv.stockMinimo}).`,
            fecha: today,
            leida: false,
            modulo: 'inventario'
          });
          changed = true;
        }
      } else if (existing && !existing.leida) {
        // Ya no está en bajo stock, retirar alerta no atendida
        this.data.alertas = this.data.alertas.filter(a => a.id !== alertId);
        changed = true;
      }
    });

    if (changed) {
      this.saveToStorage(this.data);
    }
  }

  // --- OPERACIONES CRUD COMPLETAS ---

  // FINCAS
  saveFinca(fincaData) {
    if (fincaData.id) {
      const idx = this.data.fincas.findIndex(f => f.id === fincaData.id);
      if (idx !== -1) {
        this.data.fincas[idx] = { ...this.data.fincas[idx], ...fincaData };
      }
    } else {
      const newFinca = {
        id: 'f-' + Date.now(),
        fechaRegistro: new Date().toISOString().slice(0, 10),
        ...fincaData
      };
      this.data.fincas.push(newFinca);
    }
    this.save();
    return true;
  }

  deleteFinca(id) {
    this.data.fincas = this.data.fincas.filter(f => f.id !== id);
    // Eliminar o desvincular lotes y registros dependientes
    this.data.lotes = this.data.lotes.filter(l => l.fincaId !== id);
    this.data.cultivos = this.data.cultivos.filter(c => c.fincaId !== id);
    this.data.cosechas = this.data.cosechas.filter(c => c.fincaId !== id);
    this.data.inventario = this.data.inventario.filter(i => i.fincaId !== id);
    this.data.finanzas = this.data.finanzas.filter(f => f.fincaId !== id);
    this.data.calendario = this.data.calendario.filter(c => c.fincaId !== id);
    this.data.alertas = this.data.alertas.filter(a => a.fincaId !== id);

    if (this.getActiveFarmId() === id) {
      this.setActiveFarmId('todas');
    }
    this.save();
    return true;
  }

  // LOTES
  saveLote(loteData) {
    if (loteData.id) {
      const idx = this.data.lotes.findIndex(l => l.id === loteData.id);
      if (idx !== -1) {
        this.data.lotes[idx] = { ...this.data.lotes[idx], ...loteData };
      }
    } else {
      const newLote = {
        id: 'l-' + Date.now(),
        ...loteData
      };
      this.data.lotes.push(newLote);
    }
    this.save();
    return true;
  }

  deleteLote(id) {
    this.data.lotes = this.data.lotes.filter(l => l.id !== id);
    this.data.cultivos = this.data.cultivos.filter(c => c.loteId !== id);
    this.save();
    return true;
  }

  // CULTIVOS / SIEMBRAS
  saveCultivo(cultivoData) {
    if (cultivoData.id) {
      const idx = this.data.cultivos.findIndex(c => c.id === cultivoData.id);
      if (idx !== -1) {
        this.data.cultivos[idx] = { ...this.data.cultivos[idx], ...cultivoData };
      }
    } else {
      const newCultivo = {
        id: 'c-' + Date.now(),
        ...cultivoData
      };
      this.data.cultivos.push(newCultivo);
    }
    this.save();
    return true;
  }

  deleteCultivo(id) {
    this.data.cultivos = this.data.cultivos.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // COSECHAS
  saveCosecha(cosechaData, registrarComoIngreso = false) {
    let item;
    if (cosechaData.id) {
      const idx = this.data.cosechas.findIndex(c => c.id === cosechaData.id);
      if (idx !== -1) {
        this.data.cosechas[idx] = { ...this.data.cosechas[idx], ...cosechaData };
        item = this.data.cosechas[idx];
      }
    } else {
      item = {
        id: 'cos-' + Date.now(),
        ...cosechaData
      };
      this.data.cosechas.unshift(item);
    }

    // Si el usuario marcó registrar automáticamente en finanzas
    if (registrarComoIngreso && item.precioVentaTotal > 0) {
      const finca = this.getFinca(item.fincaId);
      const lote = this.getLote(item.loteId);
      this.saveFinanza({
        fincaId: item.fincaId,
        loteId: item.loteId,
        tipo: 'ingreso',
        categoria: `Venta Cosecha`,
        monto: Number(item.precioVentaTotal),
        fecha: item.fecha,
        descripcion: `Venta de ${item.cantidad} ${item.unidad} (${item.calidad}) - ${finca?.nombre || ''} [Lote: ${lote?.nombre || 'General'}]`,
        comprobante: `COS-${item.id.slice(-6)}`
      });
    }

    this.save();
    return item;
  }

  deleteCosecha(id) {
    this.data.cosechas = this.data.cosechas.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // INVENTARIO
  saveInventario(invData) {
    if (invData.id) {
      const idx = this.data.inventario.findIndex(i => i.id === invData.id);
      if (idx !== -1) {
        this.data.inventario[idx] = { ...this.data.inventario[idx], ...invData };
      }
    } else {
      const newInv = {
        id: 'inv-' + Date.now(),
        ...invData
      };
      this.data.inventario.push(newInv);
    }
    this.save();
    return true;
  }

  deleteInventario(id) {
    this.data.inventario = this.data.inventario.filter(i => i.id !== id);
    this.save();
    return true;
  }

  // Registrar movimiento de stock (Entrada o Salida)
  recordStockMovement(movementData) {
    const inv = this.data.inventario.find(i => i.id === movementData.inventarioId);
    if (!inv) return false;

    const cantidadNum = Number(movementData.cantidad);
    if (movementData.tipo === 'Entrada / Compra') {
      inv.stockActual = Number(inv.stockActual) + cantidadNum;
      // Opción de registrar gasto en finanzas
      if (movementData.registrarGasto && movementData.costoTotal > 0) {
        this.saveFinanza({
          fincaId: inv.fincaId,
          loteId: null,
          tipo: 'gasto',
          categoria: 'Insumos y Fertilizantes',
          monto: Number(movementData.costoTotal),
          fecha: movementData.fecha || new Date().toISOString().slice(0, 10),
          descripcion: `Compra de ${cantidadNum} ${inv.unidad} de ${inv.nombre}`,
          comprobante: movementData.comprobante || 'FAC-INS'
        });
      }
    } else if (movementData.tipo === 'Salida / Aplicación') {
      inv.stockActual = Math.max(0, Number(inv.stockActual) - cantidadNum);
    }

    inv.ultimoMovimiento = movementData.fecha || new Date().toISOString().slice(0, 10);

    const mov = {
      id: 'mov-' + Date.now(),
      inventarioId: inv.id,
      fincaId: inv.fincaId,
      ...movementData
    };

    if (!this.data.movimientosInventario) {
      this.data.movimientosInventario = [];
    }
    this.data.movimientosInventario.unshift(mov);
    this.save();
    return true;
  }

  // FINANZAS (GASTOS E INGRESOS)
  saveFinanza(finData) {
    if (finData.id) {
      const idx = this.data.finanzas.findIndex(f => f.id === finData.id);
      if (idx !== -1) {
        this.data.finanzas[idx] = { ...this.data.finanzas[idx], ...finData };
      }
    } else {
      const newFin = {
        id: 'fin-' + Date.now(),
        ...finData
      };
      this.data.finanzas.unshift(newFin);
    }
    this.save();
    return true;
  }

  deleteFinanza(id) {
    this.data.finanzas = this.data.finanzas.filter(f => f.id !== id);
    this.save();
    return true;
  }

  // CALENDARIO DE LABORES
  saveLabor(laborData) {
    if (laborData.id) {
      const idx = this.data.calendario.findIndex(c => c.id === laborData.id);
      if (idx !== -1) {
        this.data.calendario[idx] = { ...this.data.calendario[idx], ...laborData };
      }
    } else {
      const newLabor = {
        id: 'cal-' + Date.now(),
        estado: 'pendiente',
        ...laborData
      };
      this.data.calendario.unshift(newLabor);
    }
    this.save();
    return true;
  }

  toggleLaborStatus(id) {
    const labor = this.data.calendario.find(c => c.id === id);
    if (labor) {
      if (labor.estado === 'pendiente') labor.estado = 'en_progreso';
      else if (labor.estado === 'en_progreso') labor.estado = 'completada';
      else labor.estado = 'pendiente';
      this.save();
      return labor.estado;
    }
    return null;
  }

  deleteLabor(id) {
    this.data.calendario = this.data.calendario.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // ALERTAS
  markAlertRead(id) {
    const alerta = this.data.alertas.find(a => a.id === id);
    if (alerta) {
      alerta.leida = true;
      this.save();
    }
  }

  dismissAlert(id) {
    this.data.alertas = this.data.alertas.filter(a => a.id !== id);
    this.save();
  }

  addCustomAlert(alertData) {
    const newAlert = {
      id: 'alt-' + Date.now(),
      fecha: new Date().toISOString().slice(0, 10),
      leida: false,
      ...alertData
    };
    this.data.alertas.unshift(newAlert);
    this.save();
    return newAlert;
  }

  // --- CÁLCULOS ESTADÍSTICOS Y KPIS ---
  getStats(fincaId = null) {
    const fid = fincaId || this.getActiveFarmId();
    const fincas = this.getFincas();
    const lotes = this.getLotes(fid);
    const cultivos = this.getCultivos(fid);
    const cosechas = this.getCosechas(fid);
    const inventarios = this.getInventario(fid);
    const finanzas = this.getFinanzas(fid);
    const calendario = this.getCalendario(fid);
    const alertas = this.getAlertas(fid);

    // Hectáreas totales
    let hectareas = 0;
    if (fid && fid !== 'todas') {
      const f = this.getFinca(fid);
      hectareas = f ? Number(f.areaTotal) : 0;
    } else {
      hectareas = fincas.reduce((acc, f) => acc + Number(f.areaTotal || 0), 0);
    }

    // Totales financieros
    const totalIngresos = finanzas
      .filter(f => f.tipo === 'ingreso')
      .reduce((acc, f) => acc + Number(f.monto || 0), 0);

    const totalGastos = finanzas
      .filter(f => f.tipo === 'gasto')
      .reduce((acc, f) => acc + Number(f.monto || 0), 0);

    const balanceNeto = totalIngresos - totalGastos;

    // Resumen de cosechas (Arrobas y Kg)
    const cosechasCafeArrobas = cosechas
      .filter(c => c.unidad.includes('Arroba') || c.unidad.includes('@'))
      .reduce((acc, c) => acc + Number(c.cantidad || 0), 0);

    const cosechasKg = cosechas
      .filter(c => c.unidad.includes('Kg') || c.unidad.includes('Kilo'))
      .reduce((acc, c) => acc + Number(c.cantidad || 0), 0);

    // Alertas no leídas y tareas pendientes
    const alertasNoLeidas = alertas.filter(a => !a.leida).length;
    const tareasPendientes = calendario.filter(c => c.estado === 'pendiente' || c.estado === 'en_progreso').length;
    const stockCriticoCount = inventarios.filter(i => Number(i.stockActual) <= Number(i.stockMinimo)).length;

    return {
      fincasCount: fincas.length,
      lotesCount: lotes.length,
      cultivosCount: cultivos.length,
      hectareasTotal: hectareas,
      totalIngresos,
      totalGastos,
      balanceNeto,
      cosechasCafeArrobas,
      cosechasKg,
      alertasNoLeidas,
      tareasPendientes,
      stockCriticoCount
    };
  }
}

// Exportar instancia singleton
export const agroStore = new Store();
