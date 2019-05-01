$(function () {

  let form = $("#movie-search");
  // let movieList = $("#movie-list");
  let movieList = document.getElementById('movie-list');
  let movieListAll = document.getElementById('allmovie-list');


  // ALL MOVIES ON SUBMIT
  // ON SUBMIT BUTTON ALL MOVIES
  $("#submitAll").on('click', function (e) {
    let searchText = form.val().trim();
    e.preventDefault();
    $("#allmovie-list").css('height', '500px');
    $("#allmovie-list").css('overflow', 'auto');
    $('#all-movies-row').css('display', 'block');
    $('.jumbotron').hide(400);
    let getUrl = "https://www.omdbapi.com/?s=" + searchText + "&apikey=13a937dc&type=movie"
    // let getUrl = "https://api.themoviedb.org/3/search/movie?api_key=ac20e07e841e7f69b85379e4ef17ab6e&include_adult=false&language=en-US&query="+searchText;
    // Creating an AJAX call for search movie button being clicked
    $.ajax({
      url: getUrl,
      method: "GET"
    }).then(function (response) {
      console.log(response);
      console.log(getUrl);
      let movies = response.Search;
      console.log(movies);
      let output = '';
      $.each(movies, (index, movie) => {
        output += `
            <div class="card well center-align col s6 m4 l3">
              <img class='responsive-img' src="${movie.Poster}">
              <h6 class="truncated">${movie.Title}</h6>
              <p class="truncated">${movie.Year}</p>
            <a href="http://imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-primary">IMDB</a>
            <hr>
            </div>
        `;
      });

      $(movieListAll).html(output);
    })
      .catch((err) => {
        console.log(err);
      });
  });
  // function movieSelected(id) {
  //   sessionStorage.setItem('movieId', id);
  //   window.location = 'movie.html';
  //   return false;
  // }

  // Grabs user input from the form on submit and
  $("#submit").on("click", (e) => {
    e.preventDefault();
    $('.jumbotron').hide();
    // $("#movie-list").css('height', '500px');
    // $("#movie-list").css('overflow', 'auto');
    // $(".movie-list").css("display", "block");

    // This line grabs the input from the textbox
    let movie = form.val().trim();
    // movie+= "movie";
    // console.log(movie);
    //url for movies
    let queryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=13a937dc&type=movie&plot=full";


    // Creating an AJAX call for search movie button being clicked
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      // console.log(queryURL);
      console.log(response);

      // grabbing and storing data in vars from response:

      let title = response.Title;
      let year = response.Year;
      let runtime = response.Runtime;
      let actors = response.Actors;
      let plot = response.Plot;
      let imageUrl = response.Poster;
      let website = response.Website;

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


  //rendering movies
  function renderMovie(doc) {
    let title = $("<h4 class='z-depth-4'>");
    let year = $("<p>");
    let runtime = $("<p>");
    let actors = $("<p>");
    let plot = $("<p>");
    let websitePlace = $("<p>");
    let websiteLink = $("<a target='_blank'>").attr('href', doc.data().website).text(doc.data().website);
    websitePlace.append(websiteLink);
    let buttonGifs = $('<button type="button" class="btn btn-info mb-2">  </button> <hr>');
    let buttonvVid = $('<button type="button" class="btn btn-primary">  </button> <hr>');

    let cross = $("<p>");
    let imagePlace = $("<img class='responsive-img' max-height='250'>");


    //appending all the elements
    let ulInfo = $('<div class="card center-align">').append(
      title.html('<strong>' + doc.data().title + '</strong>'),
      year.text('Release Year: ' + doc.data().year),
      runtime.text('Duration: ' + doc.data().runtime),
      websitePlace.append(websiteLink),
      actors.text('Actors: ' + doc.data().actors),
      imagePlace.attr("src", doc.data().image).css('width', '180px'),
      plot.text('Plot: ' + doc.data().plot),
      buttonGifs.text('Show Gifs'),
      buttonvVid.text('Video List'),
      cross.html('<p>Delete Movie  <i class="far fa-trash-alt"></i></p>')
    );
    buttonGifs.attr('data-name', doc.data().title)
    buttonvVid.attr('data-name', doc.data().title)
    let movieRow = $("<div class='row mb-2'>")
    let colOne = $('<div class="col s12 m6 l4">');
    let colTwo = $('<div class="col s12 m6 l4 card">');
    let colThree = $('<div class="col s12 m6 l4 card">')
    let gifDiv = $("<div class='center-align'>");
    let videoDiv = $("<div class='center-align'>");

    movieRow = movieRow.attr('data-id', doc.id);
    colOne.append(ulInfo);
    colTwo.append(gifDiv);
    colThree.append(videoDiv);
    movieRow.append(colOne, colTwo, colThree);
    movieRow.prependTo(movieList);

    //showing gifs
    buttonGifs.on('click', function (event) {
      event.preventDefault();
      //url for gifs
      let movieGif = $(this).attr("data-name");
      let queryURLgifs = "http://api.giphy.com/v1/gifs/search?q=" + movieGif + "+movie&api_key=Wa2AdCO6cHGtHNULqRHDcKFm4pSgr85Q&limit=12";

      $.ajax({
        url: queryURLgifs,
        method: "GET"
      }).then(function (resp) {
        console.log(queryURLgifs);
        console.log(resp);
        for (let i = 0; i < resp.data.length; i++) {
          let imgGif = $("<img class='responsive-img'>").css('width', '170px')
          imgGif.attr('src', resp.data[i].images.preview_gif.url);
          imgGif.attr('id', resp.data[i].id);
          gifDiv.append(imgGif);
        }
      })

    })

    // showing videos from youtube
    buttonvVid.on("click", function (e) {
      e.stopPropagation();
      let videos = $(this).attr("data-name");
      console.log("videos" + videos);
      //  Creating an $.get call from youtube api
      $.get(
        "https://www.googleapis.com/youtube/v3/search", {
          part: 'snippet, id',
          q: videos,
          type: 'videos',
          key: 'AIzaSyDrWhQOWG8TUTL1onkdl83ZQ_m8yaUk3Ug'
        },


        function (data) {

          console.log(data);

          $.each(data.items, function (i, item) {
            console.log(data);
            //getting output
            var videoId = item.id.videoId;
            let titleYoutube = item.snippet.title;
            let descriptionYoutube = item.snippet.description;
            let thumbYoutube = item.snippet.thumbnails.default.url;
            // console.log(thumbYoutube);
            let titleY = $("<div>").append(titleYoutube);
            // let vidId = $("<div>").append("YouTube Video ID: " + videoId);
            $("<a target='_blank'>").attr('href', doc.data().website).text(doc.data().website);
            let vidIdlink = $("<a target='_blank'>").attr('href', 'https://www.youtube.com/results?search_query=' + videoId).text('Watch on Youtube');
            let vidID = $("<div>");
            vidID.append(vidIdlink);
            // let descrY = $("<div>").append(descriptionYoutube);
            let imgYoutube = $("<img class='responsive-img'>").attr("src", thumbYoutube).attr('video-id', videoId).css('width', '170px');
            videoDiv.append(titleY, vidID, imgYoutube);
            console.log(imgYoutube);
          });
        }
      )
    })

    // deleting data
    cross.on('click', function (e) {
      e.stopPropagation();
      // confirm('Do you want to delete this movie?');
      alert('Do you want to delete this movie?')
      let id = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
      // console.log(id);
      // console.log(db.collection('movies').doc(id));
      db.collection('movies').doc(id).delete();
      db.collection('movie-Youtube').doc(id).delete();
      //   db.collection('movie-Youtube').doc(id).delete();
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

  // form.on('focus', function () {
  //   $(this).animate({
  //     opacity: '0.1',
  //   }, 800)
  // })

});


