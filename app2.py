import tkinter as tk
from PIL import Image, ImageTk, ImageDraw
import math
import csv

class ObstacleMeasurementTool:
    def __init__(self, image_path, metres_per_pixel=6.24):
        self.mpp = metres_per_pixel
        self.runway_end = None
        self.obstacles = []
        self.mode = 'runway'  # 'runway' | 'obstacle' | 'calibrate'
        
        # Load image
        self.orig_img = Image.open(image_path)
        
        # Set up window
        self.root = tk.Tk()
        self.root.title("AIP Obstacle Measurement Tool")
        self._build_ui()
        self.root.mainloop()

    def _build_ui(self):
        # Toolbar
        toolbar = tk.Frame(self.root)
        toolbar.pack(fill='x', pady=4)
        tk.Button(toolbar, text="1. Set runway end",
                  command=lambda: self.set_mode('runway')).pack(side='left', padx=4)
        tk.Button(toolbar, text="2. Place obstacle",
                  command=lambda: self.set_mode('obstacle')).pack(side='left', padx=4)
        tk.Button(toolbar, text="Export CSV",
                  command=self.export_csv).pack(side='right', padx=4)

        # Canvas
        self.tk_img = ImageTk.PhotoImage(self.orig_img)
        self.canvas = tk.Canvas(self.root,
                                width=self.orig_img.width,
                                height=self.orig_img.height)
        self.canvas.pack()
        self.canvas.create_image(0, 0, anchor='nw', image=self.tk_img)
        self.canvas.bind('<Button-1>', self.on_click)
        self.canvas.bind('<Motion>', self.on_hover)

        # Status bar
        self.status_var = tk.StringVar(value="Click 'Set runway end' to begin.")
        tk.Label(self.root, textvariable=self.status_var,
                 anchor='w').pack(fill='x', padx=8)

        # Results table
        self.table_frame = tk.Frame(self.root)
        self.table_frame.pack(fill='x', padx=8, pady=4)

    def set_mode(self, mode):
        self.mode = mode

    def on_click(self, event):
        x, y = event.x, event.y
        if self.mode == 'runway':
            self.runway_end = (x, y)
            self._draw_runway_marker(x, y)
            self.status_var.set(f"Runway end set at ({x}, {y}). Now place obstacles.")
        elif self.mode == 'obstacle':
            if not self.runway_end:
                self.status_var.set("Set runway end first!")
                return
            obs_id = len(self.obstacles) + 1
            long_m, lat_m, dist_m = self._measure(x, y)
            self.obstacles.append({
                'id': obs_id, 'px': (x, y),
                'longitudinal_m': long_m,
                'lateral_m': lat_m,
                'straight_line_m': dist_m
            })
            self._draw_obstacle_marker(x, y, obs_id)
            self._draw_dimension_lines(x, y, long_m, lat_m)
            self.status_var.set(
                f"Obstacle {obs_id}: {long_m:.0f}m along runway, "
                f"{lat_m:.0f}m lateral, {dist_m:.0f}m straight-line"
            )

    def _measure(self, obs_x, obs_y):
        rx, ry = self.runway_end
        dx_px = abs(obs_x - rx)
        dy_px = abs(obs_y - ry)
        long_m = dx_px * self.mpp
        lat_m  = dy_px * self.mpp
        dist_m = math.sqrt(long_m**2 + lat_m**2)
        return round(long_m), round(lat_m), round(dist_m)

    def _draw_runway_marker(self, x, y):
        r = 6
        self.canvas.create_oval(x-r, y-r, x+r, y+r,
                                outline='blue', width=2, tags='overlay')
        self.canvas.create_text(x+10, y-10, text='RWY end',
                                fill='blue', anchor='w', tags='overlay')

    def _draw_obstacle_marker(self, x, y, obs_id):
        r = 7
        self.canvas.create_line(x-r, y-r, x+r, y+r,
                                fill='red', width=2, tags='overlay')
        self.canvas.create_line(x+r, y-r, x-r, y+r,
                                fill='red', width=2, tags='overlay')
        self.canvas.create_text(x+9, y-9, text=str(obs_id),
                                fill='red', font=('Arial', 9, 'bold'), tags='overlay')

    def _draw_dimension_lines(self, ox, oy, long_m, lat_m):
        rx, ry = self.runway_end
        # Longitudinal line (horizontal)
        self.canvas.create_line(rx, ry, ox, ry,
                                fill='green', dash=(4,3), tags='overlay')
        self.canvas.create_text((rx+ox)//2, ry-6,
                                text=f'{long_m}m', fill='green',
                                font=('Arial', 8), tags='overlay')
        # Lateral line (vertical)
        self.canvas.create_line(ox, ry, ox, oy,
                                fill='green', dash=(4,3), tags='overlay')
        self.canvas.create_text(ox+4, (ry+oy)//2,
                                text=f'{lat_m}m', fill='green',
                                font=('Arial', 8), anchor='w', tags='overlay')

    def on_hover(self, event):
        if self.runway_end and self.mode == 'obstacle':
            long_m, lat_m, dist_m = self._measure(event.x, event.y)
            self.status_var.set(
                f"Preview — Long: {long_m}m  Lat: {lat_m}m  Dist: {dist_m}m"
            )

    def export_csv(self):
        with open('obstacles.csv', 'w', newline='') as f:
            w = csv.DictWriter(f, fieldnames=[
                'id','longitudinal_m','lateral_m','straight_line_m'])
            w.writeheader()
            w.writerows([{k: v for k, v in o.items() if k != 'px'}
                         for o in self.obstacles])
        self.status_var.set("Exported to obstacles.csv")

    def calibrate_interactive(self):
        """User clicks two known points on the scale bar."""
        self.mode = 'calibrate'
        self.calib_points = []
        
        # Prompt: "Click the 0m mark on the scale bar, then the 1000m mark"
        # On second click:
        known_m = 1000
        dx = abs(self.calib_points[1][0] - self.calib_points[0][0])
        self.mpp = known_m / dx
        self.status_var.set(f"Calibrated: {self.mpp:.3f} m/px")

# Run it
tool = ObstacleMeasurementTool("LS_AD_2_LSGG_24-4-1_en_2009-07-16.png",
                                metres_per_pixel=6.24)