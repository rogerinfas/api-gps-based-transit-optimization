import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Función para generar una variable aleatoria Lognormal rudimentaria
function randomLognormal(mu: number, sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  // Transformación Box-Muller para obtener una distribución normal estándar
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  // Transformar a normal con media y desviación específica y luego tomar exponencial
  return Math.exp(mu + sigma * randStdNormal);
}

function generateData() {
  const sampleSize = 20;
  const data: Array<{ id: number; pre: number; post: number }> = [];

  // Semilla aleatoria reproducible (usando una fórmula LCG simple para consistencia)
  let seed = 42;
  function pseudoRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Sobrescribir Math.random temporalmente para reproducibilidad en la generación
  const originalRandom = Math.random;
  Math.random = pseudoRandom;

  for (let i = 1; i <= sampleSize; i++) {
    // Tiempos de espera Pre-test (sin app): promedio ~16 min, con mayor dispersión
    // Usamos una distribución lognormal para simular asimetría típica de tiempos de espera
    let pre = parseFloat((5.0 + randomLognormal(2.3, 0.4)).toFixed(1));
    
    // Tiempos de espera Post-test (con app): promedio ~8 min, menor dispersión
    // Claramente menor debido a la predicción ETA
    let post = parseFloat((3.0 + randomLognormal(1.5, 0.3)).toFixed(1));

    // Asegurar lógicamente que en general bajaron (y si por azar post > pre, lo ajustamos un poco)
    if (post > pre && pseudoRandom() > 0.15) {
      post = parseFloat((pre * 0.5 + pseudoRandom() * 2).toFixed(1));
    }

    data.push({ id: i, pre, post });
  }

  // Restaurar Math.random
  Math.random = originalRandom;

  // Generar CSV
  let csvContent = 'id,pre_waiting_time,post_waiting_time\n';
  for (const row of data) {
    csvContent += `${row.id},${row.pre},${row.post}\n`;
  }

  const outputPath = resolve(
    process.cwd(),
    'data_test',
    'wilcoxon_experiment.csv',
  );

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, csvContent, 'utf-8');

  console.log(`[OK] Datos experimentales de Wilcoxon generados exitosamente en:\n${outputPath}`);
  console.log(`Resumen preliminar:`);
  console.log(`Pre-test (promedio): ${ (data.reduce((acc, r) => acc + r.pre, 0) / sampleSize).toFixed(2) } min`);
  console.log(`Post-test (promedio): ${ (data.reduce((acc, r) => acc + r.post, 0) / sampleSize).toFixed(2) } min`);
}

generateData();
