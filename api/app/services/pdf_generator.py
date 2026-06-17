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


class PDFGenerator:
    """Generates PDF files from chat conversations with proper formatting and Emoji support."""
    
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
        Handles tables, headings, lists, horizontal rules, and formatting safely.
        """
        lines = text.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
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