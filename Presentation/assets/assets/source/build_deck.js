const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const { applyTheme } = require('/mnt/skills/public/pptx/scripts/apply_theme.js');

const CH = path.join(__dirname, '..', 'charts');
const OUTFILE = path.join(__dirname, 'Financial_Market_Dynamics_Presentation.pptx');

// ---------- palette ----------
const BG='0B1424', PANEL='121D33', PANEL2='172540', BORDER='243552', TXT='F3F6FB', MUT='9AA8BF', DIM='6B7A93';
const TEAL='2DD4BF', BLUE='5B9CF6', RED='F26D6D', AMBER='E8B04B';
const FONT='Calibri', SERIF='Cambria';
const THEME = { name:'Quant Research Dark', headFontFace:FONT, bodyFontFace:FONT,
  colors:{ dk1:BG, lt1:TXT, dk2:PANEL, lt2:MUT, accent1:TEAL, accent2:BLUE, accent3:RED, accent4:DIM, accent5:AMBER, accent6:BORDER, hlink:TEAL, folHlink:BLUE } };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.333 x 7.5 in
pres.author = 'Syed Zaid';
pres.title = 'Financial Market Dynamics: Econometric Analysis & Time-Series Forecasting';
pres.subject = 'S&P 500, VIX, 10Y Treasury, Brent, Fed funds, 2016-2026';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

pres.defineSlideMaster({
  title:'CONTENT', background:{ color:BG },
  objects:[
    { placeholder:{ options:{ name:'title', type:'title', x:0.6, y:0.72, w:12.13, h:0.7, fontFace:FONT, fontSize:28, bold:true, color:TXT, align:'left', valign:'top', margin:0 }, text:'' } },
    { text:{ text:'Financial Market Dynamics  ·  Syed Zaid', options:{ x:0.6, y:7.03, w:6, h:0.3, fontFace:FONT, fontSize:10, color:DIM, margin:0, valign:'middle' } } }
  ],
  slideNumber:{ x:11.93, y:7.03, w:0.8, h:0.3, fontFace:FONT, fontSize:10, color:DIM, align:'right', valign:'middle', margin:0 }
});
pres.defineSlideMaster({ title:'COVER', background:{ color:BG } });

// ---------- helpers ----------
const png = f => { const b = fs.readFileSync(path.join(CH, f+'.png')); return { w:b.readUInt32BE(16), h:b.readUInt32BE(20), p:path.join(CH, f+'.png') }; };
function T(s, text, o={}) {
  s.addText(text, Object.assign({ fontFace:FONT, fontSize:14, color:TXT, margin:0, valign:'top', isTextBox:true }, o));
}
function card(s, x, y, w, h, fill=PANEL, name='card') {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill:{ color:fill }, line:{ color:BORDER, width:0.75 }, rectRadius:0.06, objectName:name });
}
function kicker(s, t) { T(s, t, { x:0.6, y:0.38, w:9, h:0.25, fontSize:11, bold:true, color:TEAL, charSpacing:3 }); }
function img(s, f, x, y, w, alt) { const i = png(f); const h = w*i.h/i.w; s.addImage({ path:i.p, x, y, w, h, altText:alt, objectName:f }); return h; }
function cap(s, t, x, y, w, o={}) { T(s, t, Object.assign({ x, y, w, h:0.3, fontSize:10.5, color:MUT, italic:true }, o)); }
function eq(str, base) {
  const out=[]; const re=/_(\{[^}]+\}|[A-Za-z0-9]+)/g; let last=0, m;
  while ((m=re.exec(str))) { if (m.index>last) out.push({ text:str.slice(last,m.index), options:{...base} });
    out.push({ text:m[1].replace(/[{}]/g,''), options:{...base, subscript:true} }); last=re.lastIndex; }
  if (last<str.length) out.push({ text:str.slice(last), options:{...base} });
  return out;
}
function table(s, rows, o) {
  const fs_ = o.fs||12; const hdr = o.header!==false;
  const data = rows.map((r,ri) => r.map((c,ci) => {
    const cell = (typeof c==='object' && c!==null) ? c : { t:String(c) };
    const isH = hdr && ri===0;
    return { text:cell.t, options:{ fontFace:FONT, fontSize:cell.fs||fs_, bold:isH||cell.bold||false, italic:cell.italic||false,
      color: cell.color || (isH?MUT:TXT), fill:{ color: cell.fill || (isH?PANEL:PANEL) }, align: cell.align || (o.align&&o.align[ci]) || 'left', valign:'middle',
      border:[{type:'none'},{type:'none'},{type:'solid',pt:0.75,color:isH?DIM:BORDER},{type:'none'}], margin:[0,0.1,0,0.1] } };
  }));
  s.addTable(data, { x:o.x, y:o.y, w:o.w, colW:o.colW, rowH:o.rowH, autoPage:false, objectName:o.name||'table' });
}
function stat(s, x, y, w, h, big, label, o={}) {
  card(s, x, y, w, h, o.fill||PANEL, 'stat');
  T(s, big, { x:x+0.18, y:y+0.12, w:w-0.36, h:h*0.5, fontSize:o.bs||26, bold:true, color:o.color||TEAL, valign:'middle' });
  T(s, label, { x:x+0.18, y:y+h*0.58, w:w-0.36, h:h*0.38, fontSize:o.ls||11.5, color:MUT, valign:'top' });
}
let secTitle = '';
function content(title, kick, notes, section) {
  const s = pres.addSlide({ masterName:'CONTENT', sectionTitle:section });
  s.addText(title, { placeholder:'title' });
  kicker(s, kick); if (notes) s.addNotes(notes); return s;
}

