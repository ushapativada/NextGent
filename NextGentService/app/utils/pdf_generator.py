from fpdf import FPDF
import os

class TechnicalSpecPDF(FPDF):
    def __init__(self, project_name: str = "NextGent"):
        super().__init__()
        self.project_name = project_name

    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, f'{self.project_name} - Technical Specification', 0, 1, 'C')
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
        lines = body.split('\n')
        for line in lines:
            import re
            # Check for image markdown ![alt](path)
            img_match = re.search(r'!\[([^\]]*)\]\((.*?)\)', line)
            if img_match:
                img_path = img_match.group(2)
                try:
                    # Give some margin before image
                    self.ln(5)
                    # Automatically scale width to roughly fit page minus margins
                    self.image(img_path, w=170)
                    self.ln(5)
                except Exception as e:
                    self.multi_cell(0, 5, f"[Image rendering failed: {img_path}]")
                    print(f"PDF Image Error: {e}")
            else:
                clean_line = line.replace('**', '').replace('##', '').replace('* ', '- ')
                if clean_line.strip() or self.get_y() > 30: # Avoid excessive newlines at top
                    self.multi_cell(0, 5, clean_line)

def generate_pdf(content: str, filename: str, project_name: str = "NextGent"):
    pdf = TechnicalSpecPDF(project_name=project_name)
    pdf.add_page()
    
    # Simple parsing to split sections if possible, or just dump content
    pdf.chapter_body(content)

    output_path = f"app/static/{filename}"
    os.makedirs("app/static", exist_ok=True)
    pdf.output(output_path)
    return output_path
