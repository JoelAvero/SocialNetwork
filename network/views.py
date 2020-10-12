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

@csrf_exempt
def register(request):
    if request.method == "POST":

        data = json.loads(request.body)

        username = data.get("username","")
        email = data.get("email","")
        firstname = data.get("firstname","")
        lastname = data.get("lastname","")

        # Ensure password matches confirmation
        password = data.get("password","")
        confirmation = data.get("confirmation","")
        if password != confirmation:
            return JsonResponse({"message": "password"})

        # Attempt to create new user
        if (username and email and firstname and lastname and password) != "":
            
            try:
                user = User.objects.create_user(username, email, password)
                user.first_name = firstname
                user.last_name = lastname
                user.save()
            except IntegrityError:
                return JsonResponse({"message": "integrityerror"})

            login(request, user)
            return JsonResponse({"message": "successful"})
        else:
            
            return JsonResponse({"message": "blankfields"})
    else:
        return render(request, "network/register.html")


@csrf_exempt
def new_post(request):

    # request is POST?
    if request.method != 'POST':
        return JsonResponse({'error': 'The request must be via POST'})

    data = json.loads(request.body)
    body = data.get('body','')
    post = Post(
        post = body,
        fk_user = request.user
    )
    post.save()

    return JsonResponse({"message": "All good!."})


def get_posts(request, postedby):
    
    if postedby == "all":

        # returnar todos los posts
        postlist = []
        liketype = {}
        posts = Post.objects.all().order_by('-timestamp')
        
        for i in posts:
            
            if request.user.is_authenticated and i.thispost.filter(fk_userliked=request.user):
                
                # instance
                getlike = i.thispost.get(fk_userliked=request.user)
                if getlike.like == True:
                    liketype = {"liketype": "like"}
                elif getlike.like == False:
                    liketype = {"liketype": "dislike"}
            else:
                liketype = {"liketype": "nolike"}
            
            postlist.append([Post.serialize(i),liketype])
        
        return JsonResponse(postlist, safe=False)

    
    elif postedby == "following":
        print("entrando en following")
        # returnar los post de los usuarios que sigue
        postlist = []
        liketype = {}
        users = User.objects.all()
        
        try:
            following = Follow.objects.filter(fk_follower=request.user)
            for i in following:
                followeds = i.fk_followed.thispublisher.all()
                for j in followeds:

                    if j.thispost.filter(fk_userliked=request.user):
                        # instance
                        getlike = j.thispost.get(fk_userliked=request.user)
                        if getlike.like == True:
                            liketype = {"liketype": "like"}
                        elif getlike.like == False:
                            liketype = {"liketype": "dislike"}
                    else:
                        liketype = {"liketype": "nolike"}
                    
                    postlist.append([Post.serialize(j),liketype])

            return JsonResponse(postlist, safe=False)
        
        except:
            return HttpResponseRedirect(reverse("index"))

    else:
        if request.user.is_authenticated:
            try:
                user = User.objects.get(username = postedby)
                
                posts = user.thispublisher.all()
                postlist = []
                liketype = {}
                
                for i in posts:
                    
                    if i.thispost.filter(fk_userliked=request.user):
                        # instance
                        getlike = i.thispost.get(fk_userliked=request.user)
                        if getlike.like == True:
                            liketype = {"liketype": "like"}
                        elif getlike.like == False:
                            liketype = {"liketype": "dislike"}
                    else:
                        liketype = {"liketype": "nolike"}

                    postlist.append([Post.serialize(i),liketype])
                
                return JsonResponse(postlist, safe=False)
            
            except:
                return JsonResponse({"response": "User not found"})
        else:
            return JsonResponse({"response": "Foribbiden"})



        



def get_post(request, post_id):
    
    post = Post.objects.get(id=post_id)
    liketype = ""

    if post.thispost.filter(fk_userliked=request.user):
        # instance
        getlike = post.thispost.get(fk_userliked=request.user)
        if getlike.like == True:
            liketype = "like"
        elif getlike.like == False:
            liketype = "dislike"
    else:
        liketype = "nolike"
    

    return JsonResponse([Post.serialize(post), {"status": liketype}], safe=False)



