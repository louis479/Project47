from django.core.management.base import BaseCommand
from atlas_app.models import County
import json, os

class Command(BaseCommand):
    help = 'Import counties geometry from geojson file and attach to County records by name'

    def add_arguments(self, parser):
        parser.add_argument('--file', help='Path to geojson file', default='geojson/kenya_counties_sample.json')

    def handle(self, *args, **options):
        # compute repository base (up four levels from this file -> Backend folder)
        base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        path = os.path.join(base, options['file'])
        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR(f'File not found: {path}'))
            return
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        features = data.get('features', [])
        updated = 0
        for feat in features:
            props = feat.get('properties', {})
            name = props.get('name')
            if not name:
                continue
            try:
                county = County.objects.get(name__iexact=name)
            except County.DoesNotExist:
                self.stdout.write(f'No county match for {name}')
                continue
            county.polygon_geojson = feat.get('geometry')
            county.save()
            updated += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated} counties'))
