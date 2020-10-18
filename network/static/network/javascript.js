
document.addEventListener('DOMContentLoaded', function() {
    const thisuser = $("#thisusernav").text()
    
    // event listener for new post
    $("#formpost").on('submit', send_post);


    // esto sirve para ir al perfil del usuario por medio de /#profile/username
    window.onhashchange = () => {
        const url = window.location.hash

        if(url.indexOf("profile/") !== -1){
            let user = url.substr(9)
            load_posts(user,1);
            get_user(user);
        };

    }


    // esto sirve para ir al perfil del usuario logueado
    $("#navuser").on("click", e => {
        
        load_posts(thisuser,1);
        get_user(thisuser)
    });


    // esto sirve para ver los posts de usuarios seguidos por el usuario logueado
    $("#navfollowing").on("click", () =>{
        
        load_posts("following",1);
    })


    //esto sirve para ir al perfil del usuario que escribio el post
    $("body").on("click","#postusername", e => {

        load_posts(e.target.title,1);
        get_user(e.target.title);
    })
    

    // para editar el post, solo lo deberia ver el creador del post
    $("body").on("click",".editbutton", e => {

        edit_post(e.target.title);

    })


/*    
    $("#postspaginator").on("click",e => {
        console.log(e.target.text);
    })
*/
    // controla el paginador, recupera el numero de pagina y lo envia a la funcion load_posts
    $("#postspaginator").on("click", "#pagelink", e => {
        e.preventDefault()
        
        load_posts(e.target.title,e.target.text)
    })


    // like
    $('body').on("click",".buttonlike", e => {
        like(e.target.id, "like");
    })
    // dislike
    $('body').on("click",".buttondislike", e => {
        like(e.target.id, "dislike");
    })


    // follow button
    $("#buttonfollow").on("click", follow)
    

    // por defecto, carga la primer pagina de todos los posts
    load_posts("all",1);
})
    




// this function sends the content of the post to the backend, where it is processed.
function send_post(e){

    e.preventDefault();
    const body = $('#bodypost')

    fetch('/post', {
        method: 'POST',
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
                break
        };
    });
}


function load_posts(requestedposts, page){

    const container = $('#allpostshere');
    const paginator = $("#postspaginator");
    
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
        console.log(posts);

        // posts[0] is the response that contains the data of the posts and likes
        posts[0].forEach(post => {

            let id = post[0].id
            let username = post[0].username
            let user = $("#thisusernav").text();
            let edit = "";

            // if the authenticated user is the creator of the post, then the edit button appears
            if(user == username){
                edit = `<button class="editbutton" title="${id}" id='buttonedit${id}'>Edit</button>`
            };

            container.append(

                `
                <div class="container-fluid border">
                                <div class="row">
                                    <div class="col-12">
                                        
                                        <div class="media">
            
                                            <div class="text-center">
                                                <div id="miniavatar" class="d-inline-flex shadow bg-white rounded-circle"></div>
                                                <p id="postname"><strong>${post[0].firstname + " " + post[0].lastname}</strong></p>
                                                <p id="postusername" title="${username}">/${username}</p>
                                            </div>
            
                                            <div id="post${id}" class="media-body border rounded">
                                                <textarea readonly class="textareapost" maxlength="141" id="textareapost${id}">${post[0].post}</textarea>
                                            </div>
                                            
                                            <div class="" id="likes">
                                                <img class="buttonlike ${post[1].liketype == 'like' ? 'buttonlikeon' : ''}" id="${id}" src="/static/network/like.png" alt="">
                                                <span id="likescounter${id}">${post[0].likes}</span>
                                                <br>
                                                <img class="buttondislike ${post[1].liketype == 'dislike' ? 'buttonlikeoff' : ''}" id="${id}" src="/static/network/dislike.png" alt="">
                                                <span id="dislikescounter${id}">${post[0].dislikes}</span>
                                                <br>
                                                <span id="spanbutton${id}">${edit}</span>
                                            </div>
            
                                        </div>
            
                                        <div class="text-right">
                                            <span>${post[0].date}</span>
                                        </div>
            
                                    </div>
                                </div>
                            </div>

                `
                )
                
        })
        
        
        // posts[1] contain information about the number of pages generated by the paginator
        for(i=1 ; i < posts[1]; i++){
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

    })
    
}


//vista
function get_user(user){

    fetch(`profile/${user}`,{
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        $("#fullnamedesc").text(data.fullname);
        $("#usernamedesc").text(data.username);
        $("#followersdesc").text(data.followers);
        $("#followingdesc").text(data.following);

    });

}


/* this function sends a post id and a value (like or dislike) and receives a response. 
if the answer is like or dislike, change the color of the image and add a like / dislike. 
if the answer is change, it changes from like to dislike, or vice versa. 
If the answer is delete, remove the color from the target and subtract a like / dislike */
function like(id, liketype) {
    
    const buttonLike = $(`#${id}.buttonlike`);
    const buttonDislike = $(`#${id}.buttondislike`);
    const likeSpan = $(`#likescounter${id}`);
    const dislikeSpan = $(`#dislikescounter${id}`);

    fetch('/newlike', {
        method: 'POST',
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

}


// vista
function follow(){

    // get data
    const follower = $("#thisusernav").text();
    const followed = $("#usernamedesc").text();

    // instance for change dinamically the number of followers
    let followers = $("#followersdesc");

    fetch("following", {
        method: "POST",
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
};



function edit_post(id){

    const post = $(`#textareapost${id}`)
    const buttoncontainer = $(`#spanbutton${id}`)

    const buttonEdit = `<button class="editbutton" title="${id}" id='buttonedit${id}'>Edit</button>`
    const buttonSave = `<button class="editbutton" title="${id}" id='buttonsave${id}'>Save</button>`

    buttoncontainer.html(buttonSave) // change edit button to the save button
    post.removeAttr("readonly") // makes the textarea editable

    const buttonsave = $(`#buttonsave${id}`) // select the recently created save button

    buttonsave.on("click", () => {
        
        fetch(`getpost/${id}`, {
            method: "PUT",
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
    
}




// Cuando el texto del post no tiene espacios, se sobrepasa del contenedor ver wordwrap

// Validar los caracteres maximos del post en el back tambien

// Intentar hackear edit posts, simular peticion PUT con el id del post

// se puede enviar posts vacios, ver eso

// editando, se puede conseguir mas de 141 caracteres

// los posts de perfil no se cargan en orden de publicacion, los de following no se