import pymupdf
import tkinter as tk
from tkinter import filedialog

def checkPath(file_path):
    if file_path:
        print(f"Selected file: {file_path}")
    else:
        print("User cancelled the dialog.")

root = tk.Tk()
root.withdraw()

file_path = filedialog.askopenfilename()
checkPath(file_path)

inputFile = pymupdf.open(file_path)

for page in inputFile:
    zoom = 5.0 # Don't go higher otherwise image resolution will slow down measurement tool (perhaps look into svg conversion)
    matrix = pymupdf.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=matrix)
    
    pix.save(f"page-{page.number}.png")

inputFile.close()