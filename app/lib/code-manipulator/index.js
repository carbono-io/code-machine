'use strict';
var DomFs = require('dom-fs');

module.exports = function (codeDir) {

    this._domFs = new DomFs(codeDir);

    /**
     * Performs an attribute edition.
     */
    this.editAttribute = function (domFs, options) {

    };

    /**
     * Inserts a new html element (passed as a string) at a specific location
     * within a file's DOM.
     * @TODO: Alter DomFs behavior to keep changes in memory.
     *
     * @param domFs - DomFs instance.
     * @param options - object containing data for operation, must contain the
     *      following fields: file, xpath, element
     */
    this.insertElementAtXPath = function (file, xpath, element) {
        if (!file) {
            throw new Error('No file provided');
        }
        if (!xpath) {
            throw new Error('No x-path of parent element provided');
        }

        var domFile = this._domFs.getFile(file);
        var parentNode = domFile.getElementByXPath(xpath);

        if (element) {
            parentNode.addChildren(element);
        }

        // The new state of the file must be written to disk, so that the
        // ResourceServer serves the modified file.
        domFile.write();
    };
}