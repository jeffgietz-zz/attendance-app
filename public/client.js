window.client = (function () {
  function getEvents(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/events',
      data: null,
      method: 'get',
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('GET /api/events', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  function getPeople(query) {
    // var url = (query != undefined) ? '/api/people/'+query : '/api/people/';
    // console.log(url);
    $.ajax({
      url: '/api/people/',
      data: null,
      method: 'get',
      dataType: 'json',
      cache: false,
      success: query.success,
      error: function (xhr, status, err) {
        console.error('GET /api/people/', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }
/*
  function getFamilies(query) {
    // var url = (query != undefined) ? '/api/people/'+query : '/api/people/';
    // console.log(url);
    $.ajax({
      url: '/api/people/',
      data: null,
      method: 'getFamilies',
      dataType: 'json',
      cache: false,
      success: query.success,
      error: function (xhr, status, err) {
        console.error('GET /api/people/', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }
*/
  function createEvent(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/events',
      data: opts.data,
      method: 'post',
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('POST /api/events', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  function createPerson(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/people',
      data: opts.data,
      method: 'put',
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('put /api/people', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  function updateEvent(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/events',
      data: opts.data,
      method: 'put',
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('PUT /api/events', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  function deleteEvent(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/events',
      method: 'delete',
      data: opts.data,
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('DELETE /api/events', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  function deleteAttendee(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/events/attendee',
      method: 'delete',
      data: opts.data,
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('deleteAttendee /api/events/attendee', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  function addAttendee(opts) {
    $.ajax({ // eslint-disable-line no-undef
      url: '/api/events/attendee',
      method: 'put',
      data: opts.data,
      dataType: 'json',
      cache: false,
      success: opts.success,
      error: function (xhr, status, err) {
        console.error('addAttendee /api/events/attendee', status, err.toString()); // eslint-disable-line no-console
      },
    });
  }

  const client = {
    getEvents: getEvents,
    getPeople: getPeople,
    createPerson: createPerson,
    createEvent: createEvent,
    updateEvent: updateEvent,
    deleteEvent: deleteEvent,
    deleteAttendee: deleteAttendee,
    addAttendee: addAttendee,
  };

  return client;
})();
