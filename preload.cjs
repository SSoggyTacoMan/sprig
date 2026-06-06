const buffer = require('node:buffer');
if (typeof buffer.SlowBuffer === 'undefined') {
	buffer.SlowBuffer = class SlowBuffer extends buffer.Buffer {};
}
