from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    
    post = models.TextField(max_length=141)
    fk_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thispublisher')
    timestamp = models.DateTimeField(auto_now_add=True)


class Follow(models.Model):
    
    fk_followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thisfollowed')
    fk_follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thisfollower')


class Likes(models.Model):

    fk_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='thispost')
    fk_userliked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thisuserliked')