document.addEventListener('DOMContentLoaded', function() {
    
    // event listener for new post
    $("#formpost").on('submit', send_post)


    // user logged profile
    $("#navuser").on("click", e => {
        const thisuser = $("#thisusernav").text()
        load_posts(thisuser,1);
        get_user(thisuser)
    });


    // following
    $("#navfollowing").on("click", () =>{
        
        load_posts("following",1);
    })


    // post creator profile
    $("body").on("click","#postusername", e => {
        load_posts(e.target.title,1);
        get_user(e.target.title);
    });
    $("body").on("click",".miniavatar", e => {
        load_posts(e.target.title,1);
        get_user(e.target.title);
    });
    $("body").on("click","#postname", e => {
        load_posts(e.target.title,1);
        get_user(e.target.title);
    });


    // edit post 
    $("body").on("click",".editbutton", e => {
        edit_post(e.target.title);
    });


    // paginator
    $("#postspaginator").on("click", "#pagelink", e => {
        e.preventDefault()
        load_posts(e.target.title,e.target.text)
    });


    // like
    $('body').on("click",".buttonlike", e => {
        like(e.target.id, "like");
    });
    // dislike
    $('body').on("click",".buttondislike", e => {
        like(e.target.id, "dislike");
    });


    // follow
    $("body").on("click", "#buttonfollow", () =>{
        
        follow();
    })


    // only for superusers 
    $("#createuser").on("click", createuser);
    $("#createposts").on("click", createposts);


    // by default load the first page of all post
    load_posts("all",1);
});


// this serves to capture the csrf token (taken from Django documentation)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};


// this function sends the content of the post to the backend, where it is processed.
function send_post(e){

    e.preventDefault();
    const body = $('#bodypost');
    const csrftoken = getCookie('csrftoken');

    fetch('/post', {
        method: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            body: body.val(),
        })
    })
    .then(response => response.json())
    .then(data => {
        switch(data.message){
            
            case "toolong":
                if(!$("#mssg").length){
                    body.before("<span id='mssg'>You cannot exceed 141 characters</span>");
                };
                break
            
            case "tooshort":
                if(!$("#mssg").length){
                    body.before("<span id='mssg'>You cannot publish an empty post</span>");
                };
                break

            case "success":
                $('#bodypost').val('');
                if($("#mssg")){
                    $("#mssg").remove()
                };
                load_posts("all",1);
                break
        };
    });
    
};



function load_posts(requestedposts, page){

    const container = $('#allpostshere');
    const paginator = $("#postspaginator");
    
    container.css("display","none");
    // clear the information every time the function is called
    paginator.text("");
    container.text("");

    // check the requestedpost to show or hide the relevant content
    if(requestedposts == "all" || requestedposts == "following"){
        document.querySelector("#formlayer").style.display = "block";
        document.querySelector("#profilelayer").style.display = "none";
    } else {
        document.querySelector("#profilelayer").style.display = "block";
        document.querySelector("#formlayer").style.display = "none";
    }

    fetch(`getposts/${requestedposts}/${page}`)
    .then(response => response.json())
    .then(posts => {

        // posts[0] is the response that contains the data of the posts and likes
        posts[0].forEach(post => {

            let id = post[0].id
            let username = post[0].username
            let avatar = post[0].avatar
            let user = $("#thisusernav").text();
            let edit = "";
            

            // if the authenticated user is the creator of the post, then the edit button appears
            if(user == username){
                edit = `<button class="btn btn-primary editbutton" title="${id}" id='buttonedit${id}'>Edit</button>`
            };

            container.append(
                `
                <div class="row justify-content-center" >
                    <div class="col-6 border shadow rounded supercontainer">
                            
                        <div class="media">

                            <div class="text-center postcontainer1">
                                <div id="miniavatar${id}" title="${username}" style="background-image: url('${post[0].avatar}');" class="d-inline-flex shadow bg-white rounded-circle miniavatar"></div>
                                <p id="postname" title="${username}">${post[0].firstname + " " + post[0].lastname}</p>
                                <p id="postusername" title="${username}">/${username}</p>
                            </div>

                            <div id="post${id}" class="media-body border rounded postcontainer2">
                                <textarea readonly class="textareapost" maxlength="141" id="textareapost${id}">${post[0].post}</textarea>
                            </div>
                            
                            <div class="postcontainer3 align-self-center" id="likes">
                                <img class="buttonlike ${post[1].liketype == 'like' ? 'buttonlikeon' : ''}" id="${id}" src="/static/network/like.png" alt="">
                                <span id="likescounter${id}">${post[0].likes}</span>
                                <br>
                                <img class="buttondislike ${post[1].liketype == 'dislike' ? 'buttonlikeoff' : ''}" id="${id}" src="/static/network/dislike.png" alt="">
                                <span id="dislikescounter${id}">${post[0].dislikes}</span>
                                <br>
                                <span id="spanbutton${id}">${edit}</span>
                            </div>
                            
                        </div>

                        <div class="text-right date">
                            <span id="date">${post[0].date}</span>
                        </div>

                    </div>
                </div>
                `
                )
                // if avatar exists, set it
                if(avatar.length > 0){
                    $(`#miniavatar${id}`).css("backgroundImage",`url(${avatar})`);
                }
        })
        
        
        // posts[1] contain information about the number of pages generated by the paginator
        for(i=1 ; i <= posts[1]; i++){
            if(page == i){
                paginator.append(
                    `
                    <li class="page-item active"><a class="page-link" title="${requestedposts}" id="pagelink" href="#">${i}</a></li>
                    `
                )
            } else {
                paginator.append(
                    `
                    <li class="page-item"><a class="page-link" title="${requestedposts}" id="pagelink" href="#">${i}</a></li>
                    `
                )
            };
            
        };
        if(posts[1] == 1){
            $("#paginatorhere").css("display", "none")
        } else {
            $("#paginatorhere").css("display", "block")
        };

    });
    container.fadeIn(2000)
};



