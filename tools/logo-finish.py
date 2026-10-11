"""Обрезает viewBox по содержимому и пишет итоговые SVG логотипа в brand/logo/ и src/icons/."""
import re, subprocess, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
COLORS = {'caramel': '#8A5A33', 'light': '#FBF3EA', 'choc': '#3B2716'}

def bbox(path_d):
    # точный bbox через Chromium не нужен: берём крайние точки контура (с запасом на кривые)
    nums = list(map(float, re.findall(r'-?\d+(?:\.\d+)?', path_d)))
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)

for name in ['full', 'no-subtitle']:
    d = (root / f'build/logo/{name}.path.txt').read_text()
    x0, y0, x1, y1 = bbox(d)
    pad = 6
    vb = f'{x0 - pad:.0f} {y0 - pad:.0f} {x1 - x0 + 2 * pad:.0f} {y1 - y0 + 2 * pad:.0f}'
    title = 'Тема еды — кафе-ресторан' if name == 'full' else 'Тема еды'
    base = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}"><title>{title}</title><path fill="{{fill}}" fill-rule="evenodd" d="{d}"/></svg>\n'
    for cname, col in COLORS.items():
        (root / f'brand/logo/tema-edy-{name}-{cname}.svg').write_text(base.replace('{fill}', col))
    (root / f'src/icons/logo-{name}.svg').write_text(base.replace('{fill}', 'currentColor'))
    print(name, vb)
