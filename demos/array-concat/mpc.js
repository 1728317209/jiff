(function(exports, node) {
  var saved_instance;

  /**
   * Connect to the server and initialize the jiff instance
   */
  exports.connect = function (hostname, computation_id, options) {
    var opt = Object.assign({}, options);
    // Added options goes here

    if(node)
      jiff = require('../../lib/jiff-client');

    saved_instance = jiff.make_jiff(hostname, computation_id, opt);
    // if you need any extensions, put them here

    return saved_instance;
  };

  /**
   * The MPC computation
   */
  exports.compute = function (input, jiff_instance) {
    if(jiff_instance == null) jiff_instance = saved_instance;

    // Convert the input string into an array of numbers
    // each number is the ascii encoding of the character at the same index
    var arr = [];
    for(let i = 0; i < input.length; i++)
      arr.push(input.charCodeAt(i));

    var final_deferred = $.Deferred();
    var final_promise = final_deferred.promise();

    var promise = jiff_instance.share_array(arr);
    promise.then(function(shares) {
      var result = [];

      for(var i = 1; i <= jiff_instance.party_count; i++)
        result = result.concat(shares[i]);

      var promises = [];
      for(var i = 0; i < result.length; i++) {
        promises.push(jiff_instance.open(result[i]));
      }

      // Handle the results
      Promise.all(promises).then(function(results) {
        // convert each opened number to a character
        // and add it to the final strings
        var string = "";
        for(let i = 0; i < results.length; i++)
          string += String.fromCharCode(results[i]);

        final_deferred.resolve(string);
      });
    });

    return final_promise;
  };
}((typeof exports == 'undefined' ? this.mpc = {} : exports), typeof exports != 'undefined'));
