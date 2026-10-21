# AgroCaldas 🌿
### Sistema Integral de Gestión Agrícola y Financiera para Fincas y Cultivos
**Contexto Geográfico:** Municipio de Anserma ("La Abuela de Caldas"), Departamento de Caldas, Colombia.  
**Altitud:** ~1.790 m.s.n.m. | **Clima:** Templado Cafetero Andino

---

## 📋 Descripción General
**AgroCaldas** es una aplicación web moderna, ágil y adaptable a teléfonos celulares, diseñada específicamente para productores agrícolas, administradores de fincas y caficultores de la región de **Anserma, Caldas**.

El sistema integra el control predial de fincas y lotes por veredas, el registro fenológico de siembras, el control de cosechas en arrobas (@) y kilogramos, el inventario de insumos agrícolas con alertas de stock crítico, el balance financiero de ingresos y gastos operativos, un calendario agrícola interactivo y un centro de alertas fitoclimáticas.

---

## 🚀 Formas de Ingresar (Sin Bloqueos de Red ni Servidores)

Si su computador tiene políticas de seguridad, firewall o antivirus que bloquean puertos locales como `localhost:8080`, **AgroCaldas** cuenta con métodos directos que **NO necesitan servidores, puertos ni permisos de administrador**:

### Método 1: Con el Lanzador Directo (Recomendado)
Haga doble clic en el archivo:
> **`Abrir_AgroCaldas.bat`**
- Abre AgroCaldas inmediatamente en **Modo Aplicación de Escritorio** (ventana limpia e independiente, sin barras de navegación molestas).
- **100% inmune a bloqueos de firewall y restricciones de red**.

### Método 2: Archivo Único Autónomo
Haga doble clic directamente sobre:
> **`AgroCaldas_Standalone.html`**
- Es un archivo único que contiene todo el sistema (código, estilos, base de datos local y gráficos). Puede moverlo a su Escritorio, a una memoria USB o enviarlo por correo o WhatsApp. Funciona en cualquier computador o celular sin conexión a internet.

### Método 3: Crear Acceso Directo en el Escritorio
Haga doble clic en:
> **`Crear_Acceso_Directo_Escritorio.bat`**
- Creará un acceso directo en su pantalla de Escritorio para abrir AgroCaldas con un solo clic.

---

## 🌾 Módulos y Funcionalidades Principales

### 1. Panel de Control (Dashboard)
- **KPIs en tiempo real:** Hectáreas totales cultivadas, arrobas (@) de café recolectadas, balance financiero neto en pesos colombianos (COP $) y conteo de alertas activas.
- **Gráfica Financiera Mensual:** Comparativo de ingresos vs. gastos de los últimos 6 meses en SVG interactivo.
- **Distribución de Cultivos:** Gráfico Donut de ocupación por hectáreas (Café, Plátano, Aguacate Hass, Caña panelera, Cítricos).
- **Estación Climática de Anserma:** Clima en vivo (Open-Meteo) con humedad relativa, precipitación, fase lunar actual y recomendaciones fitosanitarias de Cenicafé.
- **Acceso Rápido:** Botón flotante para registrar cosechas, gastos, labores o movimientos de stock con un clic.

### 2. Fincas y Lotes
- Registro de predios con selector de **Veredas oficiales de Anserma** (*Bellavista, Chápata, El Horro, Tabla Roja, Cauya, Partidas, San Jerónimo, Tamarvia, La Nubia, Morro Azul*, etc.).
- Caracterización topográfica de cada lote (pendiente suave, media, ladera quebrada típica de Caldas).
- Tipo de suelo (franco-arenoso volcánico) y estado de producción.

### 3. Siembras y Cultivos
- Registro por lote de variedades tradicionales y tecnificadas (*Café Castillo, Cenicafé 1, Plátano Dominico Hartón, Aguacate Hass*).
- Cálculo de densidad de siembra (plantas por hectárea) y distancia de surcos.
- Seguimiento del estado fenológico: *Almácigo, Crecimiento vegetativo, Floración, Producción activa y Zoqueo/Renovación*.

### 4. Cosechas y Rendimientos
- Registro de recolección en **Arrobas (@)** para café (12.5 Kg) y **Kilogramos (Kg)** para otros rubros.
- Calidad y factor de rendimiento (Pergamino Seco Extra, Pasilla, Exportación).
- Destino o comprador (*Cooperativa de Caficultores de Anserma - Coopcafé*, compradores locales).
- **Sincronización Automática:** Opción de registrar el valor vendido como ingreso directo en el módulo de finanzas.
- Exportación del histórico de cosechas a formato **CSV** compatible con Microsoft Excel.

### 5. Inventario de Insumos y Bodega
- Control de existencias para:
  - Fertilizantes edáficos (17-6-18-2, Urea 46%, Gallinaza, DAP).
  - Plaguicidas y fungicidas (Oxicloruro de cobre, trampas Brocap para broca).
  - Empaques (Costales de fique tradicionales).
  - Herramientas y maquinaria de beneficio (despulpadoras, tanques tina).
- **Control de Stock Mínimo:** Genera alertas visuales automáticas en rojo cuando el stock cae por debajo del nivel de seguridad.
- Registro de movimientos de **Entrada (compras)** y **Salida (aplicaciones a lotes)** con vinculación a gastos financieros.

### 6. Gastos e Ingresos (Finanzas Agrícolas)
- Flujo de caja en moneda local (**COP $**).
- Clasificación de gastos típicos cafeteros:
  - Mano de obra y jornales de recolección (por kilo/arroba).
  - Jornales de limpia, deshierbe y plateo manual.
  - Compra de fertilizantes y agroquímicos.
  - Fletes y transporte en Willys o campero a Anserma o Manizales.
  - Mantenimiento de despulpadoras y guadañas.
- Cálculo automático de **Utilidad Neta** y margen de rentabilidad porcentual.
- Exportación de libros contables a **CSV**.

### 7. Calendario Agrícola y Labores
- Cuadrícula mensual interactiva y lista de labores programadas.
- Actividades clasificadas: *Fertilización, Fumigación preventiva, Deshierbe, Podas/Zoqueo, Cosecha, Mantenimiento de beneficio*.
- Cambio de estado en un clic: `Pendiente` ➔ `En Curso` ➔ `Completada`.

### 8. Alertas y Asistente Fitosanitario
- Alertas automáticas de stock crítico y labores vencidas.
- Alertas climáticas de temporada para la vertiente occidental de Caldas (picos de lluvia en octubre, riesgo de roya, control biológico de broca con trampeo RE-RE).
- Creación de alertas manuales personalizadas por predio.

### 9. Persistencia de Datos y Respaldo
- Todos los datos se guardan de forma **100% persistente** en el almacenamiento local del dispositivo (`localStorage`).
- Botón para **Descargar Copia de Seguridad completa en formato JSON**.
- Botón para **Restaurar Copia de Seguridad** desde un archivo JSON previamente guardado.
- Botón para restablecer en cualquier momento los datos modelo de demostración de Anserma Caldas.

---

## 🎨 Diseño y Usabilidad
- **Paleta de Colores:** Verde cafetero (#15803d / #16a34a / #f0fdf4) y Blanco (#ffffff / #f8faf9).
- **Adaptable a Móviles (Responsive):** Barra inferior de navegación rápida (*Bottom Nav Bar*) en pantallas táctiles y menú lateral (*Sidebar*) colapsable.
- **PWA Ready:** Compatible con instalación directa en teléfonos Android o iOS para acceso directo sin conexión celular en veredas remotas.
