"""
SentiVerse AI — Model Evaluation Script
Evaluates Hybrid (TF-IDF + VADER) Logistic Regression model.
Generates confusion matrix image + full metrics.
"""

import os
import sys
import shutil
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from scipy.sparse import hstack
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    classification_report, confusion_matrix, matthews_corrcoef
)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ml.trainer import fast_clean_text, extract_vader_features, CUSTOM_STOPWORDS
from config import Config

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "ml")
IMG_PATH   = os.path.join(OUTPUT_DIR, "confusion_matrix.png")
ARTIFACT_IMG_PATH = r"C:\Users\01\.gemini\antigravity\brain\2c26868b-f9cd-4f7a-9c0f-fbdb9572a258\confusion_matrix.png"
CLASSES    = ['negative', 'neutral', 'positive']

print("\n" + "="*60)
print("  SentiVerse AI -- Hybrid Model Evaluation Report")
print("="*60)

print("\n[1/4] Loading serialised model and vectorizer...")
model      = joblib.load(Config.MODEL_PATH)
vectorizer = joblib.load(Config.VECTORIZER_PATH)
print(f"      Model    : {Config.MODEL_PATH}")
print(f"      Vectorizer: {Config.VECTORIZER_PATH}")

print("\n[2/4] Loading dataset from CSV...")
csv_path = os.path.join(OUTPUT_DIR, "sentiment_dataset.csv")
df = pd.read_csv(csv_path)
X_raw = df['text'].tolist()
y = df['sentiment'].tolist()

print(f"      Total dataset size : {len(df)} samples")
for cls in CLASSES:
    count = sum(1 for lbl in y if lbl == cls)
    print(f"        {cls:10s}: {count} samples")

# Preprocess
X_clean = [fast_clean_text(t) for t in X_raw]

print("\n[3/4] Running 80/20 stratified train-test split evaluation...")
X_raw_train, X_raw_test, X_clean_train, X_clean_test, y_train, y_test = train_test_split(
    X_raw, X_clean, y, test_size=0.20, random_state=42, stratify=y
)

# Vectorize test split
X_test_tfidf = vectorizer.transform(X_clean_test)
X_test_vader = extract_vader_features(X_raw_test)
X_test_comb  = hstack([X_test_tfidf, X_test_vader]).tocsr()

# Predict using serialized model
y_pred = model.predict(X_test_comb)

acc         = accuracy_score(y_test, y_pred)
f1_macro    = f1_score(y_test, y_pred, average='macro')
f1_weighted = f1_score(y_test, y_pred, average='weighted')
prec_macro  = precision_score(y_test, y_pred, average='macro',  zero_division=0)
rec_macro   = recall_score(y_test, y_pred, average='macro',  zero_division=0)
prec_w      = precision_score(y_test, y_pred, average='weighted', zero_division=0)
rec_w       = recall_score(y_test, y_pred, average='weighted', zero_division=0)
mcc         = matthews_corrcoef(y_test, y_pred)
cm          = confusion_matrix(y_test, y_pred, labels=CLASSES)

f1_per_class = f1_score(y_test, y_pred, average=None, labels=CLASSES, zero_division=0)
prec_per     = precision_score(y_test, y_pred, average=None, labels=CLASSES, zero_division=0)
rec_per      = recall_score(y_test, y_pred, average=None, labels=CLASSES, zero_division=0)

print("      Running 5-fold cross-validation...")
X_all_tfidf = vectorizer.transform(X_clean)
X_all_vader = extract_vader_features(X_raw)
X_all_comb  = hstack([X_all_tfidf, X_all_vader]).tocsr()
cv_scores   = cross_val_score(model, X_all_comb, y, cv=5, scoring='accuracy')

print("\n" + "="*60)
print("  EVALUATION RESULTS (80/20 Hold-out Test Set)")
print("="*60)
print(f"\n  Accuracy              : {acc*100:.2f}%")
print(f"  Macro F1-Score        : {f1_macro:.4f}")
print(f"  Weighted F1-Score     : {f1_weighted:.4f}")
print(f"  Macro Precision       : {prec_macro:.4f}")
print(f"  Macro Recall          : {rec_macro:.4f}")
print(f"  Weighted Precision    : {prec_w:.4f}")
print(f"  Weighted Recall       : {rec_w:.4f}")
print(f"  Matthews Corr. Coeff. : {mcc:.4f}")
print(f"\n  5-Fold CV Accuracy    : {cv_scores.mean()*100:.2f}% +/- {cv_scores.std()*100:.2f}%")
print(f"  CV Scores per fold    : {[f'{s*100:.1f}%' for s in cv_scores]}")

print("\n" + "-"*60)
print("  Per-Class Breakdown")
print("-"*60)
print(f"  {'Class':<12} {'Precision':>10} {'Recall':>10} {'F1-Score':>10}")
print(f"  {'-'*42}")
for i, cls in enumerate(CLASSES):
    print(f"  {cls.capitalize():<12} {prec_per[i]:>10.4f} {rec_per[i]:>10.4f} {f1_per_class[i]:>10.4f}")

print("\n  Full Classification Report:")
print("-"*60)
print(classification_report(y_test, y_pred, target_names=[c.capitalize() for c in CLASSES], zero_division=0))

print("\n  Confusion Matrix (rows=Actual, cols=Predicted):")
print(f"  {'':12}", end='')
for cls in CLASSES:
    print(f"  {cls.capitalize():>10}", end='')
print()
for i, cls in enumerate(CLASSES):
    print(f"  {cls.capitalize():<12}", end='')
    for j in range(len(CLASSES)):
        print(f"  {cm[i][j]:>10}", end='')
    print()

