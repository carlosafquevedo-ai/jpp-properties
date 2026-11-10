#!/usr/bin/env python3
"""Turn migration-output/properties.json (from scripts/migrate-old-site.py) into src/data/imported-properties.ts.

The text and numbers are the client's own, from their current site. The only additions are the mapping decisions
below (our slug, zone, locality, type), each taken from the listing itself; anything the old site does not say stays
empty (null) and is listed in migration-output/report.md for the client. Photos stay on the old site (hot-linked).

Usage: python3 scripts/build-properties.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'migration-output' / 'properties.json'
OUT = ROOT / 'src' / 'data' / 'imported-properties.ts'

# Per listing (keyed by the old EN slug): our PT slug, zone, locality and type, read from the listing's own text.
# 'skip' leaves a listing out until a decision is made (e.g. a zone the site does not have yet).
MAP: dict[str, dict] = {
    '2-bedroom-apartment-in-vilamoura-marina': {'slug': 't2-marina-de-vilamoura', 'zone': 'vilamoura', 'locality': 'Marina'},
    '2-bedroom-apartment-with-golf-view': {'slug': 't2-vista-golfe-vilamoura', 'zone': 'vilamoura'},
    '2-bedroom-near-the-beach': {'slug': 't2-perto-da-praia-quarteira', 'zone': 'quarteira'},
    '3-bedroom-villa': {'slug': 'moradia-t3-vilasol', 'zone': 'vilasol'},
    '4-bdr-villa': {'slug': 'moradia-v4-the-crest-loule', 'zone': 'loule', 'locality': 'The Crest'},
    '6000-m%c2%b2-rustic-plot-stunning-unobstructed-panoramic-views-franqueada-sao-sebastiao-loule': {
        'slug': 'terreno-rustico-franqueada-loule', 'zone': 'loule', 'locality': 'Franqueada, São Sebastião',
        'type': 'plot', 'plotArea': 6000,  # "aproximadamente 6.000 m²" in the title and text
    },
    'brand-new-1-bedroom-apartment-with-parking-minutes-from-the-beach': {
        'slug': 't1-novo-rua-da-azinheira-quarteira', 'zone': 'quarteira', 'locality': 'Rua da Azinheira'},
    'brand-new-2-bedroom-apartment-with-sea-views-swimming-pool-and-garage-forte-novo-quarteira': {
        'slug': 't2-vista-mar-forte-novo-quarteira', 'zone': 'quarteira', 'locality': 'Forte Novo',
        'usableArea': 106, 'grossArea': 237,  # "Com 237 m² de área bruta e 106 m² de área útil"
    },
    'living-at-casuarinas-residences': {'slug': 'casuarinas-residences-vilamoura', 'zone': 'vilamoura', 'usableArea': None},
    'luxury-construction-2': {'slug': 'apartamento-t2-casuarinas-vilamoura', 'zone': 'vilamoura', 'usableArea': None,
                              'title': 'Apartamento T2 nas Casuarinas, Vilamoura'},
    'luxury-construction': {'slug': 'townhouse-casuarinas-vilamoura', 'zone': 'vilamoura', 'type': 'villa',
                            'title': 'Moradia em banda nas Casuarinas, Vilamoura'},
    'oliveiras-residence': {'slug': 'oliveiras-residence-quarteira', 'zone': 'quarteira', 'locality': 'Cascalheira'},
    'traditional-villa-in-querenca': {'slug': 'moradia-isolada-querenca', 'zone': 'loule', 'locality': 'Querença'},
    'two-bedroom-apartment-for-sale-in-vilamoura': {
        'slug': 't2-praca-tivoli-vilamoura', 'zone': 'vilamoura', 'locality': 'Praça Tivoli',
        'usableArea': 65.68, 'grossArea': 90.6,  # "Área bruta privativa: 90,60 m² | Área útil: 65,68 m²"
    },
    'v3-townhouse': {'slug': 'moradia-em-banda-t3-quinta-do-lago', 'zone': 'quinta-do-lago', 'locality': 'Pinheiros Altos'},
    'vila-in-vilamoura': {'slug': 'moradia-t3-vilamoura', 'zone': 'vilamoura'},
    'villa-to-renovate-with-rural-tourism-project': {
        'slug': 'moradias-para-recuperar-turismo-rural-loule', 'zone': 'loule',
        'grossArea': 423,  # "423 m² de área edificada"
    },
    # Carvoeiro (Lagoa): Primelife (three units) and The Court (three units), zone added at the client's request.
    # Repeated titles on the old site (one per unit of the same development): our titles name the development and the
    # typology from each listing. TODO (client): the two Primelife T2 and the two The Court units without a typology
    # still read alike; ask for what tells them apart (floor, view, unit letter).
    'luxury-and-tranquillity-in-the-heart-of-carvoeiro': {'slug': 'primelife-t2-carvoeiro', 'zone': 'carvoeiro',
        'title': 'Apartamento T2 no Primelife, Carvoeiro'},
    'luxury-and-tranquillity-in-the-heart-of-carvoeiro-2': {'slug': 'primelife-t2-carvoeiro-2', 'zone': 'carvoeiro',
        'title': 'Apartamento T2 no Primelife, Carvoeiro'},
    'luxury-and-tranquillity-in-the-heart-of-carvoeiro-3': {'slug': 'primelife-t3-carvoeiro', 'zone': 'carvoeiro',
        'title': 'Apartamento T3 no Primelife, Carvoeiro'},
    'new-build-development': {'slug': 'the-court-t2-carvoeiro', 'zone': 'carvoeiro',
        'title': 'Apartamento T2 no The Court, Carvoeiro'},
    'new-build-development-2': {'slug': 'the-court-carvoeiro-2', 'zone': 'carvoeiro',
        'title': 'Apartamento no The Court, Carvoeiro'},
    'new-build-development-3': {'slug': 'the-court-carvoeiro-3', 'zone': 'carvoeiro',
        'title': 'Apartamento no The Court, Carvoeiro'},
}

TYPES = {'apartment': 'apartment', 'houses': 'villa', 'house-in-condominium': 'villa', 'plot': 'plot', 'shop': 'shop'}
REFERENCE = re.compile(r'^[A-Z]{2,}\d+[A-Z0-9-]*$')  # e.g. CRT2; free text such as "Casuarinas" is not a reference


# A table header that the old editor flattened into one unreadable line (e.g. "LOTE A. LOTE A. UTIL A. BRUTA V. VENDA");
# the rows under it read fine on their own, so the header is dropped.
GARBLED_HEADER = re.compile(r'^(LOTE|PLOT)\s+A\.\s', re.I)


def clean_line(line: str) -> str:
    if GARBLED_HEADER.match(line.strip()):
        return ''
    line = line.replace('—–', ' · ').replace('–—', ' · ')
    line = re.sub(r'\s+·\s+', ' · ', line)
    return re.sub(r'\s{2,}', ' ', line).strip()


def ts(value) -> str:
    return json.dumps(value, ensure_ascii=False)


def main():
    records = json.loads(SRC.read_text())
    out, skipped = [], []
    for r in records:
        m = MAP.get(r['enSlug'])
        if m is None:
            raise SystemExit(f'No mapping for {r["enSlug"]}')
        if 'skip' in m:
            skipped.append((r['enSlug'], m['skip']))
            continue
        ptype = m.get('type') or next((TYPES[t] for t in r['types'] if t in TYPES), None)
        if ptype is None:
            raise SystemExit(f'No property type for {r["enSlug"]}: {r["types"]}')
        labels = r['labels']
        condition = 'new' if 'new' in labels else 'used' if 'used' in labels else None
        images = [i.get('use') or i['resized'] for i in r['images'] if i.get('use', True)]
        ref = r['details'].get('Property ID', '')
        title = m.get('title') or r['titlePt'] or r['titleEn']
        title = title.replace('Empreedimento', 'Empreendimento')

        def pick(key, src):
            return m[key] if key in m else src

        rec = {
            'slug': m['slug'],
            **({'reference': ref} if REFERENCE.match(ref or '') else {}),
            'title': title,
            'listingType': 'rent' if 'rent' in r['status'] else 'sale',
            'propertyType': ptype,
            'condition': condition,
            'zone': m['zone'],
            **({'locality': m['locality']} if m.get('locality') else {}),
            **({'grossArea': m['grossArea']} if m.get('grossArea') else {}),
            **({'plotArea': pick('plotArea', r['areaLand'])} if pick('plotArea', r['areaLand']) else {}),
            'price': r['price'],
            'bedrooms': r['bedrooms'],
            'bathrooms': r['bathrooms'],
            'garageSpaces': r['garage'],
            'usableArea': pick('usableArea', r['areaUsable']) or None,
            'yearBuilt': r['yearBuilt'],
            'energyClass': r['energyClass'],
            'availability': 'available',
            'addedAt': f'{r["uploadMonth"]}-01' if r['uploadMonth'] else None,
            'images': images,
            'description': [clean_line(x) for x in r['descriptionPt'] if clean_line(x)],
            'features': r['featuresPt'],
            'source': r['ptUrl'] or r['enUrl'],
        }
        out.append(rec)

    slugs = [p['slug'] for p in out]
    dupes = {s for s in slugs if slugs.count(s) > 1}
    if dupes:
        raise SystemExit(f'Duplicate slugs: {dupes}')

    body = ',\n'.join('  ' + json.dumps(p, ensure_ascii=False, indent=2).replace('\n', '\n  ') for p in out)
    OUT.write_text(
        '/**\n'
        ' * IMPORTED FROM THE CURRENT SITE (jppproperties.com), generated by scripts/build-properties.py — do not edit by\n'
        ' * hand; re-run the migration instead. Text and numbers are the client\'s own (PT pages); null means the old site\n'
        ' * does not say (see migration-output/report.md, not in Git). Photos are hot-linked from the old site.\n'
        ' * TODO (client): fill the gaps listed in the report; addedAt is the month the photos were uploaded, not the real\n'
        ' * listing date. In production everything comes from Sanity.\n'
        ' */\n'
        "import type { Property } from './properties';\n\n"
        f'export const importedProperties: Property[] = [\n{body},\n];\n'
    )
    print(f'{len(out)} written to {OUT.relative_to(ROOT)}; skipped {len(skipped)}')


if __name__ == '__main__':
    main()
