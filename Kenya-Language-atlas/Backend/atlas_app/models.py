from django.db import models


class Region(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    population = models.IntegerField(default=0)
    languages = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.CharField(max_length=100)
    family = models.CharField(max_length=100, blank=True)
    speakers = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class County(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='counties')
    name = models.CharField(max_length=120)
    population = models.IntegerField(default=0)
    polygon_geojson = models.JSONField(blank=True, null=True)
    languages = models.ManyToManyField('Language', related_name='counties', blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    history = models.TextField(blank=True)
    tribes = models.TextField(blank=True)
    language_details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.region.name})"
