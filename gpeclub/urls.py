from django.urls import path

from . import views
from . import search

urlpatterns = [
    path('', views.index, name="index"),
    path('projects/search/', search.search_project_by_name,name = 'search'),
    path('header/', views.header, name="header"),
    path('projects/supertictactoe/', views.supertictactoe, name="supertictactoe"),
    path('projects/photo1/', views.photo1, name="photo1"),
    path('projects/trigonomis/', views.trigonomis, name="trigonomis"),
    path('projects/invective/', views.invective, name="invective"),

    path('projects/about/', views.about, name="about"),
    path('projects/school/', views.school, name="school"),
    path('projects/powerschool/', views.powerschool, name="powerschool"),
    path('run_crawltest/', views.run_crawltest, name="run_crawltest"),
]
