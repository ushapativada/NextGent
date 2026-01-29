from fpdf import FPDF
import os

class TechnicalSpecPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'NextGent - Technical Specification', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 6, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        # simplistic markdown cleanup
        clean_body = body.replace('**', '').replace('##', '').replace('* ', '- ')
        self.multi_cell(0, 5, clean_body)
        self.ln()

def generate_pdf(content: str, filename: str):
    pdf = TechnicalSpecPDF()
    pdf.add_page()
    
    # Simple parsing to split sections if possible, or just dump content
    pdf.chapter_body(content)

    output_path = f"app/static/{filename}"
    os.makedirs("app/static", exist_ok=True)
    pdf.output(output_path)
    return output_path
