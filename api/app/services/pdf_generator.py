"""
PDF generation for chat conversations.
Handles PDF creation with proper formatting, native Unicode/Emoji support,
and Supabase storage upload.
"""
import json
import os
import re
import tempfile
import uuid
from datetime import datetime
from pathlib import Path

from core.supabase_client import supabase

# Regex pattern for chart detection (assouplie pour capturer plus facilement)
CHART_PATTERN = re.compile(r'%CHART:\s*([\s\S]*?)\s*%ENDCHART%', re.IGNORECASE)


class PDFGenerator:
    """Generates PDF files from chat conversations with proper formatting and Emoji support."""
    
    @staticmethod
    def _parse_chart_config(chart_json: str) -> dict:
        """
        Parse chart configuration from JSON string.
        Normalizes the config to be compatible with matplotlib and handles LLM formatting quirks.
        """
        try:
            # 1. Nettoyage et formatage forcé des accolades
            cleaned_json = chart_json.strip()
            if not cleaned_json.startswith('{'):
                cleaned_json = '{' + cleaned_json
            if not cleaned_json.endswith('}'):
                cleaned_json = cleaned_json + '}'
                
            # 2. Suppression des retours à la ligne qui font planter json.loads()
            cleaned_json = cleaned_json.replace('\n', ' ').replace('\r', '')
            
            config = json.loads(cleaned_json)
            if not config or not isinstance(config, dict):
                return None
            
            # --- SÉCURISATION DE L'EXTRACTION ---
            
            # Extract chart type safely
            chart_type = 'line'
            if isinstance(config.get('type'), str):
                chart_type = config['type'].lower()
            elif isinstance(config.get('chart'), dict) and config['chart'].get('type'):
                chart_type = str(config['chart']['type']).lower()
            elif isinstance(config.get('options'), dict):
                opt_chart = config['options'].get('chart')
                if isinstance(opt_chart, dict) and opt_chart.get('type'):
                    chart_type = str(opt_chart['type']).lower()
            
            # Fix common type mismatches
            type_mapping = {
                'doughnut': 'donut',
                'column': 'bar',
                'radialbar': 'bar',
                'polararea': 'pie'
            }
            chart_type = type_mapping.get(chart_type, chart_type)
            
            # Extract series data safely
            series = []
            if isinstance(config.get('series'), list):
                series = config['series']
            elif isinstance(config.get('options'), dict) and isinstance(config['options'].get('series'), list):
                series = config['options']['series']
            
            # Extract labels safely
            labels = []
            if isinstance(config.get('labels'), list):
                labels = config['labels']
            elif isinstance(config.get('options'), dict):
                if isinstance(config['options'].get('labels'), list):
                    labels = config['options']['labels']
                elif isinstance(config['options'].get('xaxis'), dict):
                    if isinstance(config['options']['xaxis'].get('categories'), list):
                        labels = config['options']['xaxis']['categories']
            elif isinstance(config.get('xaxis'), dict) and isinstance(config['xaxis'].get('categories'), list):
                labels = config['xaxis']['categories']
            
            # Extract title safely (Gère le cas où le LLM renvoie une string OU un dict)
            title_text = ''
            
            raw_title = config.get('title')
            if isinstance(raw_title, str):
                title_text = raw_title
            elif isinstance(raw_title, dict):
                title_text = raw_title.get('text', '')
                
            if not title_text and isinstance(config.get('options'), dict):
                opt_title = config['options'].get('title')
                if isinstance(opt_title, str):
                    title_text = opt_title
                elif isinstance(opt_title, dict):
                    title_text = opt_title.get('text', '')
                    
            if not title_text and isinstance(config.get('chart'), dict):
                chart_title = config['chart'].get('title')
                if isinstance(chart_title, str):
                    title_text = chart_title
                elif isinstance(chart_title, dict):
                    title_text = chart_title.get('text', '')
            
            return {
                'type': chart_type,
                'series': series,
                'labels': labels,
                'title': str(title_text).strip() if title_text else None
            }
            
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error parsing chart config: {e}")
            return None
    
    @staticmethod
    def _generate_chart_image(config: dict, output_path: str, width: int = 800, height: int = 400, dpi: int = 100):
        """
        Generate chart image using matplotlib.
        """
        try:
            import matplotlib
            matplotlib.use('Agg')  # Non-interactive backend
            import matplotlib.pyplot as plt
            import numpy as np  # Nécessaire pour la heatmap
            
            fig, ax = plt.subplots(figsize=(width/dpi, height/dpi), dpi=dpi)
            chart_type = config.get('type', 'line')
            series = config.get('series', [])
            labels = config.get('labels', [])
            title = config.get('title')
            
            if title:
                ax.set_title(title, fontsize=12, pad=20)
            
            # ---------------------------------------------------------
            # 1. PIE / DONUT CHARTS
            # ---------------------------------------------------------
            if chart_type in ['pie', 'donut']:
                data = []
                chart_labels = []
                
                for item in series:
                    if isinstance(item, dict):
                        if 'data' in item and isinstance(item['data'], list):
                            data.extend([float(x) if isinstance(x, (int, float)) else 0 for x in item['data']])
                        elif 'value' in item:
                            data.append(float(item['value']) if isinstance(item['value'], (int, float)) else 0)
                        if 'name' in item:
                            chart_labels.append(str(item['name']))
                    elif isinstance(item, (int, float)):
                        data.append(float(item))
                
                if labels:
                    chart_labels = [str(l) for l in labels]
                
                if data:
                    # FIX: Assurer que labels et data ont exactement la même taille
                    if chart_labels:
                        if len(chart_labels) > len(data):
                            chart_labels = chart_labels[:len(data)]
                        elif len(chart_labels) < len(data):
                            chart_labels.extend([f"Item {i+1}" for i in range(len(chart_labels), len(data))])
                    else:
                        chart_labels = [f"Item {i+1}" for i in range(len(data))]

                    if chart_type == 'donut':
                        wedgeprops = {'width': 0.3, 'edgecolor': 'white'}
                        ax.pie(data, labels=chart_labels, wedgeprops=wedgeprops, startangle=90)
                    else:
                        ax.pie(data, labels=chart_labels, startangle=90)
                    ax.axis('equal')
            
            # ---------------------------------------------------------
            # 2. HEATMAP CHARTS
            # ---------------------------------------------------------
            elif chart_type == 'heatmap':
                matrix_data = []
                y_labels = []
                x_labels = labels if labels else []

                for item in series:
                    if isinstance(item, dict):
                        y_labels.append(str(item.get('name', f'Série {len(matrix_data)+1}')))
                        row_data = []
                        if 'data' in item and isinstance(item['data'], list):
                            for point in item['data']:
                                if isinstance(point, dict):
                                    val = point.get('y', 0)
                                    row_data.append(float(val) if val is not None else 0.0)
                                    # Essayer de récupérer les labels X si pas fournis
                                    if len(matrix_data) == 0 and 'x' in point and not x_labels:
                                        x_labels.append(str(point['x']))
                                else:
                                    row_data.append(float(point) if isinstance(point, (int, float)) else 0.0)
                        matrix_data.append(row_data)

                if matrix_data:
                    # Uniformiser la taille des lignes
                    max_len = max(len(row) for row in matrix_data)
                    for row in matrix_data:
                        row.extend([0.0] * (max_len - len(row)))

                    data_array = np.array(matrix_data)
                    
                    # Dessiner la heatmap
                    im = ax.imshow(data_array, cmap='YlOrRd', aspect='auto')
                    
                    # Configurer les axes
                    if x_labels:
                        x_labels = x_labels[:max_len] + [''] * max(0, max_len - len(x_labels))
                        ax.set_xticks(np.arange(len(x_labels)))
                        ax.set_xticklabels(x_labels, rotation=45, ha='right')
                    
                    ax.set_yticks(np.arange(len(y_labels)))
                    ax.set_yticklabels(y_labels)
                    
                    # Ajouter la barre de couleur
                    plt.colorbar(im, ax=ax)

            # ---------------------------------------------------------
            # 3. BAR CHARTS
            # ---------------------------------------------------------
            elif chart_type == 'bar':
                data = []
                chart_labels = []
                
                for item in series:
                    if isinstance(item, dict):
                        if 'data' in item and isinstance(item['data'], list):
                            # FIX: Gérer le format ApexCharts {x: ..., y: ...}
                            parsed_data = []
                            for d in item['data']:
                                if isinstance(d, dict) and 'y' in d:
                                    val = d.get('y', 0)
                                    parsed_data.append(float(val) if val is not None else 0)
                                else:
                                    parsed_data.append(float(d) if isinstance(d, (int, float)) else 0)
                            data.append(parsed_data)
                            chart_labels.append(str(item.get('name', 'Series')))
                        elif 'value' in item:
                            data.append([float(item['value']) if isinstance(item['value'], (int, float)) else 0])
                            chart_labels.append(str(item.get('name', 'Series')))
                    elif isinstance(item, (int, float)):
                        if not data:
                            data.append([])
                            chart_labels.append('Data')
                        data[-1].append(float(item))
                
                if labels:
                    chart_labels = [str(l) for l in labels]
                
                if labels and data:
                    min_len = min(len(labels), len(data[0]))
                    labels = labels[:min_len]
                    data = [d[:min_len] for d in data]
                
                if data:
                    if len(data) == 1:
                        ax.bar(range(len(data[0])), data[0])
                        ax.set_xticks(range(len(data[0])))
                        ax.set_xticklabels(labels if labels else [str(i) for i in range(len(data[0]))])
                    else:
                        x = range(len(labels) if labels else len(data[0]))
                        width = 0.8 / len(data)
                        for i, (series_data, series_label) in enumerate(zip(data, chart_labels)):
                            offset = i * width
                            ax.bar([x_val + offset for x_val in x], series_data, width=width, label=series_label)
                        ax.legend()
                        if labels:
                            ax.set_xticks([x_val + (len(data) - 1) * width / 2 for x_val in x])
                            ax.set_xticklabels([str(l) for l in labels])
            
            # ---------------------------------------------------------
            # 4. LINE, AREA, ETC.
            # ---------------------------------------------------------
            else: 
                data_series = []
                series_names = []
                
                for item in series:
                    if isinstance(item, dict):
                        if 'data' in item and isinstance(item['data'], list):
                            # FIX: Gérer le format ApexCharts {x: ..., y: ...}
                            parsed_data = []
                            for d in item['data']:
                                if isinstance(d, dict) and 'y' in d:
                                    val = d.get('y', 0)
                                    parsed_data.append(float(val) if val is not None else 0)
                                else:
                                    parsed_data.append(float(d) if isinstance(d, (int, float)) else 0)
                            data_series.append(parsed_data)
                            series_names.append(str(item.get('name', 'Series')))
                        elif 'value' in item:
                            data_series.append([float(item['value']) if isinstance(item['value'], (int, float)) else 0])
                            series_names.append(str(item.get('name', 'Series')))
                    elif isinstance(item, (int, float)):
                        if not data_series:
                            data_series.append([])
                            series_names.append('Data')
                        data_series[-1].append(float(item))
                
                if labels and data_series:
                    min_len = min(len(labels), len(data_series[0]))
                    labels = labels[:min_len]
                    data_series = [d[:min_len] for d in data_series]
                
                if data_series:
                    x_values = range(len(data_series[0]))
                    for data, name in zip(data_series, series_names):
                        ax.plot(x_values, data, marker='o', label=name)
                    
                    if len(series_names) > 1:
                        ax.legend()
                    
                    if labels:
                        ax.set_xticks(range(len(labels)))
                        ax.set_xticklabels([str(l) for l in labels])
                    else:
                        ax.set_xticks(x_values)
            
            plt.tight_layout()
            plt.savefig(output_path, dpi=dpi, bbox_inches='tight', format='png')
            plt.close(fig)
            
        except Exception as e:
            print(f"Error generating chart image: {e}")
            try:
                import matplotlib
                matplotlib.use('Agg')
                import matplotlib.pyplot as plt
                fig, ax = plt.subplots(figsize=(4, 2), dpi=dpi)
                ax.text(0.5, 0.5, f'Chart Error: {str(e)[:50]}', 
                        ha='center', va='center', fontsize=10)
                ax.axis('off')
                plt.savefig(output_path, dpi=dpi, bbox_inches='tight', format='png')
                plt.close(fig)
            except:
                pass
    
    @staticmethod
    def _parse_markdown_table(text: str) -> list[list[str]]:
        """
        Parse markdown table block and return list of rows.
        Ignores separator lines (-----).
        """
        lines = [line.strip() for line in text.strip().split('\n') if line.strip()]
        rows = []
        
        for line in lines:
            if not line.startswith('|'): line = '|' + line
            if not line.endswith('|'): line = line + '|'
            
            cells = [cell.strip() for cell in line.strip('|').split('|')]
            
            if all(c.strip('-: ') == '' for c in cells):
                continue
                
            rows.append(cells)
            
        return rows
    
    @staticmethod
    def _draw_markdown_table(pdf, text: str, font_size: float = 10):
        """
        Draw markdown table using FPDF2 native table capabilities.
        """
        rows = PDFGenerator._parse_markdown_table(text)
        
        if not rows or len(rows) == 0:
            return
            
        pdf.set_font("DejaVu", size=font_size)
        
        with pdf.table(
            borders_layout="ALL",
            text_align="LEFT",
            line_height=pdf.font_size * 1.5,
            padding=2
        ) as table:
            for idx, row_data in enumerate(rows):
                row = table.row()
                for cell_text in row_data:
                    clean_cell = cell_text.replace('*', '').replace('_', '')
                    if idx == 0:
                        pdf.set_font("DejaVu", 'B', font_size)
                        row.cell(clean_cell)
                        pdf.set_font("DejaVu", '', font_size)
                    else:
                        row.cell(clean_cell)
            
        pdf.ln(3)
    
    @staticmethod
    def _render_markdown_to_pdf(pdf, text: str, font_size: float = 10):
        """
        Render markdown content in PDF leveraging FPDF2 markdown support.
        Handles tables, headings, lists, horizontal rules, formatting, and charts.
        """
        # First, process charts in the text
        chart_images = []
        text_with_placeholders = text
        
        for match in CHART_PATTERN.finditer(text):
            chart_json = match.group(1)
            chart_config = PDFGenerator._parse_chart_config(chart_json)
            
            if chart_config:
                # Generate a unique placeholder
                placeholder = f"__CHART_PLACEHOLDER_{len(chart_images)}__"
                text_with_placeholders = text_with_placeholders.replace(match.group(0), placeholder, 1)
                chart_images.append(chart_config)
            else:
                # Keep the original text if parsing fails
                pass
        
        lines = text_with_placeholders.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Check for chart placeholder
            if line.startswith('__CHART_PLACEHOLDER_') and line.endswith('__'):
                try:
                    chart_idx = int(line[20:-2])
                    if chart_idx < len(chart_images):
                        chart_config = chart_images[chart_idx]
                        # Generate chart image
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as img_file:
                            img_path = img_file.name
                        
                        PDFGenerator._generate_chart_image(
                            chart_config, 
                            img_path, 
                            width=600, 
                            height=400, 
                            dpi=100
                        )
                        
                        # Insert image into PDF
                        pdf.ln(5)
                        # Calculate available width (pdf.w - margins)
                        available_width = pdf.w - pdf.r_margin - pdf.l_margin
                        # Scale image to fit
                        pdf.image(img_path, x=pdf.l_margin, w=available_width * 0.8)
                        pdf.ln(5)
                        
                        # Clean up
                        try:
                            os.unlink(img_path)
                        except:
                            pass
                except Exception as e:
                    print(f"Error rendering chart: {e}")
                    # Just render the placeholder text
                    pdf.set_font("DejaVu", size=font_size)
                    pdf.multi_cell(0, 5, f"[Chart Error: {str(e)[:50]}]")
                    pdf.ln(2)
                
                i += 1
                continue
            
            if line.startswith('|') or (line.count('|') > 1 and not line.startswith(' ')):
                table_lines = []
                while i < len(lines) and (lines[i].strip().startswith('|') or lines[i].count('|') > 1):
                    table_lines.append(lines[i].strip())
                    i += 1
                
                PDFGenerator._draw_markdown_table(pdf, '\n'.join(table_lines), font_size=font_size)
                continue
            
            if line:
                if line in ['---', '***', '___']:
                    pdf.ln(2)
                    pdf.set_draw_color(200, 200, 200)
                    w = pdf.w - pdf.r_margin - pdf.l_margin
                    pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + w, pdf.get_y())
                    pdf.ln(3)
                    i += 1
                    continue
                
                heading_match = re.match(r'^(#{1,6})\s+(.*)', line)
                if heading_match:
                    level = len(heading_match.group(1))
                    content = heading_match.group(2)
                    size_bonus = {1: 6, 2: 4, 3: 2}.get(level, 1)
                    
                    pdf.ln(2)
                    pdf.set_font("DejaVu", 'B', font_size + size_bonus)
                    pdf.multi_cell(0, 6, content)
                    pdf.ln(1)
                    i += 1
                    continue

                indent = 0
                if line.startswith('- ') or line.startswith('* '):
                    line = f"\u2022 {line[2:]}"
                    indent = 5
                elif re.match(r'^\d+\.\s+', line):
                    indent = 5
                
                line = line.replace('***', '**').replace('___', '**')
                line = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'\1', line)
                line = re.sub(r'(?<!_)_(?!_)(.+?)(?<!_)_(?!_)', r'\1', line)
                
                pdf.set_font("DejaVu", size=font_size)
                
                if indent > 0:
                    original_l_margin = pdf.l_margin
                    pdf.set_left_margin(original_l_margin + indent)
                    pdf.set_x(pdf.l_margin)
                
                pdf.multi_cell(0, 5, line, markdown=True)
                
                if indent > 0:
                    pdf.set_left_margin(original_l_margin)
                    pdf.set_x(pdf.l_margin)
                
                pdf.ln(1)
            else:
                pdf.ln(2)
            
            i += 1
    
    @staticmethod
    def generate_conversation_pdf(chat_history: list[dict[str, str]]) -> tuple[bytes, str]:
        """
        Generate PDF from chat conversation.
        """
        try:
            from fpdf import FPDF
        except ImportError:
            raise ImportError(
                "Le package 'fpdf2' est requis pour générer des PDF. "
                "Installez-le avec: pip install fpdf2"
            )
        
        pdf = FPDF()
        pdf.add_page()
        
        font_dir = Path(__file__).parent / "fonts"
        
        pdf.add_font("DejaVu", "", str(font_dir / "DejaVuSans.ttf"))
        pdf.add_font("DejaVu", "B", str(font_dir / "DejaVuSans-Bold.ttf"))
        
        pdf.add_font("NotoEmoji", "", str(font_dir / "NotoEmoji-Regular.ttf"))
        pdf.set_fallback_fonts(["NotoEmoji"])
        
        pdf.set_font("DejaVu", size=14, style="B")
        
        pdf.cell(0, 10, "Broussaud AI", ln=True, align='C')
        
        pdf.set_font("DejaVu", size=10)
        pdf.set_text_color(120, 120, 120) 
        pdf.cell(0, 10, f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}", ln=True, align='C')
        pdf.set_text_color(0, 0, 0)
        pdf.ln(10)
        
        for i, interaction in enumerate(chat_history, 1):
            question = interaction.get("question", "")
            response = interaction.get("response", "")
            
            try:
                resp_data = json.loads(response)
                response = resp_data.get("answer", response)
            except (json.JSONDecodeError, TypeError):
                pass
            
            question = question.strip() if question else ""
            response = response.strip() if response else ""
            
            pdf.set_font("DejaVu", 'B', 11)
            pdf.cell(0, 7, f"Question {i}:", ln=True)
            pdf.set_font("DejaVu", size=11)
            PDFGenerator._render_markdown_to_pdf(pdf, question, font_size=11)
            pdf.ln(3)
            
            pdf.set_font("DejaVu", 'B', 11)
            pdf.cell(0, 7, "Réponse:", ln=True)
            PDFGenerator._render_markdown_to_pdf(pdf, response, font_size=10)
            pdf.ln(8)
        
        pdf.set_font("DejaVu", size=8)
        pdf.set_text_color(120, 120, 120)
        pdf.cell(0, 10, f"Total: {len(chat_history)} échanges", ln=True, align='R')
        pdf.set_text_color(0, 0, 0)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"conversation_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"
        
        pdf_bytes = bytes(pdf.output())
        
        return pdf_bytes, filename
    
    @staticmethod
    async def upload_to_supabase_storage(pdf_bytes: bytes, filename: str) -> str:
        """
        Upload PDF to Supabase Storage.
        """
        storage_path = f"conversations/{filename}"
        
        if isinstance(pdf_bytes, bytearray):
            pdf_bytes = bytes(pdf_bytes)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_bytes)
            tmp_file_path = tmp_file.name
        
        try:
            response = supabase.storage.from_("conversations").upload(
                path=storage_path,
                file=tmp_file_path,
                file_options={"content-type": "application/pdf", "cache-control": "3600"}
            )
            
            if hasattr(response, 'status_code') and response.status_code >= 400:
                error_msg = response.text or "Réponse HTTP vide de la part du serveur."
                raise Exception(f"Échec de l'upload vers Supabase (HTTP {response.status_code}) : {error_msg}")
            
            if hasattr(response, 'error') and response.error:
                error_msg = str(response.error)
                raise Exception(f"Échec de l'upload vers Supabase Storage : {error_msg}")
                
        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
        
        url_response = supabase.storage.from_("conversations").get_public_url(storage_path)
        
        if hasattr(url_response, 'data') and url_response.data:
            public_url = url_response.data.get('publicUrl') or url_response.data.get('url')
        elif hasattr(url_response, 'publicUrl'):
            public_url = url_response.publicUrl
        elif isinstance(url_response, str):
            public_url = url_response
        else:
            public_url = str(url_response) if url_response else None
        
        if not public_url:
            raise Exception("Impossible de récupérer l'URL publique du fichier")
        
        return public_url


async def generate_conversation_pdf_link(chat_history: list[dict[str, str]]) -> str:
    """
    Main function to generate PDF and return its information.
    """
    if not chat_history:
        return json.dumps({"error": "Aucune conversation à exporter en PDF", "name": None, "url": None})
    
    try:
        pdf_bytes, filename = PDFGenerator.generate_conversation_pdf(chat_history)
        public_url = await PDFGenerator.upload_to_supabase_storage(pdf_bytes, filename)
        
        return json.dumps({
            "url": public_url,
            "name": filename
        })
    except Exception as e:
        return json.dumps({
            "error": f"Erreur lors de la génération du PDF: {str(e)}"
        })