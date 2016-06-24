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

function refreshCardFromHash() {
  var hash = window.location.hash;
  if (hash) {
    var url_array = hash.substring(1, hash.length).split('/ldp/');
    if (url_array) {
      var hostname = url_array[0];
      if (hostname && typeof(Storage)) {
        var hostList = localStorage.getItem('ldp_hostname_list');
        if (hostList) {
          hostList = JSON.parse(hostList);
          var exists = false;
          if (hostList.host) {
            hostList.host.forEach(function(host) {
              if (host == hostname) {
                exists = true;
              }
            });
          }

          if (!exists) {
            hostList.host.push(hostname);
          }
        } else {
          hostList = {};
          hostList.host = [];
          hostList.host.push(hostname);
        }

        localStorage.setItem('ldp_hostname_list', JSON.stringify(hostList));
      }
    }
    displayResource(hash.substring(1, hash.length));
  } else {
    var resourceId = config.resourceBaseUrl + '/ldp/project/assemblee-virtuelle/';
    displayProject('#detail', resourceId, '#project-detail-template');
  }
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