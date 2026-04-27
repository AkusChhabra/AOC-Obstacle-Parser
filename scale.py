from PIL import Image

image_path = './documents/LS_AD_2_LSGG_24-4-1_en_2009-07-16.png'  
image = Image.open(image_path)

original_width, original_height = image.size

point = (100, 150) # Implement cursor postion tp scale image

scale_factor = 2 # scale factor

new_width = int(original_width * scale_factor)
new_height = int(original_height * scale_factor)

scaled_image = image.resize((new_width, new_height))

scaled_point = (int(point[0] * scale_factor), int(point[1] * scale_factor))

scaled_image.show()

print(f"Original point: {point}")
print(f"Scaled point: {scaled_point}")