function get_user(user){

    const buttonfollow = $("#buttonfollow");
    const buttonfollowspan = $("#buttonfollowspan")
    const $follow = `<button class="btn btn-primary" id="buttonfollow">Follow</button>`;
    const $following = `<button class="btn btn-success" id="buttonfollow">Following</button>`;
    

    fetch(`profile/${user}`)
    .then(response => response.json())
    .then(data => {
        $("#fullnamedesc").text(data.fullname);
        $("#usernamedesc").text(data.username);
        $("#followersdesc").text(data.followers);
        $("#followingdesc").text(data.following);
        $("#avatarprofile").css("backgroundImage",`url(${data.avatar})`);

        if(data.followstatus == "follow"){
            buttonfollowspan.html($following);
        } else {
            buttonfollowspan.html($follow);
        };

        if(data.currentuser == data.username){
            buttonfollowspan.css("display","none");
        } else {
            buttonfollowspan.css("display","block");
        };

        
    });
    

};


/* this function sends a post id and a value (like or dislike) and receives a response. 
if the answer is like or dislike, change the color of the image and add a like / dislike. 
if the answer is change, it changes from like to dislike, or vice versa. 
If the answer is delete, remove the color from the target and subtract a like / dislike */
function like(id, liketype) {
    
    const buttonLike = $(`#${id}.buttonlike`);
    const buttonDislike = $(`#${id}.buttondislike`);
    const likeSpan = $(`#likescounter${id}`);
    const dislikeSpan = $(`#dislikescounter${id}`);
    const csrftoken = getCookie('csrftoken');

    fetch('/newlike', {
        method: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            postid: id,
            liketype: liketype
        })
    })
    .then(result => result.json())
    .then(data => {

        if (data.like == "like"){

            switch(data.result){

                case "change":
                    buttonDislike.removeClass("buttonlikeoff");
                    buttonLike.addClass("buttonlikeon");
                    dislikeSpan.text(`${Number($(`#dislikescounter${id}`).text()) - 1}`);
                    likeSpan.text(`${Number($(`#likescounter${id}`).text()) + 1}`);
                    break

                case "like":
                    buttonLike.addClass("buttonlikeon");
                    likeSpan.text(`${Number($(`#likescounter${id}`).text()) + 1}`);
                    break
                
                case "delete":
                    buttonLike.removeClass("buttonlikeon");
                    likeSpan.text(`${Number($(`#likescounter${id}`).text()) - 1}`);
                    break
            }; 
            } else {
            
            switch(data.result){

                case "change":
                    buttonLike.removeClass("buttonlikeon");
                    buttonDislike.addClass("buttonlikeoff");
                    likeSpan.text(`${Number($(`#likescounter${id}`).text()) - 1}`);
                    dislikeSpan.text(`${Number($(`#dislikescounter${id}`).text()) + 1}`);
                    break

                case "dislike":
                    buttonDislike.addClass("buttonlikeoff");
                    dislikeSpan.text(`${Number($(`#dislikescounter${id}`).text()) + 1}`);
                    break
                
                case "delete":
                    buttonDislike.removeClass("buttonlikeoff");
                    dislikeSpan.text(`${Number($(`#dislikescounter${id}`).text()) - 1}`);
                    break
            };
        };
    });

};



function follow(){

    const buttonfollow = $("#buttonfollow");
    const buttonfollowspan = $("#buttonfollowspan");
    
    // get data
    const follower = $("#thisusernav").text();
    const followed = $("#usernamedesc").text();
    const csrftoken = getCookie('csrftoken');

    // instance for change dinamically the number of followers
    let followers = $("#followersdesc");
    
    fetch("following", {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            follower: follower,
            followed: followed
        })
    })
    .then(response => response.json())
    .then(data => {
        
        // process the response
        switch(data.message){
            case "sameuser":
                break

            case "delete":
                followers.text(`${Number(followers.text()) - 1}`);
                break

            case "successful":
                followers.text(`${Number(followers.text()) + 1}`);
                
                break
            
            case "error":
                console.log("error when trying to instantiate users");
        };
    });
    if(buttonfollow.text() == "Follow"){
        buttonfollowspan.html(`<button class="btn btn-success" id="buttonfollow">Following</button>`);
    } else {
        buttonfollowspan.html(`<button class="btn btn-primary" id="buttonfollow">Follow</button>`);  
    };
};



function edit_post(id){

    const post = $(`#textareapost${id}`);
    const buttoncontainer = $(`#spanbutton${id}`);
    const csrftoken = getCookie('csrftoken');

    const buttonEdit = `<button class="btn btn-primary editbutton" title="${id}" id='buttonedit${id}'>Edit</button>`
    const buttonSave = `<button class="btn btn-primary editbutton" title="${id}" id='buttonsave${id}'>Save</button>`

    buttoncontainer.html(buttonSave) // change edit button to the save button
    post.removeAttr("readonly") // makes the textarea editable

    const buttonsave = $(`#buttonsave${id}`) // select the recently created save button

    buttonsave.on("click", () => {
        
        fetch(`getpost/${id}`, {
            method: "PUT",
            headers: { "X-CSRFToken": csrftoken },
            body: JSON.stringify({
                post: post.val()
            })
        })
        .then(response => response.json())
        .then(data => {

            switch(data.message){

                case "toolong":
                    if(!$("#msg").length){
                        post.before("<span id='msg'>You cannot exceed 141 characters</span>");
                    };
                    break
                
                case "tooshort":
                    if(!$("#msg").length){
                        post.before("<span id='msg'>You cannot publish an empty post</span>");
                    };
                    break

                case "success":
                    post.attr("readonly", true);  // makes the textarea non editable again    
                    buttoncontainer.html(buttonEdit); // change save button for edit button again
                    if($("#msg")){
                        $("#msg").remove()
                    };
                    break
            };
        });
    });
    
};




// these two functions are for testing purposes only
// each time the "create user" button is pressed (only for super users) a random user is created
function createuser(){

    const csrftoken = getCookie('csrftoken');
    
    fetch("https://randomuser.me/api/")
    .then(resp => resp.json())
    .then(data => {
        
        fetch("/createuser", {
            method: "POST",
            headers: { "X-CSRFToken": csrftoken },
            body: JSON.stringify({
                firstname: data.results[0].name.first,
                lastname: data.results[0].name.last, 
                username: data.results[0].login.username,
                email: data.results[0].email,
                password: data.results[0].login.password,
                confirmation: data.results[0].login.password,
                image: data.results[0].picture.medium
            })
        })
    })
};

// each time the "create posts" button is pressed, 100 posts are created with the word "TEST" from random users
function createposts(){

    const csrftoken = getCookie('csrftoken');

    fetch('/createposts', {
        method: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            body: "TEST",
        })
    })


};