// =====================================================================
// 1  COVER
// =====================================================================
pres.addSection({ title:'Overview' });
{
  const s = pres.addSlide({ masterName:'COVER', sectionTitle:'Overview' });
  T(s, 'UNDERGRADUATE RESEARCH PROJECT', { x:0.8, y:1.35, w:7, h:0.3, fontSize:12, bold:true, color:TEAL, charSpacing:4 });
  T(s, 'Financial Market Dynamics', { x:0.8, y:1.95, w:7.3, h:0.95, fontSize:46, bold:true, color:TXT, valign:'middle' });
  T(s, 'Econometric Analysis & Time-Series Forecasting', { x:0.8, y:2.95, w:7.6, h:0.5, fontSize:24, color:TXT, valign:'top' });
  T(s, 'S&P 500 returns and four market indicators, 2016–2026', { x:0.8, y:3.6, w:6.9, h:0.4, fontSize:16, color:MUT });
  T(s, 'Syed Zaid', { x:0.8, y:5.35, w:6, h:0.45, fontSize:22, bold:true, color:TXT });
  T(s, 'BSc Data Science & Analytics', { x:0.8, y:5.82, w:6, h:0.35, fontSize:15, color:MUT });
  T(s, 'Research period: November 2016 – October 2026', { x:0.8, y:6.22, w:6.5, h:0.3, fontSize:13, color:DIM });
  img(s, 'cover_sp500', 6.55, 1.45, 6.3, 'S&P 500 closing level, November 2016 to October 2026');
  T(s, 'S&P 500 closing level, 2016–2026 (FRED: SP500)', { x:6.55, y:5.2, w:6.3, h:0.3, fontSize:10.5, italic:true, color:DIM, align:'right' });
  s.addNotes('Cover. Programme line per author: BSc Data Science & Analytics. Personal research project (no institution named). Chart: S&P 500 close from Financial_dataset_cleaned.csv.');
}

// =====================================================================
// 2  RESEARCH OVERVIEW
// =====================================================================
{
  const s = content('Explaining market moves is not the same as forecasting them', 'RESEARCH OVERVIEW',
    'Source: report Ch.1 (research question), Ch.3.1. The two empirical questions use the same cleaned dataset but different information sets.', 'Overview');
  card(s, 0.6, 1.7, 12.13, 1.3);
  T(s, 'RESEARCH QUESTION', { x:0.85, y:1.85, w:4, h:0.25, fontSize:10.5, bold:true, color:MUT, charSpacing:2 });
  T(s, 'To what extent can financial market indicators explain fluctuations in S&P 500 returns, and how effectively can historical market data be used to forecast future market movements?', { x:0.85, y:2.15, w:11.6, h:0.75, fontSize:18, color:TXT });
  // two questions
  const cw = 5.95;
  card(s, 0.6, 3.2, cw, 1.85); card(s, 0.6+cw+0.23, 3.2, cw, 1.85);
  T(s, 'EXPLAIN', { x:0.85, y:3.35, w:3, h:0.25, fontSize:11, bold:true, color:TEAL, charSpacing:3 });
  T(s, 'How much same-day return variation do VIX, yields, oil and funding rates account for?', { x:0.85, y:3.68, w:cw-0.5, h:0.6, fontSize:15, bold:true });
  T(s, 'Regression on contemporaneous indicators, judged in-sample, with robust inference.', { x:0.85, y:4.38, w:cw-0.5, h:0.55, fontSize:13, color:MUT });
  const x2 = 0.6+cw+0.23;
  T(s, 'FORECAST', { x:x2+0.25, y:3.35, w:3, h:0.25, fontSize:11, bold:true, color:BLUE, charSpacing:3 });
  T(s, 'Does return history alone improve out-of-sample forecasts over simple rules?', { x:x2+0.25, y:3.68, w:cw-0.5, h:0.6, fontSize:15, bold:true });
  T(s, 'ARIMA on a chronological holdout, compared with zero and mean benchmarks.', { x:x2+0.25, y:4.38, w:cw-0.5, h:0.55, fontSize:13, color:MUT });
  // phases
  const ph = [['1','Data engineering','Acquire five FRED series, merge, engineer returns and changes, treat missing values'],
              ['2','Econometric analysis','EDA, correlation, simple and multiple OLS, diagnostics, HC3 and HAC inference'],
              ['3','Time-series forecasting','ADF, ACF/PACF, ARIMA selection, static and rolling forecasts vs benchmarks']];
  ph.forEach((p,i) => { const x = 0.6 + i*(3.9+0.215);
    card(s, x, 5.3, 3.9, 1.55);
    s.addShape(pres.shapes.OVAL, { x:x+0.22, y:5.5, w:0.42, h:0.42, fill:{ color:TEAL }, line:{ color:TEAL, width:0 }, objectName:'phase-dot' });
    T(s, p[0], { x:x+0.22, y:5.5, w:0.42, h:0.42, fontSize:15, bold:true, color:BG, align:'center', valign:'middle' });
    T(s, 'Phase '+p[0]+' · '+p[1], { x:x+0.78, y:5.5, w:3.0, h:0.42, fontSize:14, bold:true, valign:'middle' });
    T(s, p[2], { x:x+0.22, y:6.05, w:3.5, h:0.72, fontSize:12, color:MUT });
  });
}

// =====================================================================
// 3  DATASET
// =====================================================================
pres.addSection({ title:'Phase 1 · Data' });
{
  const s = content('Five FRED series, ten years of daily observations', 'PHASE 1 · DATA ENGINEERING',
    'Source: report Table 1, Table A1; dimensions verified against Financial_dataset_Raw.csv (2,607 x 6) and Financial_dataset_cleaned.csv (2,320 x 11). Dimensions include the Date column.', 'Phase 1 · Data');
  const items = [['RESEARCH PERIOD','2016–2026','4 Nov 2016 – 27 Oct 2026 (complete cases)'],
                 ['FREQUENCY','Daily','Retained observations, not a regular trading calendar'],
                 ['RAW DATASET','2,607 × 6','3 Nov 2016 – 30 Oct 2026'],
                 ['CLEANED DATASET','2,320 × 11','88.99% of raw rows retained']];
  items.forEach((it,i) => { const w=2.89, x=0.6+i*(w+0.19); card(s, x, 1.7, w, 1.55);
    T(s, it[0], { x:x+0.2, y:1.85, w:w-0.4, h:0.25, fontSize:10.5, bold:true, color:MUT, charSpacing:2 });
    T(s, it[1], { x:x+0.2, y:2.12, w:w-0.4, h:0.55, fontSize:28, bold:true, color:TEAL, valign:'middle' });
    T(s, it[2], { x:x+0.2, y:2.72, w:w-0.4, h:0.45, fontSize:11.5, color:MUT }); });
  card(s, 0.6, 3.5, 12.13, 3.3);
  const rows = [['Indicator','FRED series','What it measures','Analysis variable (unit)'],
    ['S&P 500','SP500','Large-cap US equity index close',{t:'Daily return, % (dependent variable)',color:TEAL}],
    ['CBOE Volatility Index (VIX)','VIXCLS','Option-implied expected volatility','Daily change, index points'],
    ['10-Year Treasury yield','DGS10','Constant-maturity market yield','Daily change, percentage points'],
    ['Brent crude oil','DCOILBRENTEU','Europe Brent spot price, USD per barrel','Daily return, %'],
    ['Effective federal funds rate','DFF','Overnight US funding rate','Daily change, percentage points']];
  table(s, rows, { x:0.8, y:3.65, w:11.73, colW:[3.1,2.0,3.5,3.13], rowH:[0.45,0.5,0.5,0.5,0.5,0.5], fs:13, name:'variables' });
}

