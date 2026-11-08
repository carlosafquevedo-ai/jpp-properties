#!/usr/bin/env python3
"""Read the old site's property pages (saved by hand in migration-output/raw/) and write:

  migration-output/properties.json  one record per property, PT text, numbers from the details block
  migration-output/report.md        every problem found, per property, for the client to review

Inputs (all inside migration-output/, which is git-ignored):
  urls.txt          the EN property URLs from /en/properties/ pages 1-3
  pt-map.txt        "<en-slug>|<pt-url>" per line
  raw/en/<slug>.html, raw/pt/<slug>.html

Usage: python3 scripts/migrate-old-site.py [--check-images]
Nothing is invented: a value that is missing on the old site stays empty and is listed in the report.
"""
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'migration-output'
UA = 'Mozilla/5.0 (JPP site migration)'


def text(fragment: str) -> str:
    fragment = re.sub(r'<br\s*/?>', ' ', fragment)
    fragment = re.sub(r'<[^>]+>', '', fragment)
    return re.sub(r'\s+', ' ', html.unescape(fragment)).strip()


def between(s: str, start: str, end: str) -> str:
    """The text after `start` up to `end` (both excluded)."""
    i = s.find(start)
    if i < 0:
        return ''
    i += len(start)
    j = s.find(end, i)
    return s[i:j] if j > 0 else s[i:]


def article(s: str) -> str:
    """The property article only (the related cards below use other markup but are cut off to be safe)."""
    a = between(s, '<article id="post-', '</article>')
    return a or s


def number(raw: str):
    """'160,00m2' -> 160, '1 250 000' -> 1250000, '' -> None."""
    raw = raw.replace('m^2', '').replace('m2', '').replace('m²', '').replace('€', '').strip()
    if not raw:
        return None
    raw = raw.replace(' ', ' ').replace(' ', '')
    if re.fullmatch(r'\d{1,3}(\.\d{3})+(,\d+)?', raw):  # 1.250.000 or 1.250,50
        raw = raw.replace('.', '')
    raw = raw.replace(',', '.')
    try:
        v = float(raw)
    except ValueError:
        return None
    return int(round(v)) if abs(v - round(v)) < 0.01 else v


def details(s: str) -> dict:
    block = between(s, 'properties_page_details', '</section>')
    out = {}
    for label, data in re.findall(
        r'properties_page_label">([^<]*)</span>\s*<span class="properties_page_data">(.*?)</span>', block, re.S
    ):
        out[text(label).rstrip(':')] = text(data)
    return out


def description(s: str) -> list[str]:
    block = between(s, 'class="properties_page_section properties_page_content', '</section>')
    block = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', block, flags=re.S)
    out: list[str] = []
    # Tables (e.g. a development's plots): one line per row, cells joined.
    for table in re.findall(r'<table.*?</table>', block, re.S):
        for row in re.findall(r'<tr.*?</tr>', table, re.S):
            cells = [text(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)]
            cells = [c for c in cells if c]
            if cells:
                out.append(' · '.join(cells))
        block = block.replace(table, '\n@@TABLE@@\n')
    tables = iter([out]) if out else iter([])
    lines: list[str] = []
    # Paragraphs, list items, headings, and "leaf" divs (some listings lay a table out as one <div> per row).
    pattern = re.compile(r'<(p|li|h[1-6])[^>]*>(.*?)</\1>|<div[^>]*>((?:(?!<div)[\s\S])*?)</div>|@@TABLE@@', re.S)
    for m in pattern.finditer(block):
        tag, inner, div = m.group(1), m.group(2), m.group(3)
        if m.group(0) == '@@TABLE@@':
            lines.extend(next(tables, []))
            continue
        t = text(inner if tag else div or '')
        t = re.sub(r'\*\*+', '', t).strip()  # stray markdown bold from the old editor
        if not t:
            continue
        lines.append(('• ' + t) if tag == 'li' else t)
    return lines


def features(s: str) -> list[str]:
    block = between(s, 'properties_page_features_list', '</div>')
    return [text(x) for x in re.findall(r'<a[^>]*>(.*?)</a>', block, re.S) if text(x)]


def classes(s: str) -> list[str]:
    m = re.search(r'<article id="post-(\d+)"[^>]*class="([^"]*)"', s)
    return (m.group(2).split() if m else [])


