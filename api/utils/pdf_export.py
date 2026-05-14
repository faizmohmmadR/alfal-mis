from django.http import HttpResponse
from datetime import datetime
import io
import os

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from arabic_reshaper import reshape
    from bidi.algorithm import get_display
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# Register Persian/Pashto font
def register_rtl_fonts():
    """Register fonts for RTL languages (Persian/Pashto)"""
    try:
        # Try to register Vazirmatn font if available
        font_paths = [
            '/usr/share/fonts/truetype/vazirmatn/Vazirmatn-Regular.ttf',
            '/usr/share/fonts/vazirmatn/Vazirmatn-Regular.ttf',
            os.path.expanduser('~/.fonts/Vazirmatn-Regular.ttf'),
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('Vazirmatn', font_path))
                return 'Vazirmatn'
        
        # Fallback to DejaVu Sans which has good Unicode support
        dejavu_paths = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/dejavu/DejaVuSans.ttf',
        ]
        
        for font_path in dejavu_paths:
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
                return 'DejaVuSans'
        
        return 'Helvetica'  # Fallback to default
    except Exception:
        return 'Helvetica'

def format_rtl_text(text):
    """Format text for RTL display in PDF"""
    try:
        if any(ord(char) > 1536 and ord(char) < 1791 for char in str(text)):
            reshaped_text = reshape(str(text))
            return get_display(reshaped_text)
        return str(text)
    except Exception:
        return str(text)


def export_to_pdf(data, headers, filename, title=None, metadata=None, finance_summary=None):
    """
    Export data to PDF file.
    
    Args:
        data: List of lists/tuples containing row data
        headers: List of column headers
        filename: Name of the file to download
        title: Optional title for the report
        metadata: Optional dict with metadata
        finance_summary: Optional dict with financial summary data
    
    Returns:
        HttpResponse with PDF file
    """
    try:
        if not PDF_AVAILABLE:
            from rest_framework.response import Response
            from rest_framework import status
            return Response({'error': 'PDF library not available'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Register RTL fonts
        rtl_font = register_rtl_fonts()
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#1f2937'), alignment=TA_CENTER, spaceAfter=16, fontName=rtl_font)
        
        # Add title
        if title:
            formatted_title = format_rtl_text(title)
            elements.append(Paragraph(formatted_title, title_style))
            elements.append(Spacer(1, 0.15*inch))
        
        # Add metadata in a professional info box
        if metadata:
            info_data = []
            for key, value in metadata.items():
                info_data.append([key, str(value)])
            
            info_table = Table(info_data, colWidths=[2*inch, 4*inch])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
                ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), rtl_font),
                ('FONTNAME', (1, 0), (1, -1), rtl_font),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(info_table)
            elements.append(Spacer(1, 0.1*inch))
        
        # Add generation date
        date_style = ParagraphStyle('DateStyle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#9ca3af'), alignment=TA_RIGHT, spaceAfter=6)
        elements.append(Paragraph(f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}', date_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Add financial summary
        if finance_summary:
            summary_title = ParagraphStyle('SummaryTitle', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1f2937'), alignment=TA_CENTER, spaceAfter=8)
            elements.append(Paragraph('FINANCIAL SUMMARY', summary_title))
            
            summary_data = [['Category', 'Total', 'Paid', 'Remaining']]
            current_category = None
            category_data = {}
            
            for key, value in finance_summary.items():
                if key and not key.startswith('  '):
                    if current_category and category_data:
                        summary_data.append([
                            current_category,
                            category_data.get('total', ''),
                            category_data.get('paid', ''),
                            category_data.get('remaining', '')
                        ])
                        category_data = {}
                    current_category = key.replace(' Currency', '').replace(' Summary', '')
                elif key.startswith('  '):
                    clean_key = key.strip().lower()
                    if 'total' in clean_key:
                        category_data['total'] = value
                    elif 'paid' in clean_key:
                        category_data['paid'] = value
                    elif 'remaining' in clean_key:
                        category_data['remaining'] = value
            
            if current_category and category_data:
                summary_data.append([
                    current_category,
                    category_data.get('total', ''),
                    category_data.get('paid', ''),
                    category_data.get('remaining', '')
                ])
            
            summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#eff6ff')),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(summary_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Add data table - convert all data to strings and format RTL text
        converted_data = []
        for row in data:
            converted_row = [format_rtl_text(cell) if cell is not None else '' for cell in row]
            converted_data.append(converted_row)
        formatted_headers = [format_rtl_text(h) for h in headers]
        table_data = [formatted_headers] + converted_data
        
        # Calculate column widths dynamically
        num_cols = len(headers)
        available_width = 10.5 * inch
        col_widths = [available_width / num_cols] * num_cols
        
        data_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        data_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), rtl_font),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), rtl_font),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]))
        elements.append(data_table)
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        import traceback
        from rest_framework.response import Response
        from rest_framework import status
        error_detail = f'{str(e)}\n{traceback.format_exc()}'
        return Response({'error': str(e), 'detail': error_detail}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
