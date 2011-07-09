var capacity  = 20;
var icon_size = 48;

function cutoff() {
  if ($("#stream div").size() >= capacity) {
    $("#stream div:last").slideDown(100, function() {
      $(this).remove();
    });
  }
}

function prepend(element) {
  element.hide().prependTo($("#stream")).slideDown("fast");
  cutoff();
}

var handlers = {
  tweet: function(data) {
    var user = data.user;

    if (user) {
      var id                = data.id_str;
      var text              = data.text;
      var screen_name       = user.screen_name;
      var profile_image_url = user.profile_image_url;

      var div = $("<div/>")
      .addClass("tweet")
      .append($("<p/>")
              .append($("<img/>")
                      .addClass("icon")
                      .attr({ src: profile_image_url, alt: screen_name, width: icon_size, height: icon_size }))
                      .append($("<span/>")
                              .addClass("screen_name")
                              .append($("<a/>")
                                      .attr({ href: "http://twitter.com/" + screen_name + "/status/" + id, target: "_blank" })
                                        .text(screen_name)))
                                      .append(text));

                                      prepend(div);
    }
  },
  irc: function(data) {
    var nick    = data.nick;
    var channel = data.channel;
    var message = data.message;

    var div = $("<div/>").addClass("irc")
    .append($("<p/>")
            .append($("<span/>").addClass("screen_name")
                    .text(nick))
                    .append($('<span/>').text(message)));

                    prepend(div);
  }
};

$(document).ready(function() {
  if (!window.key) return;

    var pusher = new Pusher(key);
    var stream = pusher.subscribe("stream");
    $.each(window.channels, function(group, names) {
      $.each(names, function(index, name) {
        console.log(group,name);
        stream.bind([group,name].join("-"), handlers[group]);
      })
    });

    var notice = pusher.subscribe("notice");
    notice.bind("notice", function(data) {
      var message    = data.message;
      var updated_at = data.updated_at;

      var div = $("#notice");

      div.contents().remove();

      div.append($("<span/>").hide()
                 .addClass("message")
                 .text(message).fadeIn(2000));
    });
});
