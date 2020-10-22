import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

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

        # get data
        data = json.loads(request.body)
        username = data.get("username","")
        email = data.get("email","")
        firstname = data.get("firstname","")
        lastname = data.get("lastname","")
        image = data.get("image","")

        # si no hay imagen, setear la imagen por default
        if image == "":
            image = "/static/network/avatar.png"

        # Ensure password matches confirmation
        password = data.get("password","")
        confirmation = data.get("confirmation","")
        if password != confirmation:
            return JsonResponse({"message": "password"})

        # Attempt to create new user
        if (username and email and firstname and lastname and password) != "":
            
            try:
                user = User.objects.create_user(username, email, password)
                user.image = image
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


#vista
@csrf_exempt
def new_post(request):

    # request is POST?
    if request.method != 'POST':
        return JsonResponse({'error': 'The request must be via POST'})

    # get data
    if request.user.is_authenticated:
        data = json.loads(request.body)
        body = data.get('body','')
        
        # a simple check, just in case if someone tries to modify the value of the form
        if len(body) > 141:
            return JsonResponse({"message": "toolong"})
        elif len(body) < 1:
            return JsonResponse({"message": "tooshort"})
        else:
            post = Post(
                post = body,
                fk_user = request.user
            )
            post.save()

        return JsonResponse({"message": "success"})
    else:
        return JsonResponse({"message": "forbidden"})



def get_posts(request, postedby, page):

    '''
    This function takes two arguments, "postedby" which can be: all, following, or a username.
    And "page" which is an integer that determines what page number (of the paginator) is requested.
    For each case, a "posts" variable is generated that contains the filtered information.
    Then, through a for loop, a list (postlist) is created where for each post information on existing 
    likes is added, this serves to present the likes as active (like or dislike) or inactive (black color)
    '''

    postlist = []
    posts =[]
    NUMBERPOSTSPERPAGE = 2

    # if "postedby" is "all", then show all the posts
    if postedby == "all":
        posts = Post.objects.all().order_by('-timestamp')
        
    # if "postedby" is "following", then show all the posts of the users that are followed by the user who made the request
    elif postedby == "following":
        if request.user.is_authenticated:

            following = Follow.objects.filter(fk_follower=request.user)
            for i in following:
                posts += i.fk_followed.thispublisher.all().order_by('-timestamp')
        else:
            return HttpResponseRedirect(reverse("index"))

    # any other word in "postedby" will be evaluated as if posts were requested from a specific user
    else:
        if request.user.is_authenticated:
            try:
                user = User.objects.get(username = postedby)
                posts = user.thispublisher.all().order_by("-timestamp")
                
            except:
                return JsonResponse({"response": "User not found"})
        else:
            return JsonResponse({"response": "Foribbiden"})

    # for each post in posts, add information about likes, dislikes or none
    for i in posts:
        try:
            getlike = i.thispost.get(fk_userliked=request.user)
            if getlike.like == True:
                liketype = {"liketype": "like"}
            elif getlike.like == False:
                liketype = {"liketype": "dislike"}
        except:
            liketype = {"liketype": "nolike"}

        postlist.append([Post.serialize(i),liketype])

    paginatedposts = Paginator(postlist,NUMBERPOSTSPERPAGE) #configuring the paginator
    ppost = paginatedposts.page(page).object_list # get posts for the required page number
    numpages = paginatedposts.num_pages # send the number of pages to generate the paginator dynamically
    response = [ppost, numpages]

    return JsonResponse(response, safe=False)



@csrf_exempt
def get_post(request, post_id):

    '''
    if the request is GET, it returns a json object with the data of the requested
    post according to its id.
    if the request is PUT, it is because the user is trying to edit the post, 
    receives the new text and updates the database
    '''
    
    # instance post by id
    try:
        post = Post.objects.get(id=post_id)
    except:
        print("Error when trying instancing object post")
    
    liketype = ""
    
    # if the user is editing the post, he receives the value of the post and updates it
    if request.method == "PUT":
        if request.user.username == post.fk_user.username:
            print("adentro de user")
            # get data
            data = json.loads(request.body)
            textpost = data.get("post", "") # get the new text

            if len(textpost) > 141:
                return JsonResponse({"message": "toolong"})
            elif len(textpost) < 1:
                return JsonResponse({"message": "tooshort"})
            else:
                post.post = textpost
                post.save()
                return JsonResponse({"message": "success"})
        else:
            return JsonResponse({"message": "forbidden"})

    try:
        getlike = post.thispost.get(fk_userliked=request.user)
        if getlike.like == True:
            liketype = "like"
        elif getlike.like == False:
            liketype = "dislike"
    except:
        liketype = "nolike"
    
    return JsonResponse([Post.serialize(post), {"status": liketype}], safe=False)


