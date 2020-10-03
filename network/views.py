import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follow, Like


def index(request):    

    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
def new_post(request):

    # request is POST?
    if request.method != 'POST':
        return JsonResponse({'error': 'The request must be via POST'})

    data = json.loads(request.body)
    print(data)
    body = data.get('body','')
    post = Post(
        post = body,
        fk_user = request.user
    )
    post.save()

    return JsonResponse({"message": "All good!."})



def get_posts(request):
    postlist = []
    posts = Post.objects.all().order_by('-timestamp')
    for i in posts:
        postlist.append(Post.serialize(i))
        
    return JsonResponse(postlist, safe=False)



def get_post(request, post_id):
    
    post = Post.objects.get(id=post_id)
    return JsonResponse(Post.serialize(post), safe=False)



@csrf_exempt
def new_like(request):

    # userid = request.user.id

    if request.method == 'GET':
        return HttpResponseRedirect(reverse("index"))

    data = json.loads(request.body)
    postid = data.get("postid", "")
    liketype = data.get("liketype", "")
    postobj = Post.objects.get(id=postid)

    if liketype == "like":
        # existe un like de este usuario en este post?
        if Like.objects.filter(fk_post=postobj, fk_userliked=request.user):
            print('instancio')
            thispost = Like.objects.get(fk_userliked=request.user)
            # existe, ¿era un like?
            if thispost.like == True:
                
                # era un like, quiere sacar el like
                print('Borro')
                thispost.delete()
            
            else:
                # era un dislike, hay que cambiar el false por true
                print('Edito')
                thispost.like = True
                thispost.save()
            
        # No existia ningun like, lo creo
        else:
            print('Creando')

            like = Like(
                fk_post = Post.objects.get(id=postid),
                fk_userliked = request.user,
                like = True
            )
            like.save()


    if liketype == "dislike":
        # existe un dislike de este usuario en este post?
        if Like.objects.filter(fk_post=postobj, fk_userliked=request.user):
            print('instancio')
            thispost = Like.objects.get(fk_userliked=request.user)

            # existe, ¿era un dislike?
            if thispost.like == False:
                
                # era un dislike, quiere sacar el dislike
                print('Borro')
                thispost.delete()
            
            else:
                # era un like, hay que cambiar el True por el False
                print('Edito')
                thispost.like = False
                thispost.save()
            
        # No existia ningun like, lo creo
        else:
            print('Creando')

            like = Like(
                fk_post = Post.objects.get(id=postid),
                fk_userliked = request.user,
                like = False
            )
            like.save()
    
    return HttpResponseRedirect(reverse("index"))

    