import math, os

os.makedirs(r"D:\Workspace\rumakost\assets\icons", exist_ok=True)

def create_radial_gauge(filename, active_color, inactive_color, active_count, total_ticks=20, percent_text="+12%"):
    cx, cy = 60, 52
    r_in, r_out = 32, 46
    ticks_svg = []
    start_deg, end_deg = 200, -20
    span = start_deg - end_deg
    
    for i in range(total_ticks):
        deg = start_deg - (i / (total_ticks - 1)) * span
        rad = math.radians(deg)
        x1 = cx + r_in * math.cos(rad)
        y1 = cy - r_in * math.sin(rad)
        x2 = cx + r_out * math.cos(rad)
        y2 = cy - r_out * math.sin(rad)
        color = active_color if i < active_count else inactive_color
        ticks_svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="2.5" stroke-linecap="round"/>')
    
    ticks_str = "\n  ".join(ticks_svg)
    svg = f'''<svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
  {ticks_str}
  <text x="60" y="52" text-anchor="middle" font-family="Poppins, sans-serif" font-size="13" font-weight="600" fill="#0F172A">{percent_text}</text>
</svg>'''
    with open(filename, "w", encoding="utf-8") as f:
        f.write(svg)

create_radial_gauge(r"D:\Workspace\rumakost\assets\icons\gauge-rooms.svg", "#F97316", "#E2E8F0", 16, 20, "+12%")
create_radial_gauge(r"D:\Workspace\rumakost\assets\icons\gauge-leads.svg", "#0F1117", "#E2E8F0", 14, 20, "+18%")
create_radial_gauge(r"D:\Workspace\rumakost\assets\icons\gauge-sales.svg", "#BE123C", "#E2E8F0", 17, 20, "+40%")
