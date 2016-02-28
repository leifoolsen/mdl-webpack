'use strict';

// Istanbul can not run coverage without a DOM.
// I don't know how to configure Istanbul to run code before and after Mocha tests, so for now, this is what
// I've come up with. This is not an ideal solution, since we do not get cleaned up after Istanbul has completed.
import jsdomify from 'jsdomify';
jsdomify.create();
