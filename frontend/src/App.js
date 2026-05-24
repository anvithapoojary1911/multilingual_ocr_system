import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const API = 'http://localhost:5000/api';

const LANGUAGES = [
  { value: 'english', label: '🇬🇧 English', code: 'eng' },
  { value: 'hindi', label: '🇮🇳 Hindi', code: 'hin' },
  { value: 'kannada', label: '🏛️ Kannada', code: 'kan' },
  { value: 'tamil', label: '🌴 Tamil', code: 'tam' },
  { value: 'telugu', label: '⭐ Telugu', code: 'tel' },
  { value: 'marathi', label: '🌺 Marathi', code: 'mar' },
  { value: 'bengali', label: '🐟 Bengali', code: 'ben' },
  { value: 'gujarati', label: '🦁 Gujarati', code: 'guj' },
  { value: 'punjabi', label: '🌾 Punjabi', code: 'pan' },
  { value: 'malayalam', label: '🌊 Malayalam', code: 'mal' },
  { value: 'english+hindi', label: '🔀 English + Hindi', code: 'eng+hin' },
  { value: 'english+kannada', label: '🔀 English + Kannada', code: 'eng+kan' },
  { value: 'english+hindi+kannada', label: '🔀 Eng + Hindi + Kannada', code: 'eng+hin+kan' },
  { value: 'all', label: '🌍 All Languages', code: 'all' },
];

