# Generated by Django 3.0.8 on 2020-10-20 04:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0017_auto_20201020_0401'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='image',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
