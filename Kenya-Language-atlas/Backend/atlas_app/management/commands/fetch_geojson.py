from django.core.management.base import BaseCommand
import requests
import os

class Command(BaseCommand):
    help = 'Try to download a Kenya counties GeoJSON from a list of candidate URLs'

    def add_arguments(self, parser):
        parser.add_argument('--out', help='Destination path relative to Backend', default='geojson/kenya_counties_full.json')

    def handle(self, *args, **options):
        candidates = [
            'https://raw.githubusercontent.com/charleslopresto/kenya-counties/master/kenya-counties.geojson',
            'https://raw.githubusercontent.com/CodeBoyJay/Kenya-Counties-GeoJSON/master/kenya-counties.geojson',
            'https://raw.githubusercontent.com/opalwang/kenya-counties/master/kenya_counties.geojson',
        ]
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        out_path = os.path.join(base, options['out'])
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        for url in candidates:
            try:
                self.stdout.write(f'Trying {url}')
                r = requests.get(url, timeout=15)
                if r.status_code == 200 and r.headers.get('content-type','').startswith('application') or r.text.strip().startswith('{'):
                    with open(out_path, 'w', encoding='utf-8') as f:
                        f.write(r.text)
                    self.stdout.write(self.style.SUCCESS(f'Downloaded geojson to {out_path}'))
                    return
            except Exception as e:
                self.stdout.write(f'Failed {url}: {e}')
        self.stdout.write(self.style.ERROR('No candidate URL succeeded. Please provide a valid GeoJSON file.'))
