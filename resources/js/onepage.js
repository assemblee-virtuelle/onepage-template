function getActorsList() {
  var actorsList = [];
  var url = config.resourceBaseUrl + '/ldp/actor/';

  store.get(url).then(function(object) {
    if (object['ldp:contains']) {
      $.each(object['ldp:contains'], function(index, actor) {
        store.get(actor).then(function(data) {
          var name = data['foaf:firstName'] + ' ' + data['foaf:name'];
          var description = data['av:biography'] ? (data['av:biography'].substring(0, 147) + '...') : null;
          var currentActor = {
            'id':        data['@id'],
            'name':      name,
            'biography': description,
            'picture' : data['foaf:img']
          };
          actorsList.push(currentActor);
          displayTemplate('#actor-list-template', '#actors-detail', actorsList);
        });
      });
    } else {
      displayTemplate('#actor-list-template', '#actors-detail', undefined);
    }
  });
}

function getProjectsList() {
  var url = config.resourceBaseUrl + '/ldp/project/';
  var projectsList = [];

  store.get(url).then(function(object) {
    if (object['ldp:contains']) {
      $.each(object['ldp:contains'], function(index, project) {
        store.get(project).then(function(data) {
          if (data.project_title && data.project_description) {
            var currentProject = {
              'id' : data['@id'],
              'title' : data.project_title,
              'description' : data.project_description.substring(0, 147) + '...'
            };
            projectsList.push(currentProject);
            displayTemplate('#project-list-template', '#projects-detail', projectsList);
          }
        });
      });
    } else {
      displayTemplate('#project-list-template', '#projects-detail', undefined);
    }
  });
}

function getIdeasList() {
  var url = config.resourceBaseUrl + '/ldp/idea/';
  var ideasList = [];

  store.get(url).then(function(object) {
    if (object['ldp:contains']) {
      $.each(object['ldp:contains'], function(index, idea) {
        store.get(idea).then(function(data) {
          var currentIdea = {
            'id':        data['@id'],
            'title':      data.title
          };
          ideasList.push(currentIdea);
          displayTemplate('#idea-list-template', '#ideas-detail', ideasList);
        });
      });
    } else {
      displayTemplate('#idea-list-template', '#ideas-detail', undefined);
    }
  });
}

function getKnownHostsList() {
  var knownHostsList = [ config.resourceBaseUrl ];
  if (typeof(Storage)) {
    var hostList = localStorage.getItem('ldp_hostname_list');
    if (hostList) {
      hostList = JSON.parse(hostList);
      if (hostList.host) {
        knownHostsList = hostList.host
      }
    }
  }

  return knownHostsList;
}

function getTemplateAjax(path, callback) {
  var source, template;
  $.ajax({
      url: path,
      success: function (data) {
          source = data;
          template = Handlebars.compile(source);
          if (callback) callback(template);
      }
  });
}

function displayTemplate(template, div, data) {
  if (typeof(template) == 'string' && template.substring(0, 1) == '#') {
    var element = $(template);
    if (element && typeof element.attr('src') !== 'undefined') {
      getTemplateAjax(element.attr('src'), function(template) {
        $(div).html(template(data));
      });
    } else {
      template = Handlebars.compile(element.html());
      $(div).html(template(data));
    }
  } else {
    template = Handlebars.compile(template);
    $(div).html(template({object: data}));
  }
}

function activateScrollEasing() {
  $(function() {
  	$('ul.nav a').bind('click',function(event){
  		var $anchor = $(this);
      console.log('Anchor', $anchor);
      var dest = $anchor.attr('href');
      console.log('Dest href', dest);
      console.log('Dest element', $(dest));
  		$('html, body').stop().animate({
  			scrollTop: $(dest).offset().top
  		}, 1500,'easeInOutExpo');
  		/*
  		if you don't want to use the easing effects:
  		$('html, body').stop().animate({
  			scrollTop: $($anchor.attr('href')).offset().top
  		}, 1000);
  		*/
  		event.preventDefault();
  	});
  });
}