#vista
@csrf_exempt
def new_like(request):

    if request.method == 'POST':
        
        # get data
        data = json.loads(request.body)
        postid = int(data.get("postid", ""))
        liketype = data.get("liketype", "")

        # instance post by id
        try:
            postobj = Post.objects.get(id=postid)
        except:
            print("Error when trying instancing object post")

        if liketype == "like":
                
            try:
                thispost = Like.objects.get(fk_post=postobj, fk_userliked=request.user)

                # if there is a like of this user in the post, it can only be like or dislike
                # if it is like, then delete it, if is dislike then change it to like
                if thispost.like == True:
                    thispost.delete()
                    return JsonResponse({"result": "delete", "like":"like"})
                
                else:
                    thispost.like = True
                    thispost.save()
                    return JsonResponse({"result": "change", "like":"like"})

                # if there is no user like in this post, then one is created
            except:
                like = Like(
                    fk_post = Post.objects.get(id=postid),
                    fk_userliked = request.user,
                    like = True
                )
                like.save()
                return JsonResponse({"result": "like", "like":"like"})

        if liketype == "dislike":
            try:
                thispost = Like.objects.get(fk_post=postobj, fk_userliked=request.user)
                
                # if there is a like of this user in the post, it can only be like or dislike
                # if it is dislike, then delete it, if is like then change it to dislike
                if thispost.like == False:
                    thispost.delete()
                    return JsonResponse({"result": "delete", "like":"dislike"})
                
                else:
                    thispost.like = False
                    thispost.save()
                    return JsonResponse({"result": "change", "like":"dislike"})
                
            # if there is no user dislike in this post, then one is created
            except:
                like = Like(
                    fk_post = Post.objects.get(id=postid),
                    fk_userliked = request.user,
                    like = False
                )
                like.save()
                return JsonResponse({"result": "dislike", "like":"dislike"})

    return HttpResponseRedirect(reverse("index"))

#vista, aca hay que ver para que con get se pueda entrar al perfil
@csrf_exempt
def user_profile(request, user_name):
    
    if request.method == "POST":
        # if requested user exists
        try:
            this_user = User.objects.get(username=user_name)
            print(this_user)
            if Follow.objects.filter(fk_followed=this_user, fk_follower=request.user):
                followstatus="follow"
            else:
                followstatus="nofollow"

            return JsonResponse({
                "fullname": this_user.get_full_name(),
                "username": this_user.username,
                "followers": len(this_user.thisfollowed.all()),
                "following": len(this_user.thisfollower.all()),
                "avatar": this_user.image,
                "currentuser": request.user.username,
                "followstatus": followstatus
            })
        # if requested user doesn't exists
        except:
            return HttpResponseRedirect(reverse('index'))
            
    return JsonResponse({})


#vista
@csrf_exempt
def follow(request):

    if request.method == "POST":
        
        # getting user follower and user followed
        data = json.loads(request.body)
        follower = data.get("follower","")
        followed = data.get("followed","")

        # instance
        try:
            userfollower = User.objects.get(username=follower)
            userfollowed = User.objects.get(username=followed)
        except:
            return JsonResponse({"message":"error"})
        
        # is this user trying to follow himself?
        if str(request.user) == followed:
            return JsonResponse({"message":"sameuser"})
        
        # check that the user is already following this person, if it exists, send the signal to delete it
        if Follow.objects.filter(fk_follower=request.user, fk_followed=userfollowed).exists():
            Follow.objects.get(fk_follower=request.user, fk_followed=userfollowed).delete()
            return JsonResponse({"message":"delete"})

        # if this user is not already following this person, create the follow entry
        else:
            follow = Follow(
                fk_followed=userfollowed,
                fk_follower=userfollower
                )
            follow.save()
            
            return JsonResponse({"message":"successful"})

    return HttpResponseRedirect(reverse("index"))
