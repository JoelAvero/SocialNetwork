# Generated by Django 3.0.8 on 2020-09-30 00:00

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_auto_20200929_2354'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='post',
            field=models.CharField(max_length=141, validators=[django.core.validators.MaxLengthValidator(141)]),
        ),
    ]