print("\n[4/4] Generating confusion matrix image plot...")

cmap = LinearSegmentedColormap.from_list(
    'indigo_dark',
    ['#0d0f1a', '#1a1f3c', '#2d2f6e', '#4338ca', '#6366f1', '#a5b4fc'],
    N=256
)

fig, axes = plt.subplots(1, 2, figsize=(16, 6.5))
fig.patch.set_facecolor('#090d16')

# Left: Confusion Matrix Heatmap
ax1 = axes[0]
ax1.set_facecolor('#0d1117')

cm_norm = cm.astype('float') / cm.sum(axis=1, keepdims=True)
im = ax1.imshow(cm_norm, interpolation='nearest', cmap=cmap, vmin=0, vmax=1)

cbar = fig.colorbar(im, ax=ax1, fraction=0.046, pad=0.04)
cbar.ax.yaxis.set_tick_params(color='white')
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color='white', fontsize=9)
cbar.set_label('Proportion', color='white', fontsize=10)

for i in range(len(CLASSES)):
    for j in range(len(CLASSES)):
        count   = cm[i][j]
        pct     = cm_norm[i][j]
        color   = 'white' if pct < 0.6 else '#090d16'
        weight  = 'bold' if i == j else 'normal'
        ax1.text(j, i, f'{count}\n({pct*100:.1f}%)',
                 ha='center', va='center',
                 fontsize=11, color=color,
                 fontweight=weight, fontfamily='monospace')

labels = [c.capitalize() for c in CLASSES]
ax1.set_xticks(range(len(CLASSES)))
ax1.set_yticks(range(len(CLASSES)))
ax1.set_xticklabels(labels, color='#a5b4fc', fontsize=11, fontweight='bold')
ax1.set_yticklabels(labels, color='#a5b4fc', fontsize=11, fontweight='bold')
ax1.set_xlabel('Predicted Label', color='#818cf8', fontsize=12, labelpad=10)
ax1.set_ylabel('Actual Label',    color='#818cf8', fontsize=12, labelpad=10)
ax1.set_title('Confusion Matrix\n(SentiVerse AI -- Hybrid TF-IDF + VADER Logistic Regression)',
              color='white', fontsize=12, fontweight='bold', pad=15)
for spine in ax1.spines.values():
    spine.set_edgecolor('#312e81')
ax1.tick_params(colors='white')

# Right: Metrics Bar Chart
ax2 = axes[1]
ax2.set_facecolor('#0d1117')

metric_labels = [
    'Accuracy', 'Macro F1', 'Weighted F1',
    'Macro Prec.', 'Macro Recall',
    'Neg F1', 'Neu F1', 'Pos F1'
]
metric_values = [
    acc, f1_macro, f1_weighted,
    prec_macro, rec_macro,
    f1_per_class[0], f1_per_class[1], f1_per_class[2]
]
bar_colors = [
    '#6366f1', '#818cf8', '#a5b4fc',
    '#34d399', '#10b981',
    '#f87171', '#fbbf24', '#34d399'
]

bars = ax2.barh(metric_labels, metric_values, color=bar_colors, height=0.55, alpha=0.9)

for bar, val in zip(bars, metric_values):
    ax2.text(bar.get_width() + 0.008, bar.get_y() + bar.get_height() / 2,
             f'{val*100:.2f}%', va='center', ha='left',
             color='white', fontsize=10, fontweight='bold', fontfamily='monospace')

ax2.set_xlim(0, 1.15)
ax2.tick_params(axis='y', colors='#a5b4fc', labelsize=10)
ax2.tick_params(axis='x', colors='#6366f1', labelsize=9)
ax2.set_xlabel('Score', color='#818cf8', fontsize=11, labelpad=10)
ax2.set_title(f'Performance Metrics\nTest Accuracy: {acc*100:.2f}%  |  CV: {cv_scores.mean()*100:.2f}% +/- {cv_scores.std()*100:.2f}%',
              color='white', fontsize=12, fontweight='bold', pad=15)
ax2.axvline(x=0.90, color='#4338ca', linestyle='--', linewidth=1, alpha=0.5, label='90% threshold')
ax2.legend(facecolor='#1e2030', edgecolor='#4338ca', labelcolor='#a5b4fc', fontsize=9)
for spine in ax2.spines.values():
    spine.set_edgecolor('#312e81')
ax2.xaxis.grid(True, linestyle='--', alpha=0.15, color='#6366f1')
ax2.set_axisbelow(True)

fig.text(0.5, 0.01,
         f'SentiVerse AI  |  Model: Hybrid TF-IDF (1-3 ngrams) + VADER Sentiment Polarity + Calibrated Logistic Regression  |  '
         f'Dataset: {len(df)} samples  |  Test split: 20%',
         ha='center', va='bottom', color='#6b7280', fontsize=8)

plt.tight_layout(rect=[0, 0.04, 1, 1])
plt.savefig(IMG_PATH, dpi=150, bbox_inches='tight', facecolor='#090d16', edgecolor='none')
plt.close()

try:
    os.makedirs(os.path.dirname(ARTIFACT_IMG_PATH), exist_ok=True)
    shutil.copy(IMG_PATH, ARTIFACT_IMG_PATH)
    print(f"[OK] Copied image to artifact directory: {ARTIFACT_IMG_PATH}")
except Exception as err:
    print(f"[Warning] Could not copy to artifact directory: {err}")

print(f"\n[OK] Confusion matrix saved to: {IMG_PATH}")
print("="*60 + "\n")
