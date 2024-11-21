# Generated by Django 5.1.3 on 2024-11-21 06:23

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gpeclub", "0003_alter_project_project_cover"),
    ]

    operations = [
        migrations.CreateModel(
            name="psl",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("courses", models.CharField(max_length=256)),
            ],
        ),
        migrations.AlterField(
            model_name="project",
            name="project_cover",
            field=models.CharField(default="imgs/logo.png", max_length=256),
        ),
    ]
