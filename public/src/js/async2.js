var refreshButton = document.querySelector('.refresh')

var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click')

// create a source of urls to 'get' with jQuery.
var startupRequestStream = Rx.Observable.of('https://api.github.com/users')

// When refresh is clicked, get a random user. Use ?since to get an added offset
var requestOnRefreshStream = refreshClickStream.map(ev => {
  var randomOffset = Math.floor(Math.random() * 500)
  var url = `https://api.github.com/users?since=${randomOffset}`
  return url
})

var responseStream = startupRequestStream
  .merge(requestOnRefreshStream) // use merge to mix in another observable to this stream
  .flatMap(requestUrl =>
    Rx.Observable.fromPromise(
      jQuery.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Basic ' + btoa('Gochida'))
        },
        dataType: 'json',
        url: requestUrl
      })
    )
  )

function createSuggestionStream(responseStream) {
  return responseStream.map(listUser => {
    return listUser[Math.floor(Math.random() * listUser.length)]
  })
}

// create some suggestion streams, these won't do anything on their own
var suggestionStream1 = createSuggestionStream(responseStream)
var suggestionStream2 = createSuggestionStream(responseStream)
var suggestionStream3 = createSuggestionStream(responseStream)

function renderSuggestion(userData, selector) {
  var element = document.querySelector(selector)
  var usernameEl = element.querySelector('.username')
  usernameEl.href = userData.html_url
  usernameEl.textContent = userData.login
  var imgEl = element.querySelector('img')
  imgEl.src = userData.avatar_url
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
