# Supporting assets

- `charts/` — 300-dpi PNG charts used in the deck (dark theme, transparent cover art).
- `source/make_charts.py` — regenerates every chart from `data/Financial_dataset_cleaned.csv` (set `SP500_DATA` to point elsewhere). Needs numpy, pandas, scipy, matplotlib; font Carlito (or edit the font name).
- `source/arma.py` — exact Gaussian ARMA(2,2) likelihood (Kalman filter) used only to reproduce the report's ARIMA(2,0,2) forecasts.
- `source/build_deck.js` — pptxgenjs script that builds the .pptx (fonts: Calibri/Cambria; native tables and bar charts remain editable).
- `QA_and_discrepancy_log.md` — verification results and file discrepancies.
