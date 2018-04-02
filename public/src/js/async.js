// create a source of urls to 'get' with jQuery.
var requestStream = Rx.Observable.of('https://api.github.com/users')

// use flatMap to create a 'promise as observable' for each url from requestStream
// flatMap is significant here, It basically merges an observable sequence of observable sequences into a single observable sequence.
var responseStream = requestStream.flatMap(requestUrl =>
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

// subscribe to that stream of 'promises as observables'
// flat map flattens all observables output into one observable (responseStream)
// so we just process responseStream's output - which is the result from 'get'
responseStream.subscribe(response => {
  console.log(response) // print JS to console
  // below is simply code to pretty-print JSON to the HTML document
  var usersElement = document.getElementById('users') // get the users code block
  usersElement.textContent = JSON.stringify(response, null, 2)
  hljs.highlightBlock(usersElement) // highlight using highlight.js
})