// =====================================================================
// 4  DATA ENGINEERING
// =====================================================================
{
  const s = content('From raw series to a 2,320-observation analytical dataset', 'PHASE 1 · DATA ENGINEERING',
    'Source: report Ch.3.2, Table 1; Phase 1 notebook (sections 2, 13-20). Per-series missing counts (96/63/110/76/0) were recomputed from the raw CSV. Notebook prose gives 74 for Brent and 2,608 rows; the CSV and report give 76 and 2,607 (see QA log). 94 = dates with a computable S&P 500 return but incomplete covariates (report Ch.3.2). IQR outlier counts from notebook output.', 'Phase 1 · Data');
  const steps = [['1','Acquire','Five series downloaded from FRED via the CSV endpoint.'],
    ['2','Integrate','Left-joined onto the S&P 500 date grid so gaps stay visible. Raw file: 2,607 × 6.'],
    ['3','Engineer','Returns for S&P 500 and Brent; first differences for VIX, yield and funding rate. 6 → 11 columns.'],
    ['4','Treat missing','No imputation: complete-case deletion keeps every value observed. 2,320 rows retained.'],
    ['5','Review outliers','IQR-flagged extremes retained: large moves are genuine market events, not errors.']];
  const w=2.25, g=0.22;
  steps.forEach((st,i) => { const x=0.6+i*(w+g); card(s, x, 1.7, w, 2.05);
    s.addShape(pres.shapes.OVAL, { x:x+0.2, y:1.88, w:0.38, h:0.38, fill:{ color:TEAL }, line:{ color:TEAL, width:0 }, objectName:'step-dot' });
    T(s, st[0], { x:x+0.2, y:1.88, w:0.38, h:0.38, fontSize:14, bold:true, color:BG, align:'center', valign:'middle' });
    T(s, st[1], { x:x+0.7, y:1.88, w:w-0.85, h:0.38, fontSize:15, bold:true, valign:'middle' });
    T(s, st[2], { x:x+0.2, y:2.42, w:w-0.4, h:1.25, fontSize:12.5, color:MUT });
    if (i<4) T(s, '›', { x:x+w-0.02, y:2.45, w:g+0.04, h:0.4, fontSize:20, color:TEAL, align:'center' }); });
  // bottom row
  card(s, 0.6, 3.95, 4.9, 2.9);
  T(s, 'Missing levels in the raw file, by series', { x:0.8, y:4.07, w:4.5, h:0.3, fontSize:12.5, bold:true });
  s.addChart(pres.charts.BAR, [{ name:'Missing observations', labels:['S&P 500','VIX','10Y yield','Brent','Fed funds'], values:[96,63,110,76,0] }], {
    x:0.7, y:4.45, w:4.7, h:2.3, barDir:'col', chartColors:[TEAL], showLegend:false, showValue:true, dataLabelColor:TXT, dataLabelFontSize:11, dataLabelFontFace:FONT, dataLabelPosition:'outEnd',
    catAxisLabelColor:MUT, catAxisLabelFontSize:11, catAxisLabelFontFace:FONT, valAxisHidden:true, valAxisMinVal:0, valAxisMaxVal:135, valGridLine:{ style:'none' }, catGridLine:{ style:'none' }, barGapWidthPct:60 });
  stat(s, 5.73, 3.95, 3.0, 1.35, '2,607 → 2,320', 'Rows: raw → cleaned (287 removed)', { bs:24 });
  stat(s, 5.73, 5.5, 3.0, 1.35, '94', 'dates with a valid S&P return dropped for incomplete covariates', { bs:26 });
  card(s, 8.96, 3.95, 3.77, 2.9);
  T(s, 'IQR-flagged observations (retained)', { x:9.16, y:4.07, w:3.4, h:0.3, fontSize:12.5, bold:true });
  table(s, [['Variable','Flagged'],['S&P 500 return','149'],['VIX change','230'],['10Y yield change','71'],['Brent return','120'],['Fed funds change','234']],
    { x:9.1, y:4.5, w:3.5, colW:[2.3,1.2], rowH:0.37, fs:12, align:['left','right'], name:'outliers' });
}

