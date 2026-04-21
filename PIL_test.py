from PIL import Image
import win32api
import math


def measure_pixel_length(p1, p2):
    """Calculates the straight-line distance between two points in pixels."""
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

# Example: Distance between point (10, 10) and (50, 40)
point1 = (10, 10)
point2 = (50, 40)
length = measure_pixel_length(point1, point2)
print(f"Length: {length:.2f} pixels")


im = Image.open('./documents/LS_AD_2_LSGG_24-4-1_en_2009-07-16.png')

pixels = list(im.getdata())
width, height = im.size
#pixels = [pixels[i * width:(i + 1) * width] for i in range(height)]
print(len(pixels))

x, y = win32api.GetCursorPos()

print(x,y)
