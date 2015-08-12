'use strict';

// External dependencies
var _ = require('lodash');

/**
 * Performs an attribute edition.
 */
function editAttribute(domFs, options) {

}

/**
 * Inserts a new html element (passed as a string) at a specific location
 * within a file's DOM.
 * @TODO: Alter DomFs behavior to keep changes in memory.
 *
 * @param domFs - DomFs instance.
 * @param options - object containing data for operation, must contain the
 *      following fields: file, xpath, element
 */
function insertElementAtXPath(domFs, options) {
  if (!options.file) {
    throw new Error('No file provided');
  }
  if (!options.xpath) {
    throw new Error('No x-path of parent element provided');
  }

  var domFile = domFs.getFile(options.file);
  var parentNode = domFile.getElementByXPath(options.xpath);

  if (options.element) {
    parentNode.addChildren(options.element);
  }

  // The new state of the file must be written to disk, so that the
  // ResourceServer serves the modified file.
  domFile.write();
}

exports.editAttribute = editAttribute;
exports.insertElementAtXPath = insertElementAtXPath;