// =====================================================================
// 5  EDA
// =====================================================================
pres.addSection({ title:'Phase 2 · Econometrics' });
{
  const s = content('Exploratory analysis: volatility is the dominant correlate', 'PHASE 2 · ECONOMETRIC ANALYSIS',
    'Source: report Ch.4.1-4.2, Fig.1-2, Table B1. Charts redrawn from Financial_dataset_cleaned.csv (n = 2,320). Excess kurtosis 16.3204 as reported (pandas convention).', 'Phase 2 · Econometrics');
  card(s, 0.6, 1.7, 7.3, 3.3);
  T(s, 'S&P 500 daily returns, Nov 2016 – Oct 2026 · volatility clusters around 2020', { x:0.8, y:1.82, w:6.9, h:0.3, fontSize:12.5, bold:true });
  img(s, 'returns_ts', 0.85, 2.12, 6.8, 'Time series of S&P 500 daily returns with the March 2020 extreme marked');
  const st = [['0.0660%','Mean daily return'],['1.1511 pp','Standard deviation'],['−11.98 / +9.52','Min / max return (%)'],['16.32','Excess kurtosis']];
  st.forEach((v,i)=>{ const w=1.7, x=0.6+i*(w+0.166); stat(s, x, 5.2, w, 1.65, v[0], v[1], { bs: i===2?17:21, color:i===3?BLUE:TEAL, ls:11.5 }); });
  card(s, 8.15, 1.7, 4.58, 3.9);
  T(s, 'Pearson correlations', { x:8.35, y:1.82, w:4.2, h:0.3, fontSize:12.5, bold:true });
  img(s, 'heatmap', 8.6, 2.15, 3.75, 'Correlation heatmap of S&P 500 return, VIX change, Treasury change, Brent return and Fed funds change');
  card(s, 8.15, 5.8, 4.58, 1.05);
  T(s, [{ text:'VIX change  −0.7866', options:{ color:TXT, bold:true, breakLine:true } },
        { text:'Brent +0.1762 · 10Y +0.1148 · Fed funds +0.0115', options:{ color:MUT } }], { x:8.35, y:5.92, w:4.2, h:0.85, fontSize:13, valign:'middle' });
}

// =====================================================================
// 6  FRAMEWORK
// =====================================================================
{
  const s = content('Econometric framework: same-day OLS regressions', 'PHASE 2 · ECONOMETRIC ANALYSIS',
    'Source: report Ch.3.3-3.4. Both models are estimated by OLS with an intercept on the same 2,320 complete cases. Interpretation is associational, not causal.', 'Phase 2 · Econometrics');
  card(s, 0.6, 1.7, 6.55, 2.2);
  T(s, 'MODEL SPECIFICATION', { x:0.85, y:1.83, w:4, h:0.25, fontSize:10.5, bold:true, color:MUT, charSpacing:2 });
  T(s, 'Simple linear regression', { x:0.85, y:2.12, w:3, h:0.25, fontSize:11.5, color:TEAL, bold:true });
  T(s, eq('R_t = β_0 + β_1 ΔVIX_t + ε_t', { fontFace:SERIF, fontSize:19, italic:true, color:TXT }), { x:0.85, y:2.38, w:6.1, h:0.42, valign:'middle' });
  T(s, 'Multiple linear regression', { x:0.85, y:2.95, w:3, h:0.25, fontSize:11.5, color:TEAL, bold:true });
  T(s, eq('R_t = β_0 + β_1 ΔVIX_t + β_2 ΔY_t + β_3 Brent_t + β_4 ΔFFR_t + ε_t', { fontFace:SERIF, fontSize:17, italic:true, color:TXT }), { x:0.85, y:3.22, w:6.1, h:0.42, valign:'middle' });
  card(s, 0.6, 4.1, 6.55, 2.75);
  table(s, [['Symbol','Variable','Unit'],
    [{t:'R_t',color:TEAL},'S&P 500 daily return (dependent)','%'],
    ['ΔVIX_t','Change in VIX','index points'],
    ['ΔY_t','Change in 10Y Treasury yield','pp'],
    ['Brent_t','Brent oil return','%'],
    ['ΔFFR_t','Change in effective fed funds rate','pp']].map(r=>r.map(c=>typeof c==='object'?{...c,t:c.t.replace('_t','ₜ')}:c.replace('_t','ₜ'))),
    { x:0.8, y:4.22, w:6.15, colW:[1.2,3.75,1.2], rowH:0.42, fs:12.5, name:'symbols' });
  card(s, 7.4, 1.7, 5.33, 4.0);
  T(s, 'Simple regression: S&P 500 return vs VIX change', { x:7.6, y:1.82, w:5.0, h:0.3, fontSize:12.5, bold:true });
  img(s, 'scatter_slr', 7.55, 2.18, 5.03, 'Scatter plot of S&P 500 daily returns against daily VIX changes with fitted regression line');
  card(s, 7.4, 5.9, 5.33, 0.95);
  T(s, [{ text:'Inference compared: ', options:{ bold:true, color:TXT } }, { text:'conventional OLS, HC3 robust and Newey–West HAC (5 lags) standard errors. Coefficients are associations, not causal effects.', options:{ color:MUT } }], { x:7.6, y:5.98, w:4.95, h:0.8, fontSize:12.5, valign:'middle' });
}

// =====================================================================
// 7  REGRESSION RESULTS
// =====================================================================
{
  const s = content('Regression results: VIX changes carry the explanatory power', 'PHASE 2 · ECONOMETRIC ANALYSIS',
    'Source: report Ch.4.3-4.4, Table 2, Tables C1-C3. Interval bars use Newey-West HAC (5 lags) 95% CIs from Table 2. R-squared is an in-sample measure; it is not evidence of predictive ability.', 'Phase 2 · Econometrics');
  card(s, 0.6, 1.7, 6.9, 4.05);
  T(s, 'Multiple regression coefficients with Newey–West 95% intervals (teal: excludes zero)', { x:0.8, y:1.82, w:6.5, h:0.3, fontSize:12.5, bold:true });
  img(s, 'coef_plot', 0.75, 2.17, 6.6, 'Coefficient plot with Newey-West HAC 95% confidence intervals for the four predictors');
  stat(s, 7.75, 1.7, 2.4, 1.45, '0.6187', 'R² · VIX only (adj. 0.6185)', { bs:26, color:BLUE });
  stat(s, 10.33, 1.7, 2.4, 1.45, '0.6228', 'R² · four predictors (adj. 0.6221)', { bs:26 });
  T(s, '+0.41 pp of variance from three extra indicators', { x:7.75, y:3.25, w:4.98, h:0.3, fontSize:12, color:MUT, italic:true });
  card(s, 7.75, 3.65, 4.98, 2.1);
  table(s, [['Predictor','Estimate','Direction','OLS p'],
    ['VIX change',{t:'−0.4484',color:RED,align:'right'},'Negative','< .001'],
    ['Treasury yield change',{t:'+0.2438',color:TEAL},'Positive','.385'],
    ['Brent oil return',{t:'+0.0204',color:TEAL},'Positive','< .001'],
    ['Fed funds rate change',{t:'−0.6229',color:RED},'Negative','.037']],
    { x:7.85, y:3.78, w:4.78, colW:[1.95,0.95,0.95,0.93], rowH:0.37, fs:12, align:['left','right','left','right'], name:'coefs' });
  card(s, 0.6, 5.95, 12.13, 0.9);
  T(s, [{ text:'Reading: ', options:{ bold:true, color:TEAL } },
        { text:'a 1-point rise in the VIX is associated with a 0.4484 pp lower same-day return. These are in-sample, contemporaneous associations; they say nothing yet about forecasting ability.', options:{ color:TXT } }],
    { x:0.85, y:6.03, w:11.65, h:0.75, fontSize:13.5, valign:'middle' });
}

