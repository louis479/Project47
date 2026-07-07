from django.contrib import admin
from django.urls import path

from atlas_app.views import (
    county_detail,
    county_list,
    home_view,
    kenya_counties_geojson,
    kenya_overview,
    language_list,
    region_list,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('api/kenya-overview/', kenya_overview, name='kenya-overview'),
    path('api/regions/', region_list, name='regions'),
    path('api/languages/', language_list, name='languages'),
    path('api/counties/', county_list, name='counties'),
    path('api/counties/<int:county_id>/', county_detail, name='county-detail'),
    path('api/geojson/kenya_counties/', kenya_counties_geojson, name='kenya-geojson'),
]
