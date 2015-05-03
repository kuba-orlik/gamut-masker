onmessage = function(e) {
  console.log('Message received from main script2', e.data.data);
  postMessage(["nini", "nono"]);
}	