// =====================================================================
// 8  DIAGNOSTICS
// =====================================================================
{
  const s = content('Diagnostics show why robust inference was necessary', 'PHASE 2 · ECONOMETRIC ANALYSIS',
    'Source: report Ch.4.5, Tables D1, D2, E1, E2, Table 2. Durbin-Watson 2.058 (not shown). Joint HAC F = 123.0486, p < .001. Cook refit uses 2,205 observations, R2 = 0.670; refit is a sensitivity check, full-sample estimates remain primary.', 'Phase 2 · Econometrics');
  card(s, 0.6, 1.7, 3.0, 2.35); card(s, 3.75, 1.7, 3.0, 2.35);
  img(s, 'diag_qq', 0.68, 1.73, 2.84, 'Normal Q-Q plot of multiple regression residuals showing heavy tails');
  img(s, 'diag_acf', 3.83, 1.73, 2.84, 'Autocorrelation function of multiple regression residuals');
  card(s, 0.6, 4.2, 6.15, 2.65);
  table(s, [['Test','Result','Reading'],
    ['Variance inflation','1.00 – 1.05','Low collinearity'],
    ['Breusch–Pagan','p = .630',{t:'Not rejected',color:MUT}],
    ['White','p < .001',{t:'Heteroskedasticity',color:RED}],
    ['ARCH-LM (lags 1–20)','p < .001',{t:'Volatility clustering',color:RED}],
    ['Breusch–Godfrey (5)','p < .001',{t:'Autocorrelation',color:RED}],
    ['Jarque–Bera','65,527',{t:'Heavy tails',color:RED}],
    ['Cook’s distance','193 flagged','115 above threshold']],
    { x:0.7, y:4.27, w:5.95, colW:[2.2,1.45,2.3], rowH:0.31, fs:12, name:'diagnostics' });
  // right: robust inference
  card(s, 7.0, 1.7, 5.73, 2.75);
  T(s, 'Does each conclusion survive robust standard errors?', { x:7.2, y:1.82, w:5.4, h:0.3, fontSize:12.5, bold:true });
  const ok = (t)=>({t, color:TEAL}), no = (t)=>({t, color:RED});
  table(s, [['Predictor','OLS p','HC3 p','HAC p','Verdict'],
    ['VIX change',ok('< .001'),ok('< .001'),ok('< .001'),{t:'Robust',color:TEAL,bold:true}],
    ['Treasury yield',no('.385'),no('.641'),no('.687'),{t:'Not significant',color:MUT}],
    ['Brent oil return',ok('< .001'),ok('.030'),ok('.012'),{t:'Robust, weaker',color:TEAL,bold:true}],
    ['Fed funds rate',ok('.037'),no('.190'),no('.152'),{t:'Significance lost',color:RED,bold:true}]],
    { x:7.1, y:2.2, w:5.53, colW:[1.55,0.85,0.85,0.85,1.43], rowH:[0.36,0.36,0.36,0.36,0.36], fs:12, align:['left','right','right','right','left'], name:'robust' });
  cap(s, 'Teal p < .05 · Red p ≥ .05 · HAC uses 5 lags', 7.2, 4.12, 5.4, { fontSize:10 });
  card(s, 7.0, 4.6, 5.73, 2.25);
  T(s, 'Sensitivity analysis', { x:7.2, y:4.7, w:5, h:0.3, fontSize:12.5, bold:true });
  T(s, [
    { text:'HAC lags 1, 5, 10, 20: 5% conclusions unchanged', options:{ bullet:true, breakLine:true } },
    { text:'Joint HAC test: all four slopes zero rejected (F = 123.05, p < .001)', options:{ bullet:true, breakLine:true } },
    { text:'Excluding 115 Cook-flagged days: VIX −0.4911, Brent +0.0140 (same signs); Treasury flips sign, Fed funds → −0.1322', options:{ bullet:true } }],
    { x:7.2, y:5.05, w:5.35, h:1.75, fontSize:12.5, color:TXT, paraSpaceAfter:5 });
}

