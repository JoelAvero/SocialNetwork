from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API
    path("profile/<str:user_name>", views.user_profile, name="profile"),
    path("following", views.follow, name="follow"),
    path("post", views.new_post, name="post"),
    path("getposts/<str:postedby>/<int:page>", views.get_posts, name="getposts"),
    path("getpost/<int:post_id>", views.get_post, name="getpost"),
    path("newlike", views.new_like, name="newlike"),

    # TEST
    path("createuser", views.create_user, name="createuser"),
    path("createposts", views.create_posts, name="createposts")
]
