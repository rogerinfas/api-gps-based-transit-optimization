import csv
import numpy as np

# Cargar datos
pre = []
post = []
ids = []

with open('data_test/wilcoxon_experiment.csv', 'r') as f:
    reader = csv.reader(f)
    next(reader) # skip header
    for row in reader:
        ids.append(int(row[0]))
        pre.append(float(row[1]))
        post.append(float(row[2]))

# Paso 1: Cálculo de Diferencias
diffs = [round(pre[i] - post[i], 1) for i in range(len(pre))]

# Paso 2: Filtrado de Ceros
filtered = [(ids[i], pre[i], post[i], diffs[i]) for i in range(len(diffs)) if diffs[i] != 0]

# Paso 3: Ordenamiento de Valores Absolutos
abs_diffs = []
for item in filtered:
    abs_diffs.append({
        'id': item[0],
        'pre': item[1],
        'post': item[2],
        'diff': item[3],
        'abs': abs(item[3])
    })

# Ordenar de menor a mayor por valor absoluto
abs_diffs.sort(key=lambda x: x['abs'])

# Asignar posiciones consecutivas (cajitas) de 1 a N
for i, item in enumerate(abs_diffs):
    item['pos_caja'] = i + 1

# Paso 4: Tratamiento de Empates (Promedios)
unique_abs = sorted(list(set([x['abs'] for x in abs_diffs])))
for u in unique_abs:
    matching = [x for x in abs_diffs if x['abs'] == u]
    if len(matching) > 1:
        sum_cajas = sum([x['pos_caja'] for x in matching])
        avg_pos = sum_cajas / len(matching)
        for x in matching:
            x['pos_final'] = avg_pos
    else:
        matching[0]['pos_final'] = float(matching[0]['pos_caja'])

# Paso 5: Asignación de Signos
for item in abs_diffs:
    item['signo'] = '+' if item['diff'] > 0 else '-'
    item['pos_signada'] = item['pos_final'] if item['signo'] == '+' else -item['pos_final']

# Volver a ordenar por ID
abs_diffs.sort(key=lambda x: x['id'])

# Paso 6: Sumatorias por Signo
sum_pos = sum([x['pos_final'] for x in abs_diffs if x['signo'] == '+'])
sum_neg = sum([x['pos_final'] for x in abs_diffs if x['signo'] == '-'])
w_stat = min(sum_pos, sum_neg)

print("--- N = 20 RESULTADOS ---")
print(f"W+ = {sum_pos}")
print(f"W- = {sum_neg}")
print(f"W = {w_stat}")
print(f"N efectivo = {len(abs_diffs)}")

# Generar el código de la tabla LaTeX en una tabla con tabular y resizebox
latex_rows = ""
for item in abs_diffs:
    latex_rows += f"{item['id']} & {item['pre']:.1f} & {item['post']:.1f} & {item['diff']:.1f} & {item['abs']:.1f} & {item['pos_caja']} & {item['pos_final']:.1f} & {item['signo']} & {item['pos_signada']:.1f} \\\\ \\hline\n"

table_code = f"""
\\begin{{table}}[H]
\\centering
\\caption{{Cálculo paso a paso de rangos para la Prueba de Wilcoxon (N=20)}}
\\label{{tab:wilcoxon_paso_a_paso}}
\\resizebox{{\\textwidth}}{{!}}{{%
\\begin{{tabular}}{{|c|c|c|c|c|c|c|c|c|}}
\\hline
\\rowcolor[HTML]{{F3F4F6}} 
\\textbf{{ID}} & \\textbf{{Pre-test ($X_1$)}} & \\textbf{{Post-test ($X_2$)}} & \\textbf{{Dif. ($d_i$)}} & \\textbf{{Abs. ($|d_i|$)}} & \\textbf{{Caja Temp.}} & \\textbf{{Rango Final}} & \\textbf{{Signo}} & \\textbf{{Rango Signado}} \\\\ \\hline
{latex_rows}
\\end{{tabular}}%
}}
\\figcaptionwithauthor{{Desglose del cálculo de rangos para la Prueba de Wilcoxon}}
\\end{{table}}
"""

import os
os.makedirs('data_test', exist_ok=True)
with open('data_test/wilcoxon_table_n20.tex', 'w', encoding='utf-8') as f:
    f.write(table_code)

print("[OK] Tabla LaTeX N=20 guardada en data_test/wilcoxon_table_n20.tex")

# Generar el archivo CSV con el paso a paso
csv_header = ['ID', 'Pre-test (X1)', 'Post-test (X2)', 'Dif (di)', 'Abs (di)', 'Caja Temp', 'Rango Final', 'Signo', 'Rango Signado']
with open('data_test/wilcoxon_step_by_step_n20.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(csv_header)
    for item in abs_diffs:
        writer.writerow([
            item['id'],
            f"{item['pre']:.1f}",
            f"{item['post']:.1f}",
            f"{item['diff']:.1f}",
            f"{item['abs']:.1f}",
            item['pos_caja'],
            f"{item['pos_final']:.1f}",
            item['signo'],
            f"{item['pos_signada']:.1f}"
        ])

print("[OK] Tabla paso a paso N=20 guardada en CSV en data_test/wilcoxon_step_by_step_n20.csv")

