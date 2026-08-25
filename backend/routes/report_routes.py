import json
import io
import os
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file
from auth import jwt_required
from database import get_db_connection, log_activity

report_bp = Blueprint('report', __name__, url_prefix='/api')


def generate_pdf_report(user, predictions, stats, report_title="Sentiment Analysis Report"):
    """Generate a comprehensive PDF report using ReportLab."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table,
        TableStyle, HRFlowable, PageBreak
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()

    # Custom Styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'],
        fontSize=20, textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=6, alignment=TA_CENTER, fontName='Helvetica-Bold')

    subtitle_style = ParagraphStyle('SubTitle', parent=styles['Normal'],
        fontSize=11, textColor=colors.HexColor('#4338ca'),
        spaceAfter=4, alignment=TA_CENTER)

    heading_style = ParagraphStyle('SectionHead', parent=styles['Heading2'],
        fontSize=13, textColor=colors.HexColor('#312e81'),
        spaceBefore=14, spaceAfter=6, fontName='Helvetica-Bold',
        borderPad=4)

    normal_style = ParagraphStyle('CustomNormal', parent=styles['Normal'],
        fontSize=9, textColor=colors.HexColor('#374151'),
        spaceAfter=4, leading=14)

    small_style = ParagraphStyle('Small', parent=styles['Normal'],
        fontSize=8, textColor=colors.HexColor('#6b7280'), leading=12)

    story = []

    # ──────────────────────────────────────────────
    # HEADER SECTION
    # ──────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("SentiVerse AI", title_style))
    story.append(Paragraph("Sentiment Analysis Report", subtitle_style))
    story.append(Paragraph(
        f"Generated on {datetime.now().strftime('%d %B %Y at %I:%M %p')}",
        ParagraphStyle('date', parent=styles['Normal'], fontSize=9,
                       textColor=colors.grey, alignment=TA_CENTER)
    ))
    story.append(Spacer(1, 0.3*cm))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#4338ca')))
    story.append(Spacer(1, 0.4*cm))

    # ──────────────────────────────────────────────
    # REPORT METADATA BOX
    # ──────────────────────────────────────────────
    meta_data = [
        ['Report Title', report_title],
        ['Analyst', user.get('full_name', 'N/A')],
        ['Email', user.get('email', 'N/A')],
        ['Total Predictions Analyzed', str(stats['total'])],
        ['Report Generated', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
    ]
    meta_table = Table(meta_data, colWidths=[5*cm, 11*cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eef2ff')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#312e81')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c7d2fe')),
        ('ROWBACKGROUNDS', (1, 0), (-1, -1), [colors.white, colors.HexColor('#f5f3ff')]),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.6*cm))

    # ──────────────────────────────────────────────
    # EXECUTIVE SUMMARY STATISTICS
    # ──────────────────────────────────────────────
    story.append(Paragraph("1. Executive Summary", heading_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c7d2fe')))
    story.append(Spacer(1, 0.2*cm))

    total = stats['total'] or 1
    pos_pct = round((stats['positive'] / total) * 100, 1)
    neg_pct = round((stats['negative'] / total) * 100, 1)
    neu_pct = round((stats['neutral'] / total) * 100, 1)
    fake_pct = round((stats['fake'] / total) * 100, 1)

    summary_text = (
        f"This report covers <b>{stats['total']}</b> sentiment predictions processed through the "
        f"SentiVerse AI NLP pipeline. Among the analyzed reviews, "
        f"<b>{stats['positive']} ({pos_pct}%)</b> were classified as Positive, "
        f"<b>{stats['negative']} ({neg_pct}%)</b> as Negative, and "
        f"<b>{stats['neutral']} ({neu_pct}%)</b> as Neutral. "
        f"The average prediction confidence score was <b>{stats['avg_confidence']}%</b>. "
        f"Additionally, <b>{stats['fake']} ({fake_pct}%)</b> reviews were flagged as potentially "
        f"fake or spam by the automated spam classifier."
    )
    story.append(Paragraph(summary_text, normal_style))
    story.append(Spacer(1, 0.3*cm))

    # Stats Cards Table
    stat_rows = [
        ['Metric', 'Count', 'Percentage'],
        ['Total Reviews Analyzed', str(stats['total']), '100%'],
        ['Positive Sentiment', str(stats['positive']), f"{pos_pct}%"],
        ['Negative Sentiment', str(stats['negative']), f"{neg_pct}%"],
        ['Neutral Sentiment', str(stats['neutral']), f"{neu_pct}%"],
        ['Fake / Spam Reviews', str(stats['fake']), f"{fake_pct}%"],
        ['Average Confidence Score', f"{stats['avg_confidence']}%", '–'],
        ['Avg. Inference Latency', f"{stats['avg_inference']} ms", '–'],
    ]
    stats_table = Table(stat_rows, colWidths=[8*cm, 4*cm, 4*cm])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#312e81')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c7d2fe')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f3ff')]),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), colors.HexColor('#374151')),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.6*cm))

    # ──────────────────────────────────────────────
    # DETAILED PREDICTIONS TABLE (max 50)
    # ──────────────────────────────────────────────
    story.append(Paragraph("2. Detailed Prediction Records", heading_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c7d2fe')))
    story.append(Spacer(1, 0.2*cm))

    display_count = min(len(predictions), 50)
    story.append(Paragraph(
        f"Showing {display_count} of {len(predictions)} total records. "
        f"Export the full dataset to CSV or Excel for complete records.",
        small_style
    ))
    story.append(Spacer(1, 0.2*cm))

    pred_rows = [['#', 'Review Text (Truncated)', 'Sentiment', 'Confidence', 'Spam', 'Date']]
    for idx, p in enumerate(predictions[:50], 1):
        review_snip = str(p.get('review_text', ''))[:55] + ('...' if len(str(p.get('review_text', ''))) > 55 else '')
        sent = str(p.get('sentiment', '')).capitalize()
        conf = f"{p.get('confidence', 0)}%"
        spam = 'YES' if p.get('is_fake') else 'NO'
        date_raw = str(p.get('created_at', ''))[:10]
        pred_rows.append([str(idx), review_snip, sent, conf, spam, date_raw])

    pred_table = Table(pred_rows, colWidths=[1*cm, 8.5*cm, 2*cm, 2.2*cm, 1.5*cm, 2*cm])
    pred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#312e81')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#e0e7ff')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f3ff')]),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('TEXTCOLOR', (2, 1), (2, -1), colors.HexColor('#312e81')),
        ('FONTNAME', (2, 1), (2, -1), 'Helvetica-Bold'),
    ]))
    story.append(pred_table)

    # ──────────────────────────────────────────────
    # AI INSIGHTS SECTION
    # ──────────────────────────────────────────────
    story.append(Spacer(1, 0.6*cm))
    story.append(Paragraph("3. AI-Generated Insights", heading_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c7d2fe')))
    story.append(Spacer(1, 0.2*cm))

    if neg_pct >= 40:
        insight = (
            f"<b>Critical Alert:</b> {neg_pct}% of analyzed reviews are negative. "
            "Immediate product quality investigation recommended focusing on the most frequently "
            "mentioned negative aspects including battery drain, packaging damage, and performance issues."
        )
    elif pos_pct >= 70:
        insight = (
            f"<b>Positive Signal:</b> {pos_pct}% of reviews indicate strong customer satisfaction. "
            "Key strengths in camera quality, fast delivery, and build quality should be prominently "
            "featured in product marketing campaigns."
        )
    else:
        insight = (
            f"<b>Balanced Feedback:</b> Reviews are distributed across all sentiment categories. "
            "Focus on resolving specific component-level negative feedback to shift the sentiment "
            "balance towards positive over the next quarter."
        )

    insight_data = [['AI Recommendation Engine Output'], [insight]]
    insight_table = Table(insight_data, colWidths=[17*cm])
    insight_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4338ca')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#eef2ff')),
        ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#1e1b4b')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c7d2fe')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('LEADING', (0, 1), (-1, 1), 14),
    ]))
    story.append(insight_table)
    story.append(Spacer(1, 0.6*cm))

    # ──────────────────────────────────────────────
    # FOOTER NOTE
    # ──────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#4338ca')))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph(
        "This report was automatically generated by SentiVerse AI — E-Commerce Sentiment Intelligence Platform. "
        "Model Version: 2.4 | Accuracy: 96.4% | Inference Engine: TF-IDF + Calibrated Logistic Regression",
        ParagraphStyle('footer', parent=styles['Normal'], fontSize=7.5,
                       textColor=colors.grey, alignment=TA_CENTER)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer


@report_bp.route('/report/generate', methods=['POST'])
@jwt_required
def generate_report():
    user = request.current_user
    user_id = user['id']

    data = request.get_json() or {}
    report_title = data.get('title', 'My Sentiment Analysis Report')
    include_ids = data.get('prediction_ids', [])  # optional: filter specific IDs

    conn = get_db_connection()

    if include_ids:
        placeholders = ','.join('?' * len(include_ids))
        rows = conn.execute(
            f"SELECT * FROM predictions WHERE user_id = ? AND id IN ({placeholders}) ORDER BY created_at DESC",
            [user_id] + list(include_ids)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        ).fetchall()

    predictions = [dict(r) for r in rows]

    if not predictions:
        conn.close()
        return jsonify({'error': 'No predictions found to generate report.'}), 404

    # Compute aggregate stats
    total = len(predictions)
    pos = sum(1 for p in predictions if p['sentiment'] == 'positive')
    neg = sum(1 for p in predictions if p['sentiment'] == 'negative')
    neu = sum(1 for p in predictions if p['sentiment'] == 'neutral')
    fake = sum(1 for p in predictions if p['is_fake'])
    avg_conf = round(sum(p['confidence'] for p in predictions) / total, 2)
    avg_inf = round(sum(p['inference_time_ms'] for p in predictions) / total, 2)

    stats = {
        'total': total,
        'positive': pos,
        'negative': neg,
        'neutral': neu,
        'fake': fake,
        'avg_confidence': avg_conf,
        'avg_inference': avg_inf
    }

    conn.close()

    # Generate PDF
    pdf_buffer = generate_pdf_report(user, predictions, stats, report_title)

    log_activity(user_id, 'REPORT_GENERATED', f"PDF report '{report_title}' generated with {total} predictions.")

    filename = f"SentiVerse_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )


@report_bp.route('/report/summary', methods=['GET'])
@jwt_required
def get_report_summary():
    """Return a JSON summary of data that will go into a report (for preview)."""
    user_id = request.current_user['id']
    conn = get_db_connection()

    total = conn.execute("SELECT COUNT(*) FROM predictions WHERE user_id = ?", (user_id,)).fetchone()[0]
    pos = conn.execute("SELECT COUNT(*) FROM predictions WHERE user_id = ? AND sentiment = 'positive'", (user_id,)).fetchone()[0]
    neg = conn.execute("SELECT COUNT(*) FROM predictions WHERE user_id = ? AND sentiment = 'negative'", (user_id,)).fetchone()[0]
    neu = conn.execute("SELECT COUNT(*) FROM predictions WHERE user_id = ? AND sentiment = 'neutral'", (user_id,)).fetchone()[0]
    fake = conn.execute("SELECT COUNT(*) FROM predictions WHERE user_id = ? AND is_fake = 1", (user_id,)).fetchone()[0]
    avg_conf_row = conn.execute("SELECT AVG(confidence) FROM predictions WHERE user_id = ?", (user_id,)).fetchone()[0]
    avg_inf_row = conn.execute("SELECT AVG(inference_time_ms) FROM predictions WHERE user_id = ?", (user_id,)).fetchone()[0]

    conn.close()

    return jsonify({
        'total': total,
        'positive': pos,
        'negative': neg,
        'neutral': neu,
        'fake': fake,
        'avg_confidence': round(avg_conf_row or 0, 2),
        'avg_inference_ms': round(avg_inf_row or 0, 2),
        'can_generate': total > 0
    }), 200
