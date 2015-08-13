'use strict';

// External dependencies
var commander = require('commander');

// Internal dependencies
var pkg = require('../package.json');
var codeMachine = require('../index');

// Constants
var DEFAULT = {
  port: 8000,
  codeDir: '/code'
};

// Use commander to parse arguments provided through the command line.
commander
  .version(pkg.version)
  .option('-p, --port [port]', 'Port at which the service should be made available.')
  .option('-d, --code-dir [codeDir]', 'The directory at which the code of the project is located.')
  .parse(process.argv);
 
// Options object to be passed to codeMachine(options)
var options = {};
options.port = commander.port || process.env.PORT || DEFAULT.port;
options.codeDir = commander.codeDir || process.env.CODE_DIR || DEFAULT.codeDir;

// Run code machine
codeMachine(options);