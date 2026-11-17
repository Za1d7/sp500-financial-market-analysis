# Financial Market Dynamics: Econometric Analysis & Time-Series Forecasting

*An empirical investigation of financial market indicators, equity returns and forecasting performance using Python.*

## Project Overview

This project examines the relationship between selected financial market indicators and daily S&P 500 returns over the period October 2016–October 2026. It combines data acquisition and preprocessing, exploratory analysis, econometric modelling, statistical diagnostics and time-series forecasting.

The study distinguishes between **explaining contemporaneous return variation** and **forecasting future returns**. Statistical relationships identified by the regression models are interpreted as associations, not causal effects.

## Research Question

> To what extent can financial market indicators explain fluctuations in S&P 500 returns, and how effectively can historical market data be used to forecast future market movements?

## Data

The analysis uses five financial time series sourced from the Federal Reserve Economic Data (FRED) database:

| Series | FRED identifier | Description |
|---|---|---|
| S&P 500 | `SP500` | S&P 500 index |
| VIX | `VIXCLS` | CBOE Volatility Index |
| 10-Year Treasury Yield | `DGS10` | 10-year US Treasury constant-maturity yield |
| Brent Crude Oil | `DCOILBRENTEU` | Europe Brent crude oil price |
| Federal Funds Rate | `DFF` | Effective federal funds rate |

The raw and processed datasets are included in the `Data/` directory. The analysis uses engineered return and change variables derived from the original series.

## Methodology

The project is organised into three analytical phases.

### Phase 1 — Data Acquisition and Preprocessing

- Acquisition of financial time-series data from FRED.
- Integration of the five source series into a master dataset.
- Data inspection and missing-value treatment.
- Feature engineering, including return and change variables.
- Outlier identification and review.
- Export of raw and cleaned datasets.

**Notebook:** [`PHASE 1.ipynb`](Notebooks/PHASE%201.ipynb)  
**HTML version:** [`PHASE 1.html`](Notebooks/HTML/PHASE%201.html)

### Phase 2 — Statistical and Econometric Analysis

- Descriptive statistics and exploratory data analysis.
- Covariance and correlation analysis.
- Simple and multiple linear regression.
- Regression diagnostics and multicollinearity assessment.
- Conventional and robust statistical inference, including HC3 and Newey–West HAC standard errors.
- Sensitivity analysis and model evaluation.

**Notebook:** [`PHASE 2.ipynb`](Notebooks/PHASE%202.ipynb)  
**HTML version:** [`PHASE 2.html`](Notebooks/HTML/PHASE%202.html)

### Phase 3 — Time-Series Analysis and Forecasting

- Time-series exploration and decomposition.
- Stationarity testing using the Augmented Dickey–Fuller test.
- ARIMA model estimation and comparison.
- Residual diagnostics.
- Static and rolling out-of-sample forecasts.
- Forecast evaluation against benchmark approaches.
- Supplementary robustness and forecast-comparison analyses.

**Notebook:** [`PHASE 3.ipynb`](Notebooks/PHASE%203.ipynb)  
**HTML version:** [`PHASE 3.html`](Notebooks/HTML/PHASE%203.html)

## Key Findings

- Changes in the VIX show a strong negative association with S&P 500 returns in the multiple regression analysis.
- The multiple linear regression model reports an R-squared of approximately **0.6228** for the analysed sample. This is an in-sample explanatory measure; it should not be interpreted as evidence of out-of-sample forecasting ability.
- Brent crude oil returns are statistically significant in the regression analysis, while the significance of some other coefficients depends on the inference specification.
- Robust standard-error and sensitivity analyses demonstrate why regression conclusions should be evaluated beyond conventional OLS standard errors.
- ARIMA forecasting provides limited improvement over simple benchmark forecasts in the static evaluation, while the rolling forecasts do not consistently outperform the zero-return benchmark.

Overall, the results highlight the difference between identifying contemporaneous statistical relationships and producing reliable forecasts of daily equity returns.

## Technology Stack

- **Language:** Python
- **Data handling:** Pandas, NumPy
- **Statistical analysis:** SciPy, Statsmodels, Scikit-learn
- **Visualisation:** Matplotlib, Seaborn
- **Environment:** Jupyter Notebook
- **Version control:** Git and GitHub

## Repository Structure

```text
sp500-financial-market-analysis/
│
├── Data/
│   ├── Raw/
│   │   └── Financial_dataset_Raw.csv
│   └── Processed/
│       └── Financial_dataset_cleaned.csv
│
├── Notebooks/
│   ├── PHASE 1.ipynb
│   ├── PHASE 2.ipynb
│   ├── PHASE 3.ipynb
│   └── HTML/
│       ├── PHASE 1.html
│       ├── PHASE 2.html
│       └── PHASE 3.html
│
├── Reports/
│   └── SP_500_Financial_Market_Dynamics.pdf
│
├── README.md
├── requirements.txt
└── .gitignore
```

## Research Report

The complete academic report is available here:

[`SP_500_Financial_Market_Dynamics.pdf`](Reports/SP_500_Financial_Market_Dynamics.pdf)

The report documents the research design, data preparation, statistical analysis, forecasting evaluation, findings and limitations.

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd sp500-financial-market-analysis
```

### 2. Create and activate a virtual environment (recommended)

```bash
python -m venv .venv
```

On Windows:

```bash
.venv\Scripts\activate
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Open the notebooks

```bash
jupyter notebook
```

Open the notebooks in the `Notebooks/` directory. Run Phase 1 before Phases 2 and 3 if you want to reproduce the data-preparation workflow from the beginning. The notebooks use repository-relative paths to locate the datasets.

## Limitations and Interpretation

- The analysis is based on historical observations and does not establish causal relationships.
- Regression results describe statistical associations within the analysed sample.
- In-sample explanatory performance does not imply out-of-sample predictive performance.
- Daily financial returns are noisy, and forecasting performance is assessed against benchmark forecasts rather than assumed from model fit alone.
- Findings should be interpreted within the study period and the data and modelling choices documented in the notebooks and final report.

## Data Source

Data were obtained from [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org/), maintained by the Federal Reserve Bank of St. Louis.

This repository is intended for academic, educational and research purposes. It is not investment advice.
