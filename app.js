$(function () {

  // let movies = [];
  let form = $("#movie-search");
  // let movieList = $("#movie-list");
  let movieList = document.getElementById('movie-list');
  // let gif = $('<img>')
  
  

  // Grabs user input from the form on submit and
  $("#submit").on("click", (e) => {
    e.preventDefault();
    // This line grabs the input from the textbox
    let movie = form.val().trim();
    // movie+= "movie";
    // console.log(movie);
    //url for movies
    let queryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=13a937dc";

     
    //  Creating an $.get call from youtube api
    $.get(
      "https://www.googleapis.com/youtube/v3/search", {
        part: 'snippet, id',
        q: 'movie',
        type: 'video',
        key: 'AIzaSyDrWhQOWG8TUTL1onkdl83ZQ_m8yaUk3Ug'},
        function(data) {
          // let nextPageToken = data.nextPageToken;
          // let prevPageToken = data.prevPageToken;
          console.log(data);
        
      $.each(data.items, function(i, item){
        //getting output
        // var videoId = item.id.videoId;
        let titleYoutube = item.snippet.title;
        let descriptionYoutube = item.snippet.description;
        let thumbYoutube = item.snippet.thumbnails.high.url;
        console.log(thumbYoutube);
        let videoDiv = $("<div>");
        $("<li>").append(titleYoutube);
        $("<li>").append(descriptionYoutube);
        let imgYoutube = $("<img>").attr("src", thumbYoutube);
        $("div").append(imgYoutube);
        // console.log(titleYoutube);

        //appending the items
        videoDiv.append(titleYoutube, descriptionYoutube, thumbYoutube);
        movieList.prepend(videoDiv);
        
        //storing values in Database
        // db.collection('movie-Youtube').add({
        //   titleYoutube: titleYoutube,
        //   descriptionYoutube: descriptionYoutube,
        //   thumbYoutube: thumbYoutube,
        // });
        });
      }
    )

    // Creating an AJAX call for search movie button being clicked
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      // console.log(queryURL);
      // console.log(response);

      // grabbing and storing data in vars from response:

      let title = response.Title;
      let year = response.Year;
      let runtime = response.Runtime;
      let actors = response.Actors;
      let plot = response.Plot;
      let imageUrl = response.Poster;
      let website = response.Website;


      // console.log(plot);

      //storing values in Database
      db.collection('movies').add({
        title: title,
        year: year,
        runtime: runtime,
        actors: actors,
        plot: plot,
        image: imageUrl,
        website: website
      });
      form.value = '';

    });

  })

  //renderin yourube thumbs
  // function renderYoutube(doc) {
  //   let videoDiv = $("<div>").attr('data-id', doc.id);
  //   let titleYoutube = $("<li>");
  //   let descriptionYoutube = $("<li>");
  //   let thumbYoutube = $("<img>").attr("src", doc.data().thumbYoutube);
  //   // console.log(titleYoutube);

  //   //appending the items
  //   videoDiv.append(titleYoutube, descriptionYoutube,thumbYoutube);
  //   movieList.prepend(videoDiv);
  // }
 
  //rendering movies
  function renderMovie(doc) {
    let title = $("<p class='z-depth-2'>");
    let year = $("<p>");
    let runtime = $("<p>");
    let actors = $("<p>");
    let plot = $("<p>");
    let websitePlace = $("<p>");
    let websiteLink = $("<a target='_blank'>").attr('href', doc.data().website).text(doc.data().website);
    websitePlace.append(websiteLink);
    let buttonGifs = $('<button type="button" class="btn btn - info showGifs"> Show Gifs </button>');
    let cross = $("<p>");
    let imagePlace = $("<img height='250'>");

    
    //appending all the elements
    let ulInfo = $('<div>').append(
      title.text(doc.data().title),
      year.text(doc.data().year),
      runtime.text(doc.data().runtime),
      websitePlace.append(websiteLink),
      actors.text(doc.data().actors),
      imagePlace.attr("src", doc.data().image),
      plot.text(doc.data().plot),
      
      buttonGifs.text('Show Gifs'),
      cross.html('<i class="far fa-trash-alt"></i>')
    );
    buttonGifs.attr('data-name', doc.data().title)
    let movieRow = $("<div class='row mb-2'>")
    let colOne = $('<div class="col s5">');
    let colTwo = $('<div class="col s7 second">');
    let gifDiv = $("<div>");
    
    movieRow = movieRow.attr('data-id', doc.id);
    colOne.append(ulInfo);
    colTwo.append(gifDiv);
    movieRow.append(colOne, colTwo);
    movieRow.prependTo(movieList);
    
    //showing gifs
    buttonGifs.on('click', function(event){
      event.stopPropagation();
      //url for gifs
      let movieGif = $(this).attr("data-name");
      let queryURLgifs = "http://api.giphy.com/v1/gifs/search?q=" + movieGif + "+movie&api_key=Wa2AdCO6cHGtHNULqRHDcKFm4pSgr85Q&limit=7";

      $.ajax({
        url: queryURLgifs,
        method: "GET"
      }).then(function (resp) {
        console.log(queryURLgifs);
        console.log(resp);
        for (let i = 0; i < resp.data.length; i++) {
          let imgGif = $('<img>')
          // gifDiv.addClass('carGif m-1 shadow p-3 mb-5 bg-white rounded')
          imgGif.attr('src', resp.data[i].images.preview_gif.url);
          imgGif.attr('id', resp.data[i].id);
          // imgGif.append($('<div>X</div>');
          gifDiv.append(imgGif);
        }
      })
    
    })

    // deleting data
    cross.on('click', function (e) {
      e.stopPropagation();
      // confirm('Do you want to delete this movie?');
      alert('Do you want to delete this movie?')
      let id = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
      // console.log(id);
      // console.log(db.collection('movies').doc(id));
      db.collection('movies').doc(id).delete();
      db.collection('movie-Youtube').doc(id).delete();
      // console.log(db.collection('movie-Youtube').doc(id));
    });
  }

  // real-time listener for omdb db
  db.collection('movies').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    // console.log(changes);
    changes.forEach(change => {
      // console.log(change.doc.data());
      if (change.type == 'added') {
        renderMovie(change.doc);
      } else if (change.type == 'removed') {
        //finding the div with attr
        let divRemove = movieList.querySelector('[data-id=' + change.doc.id + ']');
        // console.log(divRemove)
        movieList.removeChild(divRemove);
      }
    });
  })
  // real-time listener for youtube
  // db.collection('movie-Youtube').onSnapshot(snapshot => {
  //   let changes = snapshot.docChanges();
  //   // console.log(changes);
  //   changes.forEach(change => {
  //     // console.log(change.doc.data());
  //     if (change.type == 'added') {
  //       renderYoutube(change.doc);
  //     } else if (change.type == 'removed') {
  //       //finding the div with attr
  //       let divRemove = movieList.querySelector('[data-id=' + change.doc.id + ']');
  //       // console.log(divRemove)
  //       movieList.removeChild(divRemove);
  //     }
  //   });
  // })

  form.on('focus', function(){
    $(this).animate({
      width: '60%',
    },800)
  })
  //function to removing some particular gif
  // let gif = $('<img>')
  // gif.on('click', function(){
    
  //   for (let j=0; j<gif.length; j++) {
  //     alert('gif clicked');
  //     $(this).remove();
  //   }
    
  // })

});