@csrf_exempt
def new_like(request):

    # userid = request.user.id

    if request.method == 'GET':
        return HttpResponseRedirect(reverse("index"))

    data = json.loads(request.body)
    postid = int(data.get("postid", ""))
    liketype = data.get("liketype", "")
    postobj = Post.objects.get(id=postid)


    if liketype == "like":
        # existe un like de este usuario en este post?
        if Like.objects.filter(fk_post=postobj, fk_userliked=request.user):
            
            thispost = Like.objects.get(fk_post=postobj, fk_userliked=request.user)

            # existe, ¿era un like?
            if thispost.like == True:
                
                # era un like, quiere sacar el like
                thispost.delete()

                return JsonResponse({"result": "delete", "like":"like"})
            
            else:
                # era un dislike, hay que cambiar el false por true
                print('Edito')
                thispost.like = True
                thispost.save()

                return JsonResponse({"result": "change", "like":"like"})
            
        # No existia ningun like, lo creo
        else:
            print('Creando')

            like = Like(
                fk_post = Post.objects.get(id=postid),
                fk_userliked = request.user,
                like = True
            )
            like.save()

            return JsonResponse({"result": "like", "like":"like"})
    

    if liketype == "dislike":
        # existe un dislike de este usuario en este post?
        
        if Like.objects.filter(fk_post=postobj, fk_userliked=request.user):
            
            thispost = Like.objects.get(fk_post=postobj, fk_userliked=request.user)
            
            # existe, ¿era un dislike? 
            if thispost.like == False:

                # era un dislike, quiere sacar el dislike
                print('Borro')
                thispost.delete()

                return JsonResponse({"result": "delete", "like":"dislike"})
            
            else:
                # era un like, hay que cambiar el True por el False
                print('Edito')
                thispost.like = False
                thispost.save()

                return JsonResponse({"result": "change", "like":"dislike"})
            
        # No existia ningun dislike, lo creo
        else:
            print('Creando')

            like = Like(
                fk_post = Post.objects.get(id=postid),
                fk_userliked = request.user,
                like = False
            )
            like.save()

            return JsonResponse({"result": "dislike", "like":"dislike"})
    
    return HttpResponseRedirect(reverse("index"))

    

@csrf_exempt
def user_profile(request, user_name):
    
    if request.method == "POST":
        user = User.objects.filter(username=user_name)
        
        if user:
            
            this_user = User.objects.get(username=user_name)
            print(this_user)
            return JsonResponse({
                "fullname": this_user.get_full_name(),
                "username": this_user.username,
                "followers": len(this_user.thisfollowed.all()),
                "following": len(this_user.thisfollower.all())
            })
        
    return HttpResponseRedirect(reverse('index'))



'''
@csrf_exempt
def get_profile(request):

    data = json.loads(request.body)
    username = data.get('username', '')
    print(username)
    try:
        user = User.objects.get(username=username)
        posts = user.thispublisher.all()
    except:
        pass

    for i in posts:
        print(i)

    pass
'''

@csrf_exempt
def follow(request):

    if request.method == "POST":

        data = json.loads(request.body)
        follower = data.get("follower","")
        followed = data.get("followed","")

        userfollower = User.objects.get(username=follower)
        userfollowed = User.objects.get(username=followed)
        
        if str(request.user) == followed:
            return JsonResponse({"message":"sameuser"})
        
        if Follow.objects.filter(fk_follower=request.user, fk_followed=userfollowed).exists():
            Follow.objects.get(fk_follower=request.user, fk_followed=userfollowed).delete()
            return JsonResponse({"message":"delete"})
        else:
            try:
                
                userfollower = User.objects.get(username=follower)
                userfollowed = User.objects.get(username=followed)

                follow = Follow(
                    fk_followed=userfollowed,
                    fk_follower=userfollower
                    )
                follow.save()
                
                return JsonResponse({"message":"successful"})

            except:
                
                return JsonResponse({"message": "error"})


    return HttpResponseRedirect(reverse("index"))