from django.urls import path

from . import views
from . import search

urlpatterns = ([
    path('', views.index, name="index"),
    path('old/', views.old, name="old"),
    path('projects/search/', search.search_project_by_name,name = 'search'),
    path('header/', views.header, name="header"),
    path('projects/supertictactoe/', views.supertictactoe, name="supertictactoe"),
    path('projects/polyptoton/', views.polyptoton, name="polyptoton"),
    path('projects/photo1/', views.photo1, name="photo1"),
    path('projects/trigonomis/', views.trigonomis, name="trigonomis"),
    path('projects/invective/', views.invective, name="invective"),
    path('projects/isocolon/', views.isocolon, name="isocolon"),
    path('about/', views.about, name="about"),
    #path('vocab/', views.vocab, name="vocab"),
    path('projects/school/', views.school, name="school"),
    path('projects/powerschool/', views.powerschool, name="powerschool"),
    path('projects/run_crawltest/', views.run_crawltest, name="run_crawltest"),
    path('politics/', views.politics, name="politics"),
    path('politics/instructions/', views.instructions, name="instructions"),
    path('politics/quiz/', views.quiz, name="quiz"),
    path('politics/results/', views.results, name="results"),
    path('final_data.json', views.final_data, name='final_data'),
    path('projects/phys2/', views.phys2, name='phys2'),
    path('projects/phys2/unit2/', views.phys2u2, name='phys2u2'),
    path('vocab/list', views.vocabList, name='vocabList'),
    path('vocab/ai/<str:set_name>/', views.ai, name='ai'),
    path('vocab/mcq/<str:set_name>/', views.mcq, name='mcq'),
    path('privacy/', views.privacy, name='privacy'),
path('magazine/pdf/<str:magazine_id>/', views.magazine_pdf, name='magazine_pdf'),
path('magazine/read/<str:magazine_id>/', views.magazine_reader, name='magazine_reader'),

    path('api/get-openai-response/', views.get_openai_response, name='get_openai_response'),

   path('vocab/sets/<str:set_name>/', views.vocabSet, name='vocabSet'),
       path('projects/vocab/sets_data/<str:set_name>/', views.vocab_set_data, name='vocabSetData'),
           ]

#+ list(map(lambda name: path('projects/vocab/sets_data/{}'.format(name), views.vocab_data_response_generator(name), name='vocab_set_data_{}'.format(name)),
 #map(lambda i: 'set{}'.format(i),range(1,33+1))
 #))

)