// =====================================================================
// 9  TIME-SERIES FRAMEWORK
// =====================================================================
pres.addSection({ title:'Phase 3 · Forecasting' });
{
  const s = content('Time-series framework: from explanation to forecasting', 'PHASE 3 · TIME-SERIES FORECASTING',
    'Source: report Ch.3.5, 4.6, Table F3, Table 1. ACF/PACF (40 lags) redrawn from the cleaned return series. ADF values are from the executed notebook / report Table F3. Decomposition (252 obs) was descriptive only.', 'Phase 3 · Forecasting');
  const steps = [['1','Return series','2,320 observations'],['2','Explore','Time plot and descriptive decomposition'],['3','ADF test','Unit root rejected: no differencing needed'],
                 ['4','ACF / PACF','Short-lag structure, weak dependence'],['5','Split','Chronological 80 / 20'],['6','Select ARIMA','7 candidates by AIC / BIC on training data']];
  const w=1.9, g=0.146;
  steps.forEach((st,i)=>{ const x=0.6+i*(w+g); card(s, x, 1.7, w, 1.3);
    T(s, st[0]+'  '+st[1], { x:x+0.15, y:1.82, w:w-0.3, h:0.32, fontSize:13.5, bold:true, color:i===5?BLUE:TEAL });
    T(s, st[2], { x:x+0.15, y:2.2, w:w-0.3, h:0.72, fontSize:11.5, color:MUT }); });
  T(s, 'The regression used same-day indicators. A forecast may only use information available before the return is observed, so the question becomes: does return history alone help?',
    { x:0.6, y:3.15, w:12.13, h:0.5, fontSize:14, italic:true, color:MUT });
  card(s, 0.6, 3.75, 3.75, 2.55); card(s, 4.5, 3.75, 3.75, 2.55);
  img(s, 'acf', 0.7, 3.82, 3.55, 'Autocorrelation function of S&P 500 returns to lag 40');
  img(s, 'pacf', 4.6, 3.82, 3.55, 'Partial autocorrelation function of S&P 500 returns to lag 40');
  card(s, 8.4, 3.75, 4.33, 2.55);
  T(s, 'Augmented Dickey–Fuller tests', { x:8.6, y:3.85, w:4, h:0.3, fontSize:12.5, bold:true });
  table(s, [['Sample (lag rule)','Lag','Statistic'],['Full (AIC)','23','−11.5499'],['Training (AIC)','24','−9.8632'],['Training (BIC)','8','−13.4043']],
    { x:8.5, y:4.2, w:4.13, colW:[1.85,0.7,1.58], rowH:0.38, fs:12, align:['left','right','right'], name:'adf' });
  T(s, 'All p < .001: the unit-root null is rejected, so returns enter ARIMA undifferenced.', { x:8.6, y:5.8, w:4.0, h:0.45, fontSize:11, color:MUT });
  // split bar
  s.addShape(pres.shapes.RECTANGLE, { x:0.6, y:6.38, w:9.704, h:0.48, fill:{ color:'1E6F68' }, line:{ color:'1E6F68', width:0 }, objectName:'train-bar' });
  s.addShape(pres.shapes.RECTANGLE, { x:10.304, y:6.38, w:2.426, h:0.48, fill:{ color:'2B5C9E' }, line:{ color:'2B5C9E', width:0 }, objectName:'test-bar' });
  T(s, 'Training · 1,856 obs · 4 Nov 2016 – 21 Oct 2024', { x:0.75, y:6.38, w:9.4, h:0.48, fontSize:12, bold:true, valign:'middle' });
  T(s, [{ text:'Test · 464 obs', options:{ breakLine:true, bold:true } }, { text:'22 Oct 2024 – 27 Oct 2026', options:{ fontSize:10 } }], { x:10.4, y:6.38, w:2.3, h:0.48, fontSize:11.5, valign:'middle' });
}

// =====================================================================
// 10  ARIMA DEVELOPMENT
// =====================================================================
{
  const s = content('ARIMA(2,0,2): best training fit, with structure left behind', 'PHASE 3 · TIME-SERIES FORECASTING',
    'Source: report Ch.4.7, Tables F1-F3. AIC/BIC use the 1,856 training observations only. Residual ACF redrawn from the re-estimated ARIMA(2,0,2) (reproduces report AIC 5734.552, log-likelihood -2861.276). Ljung-Box p-values use the executed software default degrees of freedom.', 'Phase 3 · Forecasting');
  card(s, 0.6, 1.7, 6.4, 3.75);
  T(s, 'Training-sample model comparison', { x:0.8, y:1.8, w:5.5, h:0.3, fontSize:12.5, bold:true });
  const hl = (t,al)=>({ t, color:TEAL, bold:true });
  table(s, [['Specification','AIC','BIC'],
    [hl('ARIMA(2,0,2)'),hl('5734.5520'),hl('5767.7091')],
    ['ARIMA(3,0,2)','5735.5077','5774.1910'],['ARIMA(1,0,2)','5834.1146','5861.7455'],['ARIMA(2,0,1)','5835.0640','5862.6949'],
    ['ARIMA(1,0,1)','5835.9766','5858.0813'],['ARIMA(1,0,0)','5840.6692','5857.2477'],['ARIMA(0,0,1)','5847.8901','5864.4687'],
    [{t:'Constant only',color:MUT},{t:'5889.6618',color:MUT},{t:'5900.7142',color:MUT}]],
    { x:0.7, y:2.15, w:6.2, colW:[2.6,1.8,1.8], rowH:0.355, fs:12.5, align:['left','right','right'], name:'candidates' });
  card(s, 7.25, 1.7, 5.48, 2.4);
  img(s, 'arima_resid_acf', 7.3, 1.75, 5.38, 'Autocorrelation function of ARIMA(2,0,2) residuals on the training sample');
  card(s, 7.25, 4.25, 5.48, 1.2);
  const tiles = [['Ljung–Box p (lags 5 / 10 / 20)','.4465 / .0162 / .0014'],['ARCH-LM (10)','613.16, p < .001'],['Jarque–Bera','6,813, p < .001']];
  tiles.forEach((t,i)=>{ const x=7.4+i*1.78; T(s, t[0], { x, y:4.38, w:1.7, h:0.45, fontSize:10.5, color:MUT }); T(s, t[1], { x, y:4.85, w:1.7, h:0.5, fontSize:11.5, bold:true, color:i===0?TXT:RED }); });
  card(s, 0.6, 5.6, 12.13, 1.25);
  T(s, 'ARIMA(2,0,2) estimates (training sample)', { x:0.8, y:5.68, w:5, h:0.28, fontSize:11.5, bold:true, color:MUT });
  const pr = [['μ','0.0650'],['φ₁','−1.7276'],['φ₂','−0.8685'],['θ₁','1.6103'],['θ₂','0.7246'],['σ²','1.2778']];
  pr.forEach((p,i)=>{ const x=0.8+i*1.2; T(s, p[0], { x, y:6.02, w:1.1, h:0.3, fontSize:14, italic:true, color:BLUE, fontFace:SERIF }); T(s, p[1], { x, y:6.3, w:1.1, h:0.4, fontSize:17, bold:true }); });
  T(s, 'AIC and BIC both favour (2,0,2). Short-lag autocorrelation is removed, but dependence at lags 10–20, volatility clustering and heavy tails remain.', { x:8.1, y:5.72, w:4.4, h:1.05, fontSize:12, color:MUT, valign:'middle' });
}

