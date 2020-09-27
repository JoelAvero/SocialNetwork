from django.contrib import admin

from network.models import User, Post, Likes, Follow

class UserAdmin(admin.ModelAdmin):
    pass


class PostAdmin(admin.ModelAdmin):
    pass


class LikesAdmin(admin.ModelAdmin):
    pass


class FollowAdmin(admin.ModelAdmin):
    pass

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Likes)
admin.site.register(Follow)