const PREPROCESSING = [
  { value: 'minimal', label: 'Minimal', desc: 'Basic grayscale only' },
  { value: 'standard', label: 'Standard', desc: 'Denoise + threshold' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Sharpen + morph ops' },
  { value: 'deskew', label: 'Deskew', desc: 'Auto-rotate + clean' },
];

const PSM_MODES = [
  { value: 3, label: 'Auto (Full Page)' },
  { value: 6, label: 'Uniform Block' },
  { value: 7, label: 'Single Line' },
  { value: 8, label: 'Single Word' },
  { value: 11, label: 'Sparse Text' },
  { value: 13, label: 'Raw Line' },
];

function FileDropzone({ onFiles, multiple = false, label }) {
  const onDrop = useCallback(accepted => onFiles(accepted), [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp'] },
    multiple,
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <div className="dropzone-content">
        <div className="drop-icon">📁</div>
        <p className="drop-label">{label}</p>
        <p className="drop-sub">PNG, JPG, JPEG, TIFF, BMP, WEBP</p>
        {isDragActive && <div className="drop-pulse">Drop it! 🎯</div>}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ConfidenceMeter({ value }) {
  const color = value >= 80 ? '#00f5a0' : value >= 60 ? '#f5a623' : '#f54242';
  return (
    <div className="confidence-meter">
      <div className="conf-header">
        <span>OCR Confidence</span>
        <span style={{ color }} className="conf-val">{value}%</span>
      </div>
      <div className="conf-bar-bg">
        <div className="conf-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── SINGLE IMAGE TAB ─────────────────────────────────────────
function SingleImageTab() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [language, setLanguage] = useState('english');
  const [preprocessing, setPreprocessing] = useState('standard');
  const [psm, setPsm] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFiles = (files) => {
    const f = files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleOCR = async () => {
    if (!file) return toast.error('Please upload an image first!');
    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('language', language);
    fd.append('preprocessing', preprocessing);
    fd.append('psm', psm);
    try {
      const { data } = await axios.post(`${API}/ocr`, fd);
      setResult(data);
      toast.success('OCR completed successfully!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'OCR failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const downloadTxt = () => {
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_${file.name}_result.txt`;
    a.click();
  };

  return (
    <div className="tab-content">
      <div className="two-col">
        {/* LEFT */}
        <div className="col">
          <div className="section-title">📷 Upload Image</div>
          <FileDropzone onFiles={handleFiles} label="Drop image here or click to browse" />

          {preview && (
            <div className="image-preview-wrap">
              <img src={preview} alt="preview" className="image-preview" />
              <div className="image-name">{file?.name}</div>
            </div>
          )}

          <div className="settings-grid">
            <div className="setting-group">
              <label>🌐 Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div className="setting-group">
              <label>🔧 Preprocessing</label>
              <select value={preprocessing} onChange={e => setPreprocessing(e.target.value)}>
                {PREPROCESSING.map(p => <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>)}
              </select>
            </div>

            <div className="setting-group">
              <label>📋 Page Segmentation Mode</label>
              <select value={psm} onChange={e => setPsm(Number(e.target.value))}>
                {PSM_MODES.map(m => <option key={m.value} value={m.value}>{m.value}: {m.label}</option>)}
              </select>
            </div>
          </div>

          <button className="btn-primary" onClick={handleOCR} disabled={loading || !file}>
            {loading ? <><span className="spinner" /> Processing...</> : '⚡ Extract Text'}
          </button>
        </div>

        {/* RIGHT */}
        <div className="col">
          <div className="section-title">📝 Extracted Text</div>

          {result ? (
            <>
              <div className="stats-row">
                <StatCard icon="💬" value={result.word_count} label="Words" color="#00f5a0" />
                <StatCard icon="📄" value={result.line_count} label="Lines" color="#6c63ff" />
                <StatCard icon="🔤" value={result.char_count} label="Chars" color="#f5a623" />
                <StatCard icon="⏱️" value={`${result.processing_time}s`} label="Time" color="#f54242" />
              </div>

              <ConfidenceMeter value={Math.round(result.confidence)} />

              <div className="text-output-wrap">
                <div className="text-output-header">
                  <span>Extracted Text</span>
                  <div className="text-actions">
                    <button className="btn-sm" onClick={copyText}>{copied ? '✅' : '📋'} Copy</button>
                    <button className="btn-sm" onClick={downloadTxt}>💾 Save TXT</button>
                  </div>
                </div>
                <div className="text-output">
                  {result.text || <em className="no-text">No text extracted. Try different settings.</em>}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-result">
              <div className="empty-icon">🔍</div>
              <p>Upload an image and click Extract Text</p>
              <p className="empty-sub">Supports 10+ Indian and global languages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BULK PROCESSING TAB ─────────────────────────────────────────
function BulkTab() {
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState('english');
  const [preprocessing, setPreprocessing] = useState('standard');
  const [exportFormat, setExportFormat] = useState('excel');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = (f) => {
    setFiles(f);
    setResults(null);
    setProgress(0);
  };

  const handleBulkOCR = async () => {
    if (!files.length) return toast.error('Please upload images!');
    setLoading(true);
    setProgress(0);

    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    fd.append('language', language);
    fd.append('preprocessing', preprocessing);
    fd.append('export_format', exportFormat);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const { data } = await axios.post(`${API}/ocr/bulk`, fd, { timeout: 300000 });
      clearInterval(interval);
      setProgress(100);
      setResults(data);
      toast.success(`Processed ${data.successful}/${data.total_images} images!`);
    } catch (e) {
      clearInterval(interval);
      toast.error(e.response?.data?.error || 'Bulk OCR failed!');
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = async () => {
    if (!results?.export_file) return;
    window.open(`${API}/download/${results.export_file}`, '_blank');
  };

  return (
    <div className="tab-content">
      <div className="two-col">
        <div className="col">
          <div className="section-title">📦 Upload Images (Bulk)</div>
          <FileDropzone onFiles={handleFiles} multiple label={`Drop multiple images here (${files.length} selected)`} />

          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">📁 {files.length} file(s) selected</div>
              <div className="file-scroll">
                {files.slice(0, 20).map((f, i) => (
                  <div key={i} className="file-item">
                    <span className="file-idx">{i + 1}</span>
                    <span className="file-nm">{f.name}</span>
                    <span className="file-sz">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
                {files.length > 20 && <div className="file-more">+{files.length - 20} more files...</div>}
              </div>
            </div>
          )}

          <div className="settings-grid">
            <div className="setting-group">
              <label>🌐 Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="setting-group">
              <label>🔧 Preprocessing</label>
              <select value={preprocessing} onChange={e => setPreprocessing(e.target.value)}>
                {PREPROCESSING.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="setting-group">
              <label>📤 Export Format</label>
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                <option value="excel">Excel (.xlsx)</option>
                <option value="txt">Text File (.txt)</option>
                <option value="json">JSON Only</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="progress-wrap">
              <div className="progress-label">Processing... {Math.round(progress)}%</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={handleBulkOCR} disabled={loading || !files.length}>
            {loading ? <><span className="spinner" /> Processing {files.length} images...</> : `⚡ Process ${files.length || ''} Images`}
          </button>
        </div>

        <div className="col">
          <div className="section-title">📊 Bulk Results</div>
          {results ? (
            <>
              <div className="stats-row">
                <StatCard icon="🖼️" value={results.total_images} label="Total" color="#6c63ff" />
                <StatCard icon="✅" value={results.successful} label="Success" color="#00f5a0" />
                <StatCard icon="❌" value={results.failed} label="Failed" color="#f54242" />
                <StatCard icon="📈" value={`${results.average_confidence}%`} label="Avg Conf" color="#f5a623" />
              </div>
              <div className="stats-row" style={{ marginTop: 8 }}>
                <StatCard icon="⏱️" value={`${results.total_processing_time}s`} label="Total Time" color="#00d4ff" />
              </div>

              {results.export_file && (
                <button className="btn-secondary" onClick={downloadExport}>
                  📥 Download {exportFormat === 'excel' ? 'Excel' : 'TXT'} Report
                </button>
              )}

              <div className="bulk-results-list">
                <div className="bulk-results-header">Per-File Results</div>
                {results.results.map((r, i) => (
                  <div key={i} className={`bulk-result-item ${r.status}`}>
                    <div className="bri-top">
                      <span className="bri-name">{r.filename}</span>
                      <span className={`bri-badge ${r.status}`}>{r.status === 'success' ? `✅ ${r.confidence}%` : '❌ Error'}</span>
                    </div>
                    {r.text && (
                      <div className="bri-text">{r.text.slice(0, 150)}{r.text.length > 150 ? '...' : ''}</div>
                    )}
                    {r.error && <div className="bri-error">{r.error}</div>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-result">
              <div className="empty-icon">📦</div>
              <p>Upload multiple images for bulk processing</p>
              <p className="empty-sub">Handles thousands of images automatically</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT TAB ─────────────────────────────────────────
function AboutTab() {
  return (
    <div className="tab-content about-tab">
      <div className="about-hero">
        <div className="about-logo">🔤</div>
        <h2>Multilingual OCR System</h2>
        <p>A complete offline OCR solution for Indian and global languages</p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="ac-icon">🎯</div>
          <h3>Objectives</h3>
          <ul>
            <li>Extract text from scanned/printed images</li>
            <li>Support 10+ Indian languages</li>
            <li>Advanced image preprocessing pipeline</li>
            <li>Bulk processing for large datasets</li>
            <li>Export to Excel, TXT, JSON</li>
            <li>100% offline — no data sent to cloud</li>
          </ul>
        </div>

        <div className="about-card">
          <div className="ac-icon">🔧</div>
          <h3>Technology Stack</h3>
          <ul>
            <li>🐍 Python + Flask (Backend)</li>
            <li>⚛️ React.js (Frontend)</li>
            <li>🔤 Tesseract OCR v5 (Engine)</li>
            <li>👁️ OpenCV (Preprocessing)</li>
            <li>🖼️ Pillow (Image handling)</li>
            <li>📊 OpenPyXL (Excel export)</li>
          </ul>
        </div>

        <div className="about-card">
          <div className="ac-icon">🌐</div>
          <h3>Supported Languages</h3>
          <ul>
            <li>🇬🇧 English</li>
            <li>🇮🇳 Hindi, Marathi</li>
            <li>🏛️ Kannada, Telugu, Tamil</li>
            <li>🌊 Malayalam, Bengali</li>
            <li>🦁 Gujarati, Punjabi</li>
            <li>🔀 Mixed language support</li>
          </ul>
        </div>

        <div className="about-card">
          <div className="ac-icon">🚀</div>
          <h3>Future Scope</h3>
          <ul>
            <li>AI/Deep Learning based OCR</li>
            <li>Real-time camera OCR</li>
            <li>Auto language detection</li>
            <li>Handwriting recognition</li>
            <li>Translation integration</li>
            <li>Document layout understanding</li>
          </ul>
        </div>
      </div>

      <div className="research-gap">
        <h3>🔍 Research Gap Addressed</h3>
        <div className="gap-grid">
          {[
            ['Mixed Language Support', 'Handles English + Kannada + Hindi in one image'],
            ['Offline Processing', 'No internet required — full privacy'],
            ['Bulk Processing', 'Process thousands of images automatically'],
            ['Custom Preprocessing', '4 levels: minimal to aggressive enhancement'],
            ['Confidence Scoring', 'Per-image OCR confidence metrics'],
            ['Export Options', 'Excel, TXT, JSON output formats'],
          ].map(([title, desc]) => (
            <div key={title} className="gap-item">
              <span className="gap-check">✅</span>
              <div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('single');

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid #6c63ff' } }} />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔤</span>
            <div>
              <div className="logo-title">MultiLingua OCR</div>
              <div className="logo-sub">Intelligent Text Extraction System</div>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge">🔒 Offline</span>
            <span className="badge">⚡ Fast</span>
            <span className="badge">🌐 10+ Languages</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        {[
          { id: 'single', label: '🖼️ Single Image' },
          { id: 'bulk', label: '📦 Bulk Processing' },
          { id: 'about', label: 'ℹ️ About' },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className="main">
        {tab === 'single' && <SingleImageTab />}
        {tab === 'bulk' && <BulkTab />}
        {tab === 'about' && <AboutTab />}
      </main>

      <footer className="footer">
        <p>Multilingual OCR System • Major Project • Powered by Tesseract OCR + OpenCV + React</p>
      </footer>
    </div>
  );
}