// =====================================================================
// 11  FORECAST PERFORMANCE
// =====================================================================
{
  const s = content('Forecasting: no meaningful gain over simple benchmarks', 'PHASE 3 · TIME-SERIES FORECASTING',
    'Source: report Table 3, Table G1, Table G2, Ch.4.8. Nominal p = .0479 (static vs expanding mean, absolute loss, 5 lags) corresponds to a ~0.0004 pp loss difference and is not treated as a reliable practical gain (report Ch.4.8, App. G). 464 held-out observations (22 Oct 2024 - 27 Oct 2026). Errors in percentage points. Forecast path chart redrawn from the re-estimated model; its MAE/RMSE reproduce Table 3 exactly. Static forecasts sit within 0.001 pp of the fitted constant from horizon 47 onward.', 'Phase 3 · Forecasting');
  card(s, 0.6, 1.7, 6.2, 3.3);
  T(s, 'Forecast error on 464 held-out observations (pp)', { x:0.8, y:1.8, w:5.8, h:0.3, fontSize:12.5, bold:true });
  const cats = ['Zero return','Historical mean','Expanding mean','Static ARIMA(2,0,2)','Rolling ARIMA(2,0,2)'];
  s.addChart(pres.charts.BAR, [
    { name:'MAE', labels:cats, values:[0.6771,0.6726,0.6728,0.6724,0.6891] },
    { name:'RMSE', labels:cats, values:[1.0221,1.0198,1.0200,1.0197,1.0273] }], {
    x:0.7, y:2.1, w:6.0, h:2.85, barDir:'bar', barGrouping:'clustered', chartColors:[TEAL, BLUE], catAxisOrientation:'maxMin',
    showLegend:true, legendPos:'b', legendColor:MUT, legendFontSize:11, legendFontFace:FONT,
    showValue:true, dataLabelFormatCode:'0.0000', dataLabelColor:TXT, dataLabelFontSize:10, dataLabelFontFace:FONT, dataLabelPosition:'outEnd',
    catAxisLabelColor:TXT, catAxisLabelFontSize:11, catAxisLabelFontFace:FONT, valAxisHidden:true, valAxisMinVal:0, valAxisMaxVal:1.3, valGridLine:{ style:'none' }, catGridLine:{ style:'none' }, barGapWidthPct:45 });
  card(s, 0.6, 5.15, 6.2, 1.7);
  table(s, [['Forecast','MAE vs zero','RMSE vs zero','OOS R² vs exp.'],
    ['Historical mean','+0.66%','+0.23%','+0.05%'],
    ['Expanding mean','+0.63%','+0.21%','—'],
    [{t:'Static ARIMA',color:TEAL,bold:true},{t:'+0.69%',color:TEAL},{t:'+0.24%',color:TEAL},{t:'+0.07%',color:TEAL}],
    [{t:'Rolling ARIMA',color:RED,bold:true},{t:'−1.78%',color:RED},{t:'−0.50%',color:RED},{t:'−1.43%',color:RED}]],
    { x:0.7, y:5.2, w:6.0, colW:[1.6,1.3,1.4,1.7], rowH:0.31, fs:11.5, align:['left','right','right','right'], name:'gains' });
  card(s, 7.05, 1.7, 5.68, 3.05);
  T(s, 'Realised returns vs ARIMA forecasts (test period)', { x:7.25, y:1.8, w:5.3, h:0.3, fontSize:12.5, bold:true });
  img(s, 'forecast_path', 7.15, 2.12, 5.48, 'Realised test-period returns with static and rolling ARIMA forecasts, and a zoomed view of the forecasts alone');
  card(s, 7.05, 4.9, 5.68, 1.95);
  T(s, 'Reading the result', { x:7.25, y:4.98, w:5, h:0.3, fontSize:12.5, bold:true, color:TEAL });
  T(s, [
    { text:'Static ARIMA and the historical mean are practically indistinguishable: MAE 0.6724 vs 0.6726', options:{ bullet:true, breakLine:true } },
    { text:'Rolling ARIMA ranks last on both MAE and RMSE', options:{ bullet:true, breakLine:true } },
    { text:'HAC loss tests show no reliable difference: static vs historical mean p = .237; rolling vs expanding mean p = .747', options:{ bullet:true } }],
    { x:7.25, y:5.3, w:5.3, h:1.5, fontSize:12, paraSpaceAfter:4 });
}

// =====================================================================
// 12  KEY FINDINGS
// =====================================================================
pres.addSection({ title:'Synthesis' });
{
  const s = content('Key findings: two questions, two different answers', 'SYNTHESIS',
    'Source: report Ch.4.4-4.8, Ch.5.1, Tables 2, 3, G1. The two panels answer different research questions and must not be conflated: the regression is contemporaneous and in-sample; the forecasts are out-of-sample.', 'Synthesis');
  const cw=5.95;
  card(s, 0.6, 1.7, cw, 4.3); card(s, 0.6+cw+0.23, 1.7, cw, 4.3);
  T(s, 'EXPLANATORY  ·  same-day association, in-sample', { x:0.85, y:1.85, w:5.5, h:0.3, fontSize:12, bold:true, color:TEAL, charSpacing:1 });
  T(s, 'FORECASTING  ·  out-of-sample, 464 observations', { x:7.06, y:1.85, w:5.5, h:0.3, fontSize:12, bold:true, color:BLUE, charSpacing:1 });
  const L = [['61.87% → 62.28%','R²: VIX alone vs all four indicators'],['−0.4484','VIX slope: robust under OLS, HC3 and HAC'],['+0.0204','Brent slope: modest, survives robust inference'],['Not robust','Treasury yield and funding-rate coefficients']];
  const R = [['0.6724 vs 0.6726','MAE: static ARIMA vs historical mean'],['0.6891','Rolling ARIMA MAE, worst of five (zero: 0.6771)'],['−1.43%','Rolling OOS R² vs expanding mean'],['Negligible','ARIMA added little over simple benchmarks']];
  [[L,0.85,TEAL],[R,7.06,BLUE]].forEach(([arr,x,col])=>{ arr.forEach((r,i)=>{ const y=2.35+i*0.9;
    T(s, r[0], { x, y, w:2.55, h:0.75, fontSize:r[0].length>12?19:22, bold:true, color:col, valign:'middle' });
    T(s, r[1], { x:x+2.65, y, w:2.85, h:0.75, fontSize:12.5, color:MUT, valign:'middle' }); }); });
  card(s, 0.6, 6.2, 12.13, 0.65, PANEL2);
  T(s, 'A strong in-sample fit is not evidence of predictive ability.', { x:0.85, y:6.2, w:11.6, h:0.65, fontSize:17, bold:true, color:TXT, valign:'middle', align:'center' });
}

