/**
 * AgroCaldas - Módulo Agroclimático y Recomendaciones de Anserma, Caldas
 * Coordenadas: Latitud 5.237, Longitud -75.786 | Altitud: ~1.790 m.s.n.m.
 * Clima andino cafetero, fases lunares y alertas fitosanitarias
 */

export const ANSERMA_GEO = {
  municipio: 'Anserma',
  departamento: 'Caldas',
  pais: 'Colombia',
  latitud: 5.237,
  longitud: -75.786,
  altitud: 1790, // metros sobre el nivel del mar
  zonaClimatica: 'Clima Templado / Cafetero Andino',
  temperaturaMedia: '20.2 °C'
};

// Calendario fitosanitario y fenológico típico de la caficultura en Caldas
export const RECOMENDACIONES_CALDAS = [
  {
    mes: 10, // Octubre
    titulo: 'Pico de Cosecha Cafetera Principal en Anserma',
    temporada: 'Lluvias de segundo semestre y recolección activa',
    practicas: [
      'Realizar recolección selectiva (RE-RE) cada 15 a 20 días para evitar caída de café maduro y proliferación de broca.',
      'Calibrar adecuadamente la despulpadora para evitar grano mordido o despulpado incompleto.',
      'Aprovechar las marquesinas parabólicas para secar el café hasta alcanzar entre el 10% y 12% de humedad.',
      'No descuidar el drenaje en lotes con pendiente para evitar encharcamientos o deslizamientos.'
    ]
  },
  {
    mes: 11, // Noviembre
    titulo: 'Finalización de Cosecha y Labores Post-Cosecha',
    temporada: 'Cosecha de pases tardíos y repase',
    practicas: [
      'Hacer el repase final (recoger todo grano maduro, sobremaduro y seco del árbol y del suelo) para romper el ciclo biológico de la broca.',
      'Hacer mantenimiento general a las tolvas, tanques tina y despulpadoras.',
      'Programar la aplicación de cal o enmiendas según análisis de suelo previo a la fertilización de fin de año.'
    ]
  },
  {
    mes: 12, // Diciembre
    titulo: 'Zoqueo y Renovación de Cafetales',
    temporada: 'Inicio de temporada seca de fin de año',
    practicas: [
      'Identificar lotes con más de 5 o 6 años de producción para renovar por siembra o zoqueo.',
      'Realizar podas de formación en cultivos asociados como aguacate Hass y cítricos.',
      'Deschuponar y deshijar en plataneras asociadas.'
    ]
  }
];

// Cálculo de fase lunar aproximada
export function getMoonPhase(date = new Date()) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 3) {
    year--;
    month += 12;
  }

  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09; // Días julianos relativos
  jd /= 29.5305882; // Ciclo sinódico lunar
  let b = parseInt(jd);
  jd -= b; // Fracción
  let phaseIndex = Math.round(jd * 8);

  if (phaseIndex >= 8) phaseIndex = 0;

  const phases = [
    { name: 'Luna Nueva', icon: '🌑', laborRecomendada: 'Labores de suelo, deshierbe de raíz y preparación de abonos.' },
    { name: 'Luna Creciente', icon: '🌒', laborRecomendada: 'Siembra de hortalizas y frutales, aplicación de fertilizantes foliares.' },
    { name: 'Cuarto Creciente', icon: '🌓', laborRecomendada: 'Abonado de cafetales, trasplante de almácigos a campo definitivo.' },
    { name: 'Gibosa Creciente', icon: '🌔', laborRecomendada: 'Buen momento para desarrollo vegetativo y control preventivo.' },
    { name: 'Luna Llena', icon: '🌕', laborRecomendada: 'Recolección de café y cosecha de plátano (máximo peso y turgencia). Evitar podas.' },
    { name: 'Gibosa Menguante', icon: '🌖', laborRecomendada: 'Cosecha de granos para secado y almacenamiento.' },
    { name: 'Cuarto Menguante', icon: '🌗', laborRecomendada: 'Podas, deschuponado, zoqueo y control de malezas (menor sangrado de savia).' },
    { name: 'Luna Menguante', icon: '🌘', laborRecomendada: 'Limpieza de lotes y mantenimiento de drenajes y herramientas.' }
  ];

  return phases[phaseIndex];
}

// Obtener pronóstico de clima para Anserma (Online vía Open-Meteo con fallback offline)
export async function getAnsermaWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ANSERMA_GEO.latitud}&longitude=${ANSERMA_GEO.longitud}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FBogota`;

    // Timeout de 3.5 segundos para no demorar la interfaz si no hay internet
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Error consultando Open-Meteo');
    const data = await res.json();

    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const humidity = current.relative_humidity_2m;
    const precipitation = current.precipitation;
    const weatherCode = current.weather_code;

    const weatherInfo = decodeWeatherCode(weatherCode);

    return {
      online: true,
      temperatura: temp,
      sensacionTermica: Math.round(current.apparent_temperature),
      humedad: humidity,
      precipitacion: precipitation,
      vientoKmH: Math.round(current.wind_speed_10m),
      descripcion: weatherInfo.texto,
      icono: weatherInfo.icono,
      alertaFitosanitaria: getFitosanitaryAlert(humidity, temp, precipitation)
    };
  } catch (err) {
    // Modo offline con clima promedio realista de Anserma para el mes de octubre
    const defaultTemp = 20;
    const defaultHumidity = 82;
    return {
      online: false,
      temperatura: defaultTemp,
      sensacionTermica: 21,
      humedad: defaultHumidity,
      precipitacion: 2.4,
      vientoKmH: 8,
      descripcion: 'Nubosidad parcial con lloviznas intermitentes',
      icono: '⛅',
      alertaFitosanitaria: getFitosanitaryAlert(defaultHumidity, defaultTemp, 2.4)
    };
  }
}

function decodeWeatherCode(code) {
  if (code === 0) return { texto: 'Despejado / Soleado', icono: '☀️' };
  if (code === 1 || code === 2) return { texto: 'Parcialmente Nublado', icono: '⛅' };
  if (code === 3) return { texto: 'Cielo Nublado', icono: '☁️' };
  if (code >= 45 && code <= 48) return { texto: 'Neblina en vertiente', icono: '🌫️' };
  if (code >= 51 && code <= 55) return { texto: 'Llovizna suave', icono: '🌦️' };
  if (code >= 61 && code <= 65) return { texto: 'Lluvias moderadas', icono: '🌧️' };
  if (code >= 80 && code <= 82) return { texto: 'Chubascos cafeteros', icono: '🌧️' };
  if (code >= 95) return { texto: 'Tormenta eléctrica andina', icono: '⛈️' };
  return { texto: 'Templado andino', icono: '🌤️' };
}

function getFitosanitaryAlert(humidity, temp, rain) {
  if (humidity > 80 && temp >= 18 && temp <= 22) {
    return {
      nivel: 'warning',
      mensaje: 'Condiciones favorables para Roya del Cafeto y Antracnosis. Mantener ventilación en lotes y nutrición potásica.'
    };
  }
  if (rain > 15) {
    return {
      nivel: 'danger',
      mensaje: 'Precipitación alta: suspender aplicaciones foliares y revisar canales de descole en lotes pendientes.'
    };
  }
  return {
    nivel: 'info',
    mensaje: 'Clima apto para recolección de café y secado en elbas o marquesinas.'
  };
}
