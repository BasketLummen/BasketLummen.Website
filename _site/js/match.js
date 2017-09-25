var getParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var matchid = decodeURIComponent(getParameterByName("matchid"));

var renderMatchDetails = function(match, org) {


     var d = new Date(match.doc.jsDTCode);
      $("#next-top-title span").text(d.toLocaleString(window.navigator.language, {weekday: 'long'}));
      /* looks like local time is stored as if it were utc? */
      $("#next-bottom-title span").text(d.toLocaleString(window.navigator.language, {day: 'numeric'}) + " " + d.toLocaleString(window.navigator.language, {month: 'long'}) + " | " + ('0'+d.getUTCHours()).slice(-2) + ":" + ('0'+d.getMinutes()).slice(-2));    
    
      org.teams.forEach(function(team){
          if(team.guid == match.doc.teamThuisGUID || team.guid == match.doc.teamUitGUID){
              $("#next-vs").text(team.naam.replace("Basket Lummen ", ""));
          }
      });

      var homesrc = vbl.teamimage(match.doc.teamThuisGUID);
      var awaysrc = vbl.teamimage(match.doc.teamUitGUID);
      $("#next-home-team-logo img").attr("src", homesrc);
      $("#next-away-team-logo img").attr("src", awaysrc);
  
      $("#next-middle .container").css("visibility", "visible");

    var geocoder = new google.maps.Geocoder();
    var address = match.doc.accommodatieDoc.adres;
    var addressStr = address.straat + " " + address.huisNr + ", " + address.plaats;
    geocoder.geocode( { 'address': addressStr}, function(results, status) {
         if (status == google.maps.GeocoderStatus.OK) {
          if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
            var loc = results[0].geometry.location;

            var infowindow = new google.maps.InfoWindow();
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: loc
            });
            var marker = new google.maps.Marker({
                position: loc,
                map: map
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent('<div><strong>' + match.doc.accommodatieDoc.naam + '</strong><br>' + addressStr + '</div>');
                infowindow.open(map, this);
            });
          }
         }
    });
    $("#acc-name").text(match.doc.accommodatieDoc.naam);
    $("#acc-address").text(addressStr);
    $("#acc-telephone").text(match.doc.accommodatieDoc.telefoon ? match.doc.accommodatieDoc.telefoon : "");
    $("#acc-web").text(match.doc.accommodatieDoc.website ? match.doc.accommodatieDoc.website : "");
}

$.topic("vbl.match.details.loaded").subscribe(function (match) {
     repository.getMatchDetails(matchid, function(match){
         repository.currentOrganisation(function(org){
            renderMatchDetails(match, org);
         });
     });  
});


$.topic("repository.initialized").subscribe(function () {
  console.log("loading data");
  repository.loadMatchDetails(matchid);
});