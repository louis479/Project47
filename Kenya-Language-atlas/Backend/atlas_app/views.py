import json
import os

from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

from .models import County, Language, Region


def home_view(request):
    return JsonResponse({'message': 'Kenya Language Atlas prototype is running'})


def kenya_overview(request):
    data = {
        'name': 'Kenya',
        'capital': 'Nairobi',
        'population': '55 million',
        'languages': ['Swahili', 'English', 'Kikuyu', 'Luo', 'Kalenjin'],
        'highlights': 'A multilingual country with rich regional diversity.'
    }
    return JsonResponse(data)


def region_list(request):
    regions = list(Region.objects.values('id', 'name', 'description', 'population', 'languages'))
    return JsonResponse(regions, safe=False)


def language_list(request):
    languages = list(Language.objects.values('id', 'name', 'family', 'speakers', 'description'))
    return JsonResponse(languages, safe=False)


def county_list(request):
    qs = County.objects.select_related('region').prefetch_related('languages')
    lang = request.GET.get('language')
    if lang:
        qs = qs.filter(languages__name__iexact=lang)
    out = []
    for c in qs:
        out.append({
            'id': c.id,
            'name': c.name,
            'population': c.population,
            'region': c.region.name,
            'languages': [l.name for l in c.languages.all()],
            'image_url': c.image_url,
            'history': c.history,
            'tribes': c.tribes,
            'language_details': c.language_details,
        })
    return JsonResponse(out, safe=False)


def county_detail(request, county_id):
    county = get_object_or_404(
        County.objects.select_related('region').prefetch_related('languages'),
        pk=county_id,
    )
    return JsonResponse({
        'id': county.id,
        'name': county.name,
        'population': county.population,
        'region': county.region.name,
        'languages': [language.name for language in county.languages.all()],
        'image_url': county.image_url,
        'history': county.history,
        'tribes': county.tribes,
        'language_details': county.language_details,
    }, safe=False)


@require_GET
def kenya_counties_geojson(request):
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base, 'geojson', 'kenya_counties_extended.json')
    if not os.path.exists(path):
        raise Http404('GeoJSON not found')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return JsonResponse(data, safe=False)
