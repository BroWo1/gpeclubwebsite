from . import models
from django.core.files.uploadedfile import SimpleUploadedFile

#import os

#settings.configure()

#os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GPEClubWebsite.settings")

def clearDatas():
    a = models.Project.objects.all()
    for _ in range(len(a)):
        a[0].delete()

def project_cover_path(name):
    return 'imgs/project_covers/{}'.format(name)

#---------------------------------------------
#actual code below----------------------------
#---------------------------------------------


clearDatas()

#super tic tac toe project
models.Project.objects.create(
    project_id=1,
    project_name='Super TicTacToe',
    project_url='projects/supertictactoe/',
    project_version='1.0.0',
    project_description='super tictactoe!',
    project_cover=project_cover_path('1.png'),
)
"""
#polyptoton
models.Project.objects.create(
    project_id=5,
    project_name='Polyptoton',
    project_url='projects/polyptoton/',
    project_version='1.0.0',
    project_description='by Andy Wang',
    project_cover=project_cover_path('6.png'),
)

#photo1
models.Project.objects.create(
    project_id=0,
    project_name='Photo Album 1',
    project_url='projects/photo1/',
    project_version='1.0.0',
    project_description='Miniature world',
    project_cover=project_cover_path('1.png'),
)
"""

models.Project.objects.create(
    project_id=2,
    project_name='Trigonomis',
    project_url='projects/trigonomis/',
    project_version='1.0.0',
    project_description='GPE Interactive Presents',
    project_cover=project_cover_path('3.png'),
)
"""
models.Project.objects.create(
    project_id=3,
    project_name='Invective',
    project_url='projects/invective/',
    project_version='1.0.0',
    project_description='By Will | Week 1',
    project_cover=project_cover_path('4.jpg'),
)

models.Project.objects.create(
    project_id=4,
    project_name='Isocolon',
    project_url='projects/isocolon/',
    project_version='1.0.0',
    project_description='By Will | Week 2',
    project_cover=project_cover_path('5.png'),
)
"""

models.Project.objects.create(
    project_id=0,
    project_name='Politic Quiz',
    project_url='politics/',
    project_version='1.0.0',
    project_description='Ideology Quiz from 8 values',
    project_cover=project_cover_path('7.png'),
)
models.Project.objects.create(
    project_id=3,
    project_name='AP Physics 2',
    project_url='projects/phys2/',
    project_version='1.0.0',
    project_description='AP Physics 2 review page',
    project_cover=project_cover_path('2.png'),
)
models.Project.objects.create(
    project_id=4,
    project_name='Agent GPE 2.0',
    project_url='agent/',
    project_version='1.0.0',
    project_description='An enhanced version of Agent GPE',
    project_cover=project_cover_path('2.png'),
)

"""
python manage.py shell
import gpeclub.data_initiator
quit()
"""