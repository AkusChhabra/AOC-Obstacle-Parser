import fitz
import pymupdf
import tkinter as tk
from tkinter import filedialog

def pdf_to_svg(pdf_path, output_prefix):
    doc = fitz.open(pdf_path)

    for page_num, page in enumerate(doc):
        svg_content = page.get_svg_image(matrix=pymupdf.Identity)
        output_filename = f"{output_prefix}_page_{page_num + 1}.svg"
        
        with open(output_filename, "w", encoding="utf-8") as svg_file:
            svg_file.write(svg_content)
            
    print(f"Successfully converted {len(doc)} page(s) to SVG.")

def checkPath(file_path):
    if file_path:
        print(f"Selected file: {file_path}")
    else:
        print("User cancelled the dialog.")


root = tk.Tk()
root.withdraw()

outputFile = "output_vector"

file_path = filedialog.askopenfilename()

inputFile = file_path.split("/")[-1]

checkPath(file_path)
pdf_to_svg(file_path, outputFile)