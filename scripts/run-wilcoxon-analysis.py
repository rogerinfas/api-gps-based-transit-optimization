import os
import pandas as pd
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt

def run_analysis():
    # Rutas relativas a los directorios de trabajo
    csv_path = 'data_test/wilcoxon_experiment.csv'
    assets_dir = '/home/acide/Descargas/project-reports/TESIS_ROGER_INFA_SANCHEZ/assets'
    chart_path = os.path.join(assets_dir, 'grafico-wilcoxon.png')
    
    # 1. Cargar datos
    if not os.path.exists(csv_path):
        print(f"Error: No se encuentra el archivo CSV en {csv_path}")
        return
    
    df = pd.read_csv(csv_path)
    pre = df['pre_waiting_time'].values
    post = df['post_waiting_time'].values
    
    # 2. Estadísticos Descriptivos
    mean_pre, mean_post = np.mean(pre), np.mean(post)
    median_pre, median_post = np.median(pre), np.median(post)
    std_pre, std_post = np.std(pre, ddof=1), np.std(post, ddof=1)
    min_pre, min_post = np.min(pre), np.min(post)
    max_pre, max_post = np.max(pre), np.max(post)
    
    print("--- Estadísticas Descriptivas ---")
    print(f"Pre-test: Media={mean_pre:.2f}, Mediana={median_pre:.2f}, Desv.Est={std_pre:.2f}, Min={min_pre:.2f}, Max={max_pre:.2f}")
    print(f"Post-test: Media={mean_post:.2f}, Mediana={median_post:.2f}, Desv.Est={std_post:.2f}, Min={min_post:.2f}, Max={max_post:.2f}")
    
    # 3. Prueba de Normalidad (Shapiro-Wilk)
    stat_shapiro_pre, p_shapiro_pre = stats.shapiro(pre)
    stat_shapiro_post, p_shapiro_post = stats.shapiro(post)
    
    print("\n--- Prueba de Normalidad de Shapiro-Wilk ---")
    print(f"Pre-test: W={stat_shapiro_pre:.4f}, p-valor={p_shapiro_pre:.4f} "
          f"({'No Normal' if p_shapiro_pre < 0.05 else 'Normal'})")
    print(f"Post-test: W={stat_shapiro_post:.4f}, p-valor={p_shapiro_post:.4f} "
          f"({'No Normal' if p_shapiro_post < 0.05 else 'Normal'})")
    
    # 4. Prueba de Rangos con Signo de Wilcoxon
    # Hipótesis alternativa: post es menor que pre -> pre > post ('greater')
    stat_wilcoxon, p_wilcoxon = stats.wilcoxon(pre, post, alternative='greater')
    
    # Calcular rangos positivos y negativos manualmente para el reporte
    diff = pre - post
    non_zero_diffs = diff[diff != 0]
    ranks = stats.rankdata(np.abs(non_zero_diffs))
    pos_ranks = ranks[non_zero_diffs > 0]
    neg_ranks = ranks[non_zero_diffs < 0]
    
    sum_pos_ranks = np.sum(pos_ranks)
    sum_neg_ranks = np.sum(neg_ranks)
    
    print("\n--- Prueba de Rangos con Signo de Wilcoxon ---")
    print(f"Suma de rangos positivos (W+): {sum_pos_ranks}")
    print(f"Suma de rangos negativos (W-): {sum_neg_ranks}")
    print(f"Estadístico de Wilcoxon (W): {stat_wilcoxon}")
    print(f"p-valor: {p_wilcoxon:.2e}")
    print(f"Conclusión (alfa=0.05): {'Rechazar H0' if p_wilcoxon < 0.05 else 'No rechazar H0'}")
    
    # 5. Generar Gráfico de Cajas (Boxplot)
    os.makedirs(assets_dir, exist_ok=True)
    
    plt.figure(figsize=(7, 5))
    box_colors = ['#f87171', '#60a5fa'] # Colores pastel (rojo para pre, azul para post)
    median_color = '#1e293b'
    
    # Use tick_labels parameter to avoid deprecation warnings
    bplot = plt.boxplot([pre, post], patch_artist=True, tick_labels=['Pre-test (Sin GPS)', 'Post-test (Con GPS)'],
                        medianprops=dict(color=median_color, linewidth=2),
                        boxprops=dict(linewidth=1.5),
                        whiskerprops=dict(linewidth=1.5),
                        capprops=dict(linewidth=1.5))
    
    for patch, color in zip(bplot['boxes'], box_colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)
        
    plt.title('Distribución de Tiempos de Espera (Pre-test vs Post-test)', fontsize=12, fontweight='bold', pad=15)
    plt.ylabel('Tiempo de Espera (minutos)', fontsize=10)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    
    plt.savefig(chart_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"\n[OK] Gráfico guardado en: {chart_path}")
    
    # 6. Generar Código de Tabla LaTeX para la tesis
    # Nota: Usamos \resizebox{\textwidth}{!}{...} para evitar que las tablas se salgan por la derecha
    latex_table = f"""
\\begin{{table}}[H]
\\centering
\\caption{{Estadísticos descriptivos y resultados de normalidad (N=20)}}
\\label{{tab:descriptivos_wilcoxon}}
\\resizebox{{\\textwidth}}{{!}}{{%
\\begin{{tabular}}{{|l|c|c|c|c|c|c|}}
\\hline
\\rowcolor[HTML]{{F3F4F6}} 
\\textbf{{Grupo}} & \\textbf{{Media (min)}} & \\textbf{{Mediana (min)}} & \\textbf{{Desv. Est.}} & \\textbf{{Mínimo}} & \\textbf{{Máximo}} & \\textbf{{Shapiro-Wilk (p)}} \\\\ \\hline
Pre-test (Sin GPS) & {mean_pre:.2f} & {median_pre:.2f} & {std_pre:.2f} & {min_pre:.2f} & {max_pre:.2f} & {p_shapiro_pre:.4f} \\\\ \\hline
Post-test (Con GPS) & {mean_post:.2f} & {median_post:.2f} & {std_post:.2f} & {min_post:.2f} & {max_post:.2f} & {p_shapiro_post:.4f} \\\\ \\hline
\\end{{tabular}}%
}}
\\figcaptionwithauthor{{Estadísticas descriptivos del experimento de tiempos de espera}}
\\end{{table}}

\\begin{{table}}[H]
\\centering
\\caption{{Resultados de la prueba de Wilcoxon (Muestras Relacionadas)}}
\\label{{tab:resultado_wilcoxon}}
\\resizebox{{\\textwidth}}{{!}}{{%
\\begin{{tabular}}{{|l|c|c|c|c|}}
\\hline
\\rowcolor[HTML]{{F3F4F6}} 
\\textbf{{Comparación}} & \\textbf{{Suma Rangos ($W^+$)}} & \\textbf{{Suma Rangos ($W^-$)}} & \\textbf{{Estadístico $W$}} & \\textbf{{p-valor}} \\\\ \\hline
Pre-test > Post-test & {sum_pos_ranks:.1f} & {sum_neg_ranks:.1f} & {stat_wilcoxon:.1f} & {p_wilcoxon:.2e} \\\\ \\hline
\\end{{tabular}}%
}}
\\figcaptionwithauthor{{Resultados de la prueba de rangos con signo de Wilcoxon}}
\\end{{table}}
"""
    print("\n--- Tabla LaTeX Generada (Copiar al documento) ---")
    print(latex_table)
    
    # Guardar la tabla en un archivo temporal de texto
    os.makedirs('data_test', exist_ok=True)
    with open('data_test/wilcoxon_tables.tex', 'w', encoding='utf-8') as f:
        f.write(latex_table)
    print("[OK] Tablas de LaTeX escritas en data_test/wilcoxon_tables.tex")

if __name__ == '__main__':
    run_analysis()
