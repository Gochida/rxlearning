var refreshButton = document.querySelector('.refresh')

var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click')

var randomOffset = Math.floor(Math.random() * 500)
var apiUrl = `https://api.github.com/users?since=${randomOffset}`
var ajaxData = null // we'll cache the data so we don't push our rate limit on refreshes
// create a source of urls to 'get' with jQuery.
var startupRequestStream = Rx.Observable.of(apiUrl)

// When refresh is clicked, get a random user. Use ?since to get an added offset
var requestOnRefreshStream = refreshClickStream.map(ev => {
  console.log('Refreshing')
  return apiUrl
})

var responseStream = startupRequestStream
  .merge(requestOnRefreshStream) // use merge to mix in another observable to this stream
  .flatMap(requestUrl => {
    if (ajaxData === null) {
      return Rx.Observable.fromPromise(
        jQuery.ajax({
          beforeSend: function(xhr) {
            xhr.setRequestHeader(
              'Authorization',
              'Basic ' +
                btoa('Gochida:b201956fe88906f19d52c21b0c3e6b6ed5089314')
              //GithubAPI throttles unauthorized api calls - so we auth using my username and an oauth token
            )
          },
          dataType: 'json',
          url: requestUrl
        })
      ).map(userList => {
        // AJAX call returned data!
        // we use map here so we can save the userList JSON from the request, and then return it
        ajaxData = userList
        return ajaxData
      })
    } else {
      console.log('Using cached data!')
      return Rx.Observable.of(ajaxData)
    }
  })
  .publishReplay()
  .refCount(1)

// When renderSuggestion is called, if user data is null it will hide that element. This is so ugly preload stuff isn't shown
// we need to emit null to fill the time between requesting and receiving data.
// This means we need to emit null immediately at the start (page load) AND on every click of refresh.
// function createSuggestionStream(responseStream) {
//   var stream = refreshClickStream
//     .map(ev => {
//       console.log("Saying null")
//       return null
//     }) // there is a kind of order of operations with merge it seems
//     .merge(
//       // with two observables emitting cached/immediate output, anything passed in by merge will come AFTER what it's merged WITH
//       responseStream.map(listUser => {
//         // so this responseStream will always emit after refreshClickStream
//         return listUser[Math.floor(Math.random() * listUser.length)]
//       })
//     )
//     .startWith(null) // this ensures the first thing off this stream conglomerate will always be 'null'
//   console.log('stream', stream) // emit the stream so we know what we got
//   return stream
// }

function createSuggestionStream(responseStream) {
  var userStream = responseStream.map(
    listUsers => listUsers[Math.floor(Math.random() * listUsers.length)]
  )
  return userStream
    .startWith(null)
}

// create some suggestion streams, these won't do anything on their own
var suggestionStream1 = createSuggestionStream(responseStream)
var suggestionStream2 = createSuggestionStream(responseStream)
var suggestionStream3 = createSuggestionStream(responseStream)

function renderSuggestion(userData, selector) {
  var element = document.querySelector(selector)
  if (userData === null) {
    console.log('hiding')
    // if we received null for userData, hide the selected element
    element.style.visibility = 'hidden'
  } else {
    console.log('showing')
    // if we received userData, show the selected element
    element.style.visibility = 'visible'
    var usernameEl = element.querySelector('.username')
    usernameEl.href = userData.html_url
    usernameEl.textContent = userData.login
    var imgEl = element.querySelector('img')
    imgEl.src = userData.avatar_url
  }
}

suggestionStream1.subscribe(user => {
  renderSuggestion(user, '.suggestion1')
})
suggestionStream2.subscribe(user => {
  renderSuggestion(user, '.suggestion2')
})
suggestionStream3.subscribe(user => {
  renderSuggestion(user, '.suggestion3')
})
