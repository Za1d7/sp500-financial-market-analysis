# QA and discrepancy log — Financial Market Dynamics presentation

Source hierarchy followed: (1) final report, (2) notebooks, (3) CSVs, (4) README. Where sources disagree, the report's reported result is used.

## 1. Numerical cross-checks (all passed)

| Item | Report | Independently recomputed / notebook output |
|---|---|---|
| Raw / cleaned dimensions | 2,607 × 6 / 2,320 × 11 | CSV shapes match |
| Complete-case rows removed | 287 (2,607 → 2,320, 88.99%) | Recomputed from raw CSV: 287; 94 dates with valid return but incomplete covariates |
| Simple OLS | slope −0.4535, R² 0.6187, adj. 0.6185 | Recomputed (numpy): identical |
| Multiple OLS | R² 0.6228, adj. 0.6221; coefficients in Table 2 | Recomputed: identical to 4 dp |
| OLS / HC3 / HAC(5) p-values | Table 2 | Recomputed by hand-coded HC3 and Newey–West: match (HAC p within rounding of small-sample correction) |
| Correlations with S&P 500 return | −0.7866, 0.1762, 0.1148, 0.0115 | Recomputed: identical |
| Train / test split | 1,856 / 464; cut 21 Oct / 22 Oct 2024 | Recomputed: identical |
| Zero, historical-mean, expanding-mean MAE/RMSE | Table 3 | Recomputed: identical |
| ARIMA(2,0,2) | AIC 5734.5520, BIC 5767.7091, logL −2861.2760, params in Table F2 | Re-estimated with an exact Gaussian likelihood (Kalman filter): identical |
| Static / rolling ARIMA MAE, RMSE, mean error, MSE | 0.6724/1.0197/0.0047; 0.6891/1.0273/0.0053 | Re-derived from the re-estimated model: identical (Table 3, Table G1 MSE) |
| Other tables (D1, D2, E1, E2, F1, F3, G1–G3) | as printed | Cross-read against executed notebook outputs; values match |

statsmodels was not installable in the build sandbox, so regressions were verified with numpy and the ARIMA with a hand-written exact-likelihood estimator (`assets/source/arma.py`). These are reproduction checks only; no new models or analyses are reported.

## 2. Discrepancies found between files (none altered the report's results)

1. **Phase 1 notebook prose vs CSV/report.** Markdown cells state 2,608 rows (report, CSV and the notebook's own `df.shape`: 2,607); Brent missing = 74 (CSV: 76); rows with any missing value = 152 (CSV: 154); rows removed = 288 (notebook's own computed output and CSV: 287); retention 88.96% (computed 88.99%). The deck uses the CSV/report values (2,607; 76; 287; 88.99%).
2. **README vs report on rolling ARIMA.** README says rolling forecasts "do not consistently outperform the zero-return benchmark". The report (Table 3) shows rolling ARIMA is worse than zero, historical mean, expanding mean and static ARIMA on both MAE and RMSE. The deck follows the report.
3. **README period vs report.** README says "October 2016–October 2026"; the data start 3/4 Nov 2016 (raw/complete) and end 30/27 Oct 2026. The deck states exact dates.
4. **Phase 3 notebook header** reads "Phase 2: Time-series analysis and forecasting" (typo). Not carried into the deck.
5. **Excess kurtosis.** Report 16.3204 follows the pandas (bias-corrected) convention; a plain biased estimator gives 16.28. The deck uses the report value.
6. **Phase 1 notebook** applies a 1 Jan 2016 lower date bound, which the raw file (starting 3 Nov 2016) never reaches; noted in the report, not material.

## 3. Interpretation safeguards in the deck
- Explanatory (in-sample, same-day) and forecasting (out-of-sample) findings are shown separately and not conflated (slides 2, 7, 11, 12).
- Static ARIMA is described as practically indistinguishable from the historical mean; rolling ARIMA as worse than every benchmark. The nominal p = .0479 (static vs expanding mean, absolute loss) is recorded in slide 11's speaker notes with the report's caution.
- Future-research items are labelled as proposed, not conducted.
- Slide numbers/captions state the data source; speaker notes cite report tables.

## 4. Charts
All charts are redrawn from `Financial_dataset_cleaned.csv`; the coefficient plot and ADF/AIC tables use values printed in the report. Axes, units and scales are preserved. Notebook originals were compared for ACF/PACF, correlation matrix, scatter, Q–Q and residual ACF.
