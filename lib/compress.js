const zlib = require("zlib");

const COMPRESSIBLE = /text|javascript|json|xml|svg/;

function compress(req, res, next) {
  const accept = req.headers["accept-encoding"] || "";
  if (req.method === "HEAD" || !/\bgzip\b/.test(accept)) {
    return next();
  }

  const chunks = [];
  const write = res.write;
  const end = res.end;
  let ending = false;

  res.write = function (chunk, encoding, callback) {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = undefined;
    }
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }
    if (typeof callback === "function") callback();
    return true;
  };

  res.end = function (chunk, encoding, callback) {
    if (ending) {
      return end.call(this, chunk, encoding, callback);
    }
    ending = true;

    if (typeof chunk === "function") {
      callback = chunk;
      chunk = undefined;
      encoding = undefined;
    } else if (typeof encoding === "function") {
      callback = encoding;
      encoding = undefined;
    }
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }

    this.write = write;
    this.end = end;

    const body = Buffer.concat(chunks);
    const type = String(this.getHeader("Content-Type") || "");
    if (this.headersSent || this.getHeader("Content-Encoding") || !COMPRESSIBLE.test(type) || body.length === 0) {
      return end.call(this, body, callback);
    }

    let compressed;
    try {
      compressed = zlib.gzipSync(body);
    } catch (err) {
      return end.call(this, body, callback);
    }
    if (compressed.length >= body.length || this.headersSent) {
      return end.call(this, body, callback);
    }

    const vary = this.getHeader("Vary");
    this.setHeader("Content-Encoding", "gzip");
    this.setHeader("Vary", vary ? `${vary}, Accept-Encoding` : "Accept-Encoding");
    this.removeHeader("Content-Length");
    return end.call(this, compressed, callback);
  };

  next();
}

module.exports = compress;
