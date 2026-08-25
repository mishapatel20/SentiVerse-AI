import React, { useState } from 'react';
import { predictAPI } from '../services/api';
import SentimentBadge from '../components/SentimentBadge';
import { 
  FileSpreadsheet, Upload, Download, FileText, CheckCircle2, 
  AlertCircle, RefreshCw, Sparkles, Filter, Search, ShieldAlert 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const BulkAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bulkResult, setBulkResult] = useState(null);
  const [error, setError] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setBulkResult(null);
      setError('');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(25);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(60);
      const res = await predictAPI.analyzeBulk(formData);
      setProgress(100);
      setBulkResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk analysis failed. Ensure valid CSV file structure.');
    } finally {
      setLoading(false);
    }
  };

  // Sample CSV generator for easy testing
  const handleDownloadSampleCSV = () => {
    const csvContent = "ReviewText,Rating,Category\n" +
      "\"The battery life is amazing and fast charging works great!\",5,Electronics\n" +
      "\"Camera quality is terrible and low light photos are super blurry.\",1,Electronics\n" +
      "\"Package arrived damaged and box was crushed by courier.\",2,Logistics\n" +
      "\"Standard delivery, microwave works fine as expected.\",3,Appliance\n" +
      "\"BEST PRODUCT EVER BUY BUY BUY 100% SCAM!!!\",1,Spam\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_ecommerce_reviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!bulkResult) return;
    let csv = "ID,ReviewText,Sentiment,Confidence,IsFake,Language\n";
    bulkResult.results.forEach((r, i) => {
      const cleanTxt = r.review_text.replace(/"/g, '""');
      csv += `${i + 1},"${cleanTxt}",${r.sentiment},${r.confidence}%,${r.fake_detection.is_fake ? 'YES' : 'NO'},${r.language.language_name}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_sentiment_analysis_${Date.now()}.csv`;
    a.click();
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!bulkResult) return;
    const excelData = bulkResult.results.map((r, i) => ({
      ID: i + 1,
      Review: r.review_text,
      Sentiment: r.sentiment,
      Confidence: `${r.confidence}%`,
      IsFake: r.fake_detection.is_fake ? 'YES' : 'NO',
      Language: r.language.language_name
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sentiment Analysis");
    XLSX.writeFile(wb, `bulk_sentiment_report_${Date.now()}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!bulkResult) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SentiVerse AI - Bulk Sentiment Analysis Report", 14, 20);

    doc.setFontSize(10);
    doc.text(`Total Processed: ${bulkResult.total_reviews} reviews`, 14, 30);
    doc.text(`Positive: ${bulkResult.summary.positive_count} | Negative: ${bulkResult.summary.negative_count} | Neutral: ${bulkResult.summary.neutral_count}`, 14, 37);

    let y = 50;
    bulkResult.results.slice(0, 15).forEach((r, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.text(`${i + 1}. [${r.sentiment.toUpperCase()}] ${r.review_text.substring(0, 75)}... (${r.confidence}%)`, 14, y);
      y += 8;
    });

    doc.save(`bulk_sentiment_report_${Date.now()}.pdf`);
  };

  const filteredResults = bulkResult ? bulkResult.results.filter(r => {
    const matchesSearch = r.review_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = filterSentiment === 'all' || r.sentiment === filterSentiment;
    return matchesSearch && matchesSentiment;
  }) : [];

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Bulk CSV Analysis Engine <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Upload CSV datasets to process hundreds of e-commerce reviews with automated batch metrics.
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCSV}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" /> Download Sample CSV
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="glass-panel p-8 rounded-3xl border border-dashed border-white/20 text-center space-y-4 relative hover:border-indigo-500/50 transition-all">
        <div className="w-16 h-16 rounded-2xl glow-primary flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          <Upload className="w-8 h-8 text-white" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Select CSV File for Ingestion</h3>
          <p className="text-xs text-gray-400 mt-1">Upload files containing customer review text columns (.csv)</p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload-input"
        />

        <div className="flex items-center justify-center gap-4">
          <label
            htmlFor="csv-upload-input"
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white cursor-pointer transition-all"
          >
            Browse CSV File
          </label>

          {file && (
            <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              Selected: {file.name}
            </span>
          )}
        </div>

        {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 max-w-md mx-auto">{error}</div>}

        {file && (
          <div className="pt-2">
            <button
              onClick={handleUploadAndAnalyze}
              disabled={loading}
              className="px-8 py-3 rounded-xl glow-primary text-white font-bold text-xs shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? `Analyzing Dataset (${progress}%)` : 'Start Bulk Analysis'}
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-gray-300 font-semibold">
            <span>Processing Batch Reviews...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Results View */}
      {bulkResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive AI Summary Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 glow-primary bg-opacity-20 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-300" /> Executive AI Bulk Summary
              </h3>
              <span className="text-xs font-semibold text-indigo-200">
                Processed {bulkResult.total_reviews} Reviews
              </span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-medium">
              {bulkResult.summary.ai_summary}
            </p>
          </div>

          {/* Export & Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterSentiment('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSentiment === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                All ({bulkResult.total_reviews})
              </button>
              <button
                onClick={() => setFilterSentiment('positive')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSentiment === 'positive' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                Positive ({bulkResult.summary.positive_count})
              </button>
              <button
                onClick={() => setFilterSentiment('negative')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSentiment === 'negative' ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                Negative ({bulkResult.summary.negative_count})
              </button>
              <button
                onClick={() => setFilterSentiment('neutral')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterSentiment === 'neutral' ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                Neutral ({bulkResult.summary.neutral_count})
              </button>
            </div>

            {/* Export Triggers */}
            <div className="flex items-center gap-2">
              <button onClick={handleExportCSV} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-semibold flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Export CSV
              </button>
              <button onClick={handleExportExcel} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-semibold flex items-center gap-1.5 cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Excel
              </button>
              <button onClick={handleExportPDF} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-semibold flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5 text-rose-400" /> Export PDF
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-white/10 uppercase tracking-wider text-[10px] text-gray-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Review Text</th>
                    <th className="py-3 px-4">Sentiment</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Spam Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredResults.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-white max-w-md truncate">{item.review_text}</td>
                      <td className="py-3 px-4">
                        <SentimentBadge sentiment={item.sentiment} showConfidence={false} />
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-300">{item.confidence}%</td>
                      <td className="py-3 px-4">
                        {item.fake_detection.is_fake ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            SPAM DETECTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-medium">
                            Organic
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkAnalysisPage;
