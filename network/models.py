from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    
    post = models.TextField()
    fk_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thispublisher')
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.fk_user.username,
            "firstname": self.fk_user.first_name,
            "lastname": self.fk_user.last_name,
            "post": self.post,
            "date": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": len(self.thispost.filter(like=True)),
            "dislikes": len(self.thispost.filter(like=False)),
        }


class Follow(models.Model):
    
    fk_followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thisfollowed')
    fk_follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thisfollower')


class Like(models.Model):

    fk_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='thispost')
    fk_userliked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='thisuserliked')
    like = models.BooleanField()