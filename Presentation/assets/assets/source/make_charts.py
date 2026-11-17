"""Chart generator for the Financial Market Dynamics presentation.
All charts are drawn from Data/Processed/Financial_dataset_cleaned.csv.
ARIMA(2,0,2) is re-estimated with an exact Gaussian likelihood (arma.py); it reproduces the report
(AIC 5734.552, MAE/RMSE in Table 3). No new models or analysis are introduced."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, pandas as pd, matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.colors import LinearSegmentedColormap
from scipy import stats

from arma import fit, kf, build

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.environ.get('SP500_DATA', os.path.join(HERE, '..', 'data', 'Financial_dataset_cleaned.csv'))
OUT = os.path.join(HERE, '..', 'charts')
os.makedirs(OUT, exist_ok=True)
BG, PANEL, GRID = '#0B1424', '#121D33', '#24344F'
TXT, MUT = '#F3F6FB', '#9AA8BF'
TEAL, BLUE, RED, GREY = '#2DD4BF', '#5B9CF6', '#F26D6D', '#6B7A93'
for f in fm.findSystemFonts():
    if 'Carlito' in f: fm.fontManager.addfont(f)
mpl.rcParams.update({
    'font.family': 'Carlito', 'font.size': 11, 'text.color': TXT, 'axes.labelcolor': MUT,
    'axes.edgecolor': GRID, 'axes.facecolor': PANEL, 'figure.facecolor': PANEL, 'savefig.facecolor': PANEL,
    'xtick.color': MUT, 'ytick.color': MUT, 'axes.grid': True, 'grid.color': GRID, 'grid.linewidth': 0.6,
    'axes.spines.top': False, 'axes.spines.right': False, 'axes.titlesize': 12, 'axes.titlecolor': TXT,
    'legend.frameon': False, 'legend.labelcolor': MUT})

c = pd.read_csv(DATA, parse_dates=['Date'])
y = c.SP500_Return.values; n = len(y)
cols = ['VIX_Change', 'Treasury_10Y_Change', 'Brent_Oil_Return', 'Fed_Rate_Change']
def save(fig, name, dpi=300):
    fig.savefig(f'{OUT}/{name}.png', dpi=dpi); plt.close(fig)

# 1 cover art: S&P 500 closing level (transparent)
fig, ax = plt.subplots(figsize=(7.6, 4.2)); fig.patch.set_alpha(0); ax.set_facecolor('none')
ax.plot(c.Date, c.SP500_Close, color=TEAL, lw=1.6, alpha=.9)
ax.fill_between(c.Date, c.SP500_Close, c.SP500_Close.min()*0.9, color=TEAL, alpha=.07)
ax.axis('off'); ax.set_ylim(c.SP500_Close.min()*0.9, c.SP500_Close.max()*1.03)
fig.subplots_adjust(0,0,1,1); fig.savefig(f'{OUT}/cover_sp500.png', dpi=300, transparent=True); plt.close(fig)

# 2 returns series
fig, ax = plt.subplots(figsize=(7.2, 2.9))
ax.plot(c.Date, y, color=TEAL, lw=.6)
ax.axhline(0, color=MUT, lw=.6)
ax.set_ylabel('Daily return (%)'); ax.grid(axis='x', visible=False)
ax.annotate('Mar 2020', xy=(pd.Timestamp('2020-03-16'), -11.98), xytext=(pd.Timestamp('2021-02-01'), -10.2), color=MUT, fontsize=10,
            arrowprops=dict(arrowstyle='-', color=MUT, lw=.6))
fig.tight_layout(pad=.8); save(fig, 'returns_ts')

# 3 correlation heatmap
vars_ = ['SP500_Return'] + cols; labs = ['S&P 500\nreturn', 'VIX\nchange', 'Treasury\nchange', 'Brent\nreturn', 'Fed funds\nchange']
cm = c[vars_].corr().values
cmap = LinearSegmentedColormap.from_list('d', [RED, '#2A3550', TEAL])
fig, ax = plt.subplots(figsize=(4.6, 4.0)); ax.grid(False)
im = ax.imshow(cm, cmap=cmap, vmin=-1, vmax=1)
ax.set_xticks(range(5)); ax.set_yticks(range(5)); ax.set_xticklabels(labs, fontsize=9); ax.set_yticklabels(labs, fontsize=9)
for s in ax.spines.values(): s.set_visible(False)
ax.tick_params(length=0)
for i in range(5):
    for j in range(5): ax.text(j, i, f'{cm[i,j]:.3f}', ha='center', va='center', fontsize=10, color=TXT, fontweight='bold' if abs(cm[i,j])>0.5 and i!=j else 'normal')
fig.tight_layout(pad=.8); save(fig, 'heatmap')

# 4 simple regression scatter
x = c.VIX_Change.values; b1, b0 = np.polyfit(x, y, 1)
fig, ax = plt.subplots(figsize=(5.4, 3.5))
ax.scatter(x, y, s=7, color=BLUE, alpha=.35, linewidths=0)
xs = np.linspace(x.min(), x.max(), 50); ax.plot(xs, b0 + b1*xs, color=RED, lw=1.8)
ax.set_xlabel('Daily change in VIX (index points)'); ax.set_ylabel('S&P 500 daily return (%)')
ax.text(.97, .95, f'slope {b1:.4f}'.replace('-','−') + '\nR² = 0.6187', transform=ax.transAxes, ha='right', va='top', color=TXT, fontsize=11)
fig.tight_layout(pad=.8); save(fig, 'scatter_slr')

# 5 coefficient plot with HAC 95% CI (values from report Table 2)
names = ['VIX change', 'Treasury yield change', 'Brent oil return', 'Fed funds rate change']
est = [-0.4484, 0.2438, 0.0204, -0.6229]
lo = [-0.4916, -0.9441, 0.0045, -1.4761]; hi = [-0.4053, 1.4316, 0.0363, 0.2303]
sig = [True, False, True, False]
fig, ax = plt.subplots(figsize=(6.6, 3.5)); ax.grid(axis='y', visible=False)
for i, (e, l, h, s) in enumerate(zip(est, lo, hi, sig)):
    col = TEAL if s else GREY
    ax.plot([l, h], [i, i], color=col, lw=3, solid_capstyle='round'); ax.plot(e, i, 'o', color=col, ms=9, mec=BG, mew=1.5)
    ax.text(h + .05, i, f'{e:+.4f}'.replace('-','−'), va='center', color=TXT if s else MUT, fontsize=11)
ax.axvline(0, color=MUT, lw=.9, ls='--'); ax.set_yticks(range(4)); ax.set_yticklabels(names, fontsize=11); ax.invert_yaxis()
ax.set_xlim(-1.6, 1.95); ax.set_xlabel('Coefficient (pp of S&P 500 return per unit), with Newey–West HAC 95% CI')
fig.tight_layout(pad=.8); save(fig, 'coef_plot')

# MLR residuals
X = np.column_stack([np.ones(n)] + [c[k].values for k in cols]); beta = np.linalg.solve(X.T@X, X.T@y); res = y - X@beta
# 6 residual QQ + ACF
fig, ax = plt.subplots(figsize=(3.0, 2.4))
(osm, osr), (sl, ic, r) = stats.probplot(res, dist='norm')
ax.scatter(osm, osr, s=5, color=BLUE, alpha=.6, linewidths=0); ax.plot(osm, sl*osm + ic, color=RED, lw=1.2)
ax.set_xlabel('Theoretical quantiles', fontsize=9); ax.set_ylabel('Residuals', fontsize=9); ax.set_title('Normal Q–Q', fontsize=10, loc='left')
ax.tick_params(labelsize=8); fig.tight_layout(pad=.6); save(fig, 'diag_qq')
def acf(v, L):
    v = v - v.mean(); d = v@v; return np.array([v[:len(v)-k]@v[k:]/d for k in range(1, L+1)])
def stem(ax, vals, nn, color=TEAL):
    L = len(vals); k = np.arange(1, L+1); ax.vlines(k, 0, vals, color=color, lw=1.4); ax.plot(k, vals, 'o', color=color, ms=3)
    bd = 1.96/np.sqrt(nn); ax.axhspan(-bd, bd, color=BLUE, alpha=.18, lw=0); ax.axhline(0, color=MUT, lw=.6)
fig, ax = plt.subplots(figsize=(3.0, 2.4)); stem(ax, acf(res, 30), n, BLUE)
ax.set_xlabel('Lag', fontsize=9); ax.set_title('Residual ACF', fontsize=10, loc='left'); ax.tick_params(labelsize=8); ax.set_ylim(-.3, .3)
fig.tight_layout(pad=.6); save(fig, 'diag_acf')

# 7 ACF / PACF of returns (40 lags)
def pacf_ywm(v, L):
    r = np.r_[1, acf(v, L)]; phi = np.zeros((L+1, L+1)); out = []; sig = 1.0
    phi[1,1] = r[1]; out.append(r[1])
    for k in range(2, L+1):
        num = r[k] - sum(phi[k-1, j]*r[k-j] for j in range(1, k)); den = 1 - sum(phi[k-1, j]*r[j] for j in range(1, k))
        phi[k,k] = num/den
        for j in range(1, k): phi[k,j] = phi[k-1,j] - phi[k,k]*phi[k-1,k-j]
        out.append(phi[k,k])
    return np.array(out)
fig, ax = plt.subplots(figsize=(4.0, 2.6)); stem(ax, acf(y, 40), n); ax.set_xlabel('Lag (retained observations)', fontsize=9); ax.set_title('ACF of S&P 500 returns', fontsize=11, loc='left'); ax.set_ylim(-.2, .2)
fig.tight_layout(pad=.6); save(fig, 'acf')
fig, ax = plt.subplots(figsize=(4.0, 2.6)); stem(ax, pacf_ywm(y, 40), n); ax.set_xlabel('Lag (retained observations)', fontsize=9); ax.set_title('PACF of S&P 500 returns', fontsize=11, loc='left'); ax.set_ylim(-.2, .2)
fig.tight_layout(pad=.6); save(fig, 'pacf')

# ARIMA re-estimation (validated against report)
sp = 1856; tr, te = y[:sp], y[sp:]
cc, phi, th, s2, ll = fit(tr, np.array([0.0650, -1.7276, -0.8685, 1.6103, 0.7246]))
pred, F, (a, P) = kf(tr - cc, phi, th, s2); v = (tr - cc) - pred
assert abs(-2*ll + 12 - 5734.552) < 0.01
fig, ax = plt.subplots(figsize=(5.6, 2.3)); stem(ax, acf(v, 40), sp)
ax.set_xlabel('Lag', fontsize=9); ax.set_title('ARIMA(2,0,2) residual ACF (training sample)', fontsize=11, loc='left'); ax.set_ylim(-.2, .2)
fig.tight_layout(pad=.6); save(fig, 'arima_resid_acf')

# 8 forecast path: static (multi-step from the training cutoff) and rolling one-step (state updated, no refit)
T_, R_, r_ = build(phi, th); Q_ = s2*(R_@R_.T)
st = []; aa = a.copy()
for h in range(len(te)): st.append(aa[0] + cc); aa = T_@aa
st = np.array(st)
ro = []; aa = a.copy(); PP = P.copy()
for t in range(len(te)):
    ro.append(aa[0] + cc); vv = (te[t] - cc) - aa[0]; K = PP[:, 0]/PP[0, 0]
    aa = aa + K*vv; PP = PP - np.outer(K, PP[0, :]); aa = T_@aa; PP = T_@PP@T_.T + Q_
ro = np.array(ro)
mae = lambda p: np.abs(te - p).mean(); rmse = lambda p: np.sqrt(((te - p)**2).mean())
assert round(mae(st), 4) == 0.6724 and round(rmse(st), 4) == 1.0197 and round(mae(ro), 4) == 0.6891 and round(rmse(ro), 4) == 1.0273  # report Table 3
d = c.Date.values[sp:]
fig, (a1, a2) = plt.subplots(2, 1, figsize=(5.9, 2.7), sharex=True, gridspec_kw=dict(height_ratios=[1.5, 1], hspace=.12))
a1.plot(d, te, color=GREY, lw=.7, label='Realised return'); a1.plot(d, st, color=TEAL, lw=1.6, label='Static ARIMA'); a1.plot(d, ro, color=RED, lw=1.1, label='Rolling ARIMA')
a1.set_ylabel('Return (%)', fontsize=9); a1.legend(loc='upper left', ncol=3, fontsize=8.5, handlelength=1.2, columnspacing=1.0, borderaxespad=.2); a1.tick_params(labelsize=8)
a2.plot(d, st, color=TEAL, lw=1.6); a2.plot(d, ro, color=RED, lw=1.1); a2.axhline(0, color=MUT, lw=.6)
a2.set_ylabel('Forecasts only (%)', fontsize=9); a2.tick_params(labelsize=8); a2.set_ylim(-1.55, 1.55)
fig.subplots_adjust(left=.1, right=.99, top=.98, bottom=.1); save(fig, 'forecast_path')
print('charts done', os.listdir(OUT))
