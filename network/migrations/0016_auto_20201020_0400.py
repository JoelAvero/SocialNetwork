# Generated by Django 3.0.8 on 2020-10-20 04:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0015_user_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='image',
            field=models.CharField(blank=True, default='avatar.png', max_length=200),
        ),
    ]