// =====================================================================
// 13  LIMITATIONS & FUTURE
// =====================================================================
{
  const s = content('Limitations and directions for future research', 'SYNTHESIS',
    'Source: report Ch.5.2-5.3. Left column limitations are from the completed study. Right column items are proposals only; none was conducted in this study.', 'Synthesis');
  card(s, 0.6, 1.7, 6.55, 5.15); card(s, 7.35, 1.7, 5.38, 5.15);
  T(s, 'LIMITATIONS IN THIS STUDY', { x:0.85, y:1.85, w:5.5, h:0.28, fontSize:11.5, bold:true, color:TEAL, charSpacing:2 });
  T(s, 'PROPOSED, NOT YET CONDUCTED', { x:7.6, y:1.85, w:5, h:0.28, fontSize:11.5, bold:true, color:BLUE, charSpacing:2 });
  const lim = [['Association, not causation','VIX is derived from equity options; indicators share macro shocks and timing differs.'],
    ['Averaged regimes','Coefficients pool calm and stressed periods; 2018 and 2020 days are influential.'],
    ['Imperfect errors','Residuals are serially dependent, heteroskedastic and heavy-tailed.'],
    ['Sample design','Complete-case filtering drops 94 usable returns; gaps are treated as one time step.'],
    ['Narrow forecast test','One 464-observation holdout; univariate linear ARIMA; tiny loss differences.']];
  lim.forEach((l,i)=>{ const y=2.3+i*0.9; T(s, l[0], { x:0.85, y, w:5.9, h:0.3, fontSize:13.5, bold:true }); T(s, l[1], { x:0.85, y:y+0.3, w:5.95, h:0.55, fontSize:12, color:MUT }); });
  T(s, [
    { text:'Forecast series on a trading-session calendar', options:{ bullet:true, breakLine:true } },
    { text:'Several pre-specified rolling origins across volatility regimes', options:{ bullet:true, breakLine:true } },
    { text:'Predictive regression on lagged indicators vs the expanding mean', options:{ bullet:true, breakLine:true } },
    { text:'Vector autoregression and regime-switching models', options:{ bullet:true, breakLine:true } },
    { text:'GARCH for conditional variance, evaluated on its own losses', options:{ bullet:true, breakLine:true } },
    { text:'Machine learning only with time-ordered validation and the same benchmarks', options:{ bullet:true } }],
    { x:7.6, y:2.35, w:4.95, h:3.6, fontSize:14, paraSpaceAfter:14 });
  T(s, 'Listed as proposals in the report; none is part of the results shown here.', { x:7.6, y:6.2, w:4.95, h:0.5, fontSize:11.5, italic:true, color:MUT });
}

// =====================================================================
// 14  CONCLUSION
// =====================================================================
{
  const s = content('Conclusion', 'SYNTHESIS',
    'Source: report Ch.5. Repository: github.com/Za1d7/sp500-financial-market-analysis. Data: FRED. Academic and educational use; not investment advice.', 'Synthesis');
  const rows = [['What the research established','Four market indicators explain 62.28% of same-day S&P 500 return variation, almost all of it through the VIX (61.87% alone).'],
    ['What the econometric models revealed','The VIX and Brent associations survive HC3 and HAC inference; the conventional significance of the funding-rate coefficient disappears.'],
    ['What the forecasting experiments showed','ARIMA(2,0,2) matched the historical-mean benchmark and rolling forecasts were worse. Return history added little.']];
  rows.forEach((r,i)=>{ const y=1.7+i*1.42; card(s, 0.6, y, 7.3, 1.27);
    T(s, r[0], { x:0.85, y:y+0.13, w:6.8, h:0.3, fontSize:14, bold:true, color:TEAL });
    T(s, r[1], { x:0.85, y:y+0.47, w:6.8, h:0.75, fontSize:13.5, color:TXT }); });
  card(s, 8.15, 1.7, 4.58, 3.95, PANEL2);
  T(s, 'Market indicators describe same-day equity moves well; past returns alone add little to forecasting them.', { x:8.4, y:1.95, w:4.1, h:3.5, fontSize:22, bold:true, color:TXT, valign:'middle' });
  card(s, 0.6, 5.95, 12.13, 0.9);
  T(s, [{ text:'Repository  ', options:{ bold:true, color:TEAL } }, { text:'github.com/Za1d7/sp500-financial-market-analysis', options:{ color:TXT, hyperlink:{ url:'https://github.com/Za1d7/sp500-financial-market-analysis' } } },
        { text:'    Data  ', options:{ bold:true, color:TEAL } }, { text:'FRED, Federal Reserve Bank of St. Louis', options:{ color:TXT, breakLine:true } },
        { text:'Methods  ', options:{ bold:true, color:TEAL } }, { text:'White (1980) · Newey & West (1987) · Box et al. (2015) · Diebold & Mariano (1995) · Welch & Goyal (2008).  Academic use; not investment advice.', options:{ color:MUT } }],
    { x:0.85, y:6.0, w:11.7, h:0.8, fontSize:11.5, valign:'middle', paraSpaceAfter:3 });
}

(async () => {
  await pres.writeFile({ fileName: OUTFILE });
  await applyTheme(OUTFILE, THEME);
  console.log('written', OUTFILE);
})();
