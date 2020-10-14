
document.addEventListener('DOMContentLoaded', function() {
    const thisuser = $("#thisusernav").text()
    
    $("#navuser").on("click", e => {
        console.log(e.data);
        load_posts(thisuser);
        get_user(thisuser)
    });

    $("#navfollowing").on("click", e =>{
        e.preventDefault();
        load_posts("following",1)
    })

    $("#formpost").on('submit', send_post);


    $("body").on("click","#postusername", e => {
        
        load_posts(e.target.title,1);
        get_user(e.target.title);
    })
    


    $("body").on("click",".editbutton", e => {

        edit_post(e.target.title);

    })



    $("#postspaginator").on("click",e => {
        console.log(e.target.text);
    })


    $("#postspaginator").on("click", "#pagelink", e => {
        e.preventDefault()
        
        load_posts("all",e.target.text)
    })


    $('body').on("click",".buttonlike", function(e) {
        like(e.target.id, "like");
    })
    
    $('body').on("click",".buttondislike", function(e) {
        like(e.target.id, "dislike");
    })


    $("#buttonfollow").on("click", follow)


    load_posts("all",1);
})
    


function send_post(e){

    e.preventDefault()
    const body = $('#bodypost').val();
    let body2 = body.length

    if(body.length > 141){
        console.log("manejar este error");
        return false
    };

    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
            body: body,
        })
    })
    .then(response => response.json())
    .then(data => {

    })
    .catch(err => {

    });

    $('#bodypost').val('');
    
}


function load_posts(requestedposts, page){

    const container = $('#allpostshere');
    const paginator = $("#postspaginator");
    paginator.text("")

    container.text("");

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
        posts[0].forEach(post => {
            
            let user = $("#thisusernav").text();
            let edit = "";

            if(user == post[0].username){
                edit = `<button class="editbutton" title="${post[0].id}" id='buttonedit${post[0].id}' title='${post[0].username}'>Edit</button>`
            };


            let status

            switch(post[1].liketype){

                case "like":
                    status = "buttonlikeon"
                    break

                case "dislike":
                    status = "buttonlikeoff"
                    break

                case "nolike":
                    status = ""
                    break
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
                                                <p id="postusername" title="${post[0].username}">/${post[0].username}</p>
                                                
                                            </div>
            
                                                <div id="post${post[0].id}" class="media-body border rounded">
                                                    <textarea readonly title="${post[0].id}" class="textareapost" id="textareapost${post[0].id}">${post[0].post}</textarea>
                                                    
                                                </div>
                                                
                                                <div class="" id="likes">
                                                    <img class="buttonlike ${status == "buttonlikeon" ? status : ''}" id="${post[0].id}" src="/static/network/like.png" alt="">
                                                    <span id="likescounter${post[0].id}">${post[0].likes}</span>
                                                    <br>
                                                    <img class="buttondislike ${status == "buttonlikeoff" ? status : '' }" id="${post[0].id}" src="/static/network/dislike.png" alt="">
                                                    <span id="dislikescounter${post[0].id}">${post[0].dislikes}</span>
                                                    <br>
                                                    <span id="spanbutton${post[0].id}">${edit}</span>
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
        
        

        for(i=1 ; i <= posts[1]; i++){
            if(page == i){
                paginator.append(
                    `
                    <li class="page-item active"><a class="page-link" id="pagelink" href="#">${i}</a></li>
                    `
                )
            } else {
                paginator.append(
                    `
                    <li class="page-item"><a class="page-link" id="pagelink" href="#">${i}</a></li>
                    `
                )
            }
            
        };

    })
    
}


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

    })

}


function like(id, liketype) {
    

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

            let boton = $(`#${id}.buttonlike`);
            let boton2 = $(`#${id}.buttondislike`);
            let likespan = $(`#likescounter${id}`);
            let dislikespan = $(`#dislikescounter${id}`);
            
            
            switch(data.result){

                case "change":
                    boton2.removeClass("buttonlikeoff");
                    boton.addClass("buttonlikeon");
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) - 1}`)
                    likespan.text(`${Number($(`#likescounter${id}`).text()) + 1}`)
                    
                    break

                case "like":
                    boton.addClass("buttonlikeon");
                    likespan.text(`${Number($(`#likescounter${id}`).text()) + 1}`)
                    break
                
                case "delete":
                    boton.removeClass("buttonlikeon");
                    likespan.text(`${Number($(`#likescounter${id}`).text()) - 1}`);
                    break
            };


        } else {
            let boton2 = $(`#${id}.buttonlike`);
            let boton = $(`#${id}.buttondislike`);
            let likespan = $(`#likescounter${id}`);
            let dislikespan = $(`#dislikescounter${id}`);
            switch(data.result){

                case "change":
                    boton2.removeClass("buttonlikeon");
                    boton.addClass("buttonlikeoff");
                    likespan.text(`${Number($(`#likescounter${id}`).text()) - 1}`);
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) + 1}`);
                    break

                case "dislike":
                    boton.addClass("buttonlikeoff");
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) + 1}`);
                    break
                
                case "delete":
                    boton.removeClass("buttonlikeoff");
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) - 1}`);
                    break
            }
        }

    })

}



function follow(){

    const follower = $("#thisusernav").text();
    const followed = $("#usernamedesc").text();

    fetch("follow", {
        method: "POST",
        body: JSON.stringify({
            follower: follower,
            followed: followed
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let followers = $("#followersdesc")
        let following = $("#followingdesc")
        let buttonfollow = $("buttonfollow")


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
                console.log("an error ocurred");
                break

        }

    })

}



function edit_post(id){

    const post = $(`#textareapost${id}`)
    const buttoncontainer = $(`#spanbutton${id}`)
    const button = $(`#buttonedit${id}`)

    buttoncontainer.html(`<button class="editbutton" title="${id}" id='buttonsave${id}'>Save</button>`)
    post.removeAttr("readonly")

    const buttonsave = $(`#buttonsave${id}`)

    buttonsave.on("click", () => {
        
        fetch(`getpost/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                post: post.val()
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            post.attr("readonly", true);
            button.text("Edit");
            post.text(data.text);
            buttoncontainer.html(button)
        });

        
    })
    
}




// Cuando el texto del post no tiene espacios, se sobrepasa del contenedor ver wordwrap

// Validar los caracteres maximos del post en el back tambien

// Intentar hackear edit posts, simular peticion PUT con el id del post


// ya funciona el paginador, hay que poner el control en el html y crear una funcion nueva en js que llame

// la idea es crear el paginador dinamicamente de acuerdo al numero de posts disponibles