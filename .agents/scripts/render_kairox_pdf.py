import fitz


source = "attached_assets/Kairox_Browser_Master_Build_Command_2026-09_1789698261192.pdf"
output_dir = ".agents/outputs/kairox-pdf"
document = fitz.open(source)

for page_number in (15, 16, 17, 22, 23):
    page = document[page_number - 1]
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pixmap.save(f"{output_dir}/page-{page_number:02d}.png")

print(f"Rendered {len((15, 16, 17, 22, 23))} visual reference pages from {document.page_count} total pages.")