def post_id(s: str):
    m = re.search(r'<article id="post-(\d+)"', s)
    return int(m.group(1)) if m else None


def head_ok(url: str) -> tuple[bool, int]:
    req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status == 200, r.status
    except Exception as e:  # noqa: BLE001
        return False, getattr(e, 'code', 0)


def main():
    check_images = '--check-images' in sys.argv
    urls = [u.strip() for u in (ROOT / 'urls.txt').read_text().splitlines() if u.strip()]
    pt_urls = dict(line.split('|', 1) for line in (ROOT / 'pt-map.txt').read_text().splitlines() if '|' in line)
    records, problems = [], {}

    for url in urls:
        slug = url.rstrip('/').split('/')[-1]
        en = (ROOT / 'raw/en' / f'{slug}.html').read_text(errors='replace')
        pt_path = ROOT / 'raw/pt' / f'{slug}.html'
        pt = pt_path.read_text(errors='replace') if pt_path.exists() else ''
        en_a, pt_a = article(en), article(pt) if pt else ''
        p = problems.setdefault(slug, [])

        cls = classes(en)
        title_en = text(between(en_a, 'properties_page_title">', '<span class="properties_page_status'))
        title_pt = text(between(pt_a, 'properties_page_title">', '<span class="properties_page_status')) if pt else ''
        address = [text(x) for x in re.findall(r'properties_address_item">(.*?)</span>', between(en_a, 'properties_page_title_address', '</div>'), re.S)]
        price_en = number(text(between(en_a, 'properties_price1">', '</span>')))
        price_pt = number(text(between(pt_a, 'properties_price1">', '</span>'))) if pt else None
        d = details(en_a)
        energy = re.search(r'Classe Energ.{0,200}?<img src=[\'"][^\'"]*/([A-G][+-]?)\.png', en_a, re.S)
        gallery = re.findall(r'properties_page_gallery_item" data-image="([^"]+)"', en_a)
        if not gallery:
            m = re.search(r'properties_page_featured.*?<img[^>]*src="([^"]+)"', en_a, re.S)
            gallery = [m.group(1)] if m else []
        # Prefer the original upload (without the -WxH size suffix) when it exists.
        images = []
        for g in gallery:
            orig = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', g)
            images.append({'resized': g, 'original': orig})

        desc_pt = description(pt_a) if pt else []
        desc_en = description(en_a)
        feats = features(pt_a) if pt else features(en_a)
        upload = re.search(r'/uploads/(\d{4})/(\d{2})/', ' '.join(gallery))

        rec = {
            'enSlug': slug,
            'enUrl': url,
            'ptUrl': pt_urls.get(slug, ''),
            'postId': post_id(en),
            'titlePt': title_pt,
            'titleEn': title_en,
            'status': [c.split('-', 2)[-1] for c in cls if c.startswith('cpt_properties_status-')],
            'types': [c.split('cpt_properties_type-')[1] for c in cls if c.startswith('cpt_properties_type-')],
            'labels': [c.split('cpt_properties_labels-')[1] for c in cls if c.startswith('cpt_properties_labels-')],
            'cityTax': [c.split('cpt_properties_city-')[1] for c in cls if c.startswith('cpt_properties_city-')],
            'countryTax': [c.split('cpt_properties_country-')[1] for c in cls if c.startswith('cpt_properties_country-')],
            'address': address,
            'price': price_en,
            'pricePt': price_pt,
            'details': d,
            'areaUsable': number(d.get('Area size', '')),
            'areaLand': number(d.get('Land size', '')),
            'bedrooms': number(d.get('Bedrooms', '')),
            'bathrooms': number(d.get('Bathrooms', '')),
            'garage': number(d.get('Garage', '')),
            'yearBuilt': number(d.get('Year built', '')),
            'energyClass': energy.group(1) if energy else None,
            'uploadMonth': f'{upload.group(1)}-{upload.group(2)}' if upload else None,
            'images': images,
            'descriptionPt': desc_pt,
            'descriptionEn': desc_en,
            'featuresPt': feats,
        }

        # ---- checks -------------------------------------------------------------------------------------
        if not pt:
            p.append('Sem versão PT.')
        if not title_pt:
            p.append('Título PT em falta.')
        if not price_en:
            p.append('Preço em falta.')
        if price_pt and price_en and price_pt != price_en:
            p.append(f'Preço diferente entre PT ({price_pt:,} €) e EN ({price_en:,} €).'.replace(',', ' '))
        for key, label in [('areaUsable', 'Área útil'), ('bedrooms', 'Quartos'), ('bathrooms', 'Casas de banho'), ('yearBuilt', 'Ano de construção')]:
            if rec[key] in (None, 0):
                p.append(f'{label} em falta no bloco de detalhes.')
        if not rec['energyClass']:
            p.append('Classe energética em falta.')
        if rec['countryTax'] and not any('portugal' in c for c in rec['countryTax']):
            p.append(f'País errado no site antigo: {", ".join(rec["countryTax"])}.')
        if any('albufeira' in c for c in rec['cityTax']):
            p.append(f'Concelho no site antigo: {", ".join(rec["cityTax"])} (confirmar; o texto fala de {", ".join(address) or "?"}).')
        if not images:
            p.append('Sem fotografias.')
        if not desc_pt:
            p.append('Descrição PT vazia.')
        # Prices quoted in the text that differ from the listing price (e.g. developments with several units).
        quoted = {number(m) for m in re.findall(r'€\s?([\d.,  ]{5,})|([\d.  ]{5,})\s?€', ' '.join(desc_pt + desc_en)) for m in m if m}
        quoted = {q for q in quoted if isinstance(q, int) and q >= 10000}
        if quoted and price_en and price_en not in quoted:
            p.append('Preços no texto diferentes do preço do anúncio: ' + ', '.join(f'{q:,} €'.replace(',', ' ') for q in sorted(quoted)) + '.')
        records.append(rec)

    # Possible duplicates: same title, or same price + area + bedrooms.
    seen = {}
    for r in records:
        key = (r['price'], r['areaUsable'], r['bedrooms'], r['areaLand'])
        seen.setdefault(key, []).append(r['enSlug'])
    for key, slugs in seen.items():
        if len(slugs) > 1:
            for s in slugs:
                others = [o for o in slugs if o != s]
                problems[s].append('Mesmo preço, área e quartos que: ' + ', '.join(others) + ' (unidades diferentes do mesmo empreendimento, ou duplicado?).')
    titles = {}
    for r in records:
        titles.setdefault(r['titlePt'].lower(), []).append(r['enSlug'])
    for t, slugs in titles.items():
        if len(slugs) > 1:
            for s in slugs:
                problems[s].append('Mesmo título PT que: ' + ', '.join(o for o in slugs if o != s) + '.')

    if check_images:
        for r in records:
            broken = 0
            for img in r['images']:
                ok, _ = head_ok(img['original'])
                if ok:
                    img['use'] = img['original']
                    continue
                ok2, code = head_ok(img['resized'])
                img['use'] = img['resized'] if ok2 else None
                if not ok2:
                    broken += 1
            if broken:
                problems[r['enSlug']].append(f'{broken} fotografia(s) com ligação partida.')

    (ROOT / 'properties.json').write_text(json.dumps(records, ensure_ascii=False, indent=2))
    lines = ['# Migração de imóveis do site antigo: relatório', '', f'{len(records)} imóveis lidos de {len(urls)} endereços.', '']
    for r in records:
        lines.append(f'## {r["titlePt"] or r["titleEn"]}')
        lines.append(f'- EN: {r["enUrl"]}')
        lines.append(f'- PT: {r["ptUrl"]}')
        lines.append(f'- Preço: {r["price"]} · Área útil: {r["areaUsable"]} · Terreno: {r["areaLand"]} · Quartos: {r["bedrooms"]} · WC: {r["bathrooms"]} · Garagem: {r["garage"]} · Ano: {r["yearBuilt"]} · Classe: {r["energyClass"]} · Fotos: {len(r["images"])}')
        lines.append(f'- Tipo: {", ".join(r["types"])} · Estado: {", ".join(r["labels"])} · Morada: {" / ".join(r["address"])}')
        for msg in problems[r['enSlug']] or ['Sem problemas encontrados.']:
            lines.append(f'  - {msg}')
        lines.append('')
    (ROOT / 'report.md').write_text('\n'.join(lines))
    print(f'{len(records)} records, {sum(len(v) for v in problems.values())} problems')


if __name__ == '__main__':
    main()
